Adding icons later: src/development/IconTool.js has three commands:

  * `node src/development/IconTool.js clean` – removes the metadata again after editing in Inkscape.
  * `node src/development/IconTool.js derive` – creates missing light icons. It only overwrites existing ones with --force and explicit names.
  * `node src/development/IconTool.js check` – compares icons.css with the files in both folders.