'use client';
import {useEffect,useRef,useState} from 'react';
import InkPad from './ink-pad';
import SortableTasks from './sortable-tasks';
import {reorderTasks} from './reorder';
import {cleanTasks,completion,COMPLETED_TTL} from './task-lifecycle';

import {readData,writeData,defaults,contrast} from './local-store';
import type {Settings} from './local-store';
import {Pencil,Plus,Check,Undo2,X,Eraser} from 'lucide-react';
import {useTaskTools} from './task-tools';
import {Checkbox} from '@/components/ui/checkbox';
const FIXED_BACKGROUND='#fffdf0';
type Point={x:number;y:number};type Stroke=Point[];type Task={id:string;title?:string;strokes?:Stroke[];done:boolean;completedAt?:number};
function Lines({strokes}:{strokes:Stroke[]}){return <>{strokes.map((s,i)=><polyline key={i} points={s.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>)}</>}
export default function Home(){
const[tasks,setTasks]=useState<Task[]>([]),[ready,setReady]=useState(false),[error,setError]=useState(''),[editing,setEditing]=useState<string|null>(null),[strokes,setStrokes]=useState<Stroke[]>([]),[text,setText]=useState(''),[mode,setMode]=useState<'ink'|'text'>('ink');const [tool,setTool]=useState<'pen'|'eraser'>('pen');const [history,setHistory]=useState<Stroke[][]>([]);
const [settings,setSettings]=useState<Settings>(defaults);const busy=useRef(false);
useEffect(()=>{readData().then(data=>{setTasks(data.tasks);setSettings(data.settings);setReady(true)}).catch(()=>setError('保存領域を開けませんでした。Safariの通常モードで開いてください。'));},[]);
useEffect(()=>{document.documentElement.style.setProperty('--page-bg',FIXED_BACKGROUND);document.documentElement.style.setProperty('--page-ink',contrast(FIXED_BACKGROUND));document.documentElement.style.setProperty('--user-accent',settings.accent);document.documentElement.style.setProperty('--accent-ink',contrast(settings.accent));document.title='doodle do';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',FIXED_BACKGROUND)},[settings]);
async function persist(next:Task[],appearance:Settings=settings){if(busy.current)return false;busy.current=true;try{const saved=await writeData({tasks:next,settings:appearance});setTasks(saved.tasks);setEditing(id=>id&&id!=='new'&&!saved.tasks.some(t=>t.id===id)?null:id);setSettings(appearance);setError('');return true}catch{setError('保存できませんでした。端末の空き容量を確認してください。');return false}finally{busy.current=false}}
useEffect(()=>{if(!ready)return;let timer:ReturnType<typeof setTimeout>;function schedule(){const deadlines=tasks.filter(t=>t.done&&t.completedAt!==undefined).map(t=>t.completedAt!+COMPLETED_TTL);if(!deadlines.length)return;const delay=Math.max(0,Math.min(...deadlines)-Date.now());timer=setTimeout(check,Math.min(delay,2147483647))}async function check(){clearTimeout(timer);if(busy.current){timer=setTimeout(check,500);return}const next=cleanTasks(tasks);if(next.length!==tasks.length){if(!await persist(next))timer=setTimeout(check,30000)}else schedule()}function visible(){if(document.visibilityState==='visible')void check()}schedule();window.addEventListener('focus',check);document.addEventListener('visibilitychange',visible);return()=>{clearTimeout(timer);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',visible)}},[ready,tasks,settings]);
async function removeTask(){if(editing&&editing!=='new')await persist(tasks.filter(t=>t.id!==editing))}
function open(task?:Task){setHistory([]);setTool('pen');setEditing(task?.id??'new');setStrokes(task?.strokes??[]);setText(task?.title??'');setMode(task?.title?'text':'ink')}
async function save(){if(mode==='ink'?!strokes.length:!text.trim())return;const task:Task={id:editing==='new'?crypto.randomUUID():editing!,done:tasks.find(t=>t.id===editing)?.done??false,completedAt:tasks.find(t=>t.id===editing)?.completedAt,...(mode==='ink'?{strokes}:{title:text.trim()})};if(await persist(editing==='new'?[...tasks,task]:tasks.map(t=>t.id===editing?task:t)))setEditing(null)}
useTaskTools(tasks,async(id,done)=>{if(!ready||!tasks.some(t=>t.id===id))return false;return persist(tasks.map(t=>t.id===id?completion(t,done):t))});

return <main className="workspace"><header className="masthead"><div className="brand"><img className="brand-logo" src="./doodle-do-logo.png" alt="doodle do" width="265" height="66"/></div></header>{error&&<p className="error" role="alert">{error}</p>}
{editing!==null&&<section className="composer" aria-label="タスクの見出しを編集"><div className="composer-head"><h2>{editing==='new'?'新しいタスク':'見出しを書き直す'}</h2><button className="icon-button" aria-label="編集を閉じる" onClick={()=>setEditing(null)}><X size={20}/></button></div><div className="mode-row"><button aria-pressed={mode==='ink'} onClick={()=>setMode('ink')}>手書き</button><button aria-pressed={mode==='text'} onClick={()=>setMode('text')}>文字入力</button>{editing!=='new'&&<button className="delete-task" onClick={removeTask}>タスクを削除</button>}</div>{mode==='ink'?<><div className="ink-tools"><button className="subtle" aria-pressed={tool==='pen'} onClick={()=>setTool('pen')}><Pencil size={18}/>ペン</button><button className="subtle" aria-pressed={tool==='eraser'} onClick={()=>setTool('eraser')}><Eraser size={18}/>消しゴム</button></div><InkPad strokes={strokes} onChange={setStrokes} onStart={()=>setHistory(h=>[...h.slice(-49),strokes])} tool={tool}/></>:<label className="text-label">タスクの見出し<input autoFocus value={text} maxLength={100} onChange={e=>setText(e.target.value)}  onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing)save()}}/></label>}<div className="composer-footer"><div>{mode==='ink'&&<><button className="subtle" disabled={!history.length} onClick={()=>{setStrokes(history[history.length-1]);setHistory(h=>h.slice(0,-1))}}><Undo2 size={16}/>ひとつ戻す</button><button className="subtle" disabled={!strokes.length} onClick={()=>{setHistory(h=>[...h.slice(-49),strokes]);setStrokes([])}}>すべて消す</button></>}</div><button className="primary" onClick={save} disabled={mode==='ink'?!strokes.length:!text.trim()}><Check size={18}/>{editing==='new'?'追加する':'保存する'}</button></div></section>}
<div className="board">{[false,true].map(completed=><section className={`column ${completed?'completed':''}`} key={String(completed)}><div className="column-heading"><h2><span className="status-dot"/>{completed?<img className="completed-label" src="./completed-label.png" alt="完了" width="141" height="86"/>:<img className="in-progress-label" src="./in-progress-label.png" alt="作業中" width="218" height="85"/>}</h2></div><SortableTasks onMove={async(from,to)=>persist(reorderTasks(tasks,from,to))}>{tasks.filter(t=>t.done===completed).map(task=><article className="task-card" key={task.id} data-sort-id={!completed?task.id:undefined} tabIndex={!completed?0:undefined} aria-label={!completed?`${task.title??'手書きタスク'}。長押しで並べ替え`:undefined}><div className="card-top"><Checkbox className="task-check" checked={task.done} aria-label={`${task.title??'手書きタスク'}を${completed?'進行中に戻す':'完了にする'}`} onCheckedChange={v=>persist(tasks.map(t=>t.id===task.id?completion(t,!!v):t))}/><button className="icon-button edit-button" aria-label="見出しを編集" onClick={()=>open(task)}><Pencil size={16}/></button></div><div className="task-title">{task.strokes?<svg viewBox="0 0 800 240" role="img" aria-label="手書きのタスク"><Lines strokes={task.strokes}/></svg>:<h3>{task.title}</h3>}</div></article>)}</SortableTasks>{!completed&&<button className="add-card" disabled={!ready} onClick={()=>open()}><img className="add-task-label" src="./add-task-label.png" alt="タスクを追加" width="524" height="85"/></button>}</section>)}</div></main>}














