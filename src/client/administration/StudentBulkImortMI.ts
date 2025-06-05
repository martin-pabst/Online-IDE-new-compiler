import { AdminMenuItem } from "./AdminMenuItem.js";
import { UserData, ClassData, GetClassesDataRequest, GetClassesDataResponse, BulkCreateUsersRequest, BulkCreateUsersResponse } from "../communication/Data.js";
import { ajax, ajaxAsync } from "../communication/AjaxHelper.js";
import { Administration } from "./Administration.js";
import { setSelectItems, getSelectedObject } from "../../tools/HtmlTools.js";
import { w2grid } from 'w2ui'
import jQuery from 'jquery'



type Step = "Step 1 Paste" | "Step 2 check" | "Step 3 import" | "Step 4 print";

type Column = "klasse" | "rufname" | "familienname" | "username" | "passwort";
type ColumnMapping = { [column: string]: number };

export class StudentBulkImportMI extends AdminMenuItem {

    destroy() {
        this.studentGrid.destroy();
    }

    studentGrid: w2grid;

    step: Step;
    $tableLeft: JQuery<HTMLElement>;
    $tableRight: JQuery<HTMLElement>;

    $importTextArea: JQuery<HTMLElement>;
    $protocol: JQuery<HTMLElement>;

    classes: ClassData[] = [];
    selectedClass: ClassData;
    usersToWrite: UserData[];

    constructor(administration: Administration) {
        super(administration);
    }

    checkPermission(user: UserData): boolean {
        return user.is_teacher;
    }

    getButtonIdentifier(): string {
        return "Schülerdatenimport";
    }

    async fetchClassesFromServer(){
        let request: GetClassesDataRequest = {
            school_id: this.administration.userData.schule_id
        }

        const response: GetClassesDataResponse = await ajaxAsync('servlet/getClassesData', request);
        this.classes = response.classDataList;
    }

    async onMenuButtonPressed($mainHeading: JQuery<HTMLElement>, $tableLeft: JQuery<HTMLElement>,
        $tableRight: JQuery<HTMLElement>, $mainFooter: JQuery<HTMLElement>) {

        await this.fetchClassesFromServer();

        this.$tableLeft = $tableLeft;
        this.$tableRight = $tableRight;


        $tableRight.css('flex', '2');

        let that = this;
        this.studentGrid = new w2grid({
            name: "studentgrid",
            header: 'Schüler/innen',
            selectType: "cell",
            show: {
                header: true,
                toolbar: true,
                toolbarDelete: true,
                footer: true,
                selectColumn: true,
                toolbarSearch: false
            },
            toolbar: {
                items: [
                ]
            },
            recid: "id",
            columns: [
                { field: 'id', text: 'ID', size: '20px', sortable: true, hidden: true },
                { field: 'klasse_id', text: 'Klasse', size: '20%', sortable: true, resizable: true, 
                    render: function (record: UserData) {
                        let classData = that.classes.find(cl => cl.id == record.klasse_id);
                        let classIdentifier = classData != null ? classData.name : "";
                            return '<div>' + classIdentifier + '</div>';
                    },
                    editable: { type: 'list', items: that.classes.map(cl => {return {id: cl.id, text: cl.name}}), showAll: true, openOnFocus: true },
                    sortMode: 'i18n' },
                { field: 'rufname', text: 'Rufname', size: '20%', sortable: true, resizable: true, editable: { type: 'text' }, sortMode: 'i18n' },
                { field: 'familienname', text: 'Familienname', size: '20%', sortable: true, resizable: true, editable: { type: 'text' }, sortMode: 'i18n' },
                { field: 'username', text: 'Benutzername', size: '20%', sortable: true, resizable: true, editable: { type: 'text' }, sortMode: 'i18n' },
                { field: 'password', text: 'Passwort', size: '20%', sortable: false, editable: { type: 'text' } }
            ],
            searches: [
                { field: 'username', label: 'Benutzername', type: 'text' },
                { field: 'rufname', label: 'Rufname', type: 'text' },
                { field: 'familienname', label: 'Familienname', type: 'text' }
            ],
            sortData: [{ field: 'klasse_id', direction: 'asc' }, { field: 'familienname', direction: 'asc' }, { field: 'rufname', direction: 'asc' }],
            onDelete: function (event) {
                if (!event.detail.force || event.isStopped) return;
                let recIds: number[] = this.studentsGrid.getSelection().map((sel) => sel["recid"]).filter((value, index, array) => array.indexOf(value) === index);
                event.onComplete = () => {
                    recIds.forEach((id) => this.studentsGrid.remove(id + ""));
                }
            },
            onChange: (event) => {
                that.onUpdateStudent(event);
            }
        });

        this.studentGrid.render($tableRight[0]);

        this.showStep("Step 1 Paste");

    }

