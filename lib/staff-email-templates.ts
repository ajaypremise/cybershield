export const STAFF_EMAIL_TEMPLATES = {
  initial: {
    name: "Initial Outreach",
    subject: "A quick introduction from CyberShield",
    body: (name: string, company?: string) => `
Hi ${name},

I’m reaching out from CyberShield${company ? ` regarding ${company}` : ""}.

We help individuals and businesses with cybersecurity support and protection.

I wanted to introduce CyberShield and see whether we may be able to help with your cybersecurity requirements.

If you'd like to discuss this, simply reply to this email and our team will be happy to assist.

Kind regards,
CyberShield Team
`,
  },

  followup: {
    name: "Follow-up",
    subject: "Following up from CyberShield",
    body: (name: string) => `
Hi ${name},

I just wanted to follow up on my previous email from CyberShield.

If cybersecurity support or protection is something you're currently considering, we'd be happy to discuss your requirements and see whether we can help.

Simply reply to this email if you'd like to speak with our team.

Kind regards,
CyberShield Team
`,
  },

  final: {
    name: "Final Follow-up",
    subject: "Final follow-up from CyberShield",
    body: (name: string) => `
Hi ${name},

Just a final follow-up from CyberShield.

I didn't want to keep filling your inbox, so I'll leave it here for now.

If you need cybersecurity support in the future, you're welcome to reply to this email and we'll be happy to help.

Kind regards,
CyberShield Team
`,
  },
} as const;

export type StaffEmailTemplateId = keyof typeof STAFF_EMAIL_TEMPLATES;
