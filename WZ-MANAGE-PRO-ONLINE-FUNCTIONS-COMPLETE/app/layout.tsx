import './globals.css';
import Link from 'next/link';
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body><header className="top"><div><b>WZ MANAGE PRO</b><span> Online Business Management</span></div><nav><Link href="/">Dashboard</Link><Link href="/modules">Modules</Link><Link href="/feature-checklist">Checklist</Link></nav></header><main className="container">{children}</main></body></html>}
