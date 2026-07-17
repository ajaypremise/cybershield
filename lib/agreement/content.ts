export const AGREEMENT_VERSION = "1.1.0";
export const CONSENT_TEXT = "I confirm that I am the person named above, that I have reviewed and accept this CyberShield Agreement, that I intend this electronic signature to be legally binding, and that I consent to receiving and signing this agreement electronically.";

const CLAUSES = `1. Parties and service
This agreement is between CyberShield Australia and the named customer. CyberShield will provide the cybersecurity and support services confirmed separately with the customer.

2. Customer responsibilities
The customer must provide accurate information, maintain suitable connectivity, supported equipment, backups and reasonable account security, and follow reasonable security instructions.

3. Service limitations
Cybersecurity reduces risk but cannot guarantee prevention, detection or remediation of every incident. Third-party systems, outages, vulnerabilities and user actions can affect outcomes.

4. Remote support
Where requested or included, the customer authorises remote access to agreed systems for setup, diagnosis, maintenance and support.

5. Data handling and privacy
CyberShield may process contact, account, device, network, support and security-event information reasonably required to provide and secure the services, subject to applicable Australian privacy obligations.

6. Fees, cancellation and statutory rights
Fees and any renewal arrangements are those separately confirmed with the customer. Nothing in this agreement excludes rights or remedies that cannot lawfully be excluded under the Australian Consumer Law.

7. Liability
To the maximum extent permitted by law, liability is subject to any limitations stated in the applicable service schedule. Mandatory consumer guarantees remain unaffected.

8. Governing law
This agreement is governed by the laws of Victoria, Australia, subject to any mandatory law that applies otherwise.

9. Electronic signature
The customer consents to receive and sign this agreement electronically. The signing workflow is intended to identify the signer and record legally binding acceptance to the extent permitted by law.

10. Acceptance
By signing, the signer confirms they are the customer or are authorised to accept this agreement and have reviewed the complete agreement.`;

export type AgreementDetails = { agreementNumber: string; customerId: string; customerName: string; email: string; address: string; coverageDate: string };
export function createAgreementSnapshot(details: AgreementDetails) {
  return [`CYBERSHIELD SERVICE AGREEMENT`, `Agreement number: ${details.agreementNumber}`, `Version: ${AGREEMENT_VERSION}`, `Customer ID: ${details.customerId}`, `Customer: ${details.customerName}`, `Email: ${details.email}`, `Service address: ${details.address}`, `Coverage date: ${details.coverageDate}`, "", CLAUSES].join("\n");
}

