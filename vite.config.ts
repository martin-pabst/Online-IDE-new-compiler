import { searchForWorkspaceRoot, type UserConfig } from 'vite'
import commonConfig from './vite.config-common'

let serverIP: string = 'localhost';
// let serverIP: string = '172.30.95.53';

export default {
    ...commonConfig,
    build: {
        ...commonConfig.build,
        rolldownOptions: {
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
                advancedChunks: {
                    groups: [
                        {
                            test: (id: string) => id.endsWith('diagram.css'),
                            name: 'diagram.css',
                            priority: 10
                        },
                        {
                            test: /node_modules/,
                            name: (id: string) => {
                                let moduleName: string = id.toString().split('node_modules/')[1].split('/')[0].toString().replace("@", "");
                                if (id.endsWith('.css')) {
                                    return moduleName + '_css';
                                }
                                return moduleName;
                            },
                            priority: 5
                        },
                    ]
                },
            }
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
