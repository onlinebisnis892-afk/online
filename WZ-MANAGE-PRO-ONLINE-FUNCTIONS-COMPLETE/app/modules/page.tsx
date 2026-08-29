import Link from 'next/link'; import {modules} from '@/lib/feature-registry';
export default function Modules(){return <><h1>Modul WZ MANAGE PRO</h1><div className="grid">{modules.map(m=><Link className="card module" href={'/modules/'+m.key} key={m.key}><h2>{m.name}</h2><p>{m.features.length} fitur</p></Link>)}</div></>}
