import { Keyboard } from "../input/keyboard.js";
import { Mouse } from "../input/mouse.js";
import { InputManager } from "../input/inputManager.js";

import { Player } from "../player/player.js";
import { AI } from "../ai/ai.js";

import { WeaponManager } from "../weapons/weaponManager.js";

import { combatAttack } from "../combat/combat.js";
import { processMeleeHit } from "../combat/attacks.js";
import { applyKnockback } from "../combat/knockback.js";

import { Renderer } from "../rendering/renderer.js";
import { HUD } from "../ui/hud.js";
import { SoundManager } from "../audio/sound.js";

import {
    GameState,
    GamePhase
} from "./gameState.js";

import { Clock } from "./clock.js";
import { GAME_CONFIG } from "./constants.js";

import { Arena } from "../arena/arena.js";

import {
    updateHazards
} from "../arena/hazards.js";

import {
    constrainToArena
} from "../physics/boundaries.js";


export class Game {

    constructor(canvas) {

        this.canvas =
            canvas;


        /*
         * =================================
         * INPUT
         * =================================
         */

        this.keyboard =
            new Keyboard();

        this.mouse =
            new Mouse();

        this.input =
            new InputManager(
                this.keyboard,
                this.mouse
            );


        /*
         * =================================
         * SOUND
         * =================================
         */

        this.sound =
            new SoundManager();


        /*
         * =================================
         * RENDERER
         * =================================
         */

        this.renderer =
            new Renderer(
                canvas
            );


        /*
         * =================================
         * HUD
         * =================================
         */

        this.hud =
            new HUD();


        /*
         * =================================
         * GAME STATE
         * =================================
         */

        this.state =
            new GameState();

        this.clock =
            new Clock();


        /*
         * =================================
         * ARENA
         * =================================
         */

        this.arena =
            new Arena(
                this.renderer.width,
                this.renderer.height
            );


        /*
         * Load default level.
         */

        this.arena.loadLevel(
            this.state.level ||
            GAME_CONFIG.defaultLevel ||
            "level1"
        );


        /*
         * =================================
         * PLAYER
         * =================================
         */

        const playerSpawn =
            this.arena.getSpawnPosition(
                "player"
            );


        this.player =
            new Player(
                playerSpawn.x,
                playerSpawn.y,
                "player"
            );


        /*
         * =================================
         * AI
         * =================================
         */

        const aiSpawn =
            this.arena.getSpawnPosition(
                "ai"
            );


        this.ai =
            new AI(
                aiSpawn.x,
                aiSpawn.y,
                GAME_CONFIG.defaultDifficulty ||
                "normal"
            );


        /*
         * =================================
         * PROJECTILES
         * =================================
         */

        this.projectiles =
            [];


        /*
         * =================================
         * WEAPONS
         * =================================
         */

        const weaponList = [

            "sword",
            "hammer",
            "bow",
            "spear",
            "dagger",
            "staff"

        ];


        this.playerWeapons =
            new WeaponManager(
                weaponList,
                "sword"
            );


        this.aiWeapons =
            new WeaponManager(
                weaponList,
                "sword"
            );


        /*
         * =================================
         * START UNARMED
         * =================================
         */

        this.playerWeapons.currentName =
            null;

        this.aiWeapons.currentName =
            null;

        this.player.setWeapon(
            null
        );

        this.ai.setWeapon(
            null
        );


        /*
         * =================================
         * COMBAT INPUT LOCK
         * =================================
         */

        this.attackInputLocked =
            false;


        this.playerName =
            "PLAYER";


        /*
         * =================================
         * EVENTS
         * =================================
         */

        this.bind();


        /*
         * =================================
         * INITIAL STATE
         * =================================
         */

        this.state.resetMatch();

        this.projectiles = [];

        this.loadCurrentLevel();

        this.showMainMenu();
        this.setBackButtonsVisible(false);


        /*
         * =================================
         * GAME LOOP
         * =================================
         */

        requestAnimationFrame(
            t => this.loop(t)
        );
    }


    /*
     * =================================
     * EVENT BINDINGS
     * =================================
     */

