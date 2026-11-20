// Maintenance tool for the icon sets in assets/icons/dark and assets/icons/light.
//
// Every icon exists twice with the same file name: assets/icons/dark/<name>.svg (for the dark theme)
// and assets/icons/light/<name>.svg (for the light theme). assets/css/icons.css defines the css class
// img_<name> with the dark icon and overrides it with the light icon under .jo_theme-light
// (ThemeManager sets this class on its root element).
//
// Usage (from the repository root):
//   node src/development/IconTool.js clean
//        Removes editor metadata (Inkscape/Sodipodi namedview, rdf metadata, editor attributes) from all icons.
//        Vite inlines the icons into the css bundle, so this keeps the bundle small. Run it after editing
//        icons with Inkscape.
//   node src/development/IconTool.js derive [--force] [name.svg ...]
//        Creates light/<name>.svg from dark/<name>.svg for every dark icon without a light counterpart
//        (or only for the given names). Existing light icons are only overwritten with --force, which
//        needs explicit names.
//        Colors are mapped as in VS Code's codicons: light grays become dark grays, colors that are too pale
//        on a white background get darker. Icons matching COPY_UNCHANGED (e.g. flags) are copied as they are.
//   node src/development/IconTool.js check
//        Compares icons.css with the icon files: missing files, icons without light/dark counterpart,
//        icons without css class.

import fs from "node:fs";
import path from "node:path";

const ICON_DIR = "assets/icons";
const DARK_DIR = path.join(ICON_DIR, "dark");
const LIGHT_DIR = path.join(ICON_DIR, "light");
const ICONS_CSS = "assets/css/icons.css";

// Icons that look the same in both themes
const COPY_UNCHANGED = [/^flag-/];

// Color pairs used by VS Code's codicons (dark theme -> light theme)
const FIXED_COLOR_MAP = {
    "#c5c5c5": "#424242",
    "#75beff": "#007acc",
    "#89d185": "#388a34",
    "#f48771": "#a1260d",
    "#ffcc00": "#ddb100",
    "#ee9d28": "#d67e00",
    "#b180d7": "#652d90",
};

const NAMED_COLORS = { "white": "#ffffff", "black": "#000000" };

// matches color values of fill, stroke, ... in attributes (fill="#c5c5c5") and in style declarations (fill:#c5c5c5)
const COLOR_REGEX = /(?<![\w-])(fill|stroke|stop-color|flood-color|lighting-color|color)(\s*[:=]\s*"?\s*)(#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|white\b|black\b)/g;

function cleanSvg(svg) {
    let s = svg;
    s = s.replace(/<\?xml[^>]*\?>\s*/g, "");
    s = s.replace(/<!--[\s\S]*?-->/g, "");
    s = s.replace(/<metadata[\s\S]*?<\/metadata>/g, "");
    s = s.replace(/<metadata[^>]*\/>/g, "");
    s = s.replace(/<sodipodi:namedview[\s\S]*?<\/sodipodi:namedview>/g, "");
    s = s.replace(/<sodipodi:namedview[^>]*\/>/g, "");
    s = s.replace(/<defs[^>]*\/>/g, "");
    s = s.replace(/\s+(inkscape|sodipodi):[A-Za-z0-9_-]+="[^"]*"/g, "");
    s = s.replace(/\s+xmlns:(inkscape|sodipodi|dc|cc|rdf|svg)="[^"]*"/g, "");
    s = s.replace(/>\s+</g, "><");
    s = s.replace(/\s*\n\s*/g, " ");
    return s.trim() + "\n";
}

function normalizeColor(color) {
    color = color.toLowerCase();
    if (NAMED_COLORS[color]) return NAMED_COLORS[color];
    if (color.length == 4) color = "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    return color;
}

function hexToRgb(hex) {
    return [1, 3, 5].map(i => parseInt(hex.substring(i, i + 2), 16) / 255);
}

function rgbToHex(rgb) {
    return "#" + rgb.map(c => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl([r, g, b]) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max == min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max == r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max == g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [h * 60, s, l];
}

function hslToRgb([h, s, l]) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hueToRgb = (t) => {
        t = (t + 1) % 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const hn = h / 360;
    return [hueToRgb(hn + 1 / 3), hueToRgb(hn), hueToRgb(hn - 1 / 3)];
}

function contrastWithWhite(rgb) {
    const lin = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const luminance = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    return 1.05 / (luminance + 0.05);
}

function isGray(hex) {
    const rgb = hexToRgb(hex);
    return Math.max(...rgb) - Math.min(...rgb) < 0.08;
}

/**
 * @param monochrome true if the icon contains no colors besides grays: then white is a foreground color
 *                   and gets dark, too. Otherwise white is kept (e.g. white letter on a colored circle).
 */
function mapColor(hex, monochrome) {
    if (FIXED_COLOR_MAP[hex]) return FIXED_COLOR_MAP[hex];
    let [h, s, l] = rgbToHsl(hexToRgb(hex));

    if (isGray(hex)) {
        if (l < 0.6) return hex;                 // dark and middle grays are visible on both backgrounds
        if (l > 0.97 && !monochrome) return hex; // white details on colored shapes
        return rgbToHex(hslToRgb([h, s, Math.max(1.03 - l, 0.1)])); // #c5c5c5 -> #424242, keeps order of gray tones
    }

    // colors: darken until there's enough contrast to a white background
    let rgb = hexToRgb(hex);
    const isYellow = h >= 40 && h <= 75;
    const targetContrast = isYellow ? 2.0 : 3.0;
    if (contrastWithWhite(rgb) >= targetContrast) return hex;
    // darkened yellow looks olive, so shift it towards gold (like codicons: #ffcc00 -> #ddb100)
    if (isYellow) h = 48 + (h - 48) * 0.3;
    while (contrastWithWhite(rgb) < targetContrast && l > 0.05) {
        l -= 0.01;
        rgb = hslToRgb([h, s, l]);
    }
    return rgbToHex(rgb);
}

// <animate attributeName="fill" values="#808080; #ffffff; #808080" .../>
const ANIMATE_REGEX = /<animate(Color)?\b[^>]*\battributeName="(fill|stroke|stop-color|flood-color|lighting-color|color)"[^>]*>/g;

function deriveLightSvg(darkSvg) {
    const svg = cleanSvg(darkSvg);
    const colors = [...svg.matchAll(COLOR_REGEX)].map(m => normalizeColor(m[3]));
    const monochrome = colors.every(c => isGray(c));
    return svg
        .replace(COLOR_REGEX, (_match, property, separator, color) =>
            property + separator + mapColor(normalizeColor(color), monochrome))
        // animated colors pulse between gray tones: there white is a foreground color, too
        .replace(ANIMATE_REGEX, (tag) => tag.replace(/\b(values|from|to|by)="([^"]*)"/g, (_m, attribute, value) =>
            attribute + '="' + value.replace(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, c => mapColor(normalizeColor(c), true)) + '"'));
}

