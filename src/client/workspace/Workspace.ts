import jQuery from 'jquery';
import { WorkspaceData, WorkspaceSettings } from "../communication/Data.js";
import { Main } from "../main/Main.js";
import { MainBase } from "../main/MainBase.js";
import { GUIFile } from "./File.js";

import * as PIXI from 'pixi.js';
import { CompilerWorkspace } from '../../compiler/common/module/CompilerWorkspace.js';
import { Compiler } from '../../compiler/common/Compiler.js';
import { JavaLibraryManager } from '../../compiler/java/runtime/JavaLibraryManager.js';

import type * as monaco from 'monaco-editor'
import { Module } from '../../compiler/common/module/Module.js';
import { TreeviewNode } from '../../tools/components/treeview/TreeviewNode.js';
import { GuiMessages } from '../main/gui/language/GuiMessages.js';


export class Workspace extends CompilerWorkspace {

    isFolder: boolean;
    parent_folder_id: number | null;
    readonly: boolean;
    id: number;
    owner_id: number;

    version: number;
    // published_to 0: none; 1: class; 2: school; 3: all
    published_to: number;

    repository_id: number;    // id of repository-workspace
    has_write_permission_to_repository: boolean; // true if owner of this working copy has write permission to repository workspace

    spritesheetId: number;

    grade?: string;
    points?: string;
    comment?: string;
    attended_exam?: boolean;

    private files: GUIFile[] = [];

    currentlyOpenFile: GUIFile;
    saved: boolean = true;

    pruefung_id: number;

    userSpritesheet: PIXI.Spritesheet; // TODO!

    settings: WorkspaceSettings = {
        libraries: []
    };

    constructor(name: string, private main: MainBase, owner_id: number) {
        super(name);
        this.owner_id = owner_id;
    }

    setLibraries(compiler: Compiler) {

        let libManager = new JavaLibraryManager();
        libManager.addLibraries(...this.settings.libraries);
        libManager.addLibrariesToCompiler(compiler);

    }


    getFiles(): GUIFile[] {
        return this.files;
    }

    removeAllFiles() {
        for (let file of this.files.filter(f => f.hasMonacoModel())) {
            file.getMonacoModel().dispose();
        }
        this.files = [];
    }

    addFile(file: GUIFile) {
        this.files.push(file);
    }

    removeFile(file: GUIFile) {
        let index = this.files.indexOf(file);
        if (index >= 0) this.files.splice(index, 1);
    }


    getWorkspaceData(withFiles: boolean): WorkspaceData {
        let wd: WorkspaceData = {
            name: this.name,
            isFolder: this.isFolder,
            parent_folder_id: this.parent_folder_id,
            id: this.id,
            owner_id: this.owner_id,
            current_file_id: this.currentlyOpenFile == null ? null : this.currentlyOpenFile.id,
            files: [],
            version: this.version,
            repository_id: this.repository_id,
            has_write_permission_to_repository: this.has_write_permission_to_repository,
            settings: JSON.stringify(this.settings),
            spritesheet_id: this.spritesheetId,
            pruefung_id: this.pruefung_id,
            readonly: this.readonly,
            grade: this.grade,
            points: this.points,
            comment: this.comment,
            attended_exam: this.attended_exam
        }

        if (withFiles) {
            for (let file of this.files) {
                wd.files.push(file.getFileData(this));
            }
        }

        return wd;
    }


    renderSynchronizeButton(node: TreeviewNode<Workspace, number>) {

        let button = node.getIconButtonByTag("Synchronize");
        if (!button) {
            button = node.addIconButton("img_open-change-dark", () => {
                this.synchronizeWithRepository();
            }, GuiMessages.SynchronizeWorkspace(),
                false)
            button.tag = "Synchronize";
        }

        let myMain: Main = <Main><any>this.main;

        button.setVisible(this.repository_id != null && this.owner_id == myMain.user.id);

    }

