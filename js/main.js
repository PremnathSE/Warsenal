import { Game } from "./core/game.js";
const canvas=document.getElementById("gameCanvas");
if(!canvas) throw new Error("WARSENAL: #gameCanvas not found");
new Game(canvas);
