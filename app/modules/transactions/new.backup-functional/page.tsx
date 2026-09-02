"use client";
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';

type Row={id:string;name?:string;serviceId?:string;price?:string|number;active?:boolean;branchId?:string};
const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0);
export default function NewTransaction(){
 const [branches,setBranches]=useState<Row[]>([]),[customers,setCustomers]=useState<Row[]>([]),[employees,setEmployees]=useState<Row[]>([]),[services,setServices]=useState<Row[]>([]),[branchServices,setBranchServices]=useState<Row[]>([]);
 const [branchId,setBranchId]=useState(''),[customerId,setCustomerId]=useState(''),[employeeId,setEmployeeId]=useState(''),[serviceId,setServiceId]=useState(''),[qty,setQty]=useState(1),[discount,setDiscount]=useState(0),[payment,setPayment]=useState('CASH'),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 async function get(entity:string){const r=await fetch(`/api/data/${entity}?limit=500`,{cache:'no-store'});const x=await r.json();if(!r.ok)throw new Error(x.error||'Gagal memuat data');return x.data||[]}
 useEffect(()=>{Promise.all([get('branches'),get('customers'),get('employees'),get('services'),get('branchServices')]).then(([b,c,e,s,bs])=>{setBranches(b);setCustomers(c);setEmployees(e);setServices(s);setBranchServices(bs)}).catch(e=>setMsg(e.message))},[]);
 const available=useMemo(()=>{const ids=new Set(branchServices.filter(x=>!x.active||x.active===true&&(!branchId||x.branchId===branchId)).map(x=>x.serviceId));return services.filter(s=>ids.has(s.id))},[services,branchServices,branchId]);
 const selected=branchServices.find(x=>x.branchId===branchId&&x.serviceId===serviceId&&x.active!==false);
 const total=Math.max(0,Number(selected?.price||0)*Math.max(1,qty)-Math.max(0,discount));
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg('');try{const r=await fetch('/api/transactions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({branchId,customerId:customerId||undefined,employeeId:employeeId||undefined,items:[{serviceId,qty,discount}],payment,status:'SELESAI'})});const x=await r.json();if(!r.ok)throw new Error(x.message||'Transaksi gagal');setMsg(`Berhasil. Nomor: ${x.number||x.id||x.data?.number||'tersimpan'}`)}catch(e:any){setMsg(e.message||'Transaksi gagal')}finally{setBusy(false)}}
 return <section className="card form-card"><div className="section-title"><div><span className="eyebrow">TRANSAKSI</span><h1>Transaksi Baru</h1><p className="muted">Harga otomatis mengikuti cabang.</p></div><Link href="/modules/transactions">Kembali</Link></div><form className="form-grid" onSubmit={submit}>
 <label>Cabang<select required value={branchId} onChange={e=>{setBranchId(e.target.value);setServiceId('')}}><option value="">Pilih cabang</option>{branches.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Pelanggan<select value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">Tanpa pelanggan</option>{customers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Barber / Karyawan<select value={employeeId} onChange={e=>setEmployeeId(e.target.value)}><option value="">Pilih</option>{employees.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Layanan<select required value={serviceId} onChange={e=>setServiceId(e.target.value)}><option value="">Pilih layanan</option>{available.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Qty<input type="number" min="1" value={qty} onChange={e=>setQty(Math.max(1,Number(e.target.value)||1))}/></label>
 <label>Diskon<input type="number" min="0" value={discount} onChange={e=>setDiscount(Math.max(0,Number(e.target.value)||0))}/></label>
 <label>Pembayaran<select value={payment} onChange={e=>setPayment(e.target.value)}><option>CASH</option><option>QRIS</option><option>TRANSFER</option></select></label>
 <div className="total-box"><span>Total</span><strong>{money(total)}</strong></div>
 {msg&&<div className="notice">{msg}</div>}
 <button className="primary-btn" disabled={busy}>{busy?'Menyimpan…':'Simpan Transaksi'}</button>
 </form></section>
}