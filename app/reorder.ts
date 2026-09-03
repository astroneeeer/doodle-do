import type {Task} from './local-store';
export function reorderTasks(tasks:Task[],fromId:string,toId:string):Task[]{const active=tasks.filter(t=>!t.done);const from=active.findIndex(t=>t.id===fromId),to=active.findIndex(t=>t.id===toId);if(from<0||to<0||from===to)return tasks;const [item]=active.splice(from,1);active.splice(to,0,item);let i=0;return tasks.map(t=>t.done?t:active[i++])}
