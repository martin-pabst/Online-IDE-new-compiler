import { lm, type TranslatedText } from "../../tools/language/LanguageManager";
import type { SettingKey, SettingValue } from "../settings/SettingsStore";
import type { JavaOnlineConfig } from "./MainEmbedded";

/**
 * Reading an embedded IDE's configuration out of the page's URL.
 *
 * An embedded IDE is normally configured by the page that hosts it, through the
 * div's `data-java-online` attribute. The playground has no such author: it is a
 * bare page a reader is handed a link to, so its link has to carry the
 * configuration instead — which libraries to load, which theme, how much of the
 * IDE to show.
 *
 * Only a div that asks for it (`'urlConfig': true`) is configured this way, so a
 * page holding several IDEs of its own does not have them all change under a
 * stray query parameter.
 */

/**
 * How a parameter's value is read. The kind decides the parsing, so that the
 * table below is the only place a parameter is written down: it is both what the
 * parser goes by and what the help panel shows the reader.
 */
type URLParameterKind = "boolean" | "string" | "special";

export type URLParameterDoc = {
    /** As it appears in the URL. */
    name: string,
    kind: URLParameterKind,
    /** What may stand to the right of the "=", for the help panel. */
    values: string,
    description: TranslatedText,
}

export const URL_PARAMETERS: URLParameterDoc[] = [
    {
        name: "libraries", kind: "special", values: "gng, nrw, niedersachsen, scratch",
        description: () => lm({
            "de": "Klassenbibliotheken, durch Komma getrennt. Leer lässt alle weg.",
            "en": "Class libraries, separated by commas. Empty leaves them all out.",
        })
    },
    {
        name: "lang", kind: "special", values: "de, en, fr",
        description: () => lm({
            "de": "Sprache der Oberfläche und der Tooltips.",
            "en": "Language of the interface and of the tooltips.",
        })
    },
    {
        name: "theme", kind: "special", values: "dark, light",
        description: () => lm({
            "de": "Farben. Ohne Angabe entscheidet die Seite, auf der die IDE steht.",
            "en": "Colours. Left out, the page the IDE sits on decides.",
        })
    },
    {
        name: "speed", kind: "special", values: "max, 1 … 1000000",
        description: () => lm({
            "de": "Schritte pro Sekunde, mit denen das Programm läuft.",
            "en": "Steps per second at which the program runs.",
        })
    },
    {
        name: "id", kind: "string", values: "…",
        description: () => lm({
            "de": "Name, unter dem die Änderungen im Browser gemerkt werden. Zwei Links mit demselben id teilen sich den Stand.",
            "en": "Name the edits are remembered under in this browser. Two links with the same id share their state.",
        })
    },
    {
        name: "withFileList", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Liste der Dateien links unten.",
            "en": "The list of files at the bottom left.",
        })
    },
    {
        name: "withConsole", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Console, in der Ausgaben und Eingaben stehen.",
            "en": "The console, where output and input go.",
        })
    },
    {
        name: "withErrorList", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Liste der Fehler des Compilers.",
            "en": "The list of the compiler's errors.",
        })
    },
    {
        name: "withPCode", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Ansicht des erzeugten Zwischencodes.",
            "en": "The view of the generated intermediate code.",
        })
    },
    {
        name: "withClassDiagram", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Klassendiagramm rechts.",
            "en": "The class diagram on the right.",
        })
    },
    {
        name: "withBottomPanel", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Der ganze untere Bereich. Aus lässt auch alles darin weg.",
            "en": "The whole bottom area. Off leaves out everything in it too.",
        })
    },
    {
        name: "hideEditor", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Nur das laufende Programm zeigen, ohne den Editor.",
            "en": "Show only the running program, without the editor.",
        })
    },
    {
        name: "hideStartPanel", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Die Knopfleiste zum Starten und Anhalten weglassen.",
            "en": "Leave out the row of buttons for starting and stopping.",
        })
    },
    {
        name: "cacheUserEdits", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Änderungen im Browser merken, so dass sie einen Reload überleben.",
            "en": "Remember edits in the browser, so that they survive a reload.",
        })
    },
    {
        name: "enableFileAccess", kind: "boolean", values: "true, false",
        description: () => lm({
            "de": "Der Seite erlauben, die Dateien der IDE über window.online_ide_access zu lesen.",
            "en": "Let the page read the IDE's files through window.online_ide_access.",
        })
    },
    {
        name: "spritesheetURL", kind: "string", values: "URL",
        description: () => lm({
            "de": "Ein gezipptes Spritesheet mit eigenen Grafiken.",
            "en": "A zipped spritesheet of your own graphics.",
        })
    },
    {
        name: "jsonFilename", kind: "string", values: "…json",
        description: () => lm({
            "de": "Vorgeschlagener Dateiname beim Speichern des Workspace.",
            "en": "Filename suggested when the workspace is saved to a file.",
        })
    },
    {
        name: "programmingLanguage", kind: "string", values: "java, …",
        description: () => lm({
            "de": "Programmiersprache, in der die Dateien geschrieben sind.",
            "en": "Programming language the files are written in.",
        })
    },
    {
        name: "setting.<name>", kind: "special", values: "…",
        description: () => lm({
            "de": "Eine einzelne Einstellung der IDE, z.B. setting.compiler.shadowedSymbolErrorLevel=error",
            "en": "One single IDE setting, e.g. setting.compiler.shadowedSymbolErrorLevel=error",
        })
    },
];