    synchronizeWithRepository() {
        let myMain: Main = <Main><any>this.main;
        if (this.repository_id != null && this.owner_id == myMain.user.id) {
            myMain.networkManager.sendUpdatesAsync(true).then(() => {
                myMain.synchronizationManager.synchronizeWithWorkspace(this);
            });
        }
    }

    static restoreFromData(wd: WorkspaceData, main: MainBase): Workspace {

        let settings: WorkspaceSettings = (wd.settings != null && wd.settings.startsWith("{")) ? JSON.parse(wd.settings) : { libraries: [] };

        //@ts-ignore
        if (settings.libaries) {
            //@ts-ignore
            settings.libraries = settings.libaries;
        }

        let w = new Workspace(wd.name, main, wd.owner_id);
        w.id = wd.id;
        w.isFolder = wd.isFolder;
        w.parent_folder_id = wd.parent_folder_id;
        w.owner_id = wd.owner_id;
        w.version = wd.version;
        w.repository_id = wd.repository_id;
        w.has_write_permission_to_repository = wd.has_write_permission_to_repository;
        w.settings = settings;
        w.pruefung_id = wd.pruefung_id;

        w.spritesheetId = wd.spritesheet_id;
        w.readonly = wd.readonly;

        w.grade = wd.grade;
        w.points = wd.points;
        w.comment = wd.comment;
        w.attended_exam = wd.attended_exam;

        if (w.settings.libraries == null) {
            w.settings.libraries = [];
        }

        for (let f of wd.files) {

            let file = GUIFile.restoreFromData(main, f);
            w.files.push(file);

            if (f.id == wd.current_file_id) {
                w.currentlyOpenFile = file;
            }

        }

        return w;

    }

    findFileById(id: number): GUIFile {
        return this.files.find(f => f.id == id);
    }

    getFirstFile(): GUIFile | undefined {
        if (this.files.length > 0) return this.files[0];
        return undefined;
    }

    getIdentifier(): string {
        return this.name;
    }

    getModuleForMonacoModel(model: monaco.editor.ITextModel | null): Module | undefined {
        if (model == null) return undefined;

        let compiler = this.main?.getCompiler();
        if (!compiler) return undefined;

        for (let file of this.getFiles()) {
            if (file.getMonacoModel() == model) {
                return this.main.getCompiler().findModuleByFile(file);
            }
        }

        let replModule = this.main.getRepl().getCurrentModule();
        if (replModule && replModule.file instanceof GUIFile) {
            if (replModule.file.getMonacoModel() == model) {
                return replModule;
            }
        }

        return undefined;
    }

    async ensureModuleIsCompiled(module: Module) {
        if (module.isReplModule()) {
            this.main.getRepl().compile(module.file.getText(), false);
        } else {
            await this.main.getCompiler().updateSingleModuleForCodeCompletion(module);
        }
    }

    getCurrentlyEditedModule(): Module | undefined {
        let model = this.main.getMainEditor().getModel();
        if (!model) return;
        return this.getModuleForMonacoModel(model);
    }

    getFileForMonacoModel(model: monaco.editor.ITextModel | null): GUIFile | undefined {
        if (model == null) return undefined;

        for (let file of this.getFiles()) {
            if (file.getMonacoModel() == model) {
                return file;
            }
        }

        return undefined;
    }

    getCurrentlyEditedFile(): GUIFile | undefined {
        let model = this.main.getMainEditor().getModel();
        if (!model) return;
        return this.getFileForMonacoModel(model);
    }

    /*
     * monaco editor counts LanguageChangedListeners and issues ugly warnings in console if more than
     * 200, 300, ... are created. Unfortunately it creates one each time a monaco.editor.ITextModel is created.
     * To keep monaco.editor.ITextModel instance count low we instantiate it only when needed and dispose of it
     * when switching to another workspace.
     */

    disposeMonacoModels() {
        this.getFiles().forEach(file => file.disposeMonacoModel());
    }

    createMonacoModels() {
        this.getFiles().forEach(file => file.getMonacoModel());
    }


}

