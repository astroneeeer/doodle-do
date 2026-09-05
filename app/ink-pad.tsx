'use client';
import {useEffect,useRef} from 'react';
import type {PointerEvent} from 'react';
import {erase} from './ink';
import type {Point,Stroke} from './ink';
export default function InkPad({strokes,onChange,onStart,onEnd,tool,width=800,height=240,strokeWidth=4,eraseRadius=12,className=''}:{strokes:Stroke[];onChange:(next:Stroke[])=>void;onStart:()=>void;onEnd?:()=>void;tool:'pen'|'eraser';width?:number;height?:number;strokeWidth?:number;eraseRadius?:number;className?:string}){
const surface=useRef<HTMLDivElement>(null),cursor=useRef<HTMLDivElement>(null),current=useRef(strokes),active=useRef<number|null>(null),last=useRef<Point|null>(null);current.current=strokes;
useEffect(()=>{const el=surface.current;if(!el)return;const stop=(e:TouchEvent)=>{if(e.cancelable)e.preventDefault()};el.addEventListener('touchstart',stop,{passive:false});el.addEventListener('touchmove',stop,{passive:false});return()=>{el.removeEventListener('touchstart',stop);el.removeEventListener('touchmove',stop)}},[]);
useEffect(()=>{if(tool!=='eraser'&&cursor.current)cursor.current.style.display='none'},[tool]);
function point(e:PointerEvent<HTMLDivElement>):Point{const r=e.currentTarget.getBoundingClientRect();return{x:Math.max(0,Math.min(width,(e.clientX-r.left)*width/r.width)),y:Math.max(0,Math.min(height,(e.clientY-r.top)*height/r.height))}}
function positionCursor(e:PointerEvent<HTMLDivElement>){if(tool!=='eraser'||!cursor.current)return;const r=e.currentTarget.getBoundingClientRect(),scale=Math.min(r.width/width,r.height/height),size=eraseRadius*2*scale;cursor.current.style.cssText=`display:block;left:${e.clientX-r.left}px;top:${e.clientY-r.top}px;width:${size}px;height:${size}px`}
function hideCursor(){if(cursor.current)cursor.current.style.display='none'}
function update(next:Stroke[]){current.current=next;onChange(next)}
function start(e:PointerEvent<HTMLDivElement>){positionCursor(e);if(active.current!==null||e.button!==0)return;e.preventDefault();e.stopPropagation();active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);onStart();const p=point(e);last.current=p;if(tool==='eraser')update(erase(current.current,p,p,eraseRadius));else update([...current.current,[p,{x:Math.min(width,p.x+.01),y:p.y}]])}
function move(e:PointerEvent<HTMLDivElement>){positionCursor(e);if(active.current!==e.pointerId)return;e.preventDefault();const p=point(e);if(tool==='eraser')update(erase(current.current,last.current??p,p,eraseRadius));else update(current.current.map((s,i)=>i===current.current.length-1?[...s,p]:s));last.current=p}
function end(e:PointerEvent<HTMLDivElement>){if(active.current!==e.pointerId)return;if(e.type==='pointerup')move(e);active.current=null;last.current=null;onEnd?.();if(tool!=='eraser'&&e.pointerType!=='mouse')hideCursor();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}
return <div ref={surface} className={`ink-surface ${className} ${tool==='eraser'?'is-erasing':''}`} style={{touchAction:'none'}} onPointerEnter={positionCursor} onPointerLeave={()=>{if(active.current===null)hideCursor()}} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{active.current=null;last.current=null;hideCursor()}} onContextMenu={e=>e.preventDefault()} role="img" aria-label={tool==='eraser'?'消しゴム入力エリア':'手書き入力エリア'}><svg className="writing-pad" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">{strokes.map((s,i)=><polyline key={i} points={s.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="currentColor" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>)}</svg><div ref={cursor} className="eraser-cursor" aria-hidden="true"/></div>
}