    onUpdateStudent(event: any){
        let student: UserData = <UserData>this.studentGrid.records[event.detail.index];
        let newValue = event.detail.value.new;
        let field = this.studentGrid.columns[event.detail.column]["field"];

        if(event.detail.column == 1){
            student.klasse_id = newValue.id;
        }
        if(student["w2ui"]){
            delete student["w2ui"]["changes"][field];
        }
    }

    showStep(step: Step) {

        this.$tableLeft.empty();

        switch (step) {
            case "Step 1 Paste":
                this.enableGrid(false);
                this.showStep1Paste();
                break;
            case "Step 2 check":
                this.enableGrid(true);
                this.showStep2Check();
                break;
            case "Step 3 import":
                this.enableGrid(false);
                this.showStep3Import();
                break;
            case "Step 4 print":
                this.enableGrid(false);
                this.showStep4Print();
                break;
        }

        this.step = step;
    }

    showStep4Print() {

        let description: string = `Die Schüler/innen wurden erfolgreich angelegt und der Klasse/den Klassen (ersatzweise: ${this.selectedClass.name}) zugeordnet.
        Eine Liste der Zugangsdaten zum Ausdrucken erhalten Sie durch Klick auf den Button "Drucken...".
        `

        this.$tableLeft.append(jQuery('<div class="jo_bulk_heading">Schritt 4: Fertig!</div>'));
        let $description = jQuery(`<div class="jo_bulk_description"></div>`);
        $description.html(description);
        this.$tableLeft.append($description);

        let $buttondiv = jQuery(`<div class="jo_bulk_buttondiv" style="justify-content: space-between"></div>`);
        this.$tableLeft.append($buttondiv);
        let $buttonPrint = jQuery(`<div class="jo_buttonContinue jo_button jo_active">Drucken...</div>`);
        $buttondiv.append($buttonPrint);

        let $buttonWriteUsers = jQuery(`<div class="jo_buttonContinue jo_button jo_active">OK</div>`);
        $buttondiv.append($buttonWriteUsers);

        let $printDiv = jQuery('#print');
        $printDiv.empty();
        this.usersToWrite.forEach((user) => {
            $printDiv.append(`<div style="page-break-inside: avoid;">
            <div><b>URL:</b> https://www.online-ide.de</div>
            <div><b>Name:</b> ${user.rufname} ${user.familienname}</div>
            <div><b>Klasse:</b> ${this.classes.find(cl => cl.id == user.klasse_id)?.name}</div>
            <div><b>Benutzername:</b> ${user.username}</div>
            <div style="margin-bottom: 3em"><b>Passwort:</b> ${user.password}</div>
            </div>`);
        });

        $buttonPrint.on('click', () => {
            jQuery('#outer').css('display', 'none');
            window.print();
            jQuery('#outer').css('display', '');
        })

        $buttonWriteUsers.on('click', () => {

            this.studentGrid.clear();
            this.showStep("Step 1 Paste");

        })


    }

