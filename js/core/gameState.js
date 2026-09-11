export const GamePhase = Object.freeze({

    MAIN_MENU: "main_menu",

    LEVEL_SELECT: "level_select",

    DIFFICULTY_SELECT: "difficulty_select",

    WEAPON_MENU: "weapon_menu",

    WEAPON_SELECT: "weapon_select",

    ROUND: "round",

    ROUND_OVER: "round_over",

    MATCH_OVER: "match_over"

});


export class GameState {

    constructor() {

        this.resetMatch();

    }


    /*
     * =================================
     * RESET MATCH
     * =================================
     */

    resetMatch() {

        this.round = 1;

        this.playerWins = 0;

        this.aiWins = 0;

        this.timeLeft = 0;

        this.phase =
            GamePhase.MAIN_MENU;
    }


    /*
     * =================================
     * RESET ROUND
     * =================================
     *
     * A new round begins at the
     * weapon menu instead of directly
     * entering combat.
     */

    resetRound() {

        this.timeLeft = 0;

        this.phase =
            GamePhase.WEAPON_MENU;
    }

}