/**
 * The table's names are the config's names, apart from the few "special" ones the
 * parser handles by hand — hence the cast; `configFromURLParameters` below is the
 * only reader.
 */
const BOOLEAN_KEYS = <(keyof JavaOnlineConfig)[]>URL_PARAMETERS.filter(p => p.kind == "boolean").map(p => p.name);
const STRING_KEYS = <(keyof JavaOnlineConfig)[]>URL_PARAMETERS.filter(p => p.kind == "string").map(p => p.name);

/** Prefix under which a single IDE setting is passed: `?setting.foo.bar=baz`. */
const SETTING_PREFIX = "setting.";

/**
 * "true", "1", "yes" and "on" are true, their opposites false, anything else is
 * not an answer and leaves the option alone — a mistyped parameter should not
 * silently turn a panel off.
 */
function asBoolean(value: string): boolean | undefined {
    switch (value.trim().toLowerCase()) {
        case "true": case "1": case "yes": case "on": return true;
        case "false": case "0": case "no": case "off": return false;
        default: return undefined;
    }
}

/** `?setting.compiler.shadowedSymbolErrorLevel=error`, typed as far as a string can be. */
function asSettingValue(value: string): SettingValue {
    let asBool = asBoolean(value);
    if (asBool !== undefined) return asBool;
    let asNumber = Number(value);
    if (value.trim() != "" && !Number.isNaN(asNumber)) return asNumber;
    return value;
}

/**
 * The configuration the current URL asks for. Parameters the URL doesn't mention
 * are absent from the result rather than undefined in it, so that the caller can
 * layer it over the div's own configuration without erasing it.
 */
export function configFromURLParameters(search: string = window.location.search): Partial<JavaOnlineConfig> {
    let parameters = new URLSearchParams(search);
    let config: Partial<JavaOnlineConfig> = {};

    for (let key of BOOLEAN_KEYS) {
        let value = parameters.get(key);
        if (value == null) continue;
        let asBool = asBoolean(value);
        if (asBool !== undefined) (<any>config)[key] = asBool;
    }

    for (let key of STRING_KEYS) {
        let value = parameters.get(key);
        if (value != null && value != "") (<any>config)[key] = value;
    }

    if (parameters.has("theme")) {
        let theme = parameters.get("theme")!.trim().toLowerCase();
        if (theme == "dark" || theme == "light") config.theme = theme;
    }

    // "max" runs the program as fast as it can, a number is steps per second
    if (parameters.has("speed")) {
        let speed = parameters.get("speed")!.trim().toLowerCase();
        if (speed == "max") {
            config.speed = "max";
        } else {
            let stepsPerSecond = Number(speed);
            if (speed != "" && !Number.isNaN(stepsPerSecond)) config.speed = stepsPerSecond;
        }
    }

    // ?libraries=scratch,nrw — an empty value means "no library", which is a
    // different statement from not mentioning the parameter at all
    if (parameters.has("libraries")) {
        config.libraries = parameters.get("libraries")!
            .split(",").map(library => library.trim()).filter(library => library != "");
    }

    let settings: Record<string, SettingValue> = {};
    for (let [name, value] of parameters) {
        if (!name.startsWith(SETTING_PREFIX)) continue;
        settings[name.substring(SETTING_PREFIX.length)] = asSettingValue(value);
    }
    if (Object.keys(settings).length > 0) config.settings = <Partial<Record<SettingKey, SettingValue>>>settings;

    return config;
}

/**
 * What the current URL says about a parameter, for the help panel: the value it
 * carries, or undefined where it doesn't mention it. `setting.<name>` stands for
 * a family of parameters, so all of its members are listed together.
 */
export function urlParameterValue(name: string, search: string = window.location.search): string | undefined {
    let parameters = new URLSearchParams(search);

    if (name == SETTING_PREFIX + "<name>") {
        let named = [...parameters].filter(([key]) => key.startsWith(SETTING_PREFIX));
        return named.length == 0 ? undefined : named.map(([key, value]) => key + "=" + value).join(", ");
    }

    return parameters.get(name) ?? undefined;
}

/**
 * The id of a workspace shared through the json store, from `#json=<id>`.
 *
 * It rides in the fragment rather than in the query so that a share link keeps
 * saying what it configures: `?libraries=scratch&theme=light#json=abc` is the
 * playground of that link, holding the code that was shared.
 */
export function sharedWorkspaceIdFromURL(hash: string = window.location.hash): string | undefined {
    let match = /^#(?:.*&)?json=([^&]+)/.exec(hash);
    return match ? decodeURIComponent(match[1]) : undefined;
}
