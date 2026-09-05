import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from './app/page';
import './app/globals.css';
createRoot(document.getElementById('root')!).render(<Home/>);
if('serviceWorker' in navigator){let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;location.reload()});window.addEventListener('load',async()=>{try{const registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});const update=()=>registration.update().catch(()=>{});update();document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')update()});window.setInterval(update,5*60*1000)}catch{}})}
