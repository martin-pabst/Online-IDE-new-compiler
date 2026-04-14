# This Fork

This Fork of Online-IDE focuses only on the embedded version. It's API is extended
to provide notifications when files are selected, created, deleted or renamed and
allows more simplifications of the user interface.

## Deployment
This repo provides multiple deployment options for developers:

- Build: install dependencies and produce the static bundle:

```bash
npm ci
npm run build
```

This creates the `dist/` folder with the compiled app and required assets (for example `dist/assets`, `dist/lib`, `dist/online-ide-embedded.js`, `dist/online-ide-embedded.css`).

- Static hosting: publish the contents of `dist/` to a web server or CDN. A helper script is available at `scripts/deploy_via_ssh.sh` for SSH-based deploys.

- Docker: build and run a container using the provided `Dockerfile` (helper: `scripts/build_docker.sh`) and publish with `scripts/publish_image.sh` if needed.

Notes:
- The Embedded-IDE is a static web app and can be served from any static host. The full Online-IDE variant requires a server backend — see the `documentation/` folder for server deployment details.

**GitHub Actions**

This repository includes a CI/Deploy workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) that automates build and deployment.

- Triggers: `push` to `main`, `release` publish, `workflow_dispatch` (manual) and PR synchronizations.
- Jobs:
    - `build`: installs Node, runs `scripts/install_and_build.sh` and uploads the produced `dist/` artifact.
    - `build-and-publish`: downloads `dist/`, builds a Docker image (uses `scripts/build_docker.sh`) and pushes it to GitHub Container Registry. The repository variable `IMAGE_NAME` is used to control image naming.
    - `deploy`: runs `scripts/deploy_via_ssh.sh` on a remote host and uses secrets to connect and deploy the container.

Key repo variables and secrets used by the workflow:

- `vars.IMAGE_NAME` (optional) — override the default image name/tag.
- `secrets.SSH_HOST`, `secrets.SSH_USER`, `secrets.SSH_PRIVATE_KEY` — SSH target for the `deploy` job.
- `secrets.REMOTE_PORT`, `secrets.CONTAINER_NAME` — optional deployment parameters.

To run the workflow manually, open the Actions tab in GitHub, select **CI Deploy**, and choose **Run workflow**.



## Online-IDE

Programmiersprache, die eine [große Teilmenge von Java](https://learnj.de/doku.php?id=unterschiede_zu_java:start) umfasst zusammen mit einer Entwicklungsumgebung (mit Compiler, Interpreter und Debugger), die **komplett im Browser** ausgeführt wird.

Die IDE gibt es in zwei Varianten: als **[Online-IDE für Schulen](https://www.online-ide.de)** zur Verwendung im Unterricht und bei den Schüler/innen zuhause sowie als kleine **[Embedded-IDE](#2-embedded-ide)** (Open Source, GNU GPL v3), die in beliebige Webseiten eingebunden werden kann und mit der beispielsweise Informatiklehrkräfte begleitend zum Unterricht eine interaktive Dokumentation für die Schüler/innen erstellen können. Die [Dokumentation der Programmiersprache zusammen mit einem umfangreichen interaktiven Java-Kurs finden Sie hier.](https://www.learnj.de)

### 1. Online-IDE für Schulen

![Online-IDE](assets/graphics/Online-IDE.png)
Mit der Online-IDE können Schüler/innen im Browser [in einer Java-ähnlichen Programmiersprache](https://www.learnj.de/doku.php?id=unterschiede_zu_java:start) programmieren. Die Programme werden auf dem Server gespeichert, so dass zuhause dieselbe Programmierumgebung bereitsteht wie in der Schule - ganz ohne Installation.

Die Lehrkraft hat Zugriff auf die Workspaces der Schüler/innen, so dass sie Hausaufgaben bequem korrigieren und bei Programmfehlern schnell helfen kann.

**Weitere Features**:

- Integriertes Repository für Gruppenarbeiten
- Code-Vervollständigung, Parameterhilfe, Refactor->Rename, Anzeige von Referenzen usw. wie in jeder modernen Entwicklungsumgebung
- Automatisches Kompilieren und Fehleranzeige während der Eingabe
- Schneller Programmstart ("Play-Button")
- Ausführungsgeschwindigkeit regelbar
- Debugger mit Breakpoints, Anzeige der lokalen Variablen, Watch-Expressions
- Ausführung wahlweise im Einzelschritt
- Console-Fenster zur Eingabe und sofortigen Ausführung einzelner Anweisungen
- Schneller, bequemer Hausaufgaben-Workflow
- Möglichkeit, elektronische Prüfungen abzuhalten

### 2. Embedded-IDE

Die Java-ähnliche Programmiersprache ist im [LearnJ-Wiki](https://www.learnj.de) ausführlich beschrieben und dort ist die IDE in Embedded-Form auch vielfach zu sehen. Hier [ein schönes Beispiel des vollen Funktionsumfangs!](https://www.learnj.de/doku.php?id=api:documentation:grafik:animation#beispiel_4feuerwerk)

### Integration als <iframe> in Moodle

Mehr dazu [auf dieser Seite.](https://www.embed.learnj.de/createwrapper.html) 

### Build

Nach dem Checkout des Repository können Sie den dist-Ordner mit den fertigen Programmdateien erstellen mittels:

``` bash
    npm install
    npm run build
```

### Integration in eigene Webseiten

Die Integration der Embedded-Version in eigene Webseiten [ist hier beschrieben.](https://learnj.de/doku.php?id=onlineide:integration:start)

Benötigt werden

- dist/assets/fonts
- dist/assets/graphics
- dist/assets/mp3
- dist/lib
- dist/online-ide-embedded.css
- dist/online-ide-embedded.js
