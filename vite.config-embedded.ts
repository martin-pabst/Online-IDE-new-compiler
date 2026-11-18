import type { UserConfig } from 'vite'
import commonConfig from './vite.config-common.ts'

import prefixer from 'postcss-prefix-selector'

export default {
    ...commonConfig,
    base: '',
    build: {
        ...commonConfig.build,
        rolldownOptions: {
            ...commonConfig.build.rolldownOptions,
            input: {
                embedded: './embedded_java.html',
            },
            output: {
                entryFileNames: _assetInfo => {
                    return 'online-ide-embedded.js'; // im Hauptverzeichnis
                },
                assetFileNames: assetInfo => assetInfo.names.some(name => name.endsWith('css')) ? 'online-ide-embedded.css' : 'assets/[name]-[hash][extname]',
                codeSplitting: {
                    groups: [{
                        debugName: 'css, npm packages, own sourcecode',
                        name: (id: string) => {
                            if (id.endsWith('.css')) {
                                return 'css';
                            }
                            if (id.includes('node_modules')) return id.toString().split('node_modules/')[1].split('/')[0].toString().replace("@", "");
                            // 'everything' - jetzt entstehen nur 1 CSS Asset, 1 JS Assert, plus 1 Worker JS Assets.
                            return 'own_sourcecode';
                        }
                    }]
                }
            }
        },
        outDir: './dist-embedded'
    },
    css: {
        postcss: {
            plugins: [
                /*
                 * Only for node_modules.
                 * For your own files, take care of yourself.
                 */
                prefixer({
                    includeFiles: [/node_modules/],
                    prefix: '.joeCssFence'
                })
            ]
        }
    },
} satisfies UserConfig
