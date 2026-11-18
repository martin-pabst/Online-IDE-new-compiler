
import { resolve } from 'path'
import { defineConfig } from 'vite'

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

const d = new Date();
const curr_date = d.getDate();
const curr_month = d.getMonth() + 1; //Months are zero based
const curr_year = d.getFullYear();
let hour = "" + d.getHours();
while (hour.length < 2) hour = "0" + hour;

let minute = "" + d.getMinutes();
while (minute.length < 2) minute = "0" + minute;

const buildDate = curr_date + "." + curr_month + "." + curr_year + ", " + hour + ":" + minute + " Uhr";


import type { UserConfig } from 'vite'

export default {
    appType: 'mpa', // to serve 404 on "not found" (instead of erroneously serving index.html)
    build: {
        sourcemap: true,
        emptyOutDir: true,
        chunkSizeWarningLimit: 4912,
        assetsInlineLimit: 10 * 1024,
        rolldownOptions: {
            // strips code under the label DEBUG: in builds
            transform: {
                dropLabels: ['DEBUG']
            },
            // no [PLUGIN_TIMINGS] report after each build
            checks: {
                bundlerTimings: false
            },
            // sql.js ships one build for node and browser: its node-only code requires fs, path and crypto,
            // which vite replaces by empty modules. That's harmless, so don't report it in every build.
            onLog(level, log, defaultHandler) {
                if (level === 'warn' && log.message.includes('has been externalized for browser compatibility')
                    && log.message.includes('/node_modules/sql.js/')) {
                    return;
                }
                defaultHandler(level, log);
            }
        }
    },
    define: {
        'APP_VERSION': JSON.stringify(pkg.version),
        'BUILD_DATE': JSON.stringify(buildDate)
    }
} satisfies UserConfig
