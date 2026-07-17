import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  Cloud,
  CloudCog,
  Fingerprint,
  Flame,
  Globe2,
  Headphones,
  KeyRound,
  Laptop,
  LockKeyhole,
  Mail,
  MapPin,
  Network,
  PhoneCall,
  Printer,
  RadioTower,
  RefreshCw,
  Router,
  Server,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { Architecture } from "@/components/Architecture";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { ShieldVisual } from "@/components/ShieldVisual";

const securityLayers = [
  { title: "Next Generation Firewall", text: "Controls traffic and blocks sophisticated application-layer attacks before they enter your network.", icon: Flame },
  { title: "Intrusion Prevention", text: "Detects and prevents exploits, brute-force attempts and suspicious network behaviour in real time.", icon: Shield },
  { title: "Malware Protection", text: "Stops malicious files, ransomware and harmful code before they can affect your business.", icon: LockKeyhole },
  { title: "IP Reputation Protection", text: "Automatically denies connections from known malicious sources and high-risk networks.", icon: Globe2 },
  { title: "Identity Protection", text: "Verifies people and permissions so only authorised users can reach sensitive systems.", icon: Fingerprint },
  { title: "Secure Remote Access", text: "Extends protected, encrypted access to your team—wherever they choose to work.", icon: KeyRound },
  { title: "Cloud Security", text: "Applies consistent controls across cloud apps, workloads and hybrid infrastructure.", icon: CloudCog },
  { title: "Threat Intelligence", text: "Continuously updates protection using current intelligence on emerging cyber threats.", icon: RadioTower },
];

const devices = [
  ["Desktops", BriefcaseBusiness], ["Laptops", Laptop], ["Phones", Smartphone],
  ["Tablets", Tablet], ["Servers", Server], ["Printers", Printer],
  ["WiFi", Wifi], ["Remote workers", Users], ["Cloud services", Cloud],
] as const;

const solutions = [
  {
    name: "Essential",
    kicker: "Focused protection",
    text: "A strong security foundation for small businesses and single-location teams.",
    points: ["Layered network protection", "Secure business connectivity", "Australian support"],
  },
  {
    name: "Business",
    kicker: "Complete coverage",
    text: "Broader protection for growing organisations with remote teams, cloud services and multiple locations.",
    points: ["Advanced threat prevention", "Secure remote access", "Multi-location architecture"],
    featured: true,
  },
  {
    name: "Enterprise",
    kicker: "Complex environments",
    text: "Scalable architecture and tailored controls for larger, high-availability environments.",
    points: ["High-performance security", "Custom policy architecture", "Business continuity design"],
  },
];

const reasons = [
  ["Australian Support", "Talk to people who understand the Australian business environment.", Headphones],
  ["Custom Deployments", "Protection designed around your users, devices, sites and risk profile.", Sparkles],
  ["Enterprise-grade Security", "Multiple coordinated controls—not a collection of disconnected tools.", BadgeCheck],
  ["24/7 Protection", "Security continues to inspect and enforce policy around the clock.", RefreshCw],
  ["Business Continuity", "Resilient designs help keep your people and critical services connected.", Zap],
  ["Scalable Architecture", "Expand protection as your workforce, locations and cloud footprint grow.", Network],
] as const;

