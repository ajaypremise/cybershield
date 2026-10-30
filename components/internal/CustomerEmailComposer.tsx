"use client";
import {useEffect,useState} from "react";
import {sendCustomerCommunication} from "@/app/communications/actions";
type Props={role:"admin"|"agent";csrfToken:string;customerId:string;customerPublicId:string;customerName:string;customerEmail:string;secondaryEmails?:string[];recordToken?:string;introductions?:Record<string,string>};
export function CustomerEmailComposer(p:Props){
 const [selected,setSelected]=useState<string[]>([p.customerEmail]);
 const [extra,setExtra]=useState("");
 const [save,setSave]=useState(false);
 const [confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false);
 const [requestId,setRequestId]=useState("");
 useEffect(()=>setRequestId(crypto.randomUUID()),[]);
 const toggle=(e:string)=>setSelected(s=>s.includes(e)?s.filter(x=>x!==e):[...s,e]);
 const changeExtra=(next:string)=>{const prior=extra;const email=next.trim().toLowerCase();setExtra(email);setSelected(current=>current.filter(x=>x!==prior));setConfirmed(false);};
 const invalidExtra=Boolean(extra&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(extra));
 return <section className="internal-card" style={{padding:"1.5rem",marginTop:"1.25rem"}}>
 <h2>Create upgrade email — Firewall 6.0</h2><p>Select one or more email recipients. The subject and branded message cannot be edited.</p>
 <form action={sendCustomerCommunication} className="internal-form" onSubmit={e=>{if(!confirmed||busy||selected.length===0||invalidExtra||!requestId){e.preventDefault();return;}setBusy(true);}}>
 <input type="hidden" name="role" value={p.role}/><input type="hidden" name="csrfToken" value={p.csrfToken}/><input type="hidden" name="customerId" value={p.customerId}/><input type="hidden" name="recordToken" value={p.recordToken||""}/><input type="hidden" name="idempotencyKey" value={requestId}/><input type="hidden" name="confirmSend" value={confirmed?"yes":"no"}/>
 <h3>Send to</h3>{[p.customerEmail,...(p.secondaryEmails||[])].map((email,i)=><label key={email}><input type="checkbox" checked={selected.includes(email)} onChange={()=>toggle(email)}/>{i===0?"Registered":"Secondary"}: {email}</label>)}
 <label>Additional email<input type="email" value={extra} onChange={e=>changeExtra(e.target.value)} placeholder="name@example.com"/></label>
 {invalidExtra&&<p role="alert">Enter a valid additional email address.</p>}
 {extra&&<><label><input type="checkbox" checked={selected.includes(extra)} onChange={()=>toggle(extra)}/> Include {extra} as recipient</label><label><input type="checkbox" checked={save} onChange={e=>setSave(e.target.checked)}/> Save as secondary email on customer record</label></>}
 <input type="hidden" name="recipients" value={JSON.stringify(selected)}/><input type="hidden" name="secondaryEmail" value={extra}/><input type="hidden" name="saveSecondary" value={save?"yes":"no"}/>
 <p><strong>Fixed subject:</strong> CyberShield Firewall 6.0 — Your Security Upgrade Review</p>
 <p><strong>Fixed template:</strong> Firewall 6.0 security review, potential improvements and CyberShield contact options.</p>
 <label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I verified the recipients and permission to send this email.</label>
 <button className="internal-primary" disabled={!confirmed||busy||!selected.length||!requestId||invalidExtra}>{busy?"Sending…":"Send upgrade email"}</button></form></section>;
}
