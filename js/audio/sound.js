/*
 * =================================
 * WARSENAL SOUND MANAGER
 * =================================
 *
 * Procedural Web Audio SFX.
 * No external audio files are required.
 * The first Play click unlocks audio.
 */

export class SoundManager {

    constructor() {
        this.context = null;
        this.master = null;
        this.enabled = true;
        this.unlocked = false;
    }


    /*
     * =================================
     * AUDIO INITIALIZATION
     * =================================
     */

    unlock() {
        if (!this.enabled) {
            return;
        }

        if (!this.context) {
            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                return;
            }

            this.context = new AudioContextClass();
            this.master =
                this.context.createGain();

            this.master.gain.value = 0.32;
            this.master.connect(
                this.context.destination
            );
        }

        if (this.context.state === "suspended") {
            this.context.resume();
        }

        this.unlocked = true;
    }


    setEnabled(enabled) {
        this.enabled = !!enabled;

        if (this.master) {
            this.master.gain.value =
                this.enabled ? 0.32 : 0;
        }
    }


    /*
     * =================================
     * LOW LEVEL TONE
     * =================================
     */

    tone({
        frequency = 440,
        endFrequency = frequency,
        duration = 0.08,
        type = "sine",
        volume = 0.08,
        delay = 0
    } = {}) {
        if (
            !this.enabled ||
            !this.unlocked ||
            !this.context ||
            !this.master
        ) {
            return;
        }

        const now =
            this.context.currentTime + delay;

        const oscillator =
            this.context.createOscillator();

        const gain =
            this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(
            frequency,
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(20, endFrequency),
            now + duration
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            Math.max(0.0001, volume),
            now + Math.min(0.012, duration * 0.25)
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        oscillator.connect(gain);
        gain.connect(this.master);

        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
    }


    /*
     * =================================
     * NOISE BURST
     * =================================
     */

    noise({
        duration = 0.08,
        volume = 0.08,
        filterFrequency = 1800,
        delay = 0
    } = {}) {
        if (
            !this.enabled ||
            !this.unlocked ||
            !this.context ||
            !this.master
        ) {
            return;
        }

        const sampleRate =
            this.context.sampleRate;

        const buffer =
            this.context.createBuffer(
                1,
                Math.max(1, Math.floor(sampleRate * duration)),
                sampleRate
            );

        const data =
            buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const fade =
                1 - i / data.length;

            data[i] =
                (Math.random() * 2 - 1) * fade;
        }

        const source =
            this.context.createBufferSource();

        const filter =
            this.context.createBiquadFilter();

        const gain =
            this.context.createGain();

        const now =
            this.context.currentTime + delay;

        source.buffer = buffer;
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(
            filterFrequency,
            now
        );

        gain.gain.setValueAtTime(
            Math.max(0.0001, volume),
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);

        source.start(now);
        source.stop(now + duration + 0.02);
    }


    /*
     * =================================
     * UI
     * =================================
     */

    uiClick() {
        this.tone({
            frequency: 480,
            endFrequency: 720,
            duration: 0.055,
            type: "square",
            volume: 0.045
        });
    }


    uiSelect() {
        this.tone({
            frequency: 620,
            endFrequency: 920,
            duration: 0.07,
            type: "square",
            volume: 0.055
        });

        this.tone({
            frequency: 920,
            endFrequency: 1240,
            duration: 0.06,
            type: "triangle",
            volume: 0.035,
            delay: 0.055
        });
    }


    /*
     * =================================
     * WEAPONS
     * =================================
     */

    weaponAttack(name) {
        const weapon =
            String(name || "").toLowerCase();

        switch (weapon) {
            case "sword":
                this.tone({
                    frequency: 360,
                    endFrequency: 120,
                    duration: 0.11,
                    type: "sawtooth",
                    volume: 0.075
                });
                this.noise({
                    duration: 0.07,
                    volume: 0.025,
                    filterFrequency: 3200
                });
                break;

            case "hammer":
                this.tone({
                    frequency: 120,
                    endFrequency: 48,
                    duration: 0.16,
                    type: "square",
                    volume: 0.09
                });
                this.noise({
                    duration: 0.13,
                    volume: 0.06,
                    filterFrequency: 850
                });
                break;

            case "spear":
                this.tone({
                    frequency: 620,
                    endFrequency: 180,
                    duration: 0.09,
                    type: "sawtooth",
                    volume: 0.065
                });
                break;

            case "dagger":
                this.tone({
                    frequency: 820,
                    endFrequency: 260,
                    duration: 0.065,
                    type: "triangle",
                    volume: 0.055
                });
                break;

            case "bow":
                this.tone({
                    frequency: 260,
                    endFrequency: 720,
                    duration: 0.09,
                    type: "triangle",
                    volume: 0.055
                });
                this.noise({
                    duration: 0.055,
                    volume: 0.035,
                    filterFrequency: 5000,
                    delay: 0.025
                });
                break;

            case "staff":
                this.tone({
                    frequency: 180,
                    endFrequency: 520,
                    duration: 0.16,
                    type: "sine",
                    volume: 0.065
                });
                this.tone({
                    frequency: 720,
                    endFrequency: 420,
                    duration: 0.12,
                    type: "triangle",
                    volume: 0.04,
                    delay: 0.035
                });
                break;

            default:
                this.tone({
                    frequency: 300,
                    endFrequency: 150,
                    duration: 0.08,
                    type: "square",
                    volume: 0.05
                });
        }
    }


    /*
     * =================================
     * IMPACTS
     * =================================
     */

    hit() {
        this.noise({
            duration: 0.075,
            volume: 0.09,
            filterFrequency: 1200
        });

        this.tone({
            frequency: 150,
            endFrequency: 70,
            duration: 0.10,
            type: "square",
            volume: 0.055
        });
    }


    projectileImpact() {
        this.noise({
            duration: 0.055,
            volume: 0.055,
            filterFrequency: 2200
        });

        this.tone({
            frequency: 260,
            endFrequency: 110,
            duration: 0.065,
            type: "triangle",
            volume: 0.035
        });
    }


    hurt() {
        this.tone({
            frequency: 180,
            endFrequency: 95,
            duration: 0.13,
            type: "sawtooth",
            volume: 0.065
        });
    }


    /*
     * =================================
     * MOVEMENT
     * =================================
     */

    dodge() {
        this.noise({
            duration: 0.12,
            volume: 0.045,
            filterFrequency: 4200
        });

        this.tone({
            frequency: 260,
            endFrequency: 620,
            duration: 0.10,
            type: "triangle",
            volume: 0.04
        });
    }


    /*
     * =================================
     * ROUND / MATCH
     * =================================
     */

    roundStart() {
        this.tone({
            frequency: 360,
            endFrequency: 360,
            duration: 0.09,
            type: "square",
            volume: 0.05
        });

        this.tone({
            frequency: 520,
            endFrequency: 520,
            duration: 0.09,
            type: "square",
            volume: 0.055,
            delay: 0.11
        });

        this.tone({
            frequency: 760,
            endFrequency: 900,
            duration: 0.14,
            type: "triangle",
            volume: 0.065,
            delay: 0.22
        });
    }


    roundWin() {
        this.tone({
            frequency: 520,
            endFrequency: 520,
            duration: 0.11,
            type: "square",
            volume: 0.065
        });

        this.tone({
            frequency: 660,
            endFrequency: 660,
            duration: 0.11,
            type: "square",
            volume: 0.065,
            delay: 0.12
        });

        this.tone({
            frequency: 820,
            endFrequency: 980,
            duration: 0.18,
            type: "triangle",
            volume: 0.075,
            delay: 0.24
        });
    }


    roundLose() {
        this.tone({
            frequency: 330,
            endFrequency: 330,
            duration: 0.13,
            type: "sawtooth",
            volume: 0.055
        });

        this.tone({
            frequency: 230,
            endFrequency: 170,
            duration: 0.20,
            type: "sawtooth",
            volume: 0.06,
            delay: 0.14
        });
    }


    matchWin() {
        this.roundWin();
        this.tone({
            frequency: 1040,
            endFrequency: 1280,
            duration: 0.22,
            type: "triangle",
            volume: 0.075,
            delay: 0.43
        });
    }


    matchLose() {
        this.roundLose();
        this.tone({
            frequency: 140,
            endFrequency: 70,
            duration: 0.28,
            type: "sawtooth",
            volume: 0.065,
            delay: 0.36
        });
    }
}

export default SoundManager;