    bind() {

        /*
         * =================================
         * MOUSE INPUT
         * =================================
         *
         * Register the Game mouse handlers.
         * The handlers already exist below, but
         * without these listeners the Game never
         * receives the left-click state.
         */

        this.mouseDownHandler =
            event => this.handleMouseDown(event);

        this.mouseUpHandler =
            event => this.handleMouseUp(event);

        window.addEventListener(
            "mousedown",
            this.mouseDownHandler
        );

        window.addEventListener(
            "mouseup",
            this.mouseUpHandler
        );


        /*
         * =================================
         * PLAY BUTTON
         * =================================
         */

        const playButton =
            document.getElementById(
                "play"
            );


        if (playButton) {

            playButton.addEventListener(
                "click",
                () => {

                    this.sound.unlock();
                    this.sound.uiClick();

                    const nameInput =
                        document.getElementById(
                            "playerNameInput"
                        );

                    const enteredName =
                        String(
                            nameInput?.value || ""
                        )
                            .replace(/\s+/g, " ")
                            .trim()
                            .slice(0, 16);

                    if (!enteredName) {

                        if (nameInput) {
                            nameInput.focus();
                        }

                        return;
                    }

                    this.playerName =
                        enteredName;

                    if (
                        this.hud &&
                        typeof this.hud.setPlayerName ===
                        "function"
                    ) {

                        this.hud.setPlayerName(
                            this.playerName
                        );
                    }

                    this.clearCombatInput();

                    this.openLevelSelection();

                }
            );
        }


        /*
         * =================================
         * BACK BUTTONS
         * =================================
         */

        const levelBack =
            document.getElementById(
                "levelSelectBack"
            );

        if (levelBack) {
            levelBack.addEventListener(
                "click",
                () => {
                    if (this.state.phase !== GamePhase.LEVEL_SELECT) {
                        return;
                    }

                    this.clearCombatInput();
                    this.showMainMenu();
                }
            );
        }


        const difficultyBack =
            document.getElementById(
                "difficultySelectBack"
            );

        if (difficultyBack) {
            difficultyBack.addEventListener(
                "click",
                () => this.goBackToLevelSelection()
            );
        }


        const weaponBack =
            document.getElementById(
                "weaponSelectBack"
            );

        if (weaponBack) {
            weaponBack.addEventListener(
                "click",
                () => {
                    if (this.state.phase !== GamePhase.WEAPON_SELECT) {
                        return;
                    }

                    this.clearCombatInput();
                    this.goBackToDifficultySelection();
                }
            );
        }


        /*
         * =================================
         * LEVEL KEYBOARD SELECTION
         * =================================
         */

        addEventListener(
            "keydown",
            e => {

                if (
                    this.state.phase !==
                    GamePhase.LEVEL_SELECT
                ) {

                    return;
                }


                const levels = {

                    Digit1: "level1",
                    Digit2: "level2",
                    Digit3: "level3"

                };


                const selected =
                    levels[e.code];


                if (!selected) {

                    return;
                }


                this.selectLevel(
                    selected
                );

            }
        );


        /*
         * =================================
         * LEVEL CARD CLICK
         * =================================
         */

        document
            .querySelectorAll(
                "#levelSelectGrid .selection-card"
            )
            .forEach(card => {

                card.addEventListener(
                    "click",
                    () => {

                        if (
                            this.state.phase !==
                            GamePhase.LEVEL_SELECT
                        ) {

                            return;
                        }


                        const level =
                            card.dataset.level;


                        if (!level) {

                            return;
                        }


                        this.selectLevel(
                            level
                        );

                    }
                );

            });


        /*
         * =================================
         * DIFFICULTY KEYBOARD SELECTION
         * =================================
         */

        addEventListener(
            "keydown",
            e => {

                if (
                    this.state.phase !==
                    GamePhase.DIFFICULTY_SELECT
                ) {

                    return;
                }


                const difficulties = {

                    Digit1: "easy",
                    Digit2: "normal",
                    Digit3: "hard"

                };


                const selected =
                    difficulties[e.code];


                if (!selected) {

                    return;
                }


                this.selectDifficulty(
                    selected
                );

            }
        );


        /*
         * =================================
         * DIFFICULTY CARD CLICK
         * =================================
         */

        document
            .querySelectorAll(
                "#difficultySelectGrid .selection-card"
            )
            .forEach(card => {

                card.addEventListener(
                    "click",
                    () => {

                        if (
                            this.state.phase !==
                            GamePhase.DIFFICULTY_SELECT
                        ) {

                            return;
                        }


                        const difficulty =
                            card.dataset.difficulty;


                        if (!difficulty) {

                            return;
                        }


                        this.selectDifficulty(
                            difficulty
                        );

                    }
                );

            });


        /*
         * =================================
         * WEAPON KEYBOARD SELECTION
         * =================================
         */

        addEventListener(
            "keydown",
            e => {

                if (
                    this.state.phase !==
                    GamePhase.WEAPON_SELECT
                ) {

                    return;
                }


                const weapons = {

                    Digit1: "sword",
                    Digit2: "hammer",
                    Digit3: "bow",
                    Digit4: "spear",
                    Digit5: "dagger",
                    Digit6: "staff"

                };


                const selected =
                    weapons[e.code];


                if (!selected) {

                    return;
                }


                this.selectWeapon(
                    selected
                );

            }
        );


        /*
         * =================================
         * WEAPON CARD CLICK
         * =================================
         */

        document
            .querySelectorAll(
                "#weaponSelectGrid .weapon-select-card"
            )
            .forEach(card => {

                card.addEventListener(
                    "click",
                    () => {

                        if (
                            this.state.phase !==
                            GamePhase.WEAPON_SELECT
                        ) {

                            return;
                        }


                        const weapon =
                            card.dataset.weapon;


                        if (!weapon) {

                            return;
                        }


                        this.selectWeapon(
                            weapon
                        );

                    }
                );

            });


        /*
         * =================================
         * NEW MATCH
         * =================================
         */

        const reset =
            document.getElementById(
                "reset"
            );


        if (reset) {

            reset.addEventListener(
                "click",
                () => {

                    this.clearCombatInput();

                    this.newMatch();

                }
            );
        }

    }


    /*
     * =================================
     * CLEAR COMBAT INPUT
     * =================================
     */

    clearCombatInput() {

        if (
            this.mouse &&
            typeof this.mouse.clearPress ===
                "function"
        ) {

            this.mouse.clearPress();

        } else if (
            this.mouse
        ) {

            this.mouse.justPressed =
                false;
        }


        if (
            this.mouse
        ) {

            this.mouse.leftDown =
                false;
        }


        this.attackInputLocked =
            true;
    }


    /*
     * =================================
     * BACK TO LEVEL SELECTION
     * =================================
     */

    goBackToLevelSelection() {

        this.clearCombatInput();

        const mainMenu =
            document.getElementById(
                "mainMenu"
            );

        const levelMenu =
            document.getElementById(
                "levelSelectMenu"
            );

        const difficultyMenu =
            document.getElementById(
                "difficultySelectMenu"
            );

        const weaponMenu =
            document.getElementById(
                "weaponSelectMenu"
            );

        if (mainMenu) {
            mainMenu.classList.add(
                "hidden"
            );
        }

        if (levelMenu) {
            levelMenu.classList.remove(
                "hidden"
            );
        }

        if (difficultyMenu) {
            difficultyMenu.classList.add(
                "hidden"
            );
        }

        if (weaponMenu) {
            weaponMenu.classList.add(
                "hidden"
            );
        }

        this.state.phase =
            GamePhase.LEVEL_SELECT;

        this.state.timeLeft =
            0;

        this.hud.status(
            "SELECT LEVEL"
        );

        this.hud.hideMessage();
    }


    /*
     * =================================
     * BACK TO DIFFICULTY SELECTION
     * =================================
     */

