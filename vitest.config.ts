import path from 'path';
import { Plugin, UserConfig } from 'vite';
import { UserConsoleLog } from 'vitest';
import { defineConfig } from 'vitest/config';
import { VerboseReporter } from 'vitest/node';

class MyDefaultReporter extends VerboseReporter {
  constructor() {
    super();
  }

  onUserConsoleLog(log: UserConsoleLog): void {
    super.onUserConsoleLog(log);
  }


}

/**
 * Every src/test/java/*.java file is a test file of its own (see test.include below), so vitest runs them
 * in parallel workers and reports them separately. This plugin turns the Java source into a module that
 * hands it to the test harness, which registers one test per /**:: block.
 */
function javaTestFilePlugin(): Plugin {
  const harness = path.resolve(import.meta.dirname, 'src/test/JavaTestHarness.ts');
  return {
    name: 'java-test-files',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0];
      if (!file.endsWith('.java')) return null;
      let harnessImport = path.relative(path.dirname(file), harness).replace(/\\/g, '/');
      if (!harnessImport.startsWith('.')) harnessImport = './' + harnessImport;
      return {
        code: `import { runJavaTestFile } from ${JSON.stringify(harnessImport)};\n` +
          `runJavaTestFile(${JSON.stringify(code)}, ${JSON.stringify(path.basename(file))});\n`,
        map: { mappings: '' }
      };
    }
  };
}

export default defineConfig({
  plugins: [javaTestFilePlugin()],
  test: {
    reporters: [new MyDefaultReporter()],

    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)', 'src/test/java/*.java'],

    // Without isolation each worker imports compiler and runtime library (and sets up jsdom) only once
    // instead of once per test file. With isolation, this costs ~14 s per .java file.
    isolate: false,

    // Importing the compiler (~9 s) dominates the run time, the tests themselves need only ~8 s on one core.
    // More workers just compete for CPU and for the vite server while importing: 3-6 threads were fastest
    // (~14 s for all .java files vs. ~19 s in a single test file), threads were faster than forks.
    pool: 'threads',
    maxWorkers: 4,
    // reporters: ["default"]

    // https://github.com/vitest-dev/vitest/discussions/1806 :
    alias: [
      {
        find: /^monaco-editor$/,
        replacement: import.meta.dirname + "/node_modules/monaco-editor/esm/vs/editor/editor.api"
      }
    ],

    // https://vitest.dev/guide/environment
    environment: 'jsdom'
  },
  logLevel: 'silent',
} satisfies UserConfig);
