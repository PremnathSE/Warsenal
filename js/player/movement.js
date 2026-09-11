export function movePlayer(player,axis,dt,speed,width,height){
  player.x+=axis.x*speed*dt;player.y+=axis.y*speed*dt;
  player.x=Math.max(player.radius,Math.min(width-player.radius,player.x));
  player.y=Math.max(player.radius,Math.min(height-player.radius,player.y));
}
