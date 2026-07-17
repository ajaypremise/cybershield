export const AGREEMENT_VERSION = "1.0.0";

export const CONSENT_TEXT =
  "I confirm that I am the person named above, that I have reviewed and accept this CyberShield Agreement, that I intend this electronic signature to be legally binding, and that I consent to receiving and signing this agreement electronically.";

type AgreementSection = { heading: string; paragraphs: string[] };

// Contract language is deliberately isolated here so Australian counsel can review it without touching application logic.
export const AGREEMENT_SECTIONS: AgreementSection[] = [
  {
    heading: "1. Parties and agreement details",
    paragraphs: [
      "This CyberShield Service Agreement is between CyberShield Australia (CyberShield, we, us) and the customer identified in the agreement details (Customer, you). The customer ID, selected protection tenure, amount paid and agreement version form part of this Agreement.",
      "This Agreement records the baseline terms for the tailored cybersecurity and support services selected with the Customer. Any written service schedule or confirmed configuration supplied by CyberShield also forms part of the agreed service scope.",
    ],
  },
  {
    heading: "2. Tailored service scope",
    paragraphs: [
      "CyberShield will provide the cybersecurity, network-security, support and related services confirmed for the Customer's environment. The solution may operate across network, firewall, infrastructure, software and identity layers, according to the agreed configuration.",
      "Coverage may apply to agreed premises, users, computers, servers, network storage, printers, mobile devices, compatible connected equipment, remote access and cloud services. Not every feature applies to every Customer. The confirmed solution and configuration determine actual coverage.",
      "Some protection operates at the network or security-infrastructure level. A protected device may therefore show no local CyberShield application, popup or visible dashboard even while relevant controls are active.",
    ],
  },
  {
    heading: "3. Customer responsibilities",
    paragraphs: [
      "The Customer must provide accurate and current information about its premises, users, devices, network, third-party services and security needs. The Customer must promptly tell CyberShield about material changes that could affect the service.",
      "The Customer is responsible for maintaining suitable internet connectivity, electrical power, supported equipment, valid third-party licences, backups and reasonable physical and account security. The Customer must follow reasonable security and support instructions.",
      "The Customer must not bypass, disable, tamper with or permit unauthorised access to security controls. CyberShield is not responsible for loss caused by unauthorised changes, unsupported equipment or the Customer's failure to follow reasonable instructions.",
    ],
  },
  {
    heading: "4. Remote support consent",
    paragraphs: [
      "Where remote support is included or requested, the Customer authorises CyberShield to access agreed systems remotely for setup, diagnosis, maintenance and support. CyberShield will use access only for authorised service purposes and the Customer may be asked to approve individual sessions where practical.",
    ],
  },
  {
    heading: "5. Service limitations and dependencies",
    paragraphs: [
      "Cybersecurity reduces risk but cannot guarantee prevention, detection or remediation of every cyber incident. Threats, vulnerabilities, user actions, third-party failures and circumstances outside reasonable control may affect outcomes.",
      "The services may depend on third-party hardware, software, telecommunications, cloud platforms, threat-intelligence services and vendors. Changes, outages, end-of-life decisions or failures affecting those services may affect CyberShield's service.",
      "Unless expressly included in a confirmed service schedule, the service does not promise continuous human monitoring, 24-hour telephone support, DDoS mitigation, encryption of all Customer data, geographic blocking or reporting for every Customer.",
    ],
  },
  {
    // LEGAL REVIEW REQUIRED: Australian privacy counsel should confirm the data-handling clause and published privacy practices.
    heading: "6. Data handling and privacy",
    paragraphs: [
      "CyberShield may process contact, account, device, network, support and security-event information reasonably required to provide, secure and administer the services. CyberShield will handle personal information in accordance with applicable Australian privacy obligations and its published privacy practices.",
      "The Customer must ensure it has authority to provide information and permit processing relating to its users, systems and devices. CyberShield will not intentionally access Customer content beyond what is reasonably necessary for authorised support and service delivery.",
    ],
  },
  {
    heading: "7. Support and contact",
    paragraphs: [
      "Standard support hours are 10:00 AM to 9:00 PM AEST. Support: 1800 997 002 or (03) 7046 5922. Billing: (04) 6825 8207. Email: info@cybershieldau.com.au. CyberShield may update contact channels by written notice.",
    ],
  },
  {
    // LEGAL REVIEW REQUIRED: Counsel should settle renewal, cancellation, refund and consumer-guarantee wording for the final sales model.
    heading: "8. Fees, tenure, renewals and cancellation",
    paragraphs: [
      "The Customer must pay the fees confirmed for the selected service and tenure. Any recurring or renewal charge must be separately disclosed or confirmed before it is applied. Taxes, third-party charges and out-of-scope work may be charged only where disclosed or agreed.",
      "Cancellation, refund and early-termination rights are subject to the confirmed service schedule, applicable consumer guarantees and any rights that cannot lawfully be excluded. Ending the service may require removal or return of CyberShield-managed equipment, credentials or configuration.",
    ],
  },
  {
    heading: "9. Acceptable use",
    paragraphs: [
      "The Customer must not use the service unlawfully, to harm others, to interfere with networks or to facilitate unauthorised access. CyberShield may take proportionate action to protect systems, comply with law or prevent material harm, including temporarily restricting affected access where reasonably necessary.",
    ],
  },
  {
    heading: "10. Liability and statutory rights",
    paragraphs: [
      // LEGAL REVIEW REQUIRED: Australian counsel must settle the liability cap, exclusions and ACL treatment before production use.
      "To the maximum extent permitted by law, each party's liability will be subject to the limitations, exclusions and any agreed liability cap stated in the applicable service schedule. Nothing in this Agreement excludes, restricts or modifies a consumer guarantee, right or remedy that cannot lawfully be excluded under the Australian Consumer Law or other applicable law.",
    ],
  },
  {
    heading: "11. Governing law",
    paragraphs: [
      // LEGAL REVIEW REQUIRED: Counsel should confirm jurisdiction language for the Customer's sales model.
      "This Agreement is governed by the laws of Victoria, Australia. The parties submit to the courts of Victoria and courts entitled to hear appeals from them, subject to any mandatory law that applies otherwise.",
    ],
  },
  {
    // LEGAL REVIEW REQUIRED: Counsel should confirm Electronic Transactions Act requirements and any excluded transaction types.
    heading: "12. Electronic communications and signature",
    paragraphs: [
      "The Customer consents to receive this Agreement and related service communications electronically and to sign electronically. An electronic signature made through CyberShield's signing process is intended to identify the signer, record acceptance and have the same effect as a handwritten signature to the extent permitted by law.",
    ],
  },
  {
    heading: "13. Entire agreement and acceptance",
    paragraphs: [
      "This Agreement, the confirmed service schedule and any documents expressly incorporated by reference form the entire agreement about the selected services and replace earlier discussions about the same subject. A change must be agreed in writing, except for operational changes that do not materially reduce the confirmed service.",
      "By signing, the signer confirms that they are the named Customer or are authorised to accept this Agreement for the Customer, have reviewed the complete Agreement and agree to be bound by it.",
    ],
  },
];

export type AgreementDetails = {
  agreementNumber: string;
  customerId: string;
  customerName: string;
  email: string;
  tenure: string;
  amount: string;
  agentName: string;
};

export function createAgreementSnapshot(details: AgreementDetails): string {
  const header = [
    "CYBERSHIELD SERVICE AGREEMENT",
    `Agreement number: ${details.agreementNumber}`,
    `Version: ${AGREEMENT_VERSION}`,
    `Customer ID: ${details.customerId}`,
    `Customer: ${details.customerName}`,
    `Email: ${details.email}`,
    `Protection tenure: ${details.tenure}`,
    `Amount paid: ${details.amount}`,
    `Assisted by: ${details.agentName}`,
  ].join("\n");
  const clauses = AGREEMENT_SECTIONS.map((section) => `${section.heading}\n${section.paragraphs.join("\n\n")}`).join("\n\n");
  return `${header}\n\n${clauses}`;
}