    showStep3Import() {

        let description: string = `Die Schüler/innen können jetzt angelegt und der Klasse ${this.selectedClass.name} zugeordnet werden.`

        this.$tableLeft.append(jQuery('<div class="jo_bulk_heading">Schritt 3: Benutzer anlegen</div>'));
        let $description = jQuery(`<div class="jo_bulk_description"></div>`);
        $description.html(description);
        this.$tableLeft.append($description);

        let $buttondiv = jQuery(`<div class="jo_bulk_buttondiv" style="justify-content: space-between"></div>`);
        this.$tableLeft.append($buttondiv);
        let $buttonBack = jQuery(`<div class="jo_buttonContinue jo_button jo_active">Zurück</div>`);
        $buttondiv.append($buttonBack);
        let $buttonWriteUsers = jQuery(`<div class="jo_buttonWriteUsers jo_button jo_active">Benutzer anlegen</div>`);
        $buttondiv.append($buttonWriteUsers);

        this.$protocol = jQuery('<div class="jo_bulk_protocol"></div>');
        this.$tableLeft.append(this.$protocol);
        this.$protocol.hide();

        $buttonBack.on('click', () => {
            this.showStep("Step 2 check");
        })


        $buttonWriteUsers.on('click', () => {

            $buttonWriteUsers.removeClass('jo_active');

            this.$protocol.show();
            this.$protocol.html("<div>Die Benutzer werden angelegt. Bitte warten...</div>");

            let request: BulkCreateUsersRequest = {
                onlyCheckUsernames: false,
                schule_id: this.administration.userData.schule_id,
                users: this.usersToWrite
            }

            ajax('bulkCreateUsers', request, (response: BulkCreateUsersResponse) => {
                this.showStep("Step 4 print");
            }, (message) => {
                alert("Fehler: " + message);
                this.showStep("Step 2 check");
            });

        })


    }

    showStep2Check() {

        let description: string = `Bitte wählen Sie im Auswahlfeld die Klasse aus, in die die Schülerdaten importiert werden sollen, 
        für die in den Eingabedaten keine Klasse angegeben ist. Sie können die Daten in der Tabelle noch bearbeiten, bevor Sie sie zur Überprüfung (noch kein Import!) absenden.`

        this.$tableLeft.append(jQuery('<div class="jo_bulk_heading">Schritt 2: Daten überprüfen</div>'));
        let $description = jQuery(`<div class="jo_bulk_description"></div>`);
        $description.html(description);
        this.$tableLeft.append($description);


        let $select = <JQuery<HTMLSelectElement>>jQuery('<select class="jo_bulk_chooseClass"></select>');
        this.$tableLeft.append($select);

        setSelectItems($select, this.classes.map((cd) => {
            return {
                caption: cd.name,
                value: cd.id,
                object: cd
            }
        }));


        let $buttondiv = jQuery(`<div class="jo_bulk_buttondiv" style="justify-content: space-between"></div>`);
        this.$tableLeft.append($buttondiv);
        let $buttonBack = jQuery(`<div class="jo_buttonContinue jo_button jo_active">Zurück</div>`);
        $buttondiv.append($buttonBack);
        let $buttonContinue = jQuery(`<div class="jo_buttonContinue jo_button jo_active">Daten überprüfen...</div>`);
        $buttondiv.append($buttonContinue);

        this.$tableLeft.append(jQuery('<div class="jo_bulk_heading_protocol">Fehlerprotokoll</div>'));
        this.$protocol = jQuery('<div class="jo_bulk_protocol"></div>');
        this.$tableLeft.append(this.$protocol);

        $buttonBack.on('click', () => {
            this.showStep("Step 1 Paste");
        })

        $buttonContinue.on('click', () => {
            this.selectedClass = getSelectedObject($select);
            this.checkData(this.selectedClass);
        })


    }

    checkData(classData: ClassData) {

        for(let record of this.studentGrid.records){
            if(record["w2ui"] && record["w2ui"]["changes"]) delete record["w2ui"]["changes"]["klasse_id"];
            if(record.klasse_id == -1) record.klasse_id = classData.id;
        }

        this.studentGrid.mergeChanges();

        this.usersToWrite = <UserData[]>this.studentGrid.records

        let request: BulkCreateUsersRequest = {
            onlyCheckUsernames: true,
            schule_id: this.administration.userData.schule_id,
            users: this.usersToWrite
        }

        ajax('bulkCreateUsers', request, (response: BulkCreateUsersResponse) => {
            if (response.namesAlreadyUsed.length == 0) {

                for (let user of this.usersToWrite) {
                    user.schule_id = this.administration.userData.schule_id;
                    if(user.klasse_id == -1) user.klasse_id = classData.id;
                    user.is_admin = false;
                    user.is_schooladmin = false;
                    user.is_teacher = false;
                }

                this.showStep("Step 3 import");
            } else {
                this.$protocol.html('Diese Benutzernamen sind schon anderen Benutzern zugeordnet und können daher nicht verwendet werden: <br>' + response.namesAlreadyUsed.join(", "));
            }
        }, (message) => {
            alert("Fehler: " + message);
        });

        return false;
    }

