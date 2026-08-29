import Link from 'next/link';
import {modules,allFeatures} from '@/lib/feature-registry';
const n=(s:string)=>s.toLowerCase();
export default function Home(){return <><h1>WZ MANAGE PRO</h1><p className="muted">Online architecture master build — 14 modules, {allFeatures.length} registered features.</p><div className="grid">{modules.map(m=><Link className="card module" href={'/modules/'+m.key} key={m.key}><h2>{m.name}</h2><p>{m.features.length} fitur terdaftar</p><span className="pill">Blueprint locked</span></Link>)}</div></>}