function svgFiles(dir) {
    return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".svg")).sort() : [];
}

function clean() {
    let changed = 0, before = 0, after = 0;
    for (const dir of [DARK_DIR, LIGHT_DIR]) {
        for (const f of svgFiles(dir)) {
            const file = path.join(dir, f);
            const svg = fs.readFileSync(file, "utf8");
            const cleaned = cleanSvg(svg);
            before += svg.length;
            after += cleaned.length;
            if (cleaned != svg) {
                fs.writeFileSync(file, cleaned);
                changed++;
            }
        }
    }
    console.log(`Cleaned ${changed} files (${before} -> ${after} bytes).`);
}

function derive(args) {
    const force = args.includes("--force");
    const names = args.filter(a => a != "--force").map(a => path.basename(a));
    if (force && names.length == 0) {
        console.log("--force needs the names of the icons to overwrite (protects hand-made light icons).");
        return;
    }
    const candidates = names.length > 0 ? names : svgFiles(DARK_DIR);
    fs.mkdirSync(LIGHT_DIR, { recursive: true });
    for (const f of candidates) {
        const darkFile = path.join(DARK_DIR, f);
        const lightFile = path.join(LIGHT_DIR, f);
        if (!fs.existsSync(darkFile)) {
            console.log(`${f}: no dark icon ${darkFile}`);
            continue;
        }
        if (fs.existsSync(lightFile) && !force) continue;
        const darkSvg = fs.readFileSync(darkFile, "utf8");
        const copy = COPY_UNCHANGED.some(regex => regex.test(f));
        fs.writeFileSync(lightFile, copy ? darkSvg : deriveLightSvg(darkSvg));
        console.log(`${f}: ${copy ? "copied" : "derived"} ${lightFile}`);
    }
}

function check() {
    const css = fs.readFileSync(ICONS_CSS, "utf8");
    const referenced = { dark: new Set(), light: new Set() };
    let problems = 0;
    for (const m of css.matchAll(/url\(['"]?\.\.\/icons\/(dark|light)\/([^'")]+)['"]?\)/g)) {
        referenced[m[1]].add(m[2]);
        if (!fs.existsSync(path.join(ICON_DIR, m[1], m[2]))) {
            console.log(`icons.css references missing file ${m[1]}/${m[2]}`);
            problems++;
        }
    }
    const dark = new Set(svgFiles(DARK_DIR)), light = new Set(svgFiles(LIGHT_DIR));
    for (const f of dark) if (!light.has(f)) { console.log(`dark/${f} has no light counterpart`); problems++; }
    for (const f of light) if (!dark.has(f)) { console.log(`light/${f} has no dark counterpart`); problems++; }
    for (const f of dark) if (!referenced.dark.has(f)) { console.log(`dark/${f} isn't used in icons.css`); problems++; }
    for (const f of light) if (!referenced.light.has(f)) { console.log(`light/${f} isn't used in icons.css`); problems++; }
    console.log(problems == 0 ? "Everything ok." : `${problems} problem(s).`);
}

const [command, ...args] = process.argv.slice(2);
switch (command) {
    case "clean": clean(); break;
    case "derive": derive(args); break;
    case "check": check(); break;
    default:
        console.log("Usage: node src/development/IconTool.js clean | derive [--force] [name.svg ...] | check");
}
