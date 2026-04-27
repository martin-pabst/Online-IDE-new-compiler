import { Howl } from 'howler'

import nearby_explosion_with_debris from "/assets/mp3/nearby_explosion_with_debris.mp3"
import nearby_explosion from "/assets/mp3/nearby_explosion.mp3"
import far_bomb from "/assets/mp3/far_bomb.mp3"
import cannon_boom from "/assets/mp3/cannon_boom.mp3"
import far_explosion from "/assets/mp3/far_explosion.mp3"
import laser_shoot from "/assets/mp3/laser_shoot.mp3"
import short_bell from "/assets/mp3/short_bell.mp3"
import flamethrower from "/assets/mp3/flamethrower.mp3"
import digging from "/assets/mp3/digging.mp3"
import short_digging from "/assets/mp3/short_digging.mp3"
import shoot from "/assets/mp3/shoot.mp3"
import short_shoot from "/assets/mp3/short_shoot.mp3"
import step from "/assets/mp3/step.mp3"
import boulder from "/assets/mp3/boulder.mp3"
import pong_d5 from "/assets/mp3/pong_d5.wav"
import pong_f5 from "/assets/mp3/pong_f5.wav"


export type SoundType = {
    url: string,
    name: string,
    //@ts-ignore
    player?: Howl,
    description: string
}

export class SoundTools {

    static sounds: SoundType[] = [
        {
            url: nearby_explosion_with_debris,
            name: "nearby_explosion_with_debris",
            description: "nahe Explosion mit herabfallenden Trümmern"
        },
        {
            url: nearby_explosion,
            name: "nearby_explosion",
            description: "nahe Explosion"
        },
        {
            url: far_bomb,
            name: "far_bomb",
            description: "fernes Geräusch einer Bombe"
        },
        {
            url: cannon_boom,
            name: "cannon_boom",
            description: "einzelner Kanonendonner"
        },
        {
            url: far_explosion,
            name: "far_explosion",
            description: "ferne Explosion"
        },
        {
            url: laser_shoot,
            name: "laser_shoot",
            description: "Laserschuss (oder was man dafür hält...)"
        },
        {
            url: short_bell,
            name: "short_bell",
            description: "kurzes Klingeln (wie bei alter Ladenkasse)"
        },
        {
            url: flamethrower,
            name: "flamethrower",
            description: "Flammenwerfer"
        },
        {
            url: digging,
            name: "digging",
            description: "Geräusch beim Sandschaufeln"
        },
        {
            url: short_digging,
            name: "short_digging",
            description: "kurzes Geräusch beim Sandschaufeln"
        },
        {
            url: shoot,
            name: "shoot",
            description: "Schussgeräusch"
        },
        {
            url: short_shoot,
            name: "short_shoot",
            description: "ein kurzer Schuss"
        },
        {
            url: step,
            name: "step",
            description: "ein Schritt"
        },
        {
            url: boulder,
            name: "boulder",
            description: "Geräusch eines Steins, der auf einen zweiten fällt"
        },
        {
            url: pong_d5,
            name: "pong_d",
            description: "Tiefer Pong-Ton"
        },
        {
            url: pong_f5,
            name: "pong_f",
            description: "Hoher Pong-Ton"
        },
    ]

    static soundMap: Map<string, SoundType> = new Map();

    static getVolume: () => number = () => {return -1};

    private static isInitialized: boolean = false;

    public static init() {
        if (!SoundTools.isInitialized) {
            SoundTools.isInitialized = true;
            for (let sound of SoundTools.sounds) {
                //@ts-ignore
                sound.player = new Howl({ src: [sound.url], preload: true })
                SoundTools.soundMap.set(sound.name, sound);
            }
        }

    }

    public static play(name: string) {
        let st: SoundType | undefined = SoundTools.soundMap.get(name);
        if (st) {
            st.player.play();
        }
    }

    static volumeDetectionRunning: boolean = false;
    public static startDetectingVolume() {
        if(SoundTools.volumeDetectionRunning) return;
        SoundTools.volumeDetectionRunning = true;
        console.log("starting...");
        //@ts-ignore
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        //@ts-ignore
        if (navigator.getUserMedia) {
            //@ts-ignore
            navigator.getUserMedia({
                audio: true
            },
                function (stream: any) {
                    let audioContext = new AudioContext();
                    let analyser = audioContext.createAnalyser();
                    let microphone = audioContext.createMediaStreamSource(stream);

                    analyser.smoothingTimeConstant = 0.8;
                    analyser.fftSize = 1024;

                    microphone.connect(analyser);

                    SoundTools.getVolume = () => {
                        if(!SoundTools.volumeDetectionRunning) return 0;
                        var times = new Float32Array(analyser.frequencyBinCount);
                        analyser.getFloatTimeDomainData(times);
                        let volume = 0;
                        for (let i = 0; i < times.length; i++) {
                            volume += Math.abs(times[i]);
                        }
                        volume = volume / times.length;
                        return volume;
                    };
                },
                function (err: any) {
                    console.log("The following error occurred: " + err.name)
                });
        } else {
            console.log("getUserMedia not supported");
        }
    }
}