    goBackToDifficultySelection() {

        this.clearCombatInput();

        const mainMenu =
            document.getElementById(
                "mainMenu"
            );

        const levelMenu =
            document.getElementById(
                "levelSelectMenu"
            );

        const difficultyMenu =
            document.getElementById(
                "difficultySelectMenu"
            );

        const weaponMenu =
            document.getElementById(
                "weaponSelectMenu"
            );

        if (mainMenu) {
            mainMenu.classList.add(
                "hidden"
            );
        }

        if (levelMenu) {
            levelMenu.classList.add(
                "hidden"
            );
        }

        if (difficultyMenu) {
            difficultyMenu.classList.remove(
                "hidden"
            );
        }

        if (weaponMenu) {
            weaponMenu.classList.add(
                "hidden"
            );
        }

        this.state.phase =
            GamePhase.DIFFICULTY_SELECT;

        this.state.timeLeft =
            0;

        this.hud.status(
            "SELECT DIFFICULTY"
        );

        this.hud.hideMessage();
    }


    /*
     * =================================
     * BACK BUTTON VISIBILITY
     * =================================
     */

    setBackButtonsVisible(visible) {
        const buttonIds = [
            "levelSelectBack",
            "difficultySelectBack",
            "weaponSelectBack",
            "backToMainMenu",
            "backToLevelSelect",
            "backToDifficultySelect"
        ];

        buttonIds.forEach(id => {
            const button =
                document.getElementById(id);

            if (button) {
                button.classList.toggle(
                    "hidden",
                    !visible
                );
            }
        });
    }


    /*
     * =================================
     * LOAD CURRENT LEVEL
     * =================================
     */

    loadCurrentLevel() {

        const levelId =
            this.state.level ||
            GAME_CONFIG.defaultLevel ||
            "level1";


        /*
         * Resize arena to current canvas.
         */

        this.arena.resize(
            this.renderer.width,
            this.renderer.height
        );


        /*
         * Load selected level.
         */

        const level =
            this.arena.loadLevel(
                levelId
            );


        return level;
    }


    /*
     * =================================
     * PLACE FIGHTERS
     * =================================
     */

    placeFighters() {

        const playerSpawn =
            this.arena.getSpawnPosition(
                "player"
            );


        const aiSpawn =
            this.arena.getSpawnPosition(
                "ai"
            );


        this.player.x =
            playerSpawn.x;

        this.player.y =
            playerSpawn.y;


        this.ai.x =
            aiSpawn.x;

        this.ai.y =
            aiSpawn.y;

    }


    /*
     * =================================
     * NEW MATCH
     * =================================
     */

    newMatch() {

        this.clearCombatInput();

        this.setBackButtonsVisible(false);


        /*
         * Reset state.
         */

        this.state.resetMatch();


        /*
         * Clear projectiles.
         */

        this.projectiles = [];


        /*
         * Reset level.
         */

        this.state.level =
            GAME_CONFIG.defaultLevel ||
            "level1";


        /*
         * Reset difficulty.
         */

        this.state.difficulty =
            GAME_CONFIG.defaultDifficulty ||
            "normal";


        /*
         * Apply difficulty.
         */

        this.ai.setDifficulty(
            this.state.difficulty
        );


        /*
         * Load default level.
         */

        this.loadCurrentLevel();


        /*
         * Remove player weapon.
         */

        this.playerWeapons.currentName =
            null;


        /*
         * Remove AI weapon.
         */

        this.aiWeapons.currentName =
            null;


        this.player.setWeapon(
            null
        );

        this.ai.setWeapon(
            null
        );


        /*
         * Reset fighters.
         */

        this.placeFighters();


        this.player.reset(
            this.player.x,
            this.player.y
        );


        this.ai.reset(
            this.ai.x,
            this.ai.y
        );


        /*
         * Clear level cards.
         */

        document
            .querySelectorAll(
                "#levelSelectGrid .selection-card"
            )
            .forEach(card => {

                card.classList.remove(
                    "active"
                );

            });


        /*
         * Clear difficulty cards.
         */

        document
            .querySelectorAll(
                "#difficultySelectGrid .selection-card"
            )
            .forEach(card => {

                card.classList.remove(
                    "active"
                );

            });


        /*
         * Clear weapon selection.
         */

        document
            .querySelectorAll(
                "#weaponSelectGrid .weapon-select-card"
            )
            .forEach(card => {

                card.classList.remove(
                    "active"
                );

            });


        /*
         * Return to menu.
         */

        this.showMainMenu();

    }


    /*
     * =================================
     * MAIN MENU
     * =================================
     */

