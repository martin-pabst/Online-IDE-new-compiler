import { AdminMenuItem } from "./AdminMenuItem.js";
import { GetTeacherDataRequest, GetTeacherDataResponse, TeacherData, UserData, ClassData, CRUDClassRequest, CRUDUserRequest, CRUDResponse, GetClassesDataRequest, GetClassesDataResponse, ChangeClassOfStudentsRequest, ChangeClassOfStudentsResponse, getUserDisplayName } from "../communication/Data.js";
import { ajax } from "../communication/AjaxHelper.js";
import { Administration } from "./Administration.js";
import { PasswordPopup } from "./PasswordPopup.js";
import { w2alert, w2form, w2grid, w2popup, w2ui, w2utils } from 'w2ui'
import { StudentBulkImportMI } from "./StudentBulkImortMI.js";
import jQuery from 'jquery'
import { AdminMessages } from "./AdministrationMessages.js";


export class ClassesWithStudentsMI extends AdminMenuItem {

    classesGrid: w2grid;
    studentGrid: w2grid;


    destroy() {
        this.classesGrid.destroy();
        this.studentGrid.destroy();
    }

    allClassesList: ClassData[] = [];
    teacherDataList: TeacherData[] = [];

    constructor(administration: Administration) {
        super(administration);
        this.initChooseClassPopup();
    }

    checkPermission(user: UserData): boolean {
        return user.is_teacher;
    }

    getButtonIdentifier(): string {
        return AdminMessages.classesWithStudents();
    }

