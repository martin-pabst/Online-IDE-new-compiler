import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { ThreadState } from "../../../../common/interpreter/ThreadState";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";
import { World3dClass } from "../3d/World3dClass";
import { RobotCubeFactory } from "./RobotCubeFactory";
import { RobotClass } from './RobotClass';
import { RuntimeExceptionClass } from '../../system/javalang/RuntimeException';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class RobotWorldClass extends ObjectClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class RobotWorld extends Object", comment: JRC.robotWorldClassComment },
        { type: "method", signature: "RobotWorld(int worldX, int worldY)", java: RobotWorldClass.prototype._cj$_constructor_$RobotWorld$int$int, comment: JRC.robotWorldConstructorWorldXWorldY },
        { type: "method", signature: "RobotWorld(string initialeWelt)", java: RobotWorldClass.prototype._cj$_constructor_$RobotWorld$int$int, comment: JRC.robotWorldConstructorInitialWorld },
        { type: "method", signature: "void setzeMaximalhöhe(int hoehe)", native: RobotWorldClass.prototype._setzeMaximalhoehe, comment: JRC.robotWorldSetzeMaximalHoehe},
        { type: "method", signature: "void setzeZiegel(int x, int y, string farbe, int anzahl)", native: RobotWorldClass.prototype._setzeZiegel, comment: JRC.robotWorldSetzeZiegel},
        { type: "method", signature: "void setzeMarke(int x, int y, string farbe)", native: RobotWorldClass.prototype._setzeMarke, comment: JRC.robotWorldSetzeMarke},


    ];


    world3d: World3dClass;
    robotCubeFactory: RobotCubeFactory;

    maxX: number;
    maxY: number;

    markers: THREE.Mesh[][] = [];  // x, y
    bricks: THREE.Mesh[][][] = [];  // x, y, height

    maximumHeight: number = 15;

    robots: RobotClass[] = [];

    _cj$_constructor_$RobotWorld$int$int(t: Thread, callback: CallbackParameter, worldX: number | string, worldY?: number) {
        
        t.s.push(this);
        let existingWorld: RobotWorldClass = t.scheduler.interpreter.retrieveObject("robotWorldClass");
        if (existingWorld) {
            existingWorld.clear();
            if(callback) callback();
            return;
        }

        t.scheduler.interpreter.storeObject("robotWorldClass", this);

        new World3dClass()._cj$_constructor_$World3d$(t, async () => {

            this.world3d = t.s.pop();
            this.world3d.scene.clear();

            this.world3d.scene.background = new THREE.Color(0.5, 0.5, 1);

            this.world3d.currentCamera.camera3d.position.z = 10;

            this.robotCubeFactory = new RobotCubeFactory(this);
            t.state = ThreadState.waiting;
            await this.robotCubeFactory.init();
            t.state = ThreadState.running;

            const ambientLight = new THREE.AmbientLight(0xeeeeee, 3);
            this.world3d.scene.add(ambientLight);

            if (typeof worldX == "string") {
                this.initFromString(worldX);
            } else {
                this.maxX = worldX;
                this.maxY = worldY!;
                
                this.initGraphics();
                this.initWorldArrays(this.maxX, this.maxY);
            }

            this.world3d.orbitControls.dispose();
            this.world3d.currentCamera.camera3d.position.set(this.maxX, Math.max(this.maxX, this.maxY), this.maxY);
            this.world3d.orbitControls = new OrbitControls(this.world3d.currentCamera.camera3d, this.world3d.renderer.domElement);


            if (callback) callback();

        })


    }

    private initGraphics() {
        this.robotCubeFactory.getGrassPlane(this.maxX, this.maxY);
        this.robotCubeFactory.initNorthArrow();
    }

    private initWorldArrays(worldX: number, worldY: number) {
        this.markers = [];
        this.bricks = [];

        for (let x = 0; x < worldX; x++) {
            let markerColumn = [];
            this.markers.push(markerColumn);
            let brickColumn = [];
            this.bricks.push(brickColumn);
            for (let y = 0; y < worldY; y++) {
                markerColumn.push(null);
                brickColumn.push([]);
            }
        }
    }

    adjustRobotPositions(x: number, y: number) {
        for (let robot of this.robots) {
            if (robot.x == x && robot.y == y) {
                robot.setZ(this.getBrickCount(x, y));
            }
        }
    }


    addBrick(x: number, y: number, farbe: string): boolean {
        let oldHeight = this.bricks[x-1][y-1].length;
        if (oldHeight < this.maximumHeight) {
            let brick = this.robotCubeFactory.getBrick(farbe, x, y, oldHeight);
            this.bricks[x-1][y-1].push(brick);
            this.adjustMarkerHeight(x, y);
            this.adjustRobotPositions(x, y);
            return true;
        } else {
            return false;
        }
    }

    removeBrick(x: number, y: number): boolean {
        if (this.bricks[x-1][y-1].length > 0) {
            let brick = this.bricks[x-1][y-1].pop();
            this.removeMesh(brick);
            this.adjustMarkerHeight(x, y);
            this.adjustRobotPositions(x, y);
        } else {
            return false;
        }

    }

    getBrickCount(x: number, y: number) {
        return this.bricks[x-1][y-1].length;
    }

    hasBrickColor(x: number, y: number, farbe: string): boolean {
        for (let brick of this.bricks[x-1][y-1]) {
            if (brick.userData["farbe"] == farbe) return true;
        }
        return false;
    }

    getMarkerColor(x: number, y: number): string {
        let marker = this.markers[x-1][y-1];
        if (marker == null) return null;
        return marker.userData["farbe"];
    }

    setMarker(x: number, y: number, farbe: string) {
        if (this.markers[x-1][y-1] != null) {
            this.removeMesh(this.markers[x-1][y-1]);
        }
        let marker = this.robotCubeFactory.getMarker(farbe, x, y, this.bricks[x-1][y-1].length);
        this.markers[x-1][y-1] = marker;
    }

    removeMarker(x: number, y: number): boolean {
        let marker = this.markers[x-1][y-1];
        if (marker == null) {
            return false;
        } else {
            this.markers[x-1][y-1] = null;
            this.removeMesh(marker);
            return true;
        }
    }

    adjustMarkerHeight(x: number, y: number) {
        let marker = this.markers[x-1][y-1];
        if (marker != null) {
            let height = this.bricks[x-1][y-1].length
            marker.translateY((height - marker.userData["z"])/2);
            marker.userData["z"] = height;
        }
    }

    clear() {
        for (let x = 0; x < this.bricks.length; x++) {
            for (let y = 0; y < this.bricks[x].length; y++) {
                let brickList = this.bricks[x][y];
                while (brickList.length > 0) {
                    this.removeMesh(brickList.pop());
                }
            }
        }

        for (let x = 0; x < this.markers.length; x++) {
            for (let y = 0; y < this.markers[x].length; y++) {
                let marker = this.markers[x][y];
                if (marker != null) {
                    this.markers[x][y] = null;
                    this.removeMesh(marker);
                }
            }
        }

        this.world3d.scene.children.forEach(c =>  {
            if(c instanceof THREE.Mesh){
                c.geometry.dispose();
                if(c.material instanceof THREE.Material){
                    c.material.dispose();
                }
            }
        })

    }

    getNumberOfBricks(x: number, y: number) {
        return this.bricks[x-1][y-1].length;
    }

    /**
     *
     * @param initString
     * " ": empty
     * "_": no brick, yellow marker
     * "Y", "G", "B", "R": switch marker color
     * "y", "g", "b", "r": switch brick color
     * "1", ..., "9": 1, ..., 9 bricks
     * "1m", ..., "9m": 1, ..., 9 bricks with markers on them
     */
    initFromString(initString: string) {

        let lowerCaseCharToColor = { "r": "rot", "g": "grün", "b": "blau", "y": "gelb" };
        let upperCaseCharToColor = { "R": "rot", "G": "grün", "B": "blau", "Y": "gelb" };
        let digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

        this.clear();
        let rows = initString.split("\n");
        let maxColumns = 0;
        rows.forEach((row) => { let rowLength = this.rowLength(row); if (rowLength > maxColumns) maxColumns = rowLength });
        this.initWorldArrays(maxColumns, rows.length);

        this.maxX = maxColumns;
        this.maxY = rows.length;

        this.initGraphics();

        let c1: string;
        let c2: string;
        let brickColor = "rot";
        let markerColor = "gelb";

        for (let y = 0; y < rows.length; y++) {
            let row = rows[y];
            let x = 0;
            let pos = 0;
            while (pos < row.length) {
                c1 = row.charAt(pos);
                c2 = pos < row.length - 1 ? row.charAt(pos + 1) : null;
                pos++;
                if (lowerCaseCharToColor[c1] != null) {
                    brickColor = lowerCaseCharToColor[c1];
                    continue;
                }
                if (upperCaseCharToColor[c1] != null) {
                    markerColor = upperCaseCharToColor[c1];
                    continue;
                }
                let index = digits.indexOf(c1);
                if (index >= 0) {
                    for (let i = 0; i < index + 1; i++) {
                        this.addBrick(x+1, y+1, brickColor);
                    }
                    if (c2 == "m") {
                        this.setMarker(x+1, y+1, markerColor);
                        pos++;
                    }
                    x++;
                    continue;
                }
                if (c1 == " ") {
                    x++;
                    continue;
                }
                if (c1 == "_") {
                    this.setMarker(x+1, y+1, markerColor);
                    x++;
                    continue;
                }
            }
        }


    }

    rowLength(row: string) {
        let l: number = 0;
        let forwardChars = " _1234567890";

        for (let i = 0; i < row.length; i++) {
            if (forwardChars.indexOf(row.charAt(i)) >= 0) {
                l++;
            }
        }
        return l;
    }

    gibtFarbe(farbe: string): boolean {
        return this.robotCubeFactory.farben.indexOf(farbe) >= 0;
    }


    removeMesh(mesh: THREE.Mesh) {
        this.world3d.scene.remove(mesh);
        mesh.geometry.dispose();
        (<THREE.Material>mesh.material).dispose();
    }

    _setzeMaximalhoehe(h:number){
        this.maximumHeight = h;
    }

    _setzeZiegel(x: number, y: number, farbe: string, anzahl: number){
        if(x < 1 || x > this.maxX || y < 1 || y > this.maxY){
            throw new RuntimeExceptionClass(JRC.robotWorldPositionOutsideWorldError(x, y));
        }

        for(let i = 0; i < anzahl; i++){
            this.addBrick(x, y, farbe);
        }

    }

    _setzeMarke(x: number, y: number, farbe: string){
        if(x < 1 || x > this.maxX || y < 1 || y < this.maxY){
            throw new RuntimeExceptionClass(JRC.robotWorldPositionOutsideWorldError(x, y));
        }

        this.setMarker(x, y, farbe);

    }

}