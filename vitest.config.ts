import { UserConfig } from 'vite';
import { RunnerTestFile, UserConsoleLog } from 'vitest';
import { defineConfig } from 'vitest/config';
import { VerboseReporter } from 'vitest/reporters';

class MyDefaultReporter extends VerboseReporter {
  constructor() {
    super();
  }

  onCollected() {
    const files = this.ctx.state.getFiles(this.watchFilters)
    // const errors = this.ctx.state.getUnhandledErrors()
    // this.reportTestSummary(files, errors)

    // this.ctx.logger.log(files)
    super.onCollected()
  }

  async onFinished(files?: RunnerTestFile[], errors?: unknown[]): Promise<void> {
    super.onFinished(files, errors);
  }

  onUserConsoleLog(log: UserConsoleLog): void {
    super.onUserConsoleLog(log);
  }


}

export default defineConfig({
  test: {
    reporters: [new MyDefaultReporter()],
    // reporters: ["default"]

    // https://github.com/vitest-dev/vitest/discussions/1806 :
    alias: [
      {
        find: /^monaco-editor$/,
        replacement: __dirname + "/node_modules/monaco-editor/esm/vs/editor/editor.api"
      }
    ],

    // https://vitest.dev/guide/environment
    environment: 'jsdom'
  },
  logLevel: 'silent',
  esbuild: {
    logOverride: {
      'unsupported-css-nesting': 'silent',
      'unsupported-@namespace': 'silent',
    }
  },
} satisfies UserConfig);
