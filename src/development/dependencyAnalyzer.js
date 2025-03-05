import * as fs from 'fs';


let lines = fs.readFileSync('out.txt', "utf-8").split("\n");

let fileToDependentFilesMap = new Map();  // Map<string, string[]>
let currentFile = null;
let currentDependentFilesList = null;
lines.shift();
for (let line of lines) {
    line = line.replace("\r", "");
    line = line.replaceAll("\u0000", "");
    if (line.startsWith("  ")) {
        if (currentDependentFilesList != null) {
            currentDependentFilesList.push(line.trim());
        }
    } else {
        if(line.trim().length == 0) continue;
        currentFile = line;
        currentDependentFilesList = [];
        fileToDependentFilesMap.set(currentFile, currentDependentFilesList);
    }
}


let df = fileToDependentFilesMap.get('src/compiler/java/JavaCompiler.ts');



let pathFromTo = (from, to) => {
    let visited = new Map();  // Map<string, boolean>
    let path = [];
    if(pathFromToRecursive(from, to, path, visited)){
        console.log(path);
    }
}

let pathFromToRecursive = (from, to, path, visited) => {
    visited.set(from, true);
    path.push(from);
    
    if(to == from) return true;

    let dl = fileToDependentFilesMap.get(from);
    let found = false;
    for(let d of dl){
        if(!visited.get(d)){
            if(pathFromToRecursive(d, to, path, visited)){
                found = true;
                break;
            }
        }
    }
    if(!found) path.pop();
    return found;
}

pathFromTo('src/compiler/java/JavaCompiler.ts', 'src/compiler/java/runtime/system/SystemModule.ts');