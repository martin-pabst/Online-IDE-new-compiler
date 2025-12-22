
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
    // esbuild: {
    //     logOverride: {
    //         'unsupported-css-nesting': 'silent',
    //         'unsupported-@namespace': 'silent',
    //     },
    //     dropLabels: ['DEBUG']
    // },
    build: {
        sourcemap: true,
        emptyOutDir: true,
        chunkSizeWarningLimit: 0x8000, // 10 MB
        assetsInlineLimit: 10 * 1024,
        cssCodeSplit: true,
    },
    define: {
        'APP_VERSION': JSON.stringify(pkg.version),
        'BUILD_DATE': JSON.stringify(buildDate)
    }
} satisfies UserConfig
