"use client";
import { useState, useEffect } from "react";
import { sendCustomerCommunication } from "@/app/communications/actions";
type Props={role:"admin"|"agent";csrfToken:string;customerId:string;customerPublicId:string;customerName:string;customerEmail:string;recordToken?:string};
export function CustomerEmailComposer(p:Props){
 const [service,setService]=useState("NETWORK_SECURITY");
 const [years,setYears]=useState("1");
 const [amount,setAmount]=useState("");
 const [currency,setCurrency]=useState("AUD");
 const [message,setMessage]=useState("");
 const [confirm,setConfirm]=useState(false);
 const [preview,setPreview]=useState(false);
 const [busy,setBusy]=useState(false);
 const [requestId,setRequestId]=useState("");
 useEffect(()=>setRequestId(crypto.randomUUID()),[]);
 const serviceName=service==="NETWORK_SECURITY"?"Network Security":"Identity & IP Protector";
 return <section className="internal-card" style={{padding:"1.5rem",marginTop:"1.25rem"}}>
 <h2>Send service information</h2>
 <p>This sends a new informational email, not a purchase confirmation or agreement. No existing purchase, customer ID or coverage record is changed.</p>
 <form action={sendCustomerCommunication} className="internal-form" onSubmit={e=>{if(!confirm||busy){e.preventDefault();return;}setBusy(true);}}>
 <input type="hidden" name="role" value={p.role}/><input type="hidden" name="csrfToken" value={p.csrfToken}/>
 <input type="hidden" name="customerId" value={p.customerId}/><input type="hidden" name="recordToken" value={p.recordToken||""}/>
 <input type="hidden" name="idempotencyKey" value={requestId}/>
 <p><strong>Recipient:</strong> {p.customerName} · {p.customerEmail} · {p.customerPublicId}</p>
 <label>Approved service template<select name="service" value={service} onChange={e=>setService(e.target.value)}><option value="NETWORK_SECURITY">Network Security</option><option value="IDENTITY_IP_PROTECTOR">Identity &amp; IP Protector</option></select></label>
 <div className="internal-form-grid">
 <label>Proposed coverage (years)<input name="years" type="number" min="1" max="50" required value={years} onChange={e=>setYears(e.target.value)}/></label>
 <label>Proposed amount<input name="amount" type="number" min="0.01" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)}/></label>
 </div>
 <label>Currency<select name="currency" value={currency} onChange={e=>setCurrency(e.target.value)}><option>AUD</option><option>USD</option><option>GBP</option></select></label>
 <label>Optional additional message<textarea name="message" rows={4} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Add context for this customer; approved service wording remains unchanged."/></label>
 <label>Optional attachment (PDF, PNG or JPEG, maximum 5 MB)<input type="file" name="attachment" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"/></label>
 <button type="button" className="internal-secondary" onClick={()=>setPreview(v=>!v)}>{preview?"Hide preview":"Preview email"}</button>
 {preview&&<div style={{border:"1px solid #cbd5e1",borderRadius:12,padding:22,background:"#fff",color:"#0b1c35"}}>
 <div style={{background:"#0b1c35",color:"#39c9f6",padding:18,fontWeight:700}}>CYBERSHIELD AUSTRALIA</div>
 <h3>{serviceName}</h3><p>Dear {p.customerName},</p><p>Thank you for contacting CyberShield. Please review the following service information.</p>
 <p><strong>Customer ID:</strong> {p.customerPublicId}</p><p><strong>Service:</strong> {serviceName}</p>
 <p><strong>Proposed amount:</strong> {currency} {amount||"—"}</p><p><strong>Proposed coverage:</strong> {years||"—"} years</p>
 {message&&<p style={{whiteSpace:"pre-wrap"}}>{message}</p>}
 <p style={{fontSize:12}}>Service information only. This does not change existing purchases, coverage or agreements.</p>
 </div>}
 <label style={{display:"flex",gap:10,alignItems:"flex-start"}}><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/><span>I have verified the customer, service, amount, coverage and attachment. I understand this sends a real email to {p.customerEmail}.</span></label>
 <button className="internal-primary" type="submit" disabled={!confirm||busy||!requestId}>{busy?"Sending…":"Send email to customer"}</button>
 </form></section>;
}
