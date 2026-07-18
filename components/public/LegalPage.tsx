
import { PageHero, SiteShell } from "@/components/public/SiteShell";
import type { ReactNode } from "react";
export function LegalPage({title,intro,updated,sections}:{title:string;intro:string;updated:string;sections:{id:string;title:string;content:ReactNode}[]}){return <SiteShell><PageHero eyebrow="Legal information" title={title} copy={intro}/><div className="public-wrap legal-layout"><aside className="legal-toc"><strong>On this page</strong>{sections.map(section=><a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</aside><article className="legal-article"><p className="last-updated">Last updated: {updated}</p>{sections.map(section=><section id={section.id} key={section.id}><h2>{section.title}</h2>{section.content}</section>)}</article></div></SiteShell>}
