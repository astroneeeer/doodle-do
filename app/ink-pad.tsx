'use client';
import {useEffect,useRef} from 'react';
import type {PointerEvent} from 'react';
import {erase} from './ink';
import type {Point,Stroke} from './ink';
export default function InkPad({strokes,onChange,onStart,tool}:{strokes:Stroke[];onChange:(next:Stroke[])=>void;onStart:()=>void;tool:'pen'|'eraser'}){
const surface=useRef<HTMLDivElement>(null),cursor=useRef<HTMLDivElement>(null),current=useRef(strokes),active=useRef<number|null>(null),last=useRef<Point|null>(null);current.current=strokes;
useEffect(()=>{const el=surface.current;if(!el)return;const stop=(e:TouchEvent)=>{if(e.cancelable)e.preventDefault()};el.addEventListener('touchstart',stop,{passive:false});el.addEventListener('touchmove',stop,{passive:false});return()=>{el.removeEventListener('touchstart',stop);el.removeEventListener('touchmove',stop)}},[]);
useEffect(()=>{if(tool!=='eraser'&&cursor.current)cursor.current.style.display='none'},[tool]);
function point(e:PointerEvent<HTMLDivElement>):Point{const r=e.currentTarget.getBoundingClientRect(),scale=Math.max(r.width/800,r.height/240),offsetX=(r.width-800*scale)/2,offsetY=(r.height-240*scale)/2;return{x:Math.max(0,Math.min(800,(e.clientX-r.left-offsetX)/scale)),y:Math.max(0,Math.min(240,(e.clientY-r.top-offsetY)/scale))}}
function positionCursor(e:PointerEvent<HTMLDivElement>){if(tool!=='eraser'||!cursor.current)return;const r=e.currentTarget.getBoundingClientRect(),scale=Math.max(r.width/800,r.height/240),size=24*scale;cursor.current.style.cssText=`display:block;left:${e.clientX-r.left}px;top:${e.clientY-r.top}px;width:${size}px;height:${size}px`}
function hideCursor(){if(cursor.current)cursor.current.style.display='none'}
function update(next:Stroke[]){current.current=next;onChange(next)}
function start(e:PointerEvent<HTMLDivElement>){positionCursor(e);if(active.current!==null||e.button!==0)return;e.preventDefault();e.stopPropagation();active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);onStart();const p=point(e);last.current=p;if(tool==='eraser')update(erase(current.current,p,p));else update([...current.current,[p,{x:Math.min(800,p.x+.01),y:p.y}]])}
function move(e:PointerEvent<HTMLDivElement>){positionCursor(e);if(active.current!==e.pointerId)return;e.preventDefault();const p=point(e);if(tool==='eraser')update(erase(current.current,last.current??p,p));else update(current.current.map((s,i)=>i===current.current.length-1?[...s,p]:s));last.current=p}
function end(e:PointerEvent<HTMLDivElement>){if(active.current!==e.pointerId)return;if(e.type==='pointerup')move(e);active.current=null;last.current=null;if(e.pointerType!=='mouse')hideCursor();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}
return <div ref={surface} className={`ink-surface ${tool==='eraser'?'is-erasing':''}`} style={{touchAction:'none'}} onPointerEnter={positionCursor} onPointerLeave={()=>{if(active.current===null)hideCursor()}} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{active.current=null;last.current=null}} onContextMenu={e=>e.preventDefault()} role="img" aria-label={tool==='eraser'?'消しゴム入力エリア':'手書き入力エリア'}><svg className="writing-pad" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{strokes.map((s,i)=><polyline key={i} points={s.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>)}</svg><div ref={cursor} className="eraser-cursor" aria-hidden="true"/></div>
}

