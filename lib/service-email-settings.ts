import { prisma } from "@/lib/db";
export async function getServiceIntroductions():Promise<Record<string,string>>{
 const events=await prisma.adminAuditEvent.findMany({where:{action:"CUSTOMER_TEMPLATE_UPDATED"},orderBy:{timestamp:"desc"},take:100});
 const result:Record<string,string>={};
 for(const event of events){const m=event.metadata as {service?:string;intro?:string}|null;if(m?.service&&!Object.prototype.hasOwnProperty.call(result,m.service))result[m.service]=m.intro||"";}
 return result;
}
