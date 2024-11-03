import type { UserConfig } from 'vite'
import commonConfig from './vite.config-common'

import prefixer from 'postcss-prefix-selector'


export default {
    ...commonConfig,
    build: {
        ...commonConfig.build,
        rollupOptions: {
            input: {
                embedded: './embedded.html',
            },
            output: {
                entryFileNames: _assetInfo => 'online-ide-embedded.js', // im Hauptverzeichnis
                assetFileNames: assetInfo => assetInfo.name?.endsWith('css') ? 'online-ide-embedded.css' : 'assets/[name]-[hash][extname]',
                manualChunks: () => {
                    // 'everything' - jetzt entstehen nur 1 CSS Asset, 1 JS Assert, plus 7 Worker JS Assets.
                    return 'everything';
                },
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
