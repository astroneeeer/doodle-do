import type {Task} from './local-store';
export const COMPLETED_TTL=24*60*60*1000;
export function completion(task:Task,done:boolean,now=Date.now()):Task{const {completedAt,...base}=task;return done?{...base,done:true,completedAt:task.done&&completedAt!==undefined?completedAt:now}:{...base,done:false}}
export function cleanTasks(tasks:Task[],now=Date.now()):Task[]{return tasks.map(t=>t.done&&t.completedAt===undefined?{...t,completedAt:now}:t).filter(t=>!t.done||now-t.completedAt!<COMPLETED_TTL)}
