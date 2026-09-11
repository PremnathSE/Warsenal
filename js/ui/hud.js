export class HUD {

    constructor() {



        /*
         * =================================
         * MATCH
         * =================================
         */

        this.roundText =
            document.getElementById(
                "roundText"
            );

        this.statusText =
            document.getElementById(
                "status"
            );

        this.timerText =
            document.getElementById(
                "timer"
            );

        /*
         * =================================
         * MATCH SCORE
         * =================================
         */

        this.playerWins =
            document.getElementById(
                "playerWins"
            );

        this.aiWins =
            document.getElementById(
                "aiWins"
            );


        this.playerNameLabel =
            document.getElementById(
                "playerNameLabel"
            );

        this.aiNameLabel =
            document.getElementById(
                "aiNameLabel"
            );


        /*
         * =================================
         * MESSAGE
         * =================================
         */

        this.messageElement =
            document.getElementById(
                "message"
            );


        /*
         * =================================
         * COOLDOWN
         * =================================
         */

        this.cooldownElement =
            document.getElementById(
                "cooldown"
            );


        /*
         * =================================
         * WEAPON DISPLAY
         * =================================
         */

        this.weaponHud =
            document.getElementById(
                "weaponHud"
            );

        this.equippedWeaponName =
            document.getElementById(
                "equippedWeaponName"
            );
    }


    /*
     * =================================
     * SET NAMES
     * =================================
     */

    setNames(
        playerName = "PLAYER",
        aiName = "CPU"
    ) {

        if (this.playerNameLabel) {

            this.playerNameLabel.textContent =
                playerName || "PLAYER";
        }

        if (this.aiNameLabel) {

            this.aiNameLabel.textContent =
                aiName || "CPU";
        }
    }


    setPlayerName(
        playerName = "PLAYER"
    ) {

        this.setNames(
            playerName,
            "CPU"
        );
    }


    /*
     * =================================
     * UPDATE
     * =================================
     */

    update(
        player,
        enemy,
        time,
        round,
        playerWins = 0,
        aiWins = 0
    ) {

        /*
         * Safety.
         */

        if (!player || !enemy) {

            return;
        }
        /*
         * Player health bar.
         */


        if (this.roundText) {

            this.roundText.textContent =
                `ROUND ${round} / 3`;
        }

        /*
         * =================================
         * MATCH SCORE
         * =================================
         */

        if (this.playerWins) {

            this.playerWins.textContent =
                String(
                    Number(playerWins) || 0
                );
        }

        if (this.aiWins) {

            this.aiWins.textContent =
                String(
                    Number(aiWins) || 0
                );
        }


        /*
         * =================================
         * TIMER
         * =================================
         */

        if (this.timerText) {

            const safeTime =
                Math.max(
                    0,
                    Number(time) || 0
                );


            this.timerText.textContent =
                safeTime.toFixed(1);
        }


        /*
         * =================================
         * COOLDOWN
         * =================================
         */

        if (this.cooldownElement) {

            if (
                player.weapon &&
                Number(
                    player.weapon.cooldownTimer
                ) > 0
            ) {

                this.cooldownElement.textContent =
                    `COOLDOWN ${
                        player.weapon.cooldownTimer.toFixed(1)
                    }`;

            } else {

                this.cooldownElement.textContent =
                    "READY";
            }
        }


        /*
         * =================================
         * EQUIPPED WEAPON
         * =================================
         */

        if (this.equippedWeaponName) {

            if (
                player.weapon &&
                player.weapon.name
            ) {

                this.equippedWeaponName.textContent =
                    String(
                        player.weapon.name
                    ).toUpperCase();

            } else {

                this.equippedWeaponName.textContent =
                    "NONE";
            }
        }
    }


    /*
     * =================================
     * STATUS
     * =================================
     */

    status(text) {

        if (!this.statusText) {

            return;
        }


        this.statusText.textContent =
            String(
                text || ""
            );
    }


    /*
     * =================================
     * SELECT WEAPON
     * =================================
     */

    selectWeapon(name) {

        if (!this.equippedWeaponName) {

            return;
        }


        if (!name) {

            this.equippedWeaponName.textContent =
                "NONE";

            return;
        }


        /*
         * Convert weapon name to display
         * format.
         */

        let displayName =
            String(name);


        /*
         * If a Weapon object was passed.
         */

        if (
            typeof name === "object" &&
            name.name
        ) {

            displayName =
                name.name;
        }


        this.equippedWeaponName.textContent =
            displayName.toUpperCase();
    }


    /*
     * =================================
     * MESSAGE
     * =================================
     */

    message(text) {

        if (!this.messageElement) {

            return;
        }


        this.messageElement.textContent =
            String(
                text || ""
            );


        this.messageElement.classList.remove(
            "hidden"
        );
    }


    /*
     * =================================
     * HIDE MESSAGE
     * =================================
     */

    hideMessage() {

        if (!this.messageElement) {

            return;
        }


        this.messageElement.classList.add(
            "hidden"
        );
    }
}