    onMenuButtonPressed($mainHeading: JQuery<HTMLElement>, $tableLeft: JQuery<HTMLElement>,
        $tableRight: JQuery<HTMLElement>, $mainFooter: JQuery<HTMLElement>) {

        $tableRight.css('flex', '2');

        let that = this;

        this.loadTablesFromTeacherObject(() => {

            this.classesGrid = new w2grid({
                name: "classesGrd",
                header: AdminMessages.classes(),
                // selectType: "cell",
                show: {
                    header: true,
                    toolbar: true,
                    toolbarAdd: true,
                    toolbarDelete: true,
                    footer: true,
                    selectColumn: true,
                    toolbarSearch: false,
                    toolbarInput: false
                },
                recid: "id",
                columns: [
                    { field: 'id', text: 'ID', size: '20px', sortable: true, hidden: true },
                    { field: 'name', text: AdminMessages.identifier(), size: '30%', sortable: true, resizable: true, editable: { type: 'text' } },
                    {
                        field: 'numberOfStudents', text: AdminMessages.count(), size: '20%', sortable: false, resizable: true,
                        render: function (record: ClassData) {
                            return '<div>' + record.students.length + '</div>';
                        }
                    },
                    {
                        field: 'teacher', text: AdminMessages.teacher(), size: '30%', sortable: true, resizable: true,
                        editable: { type: 'list', items: that.teacherDataList, showAll: true, openOnFocus: true },
                        render: function (record: ClassData) {
                            let teacher = that.teacherDataList.find(td => td.userData.id == record.lehrkraft_id);
                            if (teacher != null) {
                                return '<div>' + teacher.userData.rufname + " " + teacher.userData.familienname + '</div>';
                            }
                        }
                    },
                    {
                        field: 'teacher2', text: AdminMessages.secondTeacher(), size: '30%', sortable: true, resizable: true,
                        render: function (record: ClassData) {
                            let teacher = that.teacherDataList.find(td => td.userData.id == record.zweitlehrkraft_id);
                            if (teacher != null) {
                                return '<div>' + teacher.userData.rufname + " " + teacher.userData.familienname + '</div>';
                            }
                        },
                        editable: {
                            type: 'list', items: that.teacherDataList.slice(0).concat([{
                                //@ts-ignore
                                userData: { id: -1, rufname: AdminMessages.noSecondTeacher(), familienname: "" },
                                classes: [],
                                id: -1,
                                text: AdminMessages.noSecondTeacher()
                            }]), showAll: false, openOnFocus: true
                        }
                    },
                    {
                        field: 'aktiv', text: 'aktiv', size: '10%', sortable: false, resizable: false, style: 'text-align: center',
                        editable: { type: 'checkbox', style: 'text-align: center' }
                    }
                ],
                searches: [
                    { field: 'name', label: AdminMessages.identifier(), type: 'text' }
                ],
                sortData: [{ field: 'name', direction: 'ASC' }],
                onSelect: (event) => { event.done(() => { that.onSelectClass(event) }) },
                onUnselect: (event) => { event.done(() => { that.onUnselectClass(event) }) },
                onAdd: (event) => { that.onAddClass() },
                onChange: (event) => { that.onUpdateClass(event) },
                onDelete: (event) => { that.onDeleteClass(event) },
            })

            this.classesGrid.render($tableLeft[0]);

            this.loadClassDataList(() => {
                this.studentGrid = new w2grid({
                    name: "studentGrid",
                    header: AdminMessages.students(),
                    // selectType: "cell",
                    show: {
                        header: true,
                        toolbar: true,
                        toolbarAdd: !this.isVidisSchool(),
                        toolbarDelete: !this.isVidisSchool(),
                        footer: true,
                        selectColumn: true,
                        toolbarSearch: false
                    },
                    toolbar: {
                        items: [
                            { type: 'break' },
                            { type: 'button', id: 'changeClassButton', text: AdminMessages.changeClass() } //, img: 'fa-key' }
                        ].concat(this.isVidisSchool() ? [] : [{ type: 'button', id: 'passwordButton', text: AdminMessages.changePassword() }]),
                        onClick: function (target, data) {
                            if (target == "passwordButton") {
                                that.changePassword();
                            } else if (target == "changeClassButton") {
                                that.changeClass();
                            }
                        }
                    },
                    recid: "id",
                    columns: [
                        { field: 'id', text: 'ID', size: '20px', sortable: true, hidden: true },
                        {
                            field: 'klasse', text: AdminMessages.classWord(), size: '10%', sortable: true, resizable: true
                        },
                        { field: 'username', text: this.isVidisSchool()?AdminMessages.nickname() : AdminMessages.username(), size: '40%', sortable: true, resizable: true, editable: { type: 'text' }, sortMode: 'i18n'},
                        { field: 'rufname', text: AdminMessages.firstName(), size: '25%', sortable: true, resizable: true, editable: { type: 'text' }, sortMode: 'i18n', hidden: this.isVidisSchool() },
                        { field: 'familienname', text: AdminMessages.lastName(), size: '25%', sortable: true, resizable: true, editable: { type: 'text' }, sortMode: 'i18n', hidden: this.isVidisSchool() },
                        { field: 'locked', text: AdminMessages.locked(), size: '10%', sortable: true, resizable: false, editable: { type: 'checkbox', style: 'text-align: center' } },
                        { field: 'vidis_sub', text: AdminMessages.vidisID(), size: '25%', sortable: true, resizable: true, editable: { type: 'text' }, sortMode: 'i18n', hidden: !this.isVidisSchool()},
                        { field: 'vidis_akronym', text: AdminMessages.vidisAbbreviation(), size: '25%', sortable: true, resizable: true, editable: { type: 'text' }, sortMode: 'i18n', hidden: !this.isVidisSchool() },
                        { field: 'vidis_klasse', text: AdminMessages.vidisClass(), size: '10%', sortable: true, resizable: true, editable: { type: 'text' }, sortMode: 'i18n', hidden: !this.isVidisSchool() },
                        {
                            field: 'id', text: 'PW', size: '40px', sortable: false, render: (e) => {
                                return '<div class="pw_button" title="' + AdminMessages.changePassword() + '" data-recid="' + e.recid + '" style="visibility: hidden">PW!</div>';
                            }, hidden: this.isVidisSchool()
                        }
                    ],
                    searches: [
                        { field: 'username', label: this.isVidisSchool()?AdminMessages.nickname() : AdminMessages.username(), type: 'text' },
                        { field: 'rufname', label: AdminMessages.firstName(), type: 'text' },
                        { field: 'familienname', label: AdminMessages.lastName(), type: 'text' }
                    ],
                    sortData: [{ field: 'klasse', direction: 'asc' }, { field: 'familienname', direction: 'asc' }, { field: 'rufname', direction: 'asc' }, { field: 'vidis_akronym', direction: 'asc' }],
                    onAdd: (event) => { that.onAddStudent() },
                    onChange: (event) => { that.onUpdateStudent(event) },
                    onDelete: (event) => { that.onDeleteStudent(event) },
                    onClick: (event) => {
                        if (event.detail.column == 1) {
                            this.studentGrid.editField(event.recid, event.detail.column);
                        }
                    },
                    onSelect: (event) => { event.done(() => { that.onSelectStudent(event) }) },
                    onUnselect: (event) => { event.done(() => { that.onUnselectStudent(event) }) },
                });
                this.loadTables();
                this.studentGrid.render($tableRight[0]);
            });

        })


    }

