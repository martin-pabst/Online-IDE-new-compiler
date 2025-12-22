import { searchForWorkspaceRoot, type UserConfig } from 'vite'
import commonConfig from './vite.config-common'

let serverIP: string = 'localhost';
// let serverIP: string = '172.30.95.53';

export default {
    ...commonConfig,
    build: {
        ...commonConfig.build,
        rollupOptions: {
            input: {
                main: './index.html',
                admin: './administration_mc.html',
                api: './api_documentation.html',
                spriteLibrary: './spriteLibrary.html',
                statistics: './statistics.html',
                shortcuts: './shortcuts.html',
                registeruser: './registerUser.html',
            },
            output: {
                manualChunks: (id: string, { getModuleInfo, getModuleIds }) => {
                    if (id.includes('node_modules')) {
                        let moduleName: string = id.toString().split('node_modules/')[1].split('/')[0].toString().replace("@", "");
                        if (id.endsWith('.css')) {
                            return moduleName + '_css';
                        }
                        return moduleName;
                    }

                    return undefined;
                },
            }

            // output: {
            //   entryFileNames: assetInfo => {
            //     if (assetInfo.name.indexOf('worker') >= 0) {
            //       return 'worker/[name].js';
            //     }
            //     return '[name]-[hash].js';
            //   },
            //   assetFileNames: assetInfo => assetInfo.name.endsWith('css') ? '[name]-[hash][extname]' : 'assets/[name]-[hash][extname]',
            //   chunkFileNames: 'assets/js/[name]-[hash].js',
            //   manualChunks: {}
            // }
        },
        outDir: './dist',
    },
    server: {
        proxy: {
            '/servlet': 'http://' + serverIP + ':5500',
            '/sprites': 'http://' + serverIP + ':5500',
            '/servlet/websocket': { target: 'ws://' + serverIP + ':5500', ws: true },
            '/servlet/pushWebsocket': { target: 'ws://' + serverIP + ':5500', ws: true }
            // '/servlet/subscriptionwebsocket': { target: 'ws://localhost:5500', ws: true },
        }
    }

} satisfies UserConfig