    showMainMenu() {

        this.state.phase =
            GamePhase.MAIN_MENU;


        this.state.timeLeft =
            0;


        this.clearCombatInput();


        /*
         * Main menu.
         */

        const mainMenu =
            document.getElementById(
                "mainMenu"
            );


        if (mainMenu) {

            mainMenu.classList.remove(
                "hidden"
            );

        }


        /*
         * Level menu.
         */

        const levelMenu =
            document.getElementById(
                "levelSelectMenu"
            );


        if (levelMenu) {

            levelMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Difficulty menu.
         */

        const difficultyMenu =
            document.getElementById(
                "difficultySelectMenu"
            );


        if (difficultyMenu) {

            difficultyMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Weapon menu.
         */

        const weaponSelectMenu =
            document.getElementById(
                "weaponSelectMenu"
            );


        if (weaponSelectMenu) {

            weaponSelectMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Combat weapon HUD.
         */

        const weaponHud =
            document.getElementById(
                "weaponHud"
            );


        if (weaponHud) {

            weaponHud.classList.add(
                "hidden"
            );

        }


        /*
         * Remove weapons.
         */

        this.player.setWeapon(
            null
        );

        this.ai.setWeapon(
            null
        );


        /*
         * Status.
         */

        this.hud.status(
            "WARSENAL"
        );

        this.hud.hideMessage();

    }


    /*
     * =================================
     * OPEN LEVEL SELECTION
     * =================================
     */

    openLevelSelection() {

        if (
            this.state.phase !==
            GamePhase.MAIN_MENU
        ) {

            return;
        }


        this.clearCombatInput();


        /*
         * Hide main menu.
         */

        const mainMenu =
            document.getElementById(
                "mainMenu"
            );


        if (mainMenu) {

            mainMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Hide difficulty menu.
         */

        const difficultyMenu =
            document.getElementById(
                "difficultySelectMenu"
            );


        if (difficultyMenu) {

            difficultyMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Hide weapon menu.
         */

        const weaponSelectMenu =
            document.getElementById(
                "weaponSelectMenu"
            );


        if (weaponSelectMenu) {

            weaponSelectMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Show level menu.
         */

        const levelMenu =
            document.getElementById(
                "levelSelectMenu"
            );


        if (levelMenu) {

            levelMenu.classList.remove(
                "hidden"
            );

        }


        this.state.phase =
            GamePhase.LEVEL_SELECT;

        this.setBackButtonsVisible(true);


        this.state.timeLeft =
            0;


        this.hud.status(
            "SELECT LEVEL"
        );

        this.hud.hideMessage();

    }


    /*
     * =================================
     * SELECT LEVEL
     * =================================
     */

    selectLevel(
        levelId
    ) {

        this.sound.uiSelect();

        if (
            this.state.phase !==
            GamePhase.LEVEL_SELECT
        ) {

            return;
        }


        this.state.level =
            levelId;


        /*
         * Load selected level
         * immediately.
         */

        this.loadCurrentLevel();


        /*
         * Highlight selected level.
         */

        document
            .querySelectorAll(
                "#levelSelectGrid .selection-card"
            )
            .forEach(card => {

                card.classList.toggle(
                    "active",

                    card.dataset.level ===
                    levelId
                );

            });


        this.clearCombatInput();


        /*
         * Continue to difficulty.
         */

        this.openDifficultySelection();

    }


    /*
     * =================================
     * OPEN DIFFICULTY SELECTION
     * =================================
     */

    openDifficultySelection() {

        this.clearCombatInput();


        /*
         * Hide level menu.
         */

        const levelMenu =
            document.getElementById(
                "levelSelectMenu"
            );


        if (levelMenu) {

            levelMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Hide weapon menu.
         */

        const weaponMenu =
            document.getElementById(
                "weaponSelectMenu"
            );


        if (weaponMenu) {

            weaponMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Show difficulty menu.
         */

        const difficultyMenu =
            document.getElementById(
                "difficultySelectMenu"
            );


        if (difficultyMenu) {

            difficultyMenu.classList.remove(
                "hidden"
            );

        }


        this.state.phase =
            GamePhase.DIFFICULTY_SELECT;


        this.state.timeLeft =
            0;


        this.hud.status(
            "SELECT DIFFICULTY"
        );

        this.hud.hideMessage();

    }


    /*
     * =================================
     * SELECT DIFFICULTY
     * =================================
     */

    selectDifficulty(
        difficulty
    ) {

        this.sound.uiSelect();

        if (
            this.state.phase !==
            GamePhase.DIFFICULTY_SELECT
        ) {

            return;
        }


        const allowed = [

            "easy",
            "normal",
            "hard"

        ];


        if (
            !allowed.includes(
                difficulty
            )
        ) {

            return;
        }


        this.state.difficulty =
            difficulty;


        /*
         * Apply difficulty to AI.
         */

        this.ai.setDifficulty(
            difficulty
        );


        /*
         * Highlight difficulty.
         */

        document
            .querySelectorAll(
                "#difficultySelectGrid .selection-card"
            )
            .forEach(card => {

                card.classList.toggle(

                    "active",

                    card.dataset.difficulty ===
                    difficulty

                );

            });


        this.clearCombatInput();


        /*
         * Start weapon selection.
         */

        this.openWeaponSelection();

    }


    /*
     * =================================
     * OPEN WEAPON SELECTION
     * =================================
     */

    openWeaponSelection() {

        if (
            this.state.phase !==
            GamePhase.DIFFICULTY_SELECT
        ) {

            return;
        }


        this.clearCombatInput();


        /*
         * Hide main menu.
         */

        const mainMenu =
            document.getElementById(
                "mainMenu"
            );


        if (mainMenu) {

            mainMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Hide level menu.
         */

        const levelMenu =
            document.getElementById(
                "levelSelectMenu"
            );


        if (levelMenu) {

            levelMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Hide difficulty menu.
         */

        const difficultyMenu =
            document.getElementById(
                "difficultySelectMenu"
            );


        if (difficultyMenu) {

            difficultyMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Show weapon menu.
         */

        const weaponSelectMenu =
            document.getElementById(
                "weaponSelectMenu"
            );


        if (weaponSelectMenu) {

            weaponSelectMenu.classList.remove(
                "hidden"
            );

        }


        this.state.phase =
            GamePhase.WEAPON_SELECT;


        this.state.timeLeft =
            0;


        /*
         * Reset player weapon.
         */

        this.playerWeapons.currentName =
            null;

        this.player.setWeapon(
            null
        );


        /*
         * =================================
         * RESET AI
         * =================================
         */

        this.ai.setDifficulty(
            this.state.difficulty
        );


        /*
         * =================================
         * CHOOSE AI WEAPON
         * =================================
         */

        const openingDistance =
            Math.hypot(

                this.ai.x -
                this.player.x,

                this.ai.y -
                this.player.y

            );


        const aiWeapon =
            this.ai.chooseWeapon(
                openingDistance
            );


        if (aiWeapon) {

            this.aiWeapons.equip(
                aiWeapon
            );

        } else {

            this.aiWeapons.equip(
                "sword"
            );

        }


        this.ai.setWeapon(
            this.aiWeapons.current
        );


        /*
         * Clear weapon cards.
         */

        document
            .querySelectorAll(
                "#weaponSelectGrid .weapon-select-card"
            )
            .forEach(card => {

                card.classList.remove(
                    "active"
                );

            });


        this.hud.status(
            "SELECT WEAPON"
        );

        this.hud.hideMessage();

    }
        /*
     * =================================
     * SELECT WEAPON
     * =================================
     */

    selectWeapon(
        name
    ) {

        this.sound.uiSelect();

        if (
            this.state.phase !==
            GamePhase.WEAPON_SELECT
        ) {

            return;
        }


        const equipped =
            this.playerWeapons.equip(
                name
            );


        if (!equipped) {

            return;
        }


        /*
         * Sync player.
         */

        this.player.setWeapon(
            this.playerWeapons.current
        );


        /*
         * Highlight.
         */

        document
            .querySelectorAll(
                "#weaponSelectGrid .weapon-select-card"
            )
            .forEach(card => {

                card.classList.toggle(
                    "active",

                    card.dataset.weapon ===
                    name

                );

            });


        this.clearCombatInput();


        /*
         * Begin round.
         */

        this.beginRound();

    }


    /*
     * =================================
     * SYNC WEAPONS
     * =================================
     */

    syncWeapons() {

        this.player.setWeapon(
            this.playerWeapons.current
        );


        this.ai.setWeapon(
            this.aiWeapons.current
        );

    }


    /*
     * =================================
     * START ROUND
     * =================================
     */

    startRound() {

        this.clearCombatInput();


        this.state.phase =
            GamePhase.WEAPON_SELECT;

        this.setBackButtonsVisible(true);


        this.state.timeLeft =
            0;


        /*
         * =================================
         * LOAD SELECTED LEVEL
         * =================================
         */

        this.loadCurrentLevel();


        /*
         * =================================
         * RESET FIGHTERS
         * =================================
         */

        this.placeFighters();


        this.player.reset(
            this.player.x,
            this.player.y
        );


        this.ai.reset(
            this.ai.x,
            this.ai.y
        );


        /*
         * =================================
         * APPLY DIFFICULTY
         * =================================
         */

        this.ai.setDifficulty(
            this.state.difficulty
        );


        /*
         * =================================
         * CLEAR PROJECTILES
         * =================================
         */

        this.projectiles = [];


        /*
         * =================================
         * PLAYER STARTS UNARMED
         * =================================
         */

        this.playerWeapons.currentName =
            null;

        this.player.setWeapon(
            null
        );


        /*
         * =================================
         * AI WEAPON
         * =================================
         */

        const openingDistance =
            Math.hypot(

                this.ai.x -
                this.player.x,

                this.ai.y -
                this.player.y

            );


        const aiWeapon =
            this.ai.chooseWeapon(
                openingDistance
            );


        if (aiWeapon) {

            this.aiWeapons.equip(
                aiWeapon
            );

        } else {

            this.aiWeapons.equip(
                "sword"
            );

        }


        this.ai.setWeapon(
            this.aiWeapons.current
        );


        /*
         * =================================
         * SHOW WEAPON MENU
         * =================================
         */

        const weaponSelectMenu =
            document.getElementById(
                "weaponSelectMenu"
            );


        if (weaponSelectMenu) {

            weaponSelectMenu.classList.remove(
                "hidden"
            );

        }


        /*
         * =================================
         * HIDE OTHER MENUS
         * =================================
         */

        const mainMenu =
            document.getElementById(
                "mainMenu"
            );


        if (mainMenu) {

            mainMenu.classList.add(
                "hidden"
            );

        }


        const levelMenu =
            document.getElementById(
                "levelSelectMenu"
            );


        if (levelMenu) {

            levelMenu.classList.add(
                "hidden"
            );

        }


        const difficultyMenu =
            document.getElementById(
                "difficultySelectMenu"
            );


        if (difficultyMenu) {

            difficultyMenu.classList.add(
                "hidden"
            );

        }


        /*
         * =================================
         * CLEAR WEAPON SELECTION
         * =================================
         */

        document
            .querySelectorAll(
                "#weaponSelectGrid .weapon-select-card"
            )
            .forEach(card => {

                card.classList.remove(
                    "active"
                );

            });


        this.hud.status(
            "SELECT WEAPON"
        );

        this.hud.hideMessage();

    }


    /*
     * =================================
     * BEGIN ROUND
     * =================================
     */

    beginRound() {

        if (
            this.state.phase !==
            GamePhase.WEAPON_SELECT
        ) {

            return;
        }


        /*
         * Player needs weapon.
         */

        if (
            !this.playerWeapons.current
        ) {

            return;
        }


        this.clearCombatInput();


        /*
         * Sync weapons.
         */

        this.syncWeapons();


        /*
         * Enter combat.
         */

        this.state.phase =
            GamePhase.ROUND;

        this.sound.roundStart();

        this.setBackButtonsVisible(false);


        this.state.timeLeft =
            GAME_CONFIG.roundDuration;


        /*
         * Hide weapon menu.
         */

        const weaponSelectMenu =
            document.getElementById(
                "weaponSelectMenu"
            );


        if (weaponSelectMenu) {

            weaponSelectMenu.classList.add(
                "hidden"
            );

        }


        /*
         * Show weapon HUD.
         */

        const weaponHud =
            document.getElementById(
                "weaponHud"
            );


        if (weaponHud) {

            weaponHud.classList.remove(
                "hidden"
            );

        }


        /*
         * Status.
         */

        this.hud.status(
            "FIGHT"
        );

        this.hud.hideMessage();

    }


    /*
     * =================================
     * FINISH ROUND
     * =================================
     */

    finishRound(
        winner
    ) {

        if (
            this.state.phase !==
            GamePhase.ROUND
        ) {

            return;
        }


        /*
         * Force loser HP to zero.
         */

        if (
            winner === "player"
        ) {

            this.ai.health =
                0;

        } else {

            this.player.health =
                0;

        }


        this.clearCombatInput();


        /*
         * Score.
         */

        if (
            winner === "player"
        ) {

            this.state.playerWins++;

        } else {

            this.state.aiWins++;

        }


        /*
         * Update HUD after the score changes.
         */

        this.hud.update(
            this.player,
            this.ai,
            this.state.timeLeft,
            this.state.round,
            this.state.playerWins,
            this.state.aiWins
        );


        /*
         * Check match.
         */

        const over =
            this.state.playerWins >=
                GAME_CONFIG.roundsToWin ||

            this.state.aiWins >=
                GAME_CONFIG.roundsToWin;


        this.state.phase =
            over
                ? GamePhase.MATCH_OVER
                : GamePhase.ROUND_OVER;

        this.setBackButtonsVisible(false);


        this.hud.status(
            over
                ? "MATCH OVER"
                : "ROUND OVER"
        );


        this.hud.message(

            `${
                winner === "player"
                    ? "ROUND WON"
                    : "ROUND LOST"
            }\n${
                this.state.playerWins
            } — ${
                this.state.aiWins
            }`

        );

        if (over) {
            if (winner === "player") {
                this.sound.matchWin();
            } else {
                this.sound.matchLose();
            }
        } else if (winner === "player") {
            this.sound.roundWin();
        } else {
            this.sound.roundLose();
        }


        /*
         * =================================
         * NEXT ROUND
         * =================================
         *
         * IMPORTANT:
         *
         * We do NOT reset the selected
         * level or difficulty here.
         *
         * The next round uses the same
         * level and difficulty.
         */

        if (!over) {

            this.state.round++;


            setTimeout(
                () => {

                    this.startRound();

                },
                1400
            );

        } else {

            setTimeout(
                () => {

                    this.hud.message(

                        this.state.playerWins >
                        this.state.aiWins

                            ? `${this.playerName}\nVICTORY`

                            : `${this.playerName}\nDEFEAT`

                    );

                },
                900
            );


            setTimeout(
                () => {
                    this.newMatch();
                },
                2000
            );

        }

    }


    /*
     * =================================
     * PROJECTILES
     * =================================
     */

    updateProjectiles(
        dt
    ) {

        for (
            const projectile of
            this.projectiles
        ) {

            projectile.update(
                dt
            );


            const target =
                projectile.owner ===
                this.player

                    ? this.ai

                    : this.player;


            /*
             * Projectile vs obstacles.
             */

            if (
                this.arena &&
                Array.isArray(
                    this.arena.obstacles
                )
            ) {

                for (
                    const obstacle of
                    this.arena.obstacles
                ) {

                    if (
                        projectileHitsObstacle(
                            projectile,
                            obstacle
                        )
                    ) {

                        projectile.alive =
                            false;

                        break;
                    }

                }

            }


            if (
                !projectile.alive
            ) {

                continue;
            }


            /*
             * Projectile vs fighter.
             */

            if (
                projectile.collidesWith(
                    target
                )
            ) {

                const damaged =
                    target.takeDamage(
                        projectile.damage
                    );


                if (damaged) {

                    this.sound.projectileImpact();
                    this.sound.hurt();

                    applyKnockback(
                        projectile.owner,
                        target,
                        projectile.knockback
                    );

                }


                projectile.alive =
                    false;

            }

        }


        /*
         * Remove dead projectiles.
         */

        this.projectiles =
            this.projectiles.filter(
                projectile =>
                    projectile.alive
            );

    }


    /*
     * =================================
     * MELEE
     * =================================
     */

    updateMelee(
        dt
    ) {

        this.player.updateAttack(
            dt
        );

        this.ai.updateAttack(
            dt
        );


        /*
         * Player melee.
         */

        if (
            this.player.weapon
        ) {

            const playerMeleeHit =
                processMeleeHit(
                    this.player,
                    this.ai
                );

            if (playerMeleeHit) {
                this.sound.hit();
            }

        }


        /*
         * AI melee.
         */

        if (
            this.ai.weapon
        ) {

            const aiMeleeHit =
                processMeleeHit(
                    this.ai,
                    this.player
                );

            if (aiMeleeHit) {
                this.sound.hit();
            }

        }

    }


    /*
     * =================================
     * ARENA COLLISION
     * =================================
     */

    resolveArenaCollision(
        entity
    ) {

        if (
            !entity ||
            !this.arena
        ) {

            return;
        }


        /*
         * First keep the fighter
         * inside the arena.
         */

        constrainToArena(
            entity,
            this.renderer.width,
            this.renderer.height,
            GAME_CONFIG.arenaPadding ||
            0
        );


        /*
         * Push fighters away from
         * rectangular obstacles.
         */

        const obstacles =
            this.arena.obstacles;


        if (
            !Array.isArray(
                obstacles
            )
        ) {

            return;
        }


        for (
            const obstacle of
            obstacles
        ) {

            if (
                obstacle.type !==
                "rectangle"
            ) {

                continue;
            }


            pushCircleOutOfRectangle(
                entity,
                obstacle
            );

        }

    }


    /*
     * =================================
     * UPDATE ARENA
     * =================================
     */

    updateArena(
        dt
    ) {

        if (
            !this.arena
        ) {

            return;
        }


        updateHazards(
            this.arena.hazards,
            dt,
            this.player,
            this.ai
        );


        this.arena.update(
            dt,
            this.player,
            this.ai
        );


        /*
         * Resolve obstacles.
         */

        this.resolveArenaCollision(
            this.player
        );


        this.resolveArenaCollision(
            this.ai
        );

    }

        /*
     * =================================
     * GAME UPDATE
     * =================================
     */

    update(
        dt
    ) {

        /*
         * Keep menu phases completely
         * outside the combat simulation.
         */

        if (
            this.state.phase !==
            GamePhase.ROUND
        ) {

            return;
        }


        /*
         * =================================
         * ROUND TIMER
         * =================================
         */

        this.state.timeLeft -= dt;


        if (
            this.state.timeLeft <= 0
        ) {

            this.state.timeLeft =
                0;


            /*
             * Time-out winner:
             *
             * Higher remaining health wins.
             * A draw is resolved in favour
             * of the player only when both
             * have exactly the same health.
             */

            let winner;


            if (
                this.player.health >=
                this.ai.health
            ) {

                winner =
                    "player";

            } else {

                winner =
                    "ai";

            }


            this.finishRound(
                winner
            );

            return;

        }


        /*
         * =================================
         * INPUT
         * =================================
         */

        const input =
            this.input;


        /*
         * =================================
         * PLAYER MOVEMENT
         * =================================
         */

        const playerWasDodging =
            this.player.dodgeDuration > 0;

        const spaceWasDown =
            this.player.dodgeKeyWasDown;

        this.player.updateMovement(
            this.keyboard,
            dt,
            this.renderer.width,
            this.renderer.height
        );

        if (
            !playerWasDodging &&
            !spaceWasDown &&
            this.player.dodgeDuration > 0
        ) {
            this.sound.dodge();
        }


        /*
         * =================================
         * PLAYER AIM
         * =================================
         */

        if (
            this.mouse
        ) {

            this.player.angle =
                Math.atan2(
                    this.mouse.y - this.player.y,
                    this.mouse.x - this.player.x
                );

        }


        /*
         * =================================
         * WEAPON COOLDOWNS
         * =================================
         *
         * Weapon cooldown timers must advance every
         * frame. Without this, the first attack starts
         * the cooldown and every later attack remains
         * blocked forever.
         */

        if (
            this.player.weapon &&
            typeof this.player.weapon.update ===
                "function"
        ) {

            this.player.weapon.update(
                dt
            );
        }


        if (
            this.ai.weapon &&
            typeof this.ai.weapon.update ===
                "function"
        ) {

            this.ai.weapon.update(
                dt
            );
        }


        /*
         * =================================
         * PLAYER ATTACK
         * =================================
         */

        if (
            this.mouse &&
            this.mouse.consumePress()
        ) {

            if (
                this.player.weapon
            ) {

                const attack =
                    combatAttack(
                        this.player,
                        this.ai,
                        this.projectiles
                    );


                if (
                    attack &&
                    attack.projectile
                ) {

                    this.projectiles.push(
                        attack.projectile
                    );

                }

                if (attack) {
                    this.sound.weaponAttack(
                        this.player.weapon.name
                    );
                }

            }

        }


        /*
         * =================================
         * AI
         * =================================
         */

        this.ai.update(
            this.player,
            dt,
            this.renderer.width,
            this.renderer.height,
            this.arena,
            this.projectiles
        );


        /*
         * AI attack.
         *
         * The AI controller decides
         * when an attack should happen.
         */

        if (
            this.ai.consumeAttack()
        ) {

            if (
                this.ai.weapon
            ) {

                const attack =
                    combatAttack(
                        this.ai,
                        this.player,
                        this.projectiles
                    );


                if (
                    attack &&
                    attack.projectile
                ) {

                    this.projectiles.push(
                        attack.projectile
                    );

                }

                if (attack) {
                    this.sound.weaponAttack(
                        this.ai.weapon.name
                    );
                }

            }

        }


        /*
         * =================================
         * ARENA
         * =================================
         */

        this.updateArena(
            dt
        );


        /*
         * =================================
         * MELEE
         * =================================
         */

        this.updateMelee(
            dt
        );


        /*
         * =================================
         * PROJECTILES
         * =================================
         */

        this.updateProjectiles(
            dt
        );


        /*
         * =================================
         * EFFECTS
         * =================================
         */

        this.player.updateEffects(
            dt
        );

        this.ai.updateEffects(
            dt
        );


        /*
         * =================================
         * DEATH CHECK
         * =================================
         */

        if (
            this.player.health <= 0
        ) {

            this.finishRound(
                "ai"
            );

            return;
        }


        if (
            this.ai.health <= 0
        ) {

            this.finishRound(
                "player"
            );

            return;
        }


        /*
         * =================================
         * HUD
         * =================================
         */

        this.hud.update(
            this.player,
            this.ai,
            this.state.timeLeft,
            this.state.round,
            this.state.playerWins,
            this.state.aiWins
        );

    }


    /*
     * =================================
     * CLEAR COMBAT INPUT
     * =================================
     */

    clearCombatInput() {

        if (
            this.mouse &&
            typeof this.mouse.clear ===
            "function"
        ) {

            this.mouse.clear();

        }


        if (
            this.keyboard &&
            typeof this.keyboard.clearPressed ===
            "function"
        ) {

            this.keyboard.clearPressed();

        }

    }


    /*
     * =================================
     * GAME LOOP
     * =================================
     */

    loop() {

        const dt =
            this.clock.tick();


        /*
         * Clamp large frame gaps.
         *
         * This prevents physics from
         * exploding after tab switching
         * or a browser stall.
         */

        const safeDt =
            Math.min(
                dt,
                0.05
            );


        this.update(
            safeDt
        );


        /*
         * =================================
         * RENDER
         * =================================
         */

        this.renderer.draw(
            this.player,
            this.ai,
            this.projectiles,
            this.arena
                ? this.arena.obstacles
                : [],
            this.arena
                ? this.arena.hazards
                : []
        );


        /*
         * =================================
         * NEXT FRAME
         * =================================
         */

        requestAnimationFrame(
            () => this.loop()
        );

    }


    /*
     * =================================
     * RESIZE
     * =================================
     */

    resize() {

        if (
            !this.renderer
        ) {

            return;
        }


        this.renderer.resize();


        if (
            this.arena
        ) {

            this.arena.resize(
                this.renderer.width,
                this.renderer.height
            );

        }


        /*
         * Keep fighters inside the
         * resized arena.
         */

        if (
            this.player
        ) {

            constrainToArena(
                this.player,
                this.renderer.width,
                this.renderer.height,
                GAME_CONFIG.arenaPadding ||
                0
            );

        }


        if (
            this.ai
        ) {

            constrainToArena(
                this.ai,
                this.renderer.width,
                this.renderer.height,
                GAME_CONFIG.arenaPadding ||
                0
            );

        }

    }


    /*
     * =================================
     * INPUT HANDLERS
     * =================================
     */

    handleKeyDown(
        event
    ) {

        /*
         * ESC returns to the main menu
         * when not actively fighting.
         */

        if (
            event.key === "Escape"
        ) {

            if (
                this.state.phase !==
                GamePhase.ROUND
            ) {

                this.showMainMenu();

            }

        }


        /*
         * Keyboard shortcuts for menus.
         */

        if (
            this.state.phase ===
            GamePhase.LEVEL_SELECT
        ) {

            if (
                event.key === "1"
            ) {

                this.selectLevel(
                    "level1"
                );

            } else if (
                event.key === "2"
            ) {

                this.selectLevel(
                    "level2"
                );

            } else if (
                event.key === "3"
            ) {

                this.selectLevel(
                    "level3"
                );

            }

        }


        if (
            this.state.phase ===
            GamePhase.DIFFICULTY_SELECT
        ) {

            const key =
                event.key.toLowerCase();


            if (
                key === "1" ||
                key === "e"
            ) {

                this.selectDifficulty(
                    "easy"
                );

            } else if (
                key === "2" ||
                key === "n"
            ) {

                this.selectDifficulty(
                    "normal"
                );

            } else if (
                key === "3" ||
                key === "h"
            ) {

                this.selectDifficulty(
                    "hard"
                );

            }

        }


        /*
         * Weapon shortcuts.
         */

        if (
            this.state.phase ===
            GamePhase.WEAPON_SELECT
        ) {

            const key =
                event.key.toLowerCase();


            const weaponKeys = {

                "1": "sword",
                "2": "hammer",
                "3": "bow",
                "4": "spear",
                "5": "dagger",
                "6": "staff"

            };


            if (
                weaponKeys[key]
            ) {

                this.selectWeapon(
                    weaponKeys[key]
                );

            }

        }

    }


    /*
     * =================================
     * MOUSE HANDLERS
     * =================================
     */

    handleMouseDown(
        event
    ) {

        if (
            this.state.phase !==
            GamePhase.ROUND
        ) {

            return;
        }


        if (
            event.button === 0
        ) {

            this.mouse.leftDown =
                true;

        }

    }


    handleMouseUp(
        event
    ) {

        if (
            event.button === 0
        ) {

            this.mouse.leftDown =
                false;

        }

    }


    /*
     * =================================
     * CLEANUP
     * =================================
     */

    destroy() {

        if (
            this.animationFrame
        ) {

            cancelAnimationFrame(
                this.animationFrame
            );

            this.animationFrame =
                null;

        }


        window.removeEventListener(
            "resize",
            this.resizeHandler
        );


        window.removeEventListener(
            "keydown",
            this.keyDownHandler
        );


        window.removeEventListener(
            "mousedown",
            this.mouseDownHandler
        );


        window.removeEventListener(
            "mouseup",
            this.mouseUpHandler
        );

    }

}


/*
 * =================================
 * PROJECTILE / OBSTACLE COLLISION
 * =================================
 */

function projectileHitsObstacle(
    projectile,
    obstacle
) {

    if (
        !projectile ||
        !obstacle
    ) {

        return false;
    }


    /*
     * Only rectangular obstacles are
     * currently supported.
     */

    if (
        obstacle.type !==
        "rectangle"
    ) {

        return false;
    }


    const radius =
        projectile.radius ||
        4;


    /*
     * Expand the obstacle by the
     * projectile radius so fast-moving
     * projectiles still register contact.
     */

    const left =
        obstacle.x -
        radius;

    const right =
        obstacle.x +
        obstacle.width +
        radius;

    const top =
        obstacle.y -
        radius;

    const bottom =
        obstacle.y +
        obstacle.height +
        radius;


    return (
        projectile.x >= left &&
        projectile.x <= right &&
        projectile.y >= top &&
        projectile.y <= bottom
    );

}


/*
 * =================================
 * CIRCLE / RECTANGLE PUSH OUT
 * =================================
 */

function pushCircleOutOfRectangle(
    circle,
    rectangle
) {

    if (
        !circle ||
        !rectangle
    ) {

        return;
    }


    const radius =
        circle.radius ||
        0;


    const closestX =
        Math.max(
            rectangle.x,
            Math.min(
                circle.x,
                rectangle.x +
                rectangle.width
            )
        );


    const closestY =
        Math.max(
            rectangle.y,
            Math.min(
                circle.y,
                rectangle.y +
                rectangle.height
            )
        );


    const dx =
        circle.x -
        closestX;

    const dy =
        circle.y -
        closestY;


    const distanceSq =
        dx * dx +
        dy * dy;


    if (
        distanceSq >
        radius * radius
    ) {

        return;
    }


    /*
     * Fighter is inside or touching
     * the obstacle.
     */

    const distance =
        Math.sqrt(
            distanceSq
        );


    /*
     * Normal collision case.
     */

    if (
        distance > 0.0001
    ) {

        const penetration =
            radius -
            distance;


        circle.x +=
            (dx / distance) *
            penetration;

        circle.y +=
            (dy / distance) *
            penetration;


        return;

    }


    /*
     * If the circle centre is directly
     * inside the rectangle, determine
     * the closest side and push toward it.
     */

    const leftDistance =
        Math.abs(
            circle.x -
            rectangle.x
        );

    const rightDistance =
        Math.abs(
            rectangle.x +
            rectangle.width -
            circle.x
        );

    const topDistance =
        Math.abs(
            circle.y -
            rectangle.y
        );

    const bottomDistance =
        Math.abs(
            rectangle.y +
            rectangle.height -
            circle.y
        );


    const minimum =
        Math.min(
            leftDistance,
            rightDistance,
            topDistance,
            bottomDistance
        );


    if (
        minimum === leftDistance
    ) {

        circle.x =
            rectangle.x -
            radius;

    } else if (
        minimum === rightDistance
    ) {

        circle.x =
            rectangle.x +
            rectangle.width +
            radius;

    } else if (
        minimum === topDistance
    ) {

        circle.y =
            rectangle.y -
            radius;

    } else {

        circle.y =
            rectangle.y +
            rectangle.height +
            radius;

    }

}


export default Game;

/*
 * =================================
 * END OF GAME.JS
 * =================================
 *
 * The remaining content of the file
 * contains no additional game logic.
 *
 * Keep the file ending exactly here.
 */ 