    onUnselectStudent(event) {
        let selection = this.studentGrid.getSelection();

        if (selection.length == 0) {
            //@ts-ignore
            studentGrid.toolbar.disable('changeClassButton');

            //@ts-ignore
            studentGrid.toolbar.disable('passwordButton');
        }
    }


    onSelectStudent(event: any) {

        let selection = this.studentGrid.getSelection();

        // let selection = studentGrid.getSelection().map((str) => str.recid).filter((value, index, array) => array.indexOf(value) === index);

        if (selection.length > 0) {
            //@ts-ignore
            this.studentGrid.toolbar.enable('changeClassButton');
        } else {
            //@ts-ignore
            this.studentGrid.toolbar.disable('changeClassButton');
        }

        if (selection.length == 1) {
            //@ts-ignore
            this.studentGrid.toolbar.enable('passwordButton');
        } else {
            //@ts-ignore
            this.studentGrid.toolbar.disable('passwordButton');
        }

    }

    changeClass() {
        let recIds: number[];
        let that = this;

        recIds = <number[]>this.studentGrid.getSelection();
        //@ts-ignore
        // recIds = <any>studentGrid.getSelection().map((str) => str.recid).filter((value, index, array) => array.indexOf(value) === index);
        let students: UserData[] = recIds.map((id) => <UserData>this.studentGrid.get(id + ""));

        this.openChooseClassPopup((newClass: ClassData) => {

            newClass = that.allClassesList.find((cl) => cl.id == newClass.id);

            let request: ChangeClassOfStudentsRequest = {
                student_ids: recIds,
                new_class_id: newClass.id
            }

            ajax("changeClassOfStudents", request, (response: ChangeClassOfStudentsResponse) => {

                w2alert(AdminMessages.movedStudentsSuccessfully(newClass.name));

                for (let klasse of this.allClassesList) {
                    klasse.students = klasse.students.filter((student) => recIds.indexOf(student.id) < 0);
                }

                for (let student of students) newClass.students.push(student);

                for (let rc of this.classesGrid.records) {
                    let rc1 = <ClassData>rc;
                    rc1.students = this.allClassesList.find((cl) => cl.id == rc1.id).students;
                }
                this.classesGrid.refresh();

                that.updateStudentTableToSelectedClasses();

            }, (message: string) => {
                w2alert(AdminMessages.errorMovingStudents() + message);
            });

        }, this.allClassesList);





    }

    changePassword(recIds: number[] = []) {
        let that = this;

        if (recIds.length == 0) {
            recIds = <number[]>this.studentGrid.getSelection();
            //@ts-ignore
            // recIds = <any>this.studentGrid.getSelection().map((str) => str.recid).filter((value, index, array) => array.indexOf(value) === index);
        }

        if (recIds.length != 1) {
            this.studentGrid.error(AdminMessages.selectStudentToSetPassword());
        } else {
            let student: UserData = <UserData>this.studentGrid.get(recIds[0] + "", false);

            let passwordFor: string = student.rufname + " " + student.familienname + " (" + student.username + ")";
            PasswordPopup.open(passwordFor, () => {
                this.studentGrid.searchReset();
                that.preparePasswordButtons();
            }, (password) => {

                student.password = password;

                let request: CRUDUserRequest = {
                    type: "update",
                    data: student,
                }
                w2utils.lock(jQuery('body'), AdminMessages.pleaseWaitForPasswordHashing(), true);

                ajax("CRUDUser", request, (response: CRUDResponse) => {
                    w2utils.unlock(jQuery('body'));

                    w2alert(AdminMessages.passwordChangedSuccessfully(student.rufname, student.familienname, student.username));
                    this.studentGrid.searchReset();
                    that.preparePasswordButtons();
                }, (message: string) => {
                    w2utils.unlock(jQuery('body'));
                    w2alert(AdminMessages.errorSettingPassword() + message);
                    this.studentGrid.searchReset();
                    that.preparePasswordButtons();
                });


            });

        }

    }

