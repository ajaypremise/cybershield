import type { Metadata } from "next";
export function publicMetadata(title:string,description:string,path:string):Metadata{return{title,description,alternates:{canonical:path},openGraph:{title:`${title} | CyberShield`,description,url:path,siteName:"CyberShield Australia",locale:"en_AU",type:"website"},twitter:{card:"summary",title:`${title} | CyberShield`,description}};}

