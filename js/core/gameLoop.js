export class GameLoop{
  constructor(update,draw){this.update=update;this.draw=draw;this.running=false}
  start(){this.running=true;requestAnimationFrame(t=>this.frame(t))}
  frame(time){if(!this.running)return;this.update(time);this.draw();requestAnimationFrame(t=>this.frame(t))}
  stop(){this.running=false}
}