    onDeleteClass(event: any) {
        if (!event.detail.force || event.isStopped) return;

        let recIds: number[];

        recIds = <number[]>this.classesGrid.getSelection();
        //@ts-ignore
        // recIds = <any>this.classesGrid.getSelection().map((str) => str.recid).filter((value, index, array) => array.indexOf(value) === index);

        // let selectedClasses: ClassData[] = <ClassData[]>this.classesGrid.records.filter(
        //     (cd: ClassData) => recIds.indexOf(cd.id) >= 0);


        let request: CRUDClassRequest = {
            type: "delete",
            data: null,
            ids: recIds,
        }

        ajax("CRUDClass", request, (response: CRUDResponse) => {
            recIds.forEach(id => {
                this.classesGrid.remove("" + id);
                this.allClassesList = this.allClassesList.filter(cd => cd.id != id);
            }
            );

            this.classesGrid.refresh();
        }, () => {
            this.classesGrid.refresh();
        });

    }

    onUpdateClass(event: any) {
        let data: ClassData = <ClassData>this.classesGrid.records[event.detail.index];

        let field = this.classesGrid.columns[event.detail.column]["field"];

        if (data[field] != undefined) data[field] = event.detail.value.new;

        let newValue = event.detail.value.new;

        if (event.detail.column == 3) {
            let teacher: TeacherData = event.detail.value.new;
            if (teacher == null || typeof teacher == "string") {
                this.classesGrid.refresh();
                return;
            } else {
                let teacherOld1 = this.teacherDataList.find((td) => td.userData.id == data.lehrkraft_id);
                if (teacherOld1 != null) teacherOld1.classes = teacherOld1.classes.filter(cd => cd.id != data.id);
                // let teacherOld2 = this.teachersGrid.get(data.lehrkraft_id + "");
                // if (teacherOld2 != null) teacherOld1.classes = teacherOld1.classes.filter(cd => cd.id != data.id);
                data.lehrkraft_id = teacher.userData.id;
                teacher.classes.push(data);
                newValue = teacher.userData.rufname + " " + teacher.userData.familienname;
            }
        }

        if (event.detail.column == 4) {
            let teacher: TeacherData = event.detail.value.new;
            if (teacher == null || typeof teacher == "string") {
                return;
            } else {
                newValue = teacher.userData.rufname + " " + teacher.userData.familienname;
                data.zweitlehrkraft_id = teacher.userData.id == -1 ? null : teacher.userData.id;
            }
        }

        let request: CRUDClassRequest = {
            type: "update",
            data: data,
        }

        ajax("CRUDClass", request, (response: CRUDResponse) => {
            // console.log(data);
            if(data["w2ui"]){
                delete data["w2ui"]["changes"][field];
                this.classesGrid.refreshCell(data["recid"], field);
            }

            let classData = this.allClassesList.find(c => "" + c.id == data["recid"]);
            if (classData != null) {
                classData[field] = newValue;
                if (field == "name") {
                    classData.text = newValue;
                }
            }
        }, () => {
            data[field] = event.detail.value.original;
            if(data["w2ui"]){
                delete data["w2ui"]["changes"][field];
                this.classesGrid.refreshCell(data["recid"], field);
            }
        });
    }

    onAddClass() {
        let userData = this.administration.userData;

        let request: CRUDClassRequest = {
            type: "create",
            data: {
                id: -1,
                schule_id: userData.schule_id,
                lehrkraft_id: userData.id,
                zweitlehrkraft_id: null,
                name: "Name der Klasse",
                aktiv: true,
                students: []
            },
        };

        ajax("CRUDClass", request, (response: CRUDResponse) => {
            let cd: ClassData = request.data;
            cd.id = response.id;
            this.classesGrid.add(cd);

            cd.lehrkraft_id = userData.id;
            cd.schule_id = userData.schule_id;
            cd.students = [];

            this.classesGrid.editField(cd.id + "", 1, undefined, { keyCode: 13 });
            this.allClassesList.push(cd)
        });
    }


    onUnselectClass(event: any) {

        this.updateStudentTableToSelectedClasses();
        this.preparePasswordButtons();

    }