const faqs = [
  ["Why can’t I see my firewall working?", "That’s normal. Enterprise protection is designed to work quietly at the network level. CyberShield continuously inspects connections and blocks unwanted activity without interrupting your team with consumer-style popups."],
  ["How do I know I’m protected?", "Protection is validated through deployment checks, security policy, monitoring and ongoing management. We explain what is covered, how it is configured and how your protection adapts as your business changes."],
  ["Do I need software on every computer?", "Not for core network protection. CyberShield protects traffic as it moves through your secured business environment. Some capabilities—such as secure remote access or device-specific controls—may use lightweight software where it adds value."],
  ["Does this protect remote workers?", "Yes. Secure remote access can extend encrypted, policy-controlled connectivity to people working from home, travelling or connecting from another location."],
  ["How many devices can be protected?", "Deployments are sized around your real environment, from a small office to multiple sites with large numbers of users and connected devices. The architecture is designed to scale."],
  ["What happens if a threat is detected?", "Relevant controls inspect and block the activity automatically according to your security policy. The event can then be reviewed and handled as part of the managed security process."],
] as const;

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": "https://www.cybershieldau.com.au/#business",
      name: "CyberShield",
      url: "https://www.cybershieldau.com.au",
      email: "info@cybershieldau.com.au",
      description: "Custom network security and managed cybersecurity services for businesses in Australia.",
      address: [
        { "@type": "PostalAddress", streetAddress: "121 Collins ST", addressLocality: "Melbourne", addressRegion: "VIC", postalCode: "3000", addressCountry: "AU" },
        { "@type": "PostalAddress", streetAddress: "9245 Laguna Springs Dr", addressLocality: "Elk Grove", addressRegion: "CA", postalCode: "95758", addressCountry: "US" },
      ],
      areaServed: "Australia",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

function SectionHeading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text: string; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      <p className="section-copy">{text}</p>
    </Reveal>
  );
}

