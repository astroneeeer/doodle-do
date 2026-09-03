export type Point={x:number;y:number};
export type Stroke=Point[];
function distance(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y;const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)}
export function erase(strokes:Stroke[],from:Point,to:Point,radius=12):Stroke[]{
return strokes.flatMap(stroke=>{const samples:Point[]=[];stroke.forEach((p,i)=>{if(!i){samples.push(p);return}const prev=stroke[i-1],n=Math.max(1,Math.ceil(Math.hypot(p.x-prev.x,p.y-prev.y)/2));for(let j=1;j<=n;j++)samples.push({x:prev.x+(p.x-prev.x)*j/n,y:prev.y+(p.y-prev.y)*j/n})});if(!samples.some(p=>distance(p,from,to)<=radius))return[stroke];const parts:Stroke[]=[];let part:Stroke=[];for(const p of samples){if(distance(p,from,to)<=radius){if(part.length)parts.push(part);part=[]}else part.push(p)}if(part.length)parts.push(part);return parts.map(s=>s.length===1?[s[0],{x:Math.min(800,s[0].x+.01),y:s[0].y}]:s)});
}