    onSelectClass(event: any) {

        this.updateStudentTableToSelectedClasses();
        this.preparePasswordButtons();

    }

    preparePasswordButtons() {
        let that = this;
        setTimeout(() => {
            jQuery('.pw_button').off('click');
            jQuery('.pw_button').on('click', (e) => {
                let recid = jQuery(e.target).data('recid');
                e.preventDefault();
                e.stopPropagation();
                that.changePassword([recid]);
            }).css('visibility', 'visible');
        }, 1000);
    }

    loadTablesFromTeacherObject(callback: () => void) {

        let request: GetTeacherDataRequest = { school_id: this.administration.userData.schule_id };

        ajax("getTeacherData", request, (data: GetTeacherDataResponse) => {
            this.teacherDataList = data.teacherData;

            for (let teacher of this.teacherDataList) {
                teacher["id"] = teacher.userData.id;
                teacher["username"] = teacher.userData.username;
                teacher["familienname"] = teacher.userData.familienname;
                teacher["rufname"] = teacher.userData.rufname;
                teacher["text"] = teacher.userData.rufname + " " + teacher.userData.familienname
            }

            callback();

        }, () => {
            w2alert(AdminMessages.errorFetchingData());
        });


    }


    updateStudentTableToSelectedClasses() {
        let recIds: number[];

        //@ts-ignore
        // recIds = <any>classesGrid.getSelection().map((str) => str.recid).filter((value, index, array) => array.indexOf(value) === index);

        recIds = <number[]>this.classesGrid.getSelection();

        let selectedClasses: ClassData[] = this.allClassesList.filter(
            (cd: ClassData) => recIds.indexOf(cd.id) >= 0);

        let studentList: UserData[] = [];

        for (let cd of selectedClasses) {
            for (let sd of cd.students) {
                //@ts-ignore
                sd.klasse = cd.name;
                studentList.push(sd);
            }
        }

        // studentsGrid.records = studentList;
        // setTimeout(() => {
        this.studentGrid.clear();
        this.studentGrid.add(studentList);
        this.studentGrid.refresh();
        this.onSelectStudent(null);
        // }, 20);

    }

    loadClassDataList(callback: () => void) {

        let request: GetClassesDataRequest = {
            school_id: this.administration.userData.schule_id
        }

        ajax('getClassesData', request, (response: GetClassesDataResponse) => {
            this.allClassesList = response.classDataList;
            for (let cd of this.allClassesList) {
                cd.text = cd.name;
            }
            callback();
        });


    }

    loadTables() {
        if (this.classesGrid == null) {
            return;
        }
        this.classesGrid.clear();

        this.classesGrid.add(this.allClassesList);
        this.classesGrid.refresh();
    }

    onDeleteStudent(event: any) {
        if (!event.detail.force || event.isStopped) return;

        let recIds: number[];

        //@ts-ignore
        // recIds = <any>studentGrid.getSelection().map((str) => str.recid).filter((value, index, array) => array.indexOf(value) === index);
        recIds = <number[]>this.studentGrid.getSelection();

        let request: CRUDUserRequest = {
            type: "delete",
            data: null,
            ids: recIds,
        }

        let that = this;

        ajax("CRUDUser", request, (response: CRUDResponse) => {
            recIds.forEach(id => this.studentGrid.remove("" + id));
            this.allClassesList.forEach(klass => {
                for (let i = 0; i < klass.students.length; i++) {
                    let student = klass.students[i];
                    if (recIds.indexOf(student.id) >= 0) {
                        klass.students.splice(i, 1);
                        i--;
                    }
                }
            })

            this.studentGrid.refresh();
            this.classesGrid.refresh();
        }, (message: string) => {
            w2alert(AdminMessages.errorDeletingStudents() + message);
            this.studentGrid.refresh();
        });

    }

