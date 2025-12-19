import type { UserConfig } from 'vite'
import commonConfig from './vite.config-common'

import prefixer from 'postcss-prefix-selector'

export default {
    ...commonConfig,
    base: '',
    build: {
        ...commonConfig.build,
        rolldownOptions: {
            input: {
                embedded: './embedded.html',
            },
            output: {
                advancedChunks: {
                    groups: [
                        {
                            test: (id: string) => id.endsWith('diagram.css'),
                            name: 'diagram.css',
                        },
                        {
                            test: (id: string) => id.endsWith('.css'),
                            name: 'css',
                        }
                    ].concat(['pixi.js', 'w2ui', 'three', 'p5', 'monaco-editor', 'diff-match-patch', 
                        'howler', 'upng-js', 'markdown-it', 'jquery', 'jszip', 'chart.js', 'pako'].map(libName => ({
                        test: (id: string) => id.includes(`node_modules/${libName}`),
                        name: libName,

                    })))
                },
                entryFileNames: _assetInfo => {
                    return 'online-ide-embedded.js'; // im Hauptverzeichnis
                },
                assetFileNames: assetInfo => assetInfo.name?.endsWith('css') ? 'online-ide-embedded.css' : 'assets/[name]-[hash][extname]',
                // manualChunks: (id: string, { getModuleInfo}) => {
                //     if(id.endsWith('diagram.css')){
                //         return 'classDiagram.Css';
                //     }
                //     if(id.endsWith('.css')){
                //         return 'css';
                //     } 
                //     if (id.includes('node_modules')) return id.toString().split('node_modules/')[1].split('/')[0].toString().replace("@", "");
                //     // 'everything' - jetzt entstehen nur 1 CSS Asset, 1 JS Assert, plus 1 Worker JS Assets.
                //     return 'own_sourcecode';
                // },
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