    showStep1Paste() {

        let description: string = `
        Zum Importieren wird eine Tabelle mit den Spalten Rufname, Familienname, Username, (optional:) Klasse und (ebenso optional:) Passwort benötigt,
        wobei die Daten in den Zellen jeweils mit Tab-Zeichen getrennt sind. Sie erhalten dieses Format beispielsweise,
        indem Sie eine Tabelle in Excel in die Zwischenablage kopieren. <br> Falls die erste Zeile Spaltenköpfe mit
        den korrekten Bezeichnern (Klasse, Rufname, Familienname, Username, Passwort) enthält, kümmert sich der Import-Algorithmus
        um die richtige Reihenfolge und blendet ggf. auch überflüssige Spalten aus. Falls eine Zeile kein Passwort enthält,
        setzt die Online-IDE ein Zufallspasswort.<br>
        Bitte fügen Sie den Inhalt der Tabelle per Copy-Paste in dieses Eingabefeld ein:`

        this.$tableLeft.append(jQuery('<div class="jo_bulk_heading">Schritt 1: Daten einlesen</div>'));
        let $description = jQuery(`<div class="jo_bulk_description"></div>`);
        this.$tableLeft.append($description);
        // this.$tableLeft.append(description);

        this.$importTextArea = jQuery(`<textarea class="jo_bulk_importarea"></textarea>`);
        this.$tableLeft.append(this.$importTextArea);
        this.$importTextArea.html('');

        let $buttondiv = jQuery(`<div class="jo_bulk_buttondiv" style="justify-content: flex-end"></div>`);
        this.$tableLeft.append($buttondiv);
        let $buttonContinue = jQuery(`<div class="jo_buttonContinue jo_button jo_active">Weiter</div>`);
        $buttondiv.append($buttonContinue);

        $buttonContinue.on('click', () => {
            this.parseText(<string>this.$importTextArea.val());
            this.showStep("Step 2 check");
        })

        // this.$tableLeft.append(jQuery('<div class="jo_bulk_heading_protocol">Importprotokoll</div>'));
        // this.$protocol = jQuery('<div class="jo_bulk_protocol"></div>');
        // this.$tableLeft.append(this.$protocol);

        $description.html(description);

    }

    parseText(text: string) {

        // this.$protocol.empty();

        let lines1: string[] = text.split(/\r?\n/);

        let lines: string[][] = [];
        for (let line1 of lines1) {
            if (line1.length > 6) {
                let columns: string[] = line1.split(/\t/);
                lines.push(columns);
            }
        }

        let cm = this.getColumnMapping(lines);
        let columnMapping: ColumnMapping = cm.columnMapping;

        let userData: UserData[] = this.makeUserData(lines, columnMapping);
        if (userData.length > 0) {
            this.studentGrid.clear();
            this.studentGrid.add(userData);
            this.studentGrid.refresh();
        }
    }

    makeUserData(lines: string[][], columnMapping: ColumnMapping): UserData[] {

        let userData: UserData[] = [];
        let id: number = 1;

        for (let line of lines) {
            let password: string = StudentBulkImportMI.getRandomPassword();
            if(columnMapping["passwort"] && line[columnMapping["passwort"]] != null){
                password = line[columnMapping["passwort"]].trim()
            }

            let classIdentifier = line[columnMapping["klasse"]];
            let klasse_id: number = -1;
            if(classIdentifier != null){
                klasse_id = this.classes.find(cl => cl.name.toLowerCase() == classIdentifier.toLowerCase())?.id;
                if(klasse_id == null) klasse_id = -1;
            }

            userData.push({
                id: id++,
                familienname: line[columnMapping["familienname"]],
                rufname: line[columnMapping["rufname"]],
                username: line[columnMapping["username"]].trim(),
                password: password,
                is_admin: false,
                is_schooladmin: false,
                is_teacher: false,
                locked: false,
                klasse_id: klasse_id,
                schule_id: -1
            });
        }

        return userData;

    }