    onUpdateStudent(event: any) {

        let data: UserData = <UserData>this.studentGrid.records[event.detail.index];

        let value_new_presented = event.detail.value.new;
        let value_old_database: number = data.klasse_id;

        if (event.detail.column == 1) {
            let classData: ClassData = event.detail.value.new;
            value_new_presented = classData.name;
            if (event.detail.value.new.id == null) {
                event.preventDefault();
                return;
            }
            data.klasse_id = event.detail.value.new.id;
        }

        let field = this.studentGrid.columns[event.detail.column]["field"];
        data[field] = value_new_presented;


        let request: CRUDUserRequest = {
            type: "update",
            data: data,
        }

        ajax("CRUDUser", request, (response: CRUDResponse) => {
            delete data["w2ui"]["changes"][field];
            this.studentGrid.refreshCell(data["recid"], field);
        }, (message: string) => {
            data[field] = event.detail.value.original;
            data.klasse_id = value_old_database;
            delete data["w2ui"]["changes"][field];
            this.studentGrid.refreshCell(data["recid"], field);
            alert(message);
        });

    }

    onAddStudent() {
        let userData = this.administration.userData;

        let selectedClasses = <number[]>this.classesGrid.getSelection();

        // let selectedClasses = <number[]>this.classesGrid.getSelection().filter((value, index, array) => array.indexOf(value) === index).map(cl => (<any>cl).recid);
        if (selectedClasses.length != 1) {
            this.studentGrid.error(AdminMessages.selectClassToAddStudents());
            return;
        }
        let classId = selectedClasses[0];
        let klass = <ClassData>this.classesGrid.get("" + classId, false);

        let request: CRUDUserRequest = {
            type: "create",
            data: {
                id: -1,
                schule_id: userData.schule_id,
                klasse_id: classId,
                username: "Benutzername" + Math.round(Math.random() * 10000000),
                rufname: "Rufname",
                familienname: "Familienname",
                is_admin: false,
                is_schooladmin: false,
                is_teacher: false,
                locked: false,
                password: StudentBulkImportMI.getRandomPassword()
            },
        };

        //@ts-ignore
        w2utils.lock(jQuery('body'), AdminMessages.pleaseWaitForPasswordHashing(), true);

        ajax("CRUDUser", request, (response: CRUDResponse) => {
            let ud: UserData = request.data;
            ud.id = response.id;
            ud["klasse"] = klass.name;
            this.studentGrid.add(ud);
            this.studentGrid.editField(ud.id + "", 2, undefined, { keyCode: 13 });
            klass.students.push(ud);

            this.preparePasswordButtons();
            this.classesGrid.refresh();
            // @ts-ignore
            w2utils.unlock(jQuery('body'));

        }, (errormessage) => {
            //@ts-ignore
            w2utils.unlock(jQuery('body'));
            w2alert(AdminMessages.errorCreatingUser() + errormessage);
        });
    }

    initChooseClassPopup() {
        let that = this;
        if (!w2ui.chooseClassForm) {
            w2ui.chooseClassForm = new w2form({
                name: 'chooseClassForm',
                style: 'border: 0px; background-color: transparent;',
                formHTML:
                    '<div class="w2ui-page page-0">' +
                    '    <div class="w2ui-field">' +
                    '        <label>' + AdminMessages.newClass() + '</label>' +
                    '        <div>' +
                    '           <input name="newClass" type="text" style="width: 150px"/>' +
                    '        </div>' +
                    '    </div>' +
                    '</div>' +
                    '<div class="w2ui-buttons">' +
                    '    <button class="w2ui-btn" name="cancel">' + AdminMessages.cancel() + '</button>' +
                    '    <button class="w2ui-btn" name="OK">' + AdminMessages.ok() + '</button>' +
                    '</div>',
                fields: [
                    {
                        field: 'newClass', type: 'list', required: true,
                        options: { items: [] }
                    },
                ],
                record: {
                    newClass: 'John',
                },
                actions: {
                    "cancel": function () {
                        w2popup.close();
                    },
                    "OK": function () {
                        w2popup.close();
                        this.myCallback(this.record.newClass);
                    }
                }
            });
        }
    }

    openChooseClassPopup(callback: (newClass: ClassData) => void, classList: any) {

        w2ui["chooseClassForm"].myCallback = callback;
        w2ui["chooseClassForm"].fields[0].options.items = classList.sort((a, b) => a.name.localeCompare(b.name));

        //@ts-ignore
        w2popup.open({
            title: AdminMessages.chooseNewClass(),
            body: '<div id="form" style="width: 100%; height: 100%;"></div>',
            style: 'padding: 15px 0px 0px 0px',
            width: 500,
            height: 300,
            showMax: true
        }).then(() => {
            w2ui.chooseClassForm.render("#w2ui-popup #form")
        });
    }

}