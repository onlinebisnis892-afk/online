import {notFound} from 'next/navigation';
import {modules} from '@/lib/feature-registry';
export default async function ModulePage({params}:{params:Promise<{key:string}>}){const {key}=await params;const m=modules.find(x=>x.key===key);if(!m)notFound();return <><h1>{m.name}</h1><p className="muted">Semua fitur dipertahankan. Fungsi online akan dihubungkan ke API/database pada tahap implementasi.</p><div className="card">{m.features.map(f=><div className="feature" key={f}>⬜ {f}</div>)}</div></>}