    static getRandomPassword(minimumLength: number = 8, minimumNumberOfCategries: number = 3): string {
        let categoryList: string[] = ["abcdefghkmnpqrstuvwxy", "ABCDEFGHKLMNPQRSTUVW", "123456789", "#!§$%&/()=[]{}*+:;,.-"];

        let goodCharacters: string = categoryList.join("");

        let goodPasswordFound: boolean = false;
        let pw: string = '';

        while(!goodPasswordFound){
            pw = '';
            let categories: Map<number, boolean> = new Map();
            for(let i = 0; i< minimumLength; i++){
                let c = goodCharacters.charAt(Math.trunc(Math.random() * goodCharacters.length));
                pw += c;
                for(let i = 0; i < categoryList.length; i++){
                    let category = categoryList[i];
                    if(category.indexOf(c) >= 0){
                        categories.set(i, true);
                    }
                }
            }
            goodPasswordFound = categories.size >= minimumNumberOfCategries;
        }

        return pw;
    }


    getColumnMapping(lines: string[][]): { columnMapping: ColumnMapping, line1HasHeaders: boolean } {

        let columnHeaders: string[] = ["klasse", "rufname", "familienname", "username", "passwort"];

        let columnMapping: ColumnMapping = {
            "klasse": 0, 
            "rufname": 1,
            "familienname": 2,
            "username": 3,
            "passwort": 4
        }

        if (lines.length < 2) {
            // this.$protocol.append(jQuery(`<div>In den Daten sind weniger als zwei Zeilen zu finden. Es wird daher nicht nach einer Kopfzeile gesucht.</div>`))
            return { columnMapping: columnMapping, line1HasHeaders: false };
        }

        let missingHeaders: string[] = [];
        let headersFound: string[] = [];
        let maxColumnIndex: number = 0;

        for (let header of columnHeaders) {
            let index = lines[0].findIndex(column => column.toLocaleLowerCase() == header.toLocaleLowerCase());

            if (index == -1 && header.toLocaleLowerCase() == "passwort") {
                index = lines[0].findIndex(column => column.toLocaleLowerCase() == "password");
            }

            if (index == -1) {
                missingHeaders.push(header);
            } else {
                columnMapping[header] = index;
                if (index > maxColumnIndex) maxColumnIndex = index;
                headersFound.push(header.toLocaleLowerCase());
            }
        }

        // this.$protocol.append(jQuery(`<div>In der 1. Zeile wurden folgende Spaltenköpfe gefunden: ${headersFound.join(", ")}</div>`));
        // if (missingHeaders.length > 0)
        //     this.$protocol.append(jQuery(`<div class="jo_bulk_error">Nicht gefunden wurden: ${missingHeaders.join(", ")}</div>`));

        let line1HasHeaders = headersFound.indexOf("rufname") >= 0 && headersFound.indexOf("familienname") >= 0;

        let lineNumber: number = 1;
        if (line1HasHeaders) {
            lines.splice(0, 1);
            lineNumber++;
        }

        for (let line of lines) {
            if (line.length < maxColumnIndex + 1) {
                // this.$protocol.append(jQuery(`<div class="jo_bulk_error">In Zeile ${lineNumber} gibt es nur ${line.length} Spalten. Benötigt werden aber ${maxColumnIndex + 1} Spalten.</div>`));
            }
            lineNumber++;
        }

        return { columnMapping: columnMapping, line1HasHeaders: line1HasHeaders }

    }

    enableGrid(enabled: boolean) {
        if (enabled) {
            this.studentGrid.unlock();
        } else {
            this.studentGrid.lock("", false);
        }
    }


}