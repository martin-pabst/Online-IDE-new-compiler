import type { UserConfig } from 'vite'
import commonConfig from './vite.config-common'


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
            'diagram-worker': './src/client/main/gui/diagrams/classdiagram/Router.ts',
        },
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
            '/servlet': 'http://localhost:5500',
            '/sprites': 'http://localhost:5500',
            '/servlet/websocket': { target: 'ws://localhost:5500', ws: true },
            '/servlet/pushWebsocket': { target: 'ws://localhost:5500', ws: true },
            // '/servlet/subscriptionwebsocket': { target: 'ws://localhost:5500', ws: true },
        }
    }
} satisfies UserConfig