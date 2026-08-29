"use client";
import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
export default function Login(){
 const router=useRouter(); const [username,setUsername]=useState(''); const [password,setPassword]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 useEffect(()=>{fetch('/api/auth/me',{cache:'no-store'}).then(r=>r.json()).then(x=>{if(x.authenticated)router.replace('/')}).catch(()=>{});},[router]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.trim(),password})});const x=await r.json().catch(()=>({}));if(!r.ok||!x.success){setError(x.message||'Login gagal');return}router.replace('/');router.refresh()}catch{setError('Server tidak dapat dihubungi')}finally{setBusy(false)}}
 return <main className="login-wrap"><form className="login-card" onSubmit={submit}><div className="brand-mark">WZ</div><h1>WZ MANAGE PRO</h1><p className="muted">Masuk untuk mengelola bisnis.</p><label>Username<input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>{error&&<div className="error-box">{error}</div>}<button className="primary-btn" disabled={busy}>{busy?'Memproses…':'Masuk'}</button></form></main>;
}