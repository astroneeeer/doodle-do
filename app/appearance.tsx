'use client';
import {useState} from 'react';
import {Menu,X} from 'lucide-react';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogClose} from '@/components/ui/dialog';
import {validSettings} from './local-store';
import type {Settings} from './local-store';
export default function Appearance({value,onSave,ready}:{value:Settings;onSave:(s:Settings)=>Promise<boolean>;ready:boolean}){const[open,setOpen]=useState(false),[draft,setDraft]=useState(value),[saving,setSaving]=useState(false),[error,setError]=useState('');return <Dialog open={open} onOpenChange={v=>{setOpen(v);setDraft(value);setError('')}}><DialogTrigger className="settings-trigger" disabled={!ready}><Menu size={20}/><img className="settings-label" src="./settings-label.png" alt="設定" width="189" height="85"/></DialogTrigger><DialogContent className="appearance-dialog" showCloseButton={false}><div className="composer-head"><DialogTitle>設定</DialogTitle><DialogClose className="icon-button" aria-label="設定を閉じる"><X size={20}/></DialogClose></div><div className="color-fields"><label>背景色<input type="color" value={draft.background} onChange={e=>setDraft({...draft,background:e.target.value})}/></label><label>ボタンの色<input type="color" value={draft.accent} onChange={e=>setDraft({...draft,accent:e.target.value})}/></label></div>{error&&<p role="alert" className="error">{error}</p>}<button className="primary" disabled={saving||!validSettings(draft)} onClick={async()=>{setSaving(true);if(await onSave(draft))setOpen(false);else setError('設定を保存できませんでした。');setSaving(false)}}>保存</button></DialogContent></Dialog>}


