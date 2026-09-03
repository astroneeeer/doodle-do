'use client';
import {useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
export default function SortableTasks({children,onMove}:{children:ReactNode;onMove:(from:string,to:string)=>Promise<boolean>}){
const root=useRef<HTMLDivElement>(null),callback=useRef(onMove);callback.current=onMove;const[message,setMessage]=useState('');
useEffect(()=>{const el=root.current!;let timer:ReturnType<typeof setTimeout>|undefined;let source:HTMLElement|null=null,target:HTMLElement|null=null;let dragging=false,x=0,y=0,pointer:number|null=null,touch:number|null=null;
function reset(){clearTimeout(timer);source?.classList.remove('dragging-task');target?.classList.remove('drop-target');source=null;target=null;dragging=false;pointer=null;touch=null;el.classList.remove('sorting-tasks')}
function begin(node:EventTarget|null,px:number,py:number){const element=node instanceof Element?node:null;if(element?.closest('button,input,a,[role=checkbox]'))return false;const card=element?.closest<HTMLElement>('[data-sort-id]');if(!card||!el.contains(card))return false;source=card;x=px;y=py;timer=setTimeout(()=>{if(!source)return;dragging=true;source.classList.add('dragging-task');el.classList.add('sorting-tasks');setMessage('上下に動かして、指を離すと並べ替えます。')},400);return true}
function move(px:number,py:number){if(!source)return;if(!dragging){if(Math.hypot(px-x,py-y)>10)reset();return}const cards=Array.from(el.querySelectorAll<HTMLElement>('[data-sort-id]'));const nearest=cards.reduce<HTMLElement|null>((best,c)=>{const r=c.getBoundingClientRect(),b=best?.getBoundingClientRect();return !b||Math.abs(py-(r.top+r.height/2))<Math.abs(py-(b.top+b.height/2))?c:best},null);target?.classList.remove('drop-target');target=nearest;if(target!==source)target?.classList.add('drop-target');if(py<70)window.scrollBy(0,-14);else if(py>window.innerHeight-70)window.scrollBy(0,14)}
async function finish(){const from=source?.dataset.sortId,to=target?.dataset.sortId,active=dragging;reset();if(active&&from&&to&&from!==to){const ok=await callback.current(from,to);setMessage(ok?'並び順を保存しました。':'並び順を保存できませんでした。')}else setMessage('')}
function touchStart(e:TouchEvent){if(e.touches.length!==1){reset();return}const t=e.changedTouches[0];if(begin(e.target,t.clientX,t.clientY))touch=t.identifier}
function touchMove(e:TouchEvent){const t=Array.from(e.changedTouches).find(t=>t.identifier===touch);if(!t)return;if(dragging&&e.cancelable)e.preventDefault();move(t.clientX,t.clientY)}
function touchEnd(e:TouchEvent){if(Array.from(e.changedTouches).some(t=>t.identifier===touch))void finish()}
function down(e:PointerEvent){if(e.pointerType==='touch'||e.button!==0)return;if(begin(e.target,e.clientX,e.clientY))pointer=e.pointerId}
function pointerMove(e:PointerEvent){if(e.pointerId===pointer){if(dragging)e.preventDefault();move(e.clientX,e.clientY)}}
function up(e:PointerEvent){if(e.pointerId===pointer)void finish()}
function cancelPointer(e:PointerEvent){if(e.pointerId===pointer)reset()}
function context(e:Event){if(source)e.preventDefault()}
function keyboard(e:KeyboardEvent){if(!e.altKey||!['ArrowUp','ArrowDown'].includes(e.key))return;const card=(e.target as Element).closest<HTMLElement>('[data-sort-id]');if(!card)return;const cards=Array.from(el.querySelectorAll<HTMLElement>('[data-sort-id]'));const index=cards.indexOf(card),next=cards[index+(e.key==='ArrowUp'?-1:1)];if(next){e.preventDefault();void callback.current(card.dataset.sortId!,next.dataset.sortId!)}}
el.addEventListener('touchstart',touchStart,{passive:true});el.addEventListener('touchmove',touchMove,{passive:false});el.addEventListener('touchend',touchEnd);el.addEventListener('touchcancel',reset);el.addEventListener('pointerdown',down);window.addEventListener('pointermove',pointerMove);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancelPointer);el.addEventListener('contextmenu',context);el.addEventListener('keydown',keyboard);
return()=>{reset();el.removeEventListener('touchstart',touchStart);el.removeEventListener('touchmove',touchMove);el.removeEventListener('touchend',touchEnd);el.removeEventListener('touchcancel',reset);el.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',pointerMove);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancelPointer);el.removeEventListener('contextmenu',context);el.removeEventListener('keydown',keyboard)}},[]);
return <div ref={root} className="cards"><span className="sr-only" role="status">{message}</span>{children}</div>}