export default function Home() {
  return (
    <main id="top" className="overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Nav />

      <div id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-grid-bg" aria-hidden="true" />
          <div className="hero-glow hero-glow-one" aria-hidden="true" />
          <div className="hero-glow hero-glow-two" aria-hidden="true" />
          <div className="shell relative grid min-h-[880px] items-center gap-14 pb-24 pt-36 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-32">
            <Reveal>
              <div className="trust-badge"><span /> Australian managed cybersecurity</div>
              <h1 id="hero-title" className="hero-title">Enterprise Cyber Protection. <em>Without the Complexity.</em></h1>
              <p className="hero-copy">CyberShield protects your entire business network—not just individual devices—with layered, continuously managed security built around how your organisation actually operates.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#contact" className="button-primary justify-center">Book Security Assessment <ArrowRight size={18} /></a>
                <a href="mailto:info@cybershieldau.com.au" className="button-secondary justify-center"><PhoneCall size={17} /> Talk to an Expert</a>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                {["Entire network", "Every device", "Always on"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-medium text-slate-300 sm:text-sm"><Check className="shrink-0 text-cyan" size={16} />{item}</div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.12}><ShieldVisual /></Reveal>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025]">
          <div className="shell grid gap-6 py-5 text-center text-xs font-semibold uppercase tracking-[.18em] text-slate-400 sm:grid-cols-3">
            <span>Custom network protection</span><span>Enterprise security architecture</span><span>Australian support</span>
          </div>
        </section>

        <section id="how-it-works" className="section-pad">
          <div className="shell">
            <SectionHeading center eyebrow="How it works" title="One protected path. Every connection." text="CyberShield sits between the outside world and your business environment, inspecting traffic through multiple coordinated security layers before it reaches your people, systems and devices." />
            <Reveal delay={0.1} className="mt-14"><Architecture /></Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                ["01", "We understand", "We map your users, devices, locations, applications and security requirements."],
                ["02", "We protect", "We design and deploy the right layered controls around your real business network."],
                ["03", "We stay with you", "Protection keeps working as threats evolve and your organisation grows."],
              ].map(([num, title, text], i) => (
                <Reveal key={num} delay={i * 0.08} className="glass-card p-6">
                  <span className="step-number">{num}</span><h3 className="mt-8 text-xl font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad relative border-y border-white/10 bg-[#050c18]">
          <div className="silent-glow" aria-hidden="true" />
          <div className="shell relative grid items-center gap-14 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1">
              <div className="silent-visual">
                <div className="silent-screen">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><span className="flex items-center gap-2 text-sm font-semibold text-white"><ShieldCheck className="text-cyan" size={18} />Network status</span><span className="status-live"><i /> Protected</span></div>
                  <div className="grid gap-3 p-5 sm:grid-cols-2">
                    {["Threat prevention", "Network firewall", "Secure access", "Cloud controls"].map((item) => <div key={item} className="silent-row"><Check size={15} />{item}<span>Active</span></div>)}
                  </div>
                  <div className="mx-5 mb-5 rounded-xl border border-cyan/10 bg-cyan/[0.04] p-4 text-sm text-slate-300">No action required. Protection is operating normally.</div>
                </div>
              </div>
            </Reveal>
            <div className="order-1 lg:order-2">
              <SectionHeading eyebrow="Quiet by design" title="Why you don’t see protection working" text="The strongest enterprise cybersecurity rarely asks for attention. It works at the network level, continuously inspecting connections and enforcing policy before threats can reach your team." />
              <Reveal delay={0.1} className="mt-8 space-y-5">
                {[
                  ["No disruptive popups", "Your team stays productive while security works in the background."],
                  ["Continuous enforcement", "Protection doesn’t wait for someone to click a scan button."],
                  ["One managed environment", "Security is coordinated across the network instead of left to every user."],
                ].map(([title, text]) => <div key={title} className="flex gap-4"><span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-electric/15 text-cyan"><Check size={15} /></span><div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div></div>)}
              </Reveal>
            </div>
          </div>
        </section>

        <section id="security-layers" className="section-pad">
          <div className="shell">
            <SectionHeading center eyebrow="Layered defence" title="Eight layers. One stronger security posture." text="No single control can stop every threat. CyberShield brings complementary protections together so each layer strengthens the next." />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {securityLayers.map((layer, i) => {
                const Icon = layer.icon;
                return <Reveal key={layer.title} delay={(i % 4) * 0.06} className="security-card"><span className="feature-icon"><Icon size={22} /></span><h3>{layer.title}</h3><p>{layer.text}</p><span className="card-index">0{i + 1}</span></Reveal>;
              })}
            </div>
          </div>
        </section>

        <section className="section-pad border-y border-white/10 bg-white/[0.018]">
          <div className="shell grid items-center gap-14 lg:grid-cols-[.85fr_1.15fr]">
            <SectionHeading eyebrow="Protected devices" title="If it connects, it belongs inside your security strategy." text="Modern businesses run across more than computers. CyberShield secures the network connecting your office technology, mobile teams, infrastructure and cloud services." />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {devices.map(([label, Icon], i) => <Reveal key={label} delay={(i % 3) * 0.05} className="device-card"><Icon size={25} /><span>{label}</span><i /></Reveal>)}
            </div>
          </div>
        </section>

        <section id="solutions" className="section-pad">
          <div className="shell">
            <SectionHeading center eyebrow="Tailored solutions" title="Built for your business. Not a product shelf." text="There is no fixed box that suits every organisation. Your deployment is customised around business size, users, devices, locations and security requirements." />
            <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
              {solutions.map((solution, i) => <Reveal key={solution.name} delay={i * 0.08} className={`solution-card ${solution.featured ? "solution-card-featured" : ""}`}>
                {solution.featured && <span className="recommended">Most adaptable</span>}
                <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan">{solution.kicker}</p><h3>{solution.name}</h3><p className="mt-4 min-h-20 text-sm leading-7 text-slate-400">{solution.text}</p>
                <ul className="mt-7 space-y-3">{solution.points.map(point => <li key={point}><Check size={16} />{point}</li>)}</ul>
                <a href="#contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">Discuss your environment <ArrowRight size={16} /></a>
              </Reveal>)}
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-slate-500">Solution names describe deployment scope, not off-the-shelf packages. Final architecture follows a security assessment.</p>
          </div>
        </section>

        <section className="section-pad border-y border-white/10 bg-[#050c18]">
          <div className="shell">
            <SectionHeading center eyebrow="Why CyberShield" title="Security that fits the way business works." text="Enterprise-grade controls are only valuable when they are well designed, clearly explained and supported by people you can reach." />
            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
              {reasons.map(([title, text, Icon], i) => <Reveal key={title} delay={(i % 3) * 0.06} className="reason-card"><Icon size={25} /><h3>{title}</h3><p>{text}</p></Reveal>)}
            </div>
          </div>
        </section>

        <section id="faq" className="section-pad">
          <div className="shell grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div><SectionHeading eyebrow="FAQ" title="Straight answers. No security theatre." text="Enterprise cybersecurity can feel invisible and complex. Here’s what business leaders most often want to know." /><Reveal className="mt-8"><a href="#contact" className="button-secondary">Ask another question <ArrowRight size={16} /></a></Reveal></div>
            <Reveal className="divide-y divide-white/10 border-y border-white/10">
              {faqs.map(([question, answer], index) => <details key={question} className="faq-item" open={index === 0}><summary><span>{question}</span><ChevronDown size={19} aria-hidden="true" /></summary><p>{answer}</p></details>)}
            </Reveal>
          </div>
        </section>

        <section id="contact" className="section-pad relative border-t border-white/10 bg-[#050c18]">
          <div className="contact-glow" aria-hidden="true" />
          <div className="shell relative grid overflow-hidden rounded-[2rem] border border-electric/25 bg-[#071223] shadow-glow lg:grid-cols-[.92fr_1.08fr]">
            <div className="contact-copy p-7 sm:p-10 lg:p-14">
              <p className="eyebrow">Your next step</p><h2 className="section-title">Let’s understand what you need to protect.</h2><p className="section-copy">Book a security assessment or talk with our team about your users, devices, locations and current concerns. We’ll help you identify a practical path forward.</p>
              <div className="mt-10 space-y-6">
                <a href="mailto:info@cybershieldau.com.au" className="contact-line"><span><Mail size={20} /></span><div><small>Email</small><strong>info@cybershieldau.com.au</strong></div></a>
                <div className="contact-line"><span><MapPin size={20} /></span><div><small>Australia</small><strong>121 Collins ST, Melbourne, VIC 3000</strong></div></div>
                <div className="contact-line"><span><MapPin size={20} /></span><div><small>United States</small><strong>9245 Laguna Springs Dr, Elk Grove 95758 CA</strong></div></div>
              </div>
            </div>
            <div className="bg-white/[0.035] p-7 sm:p-10 lg:p-14">
              <form className="space-y-5" action="mailto:info@cybershieldau.com.au" method="post" encType="text/plain">
                <div className="grid gap-5 sm:grid-cols-2"><label>First name<input name="first-name" autoComplete="given-name" required placeholder="Jane" /></label><label>Last name<input name="last-name" autoComplete="family-name" required placeholder="Smith" /></label></div>
                <label>Business email<input name="email" type="email" autoComplete="email" required placeholder="jane@business.com.au" /></label>
                <label>Phone number <span className="text-slate-500">(optional)</span><input name="phone" type="tel" autoComplete="tel" placeholder="04xx xxx xxx" /></label>
                <label>How can we help?<textarea name="message" required rows={4} placeholder="Tell us about your business, locations or current security concerns." /></label>
                <button type="submit" className="button-primary w-full justify-center">Book Security Assessment <ArrowRight size={18} /></button>
                <p className="text-center text-xs leading-5 text-slate-500">Your enquiry opens securely in your email client and is sent directly to CyberShield.</p>
              </form>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 bg-ink py-10">
        <div className="shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div><img src="/cybershield-logo.png" alt="CyberShield" className="h-12 w-auto max-w-[190px] object-contain" /><p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">Unique and custom network security solutions for Australian businesses.</p></div>
          <div className="text-sm text-slate-500 md:text-right"><a href="mailto:info@Cybershield.website" className="transition hover:text-white">info@Cybershield.website</a><p className="mt-2">© {new Date().getFullYear()} CyberShield. All rights reserved.</p></div>
        </div>
      </footer>
    </main>
  );
}
