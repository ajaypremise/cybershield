import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Firewall 6.0 Customer Review | CyberShield Australia",
  description:
    "Existing CyberShield customers can request a quick review of their current setup and Firewall 6.0 suitability.",
  robots: {
    index: false,
    follow: false,
  },
};

async function requestCallback(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const callbackTime = String(formData.get("callbackTime") || "").trim();
  const website = String(formData.get("website") || "").trim();

  // Spam honeypot
  if (website) {
    redirect("/firewall-6?sent=1");
  }

  if (!name || !phone || !callbackTime) {
    redirect("/firewall-6?error=1");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ||
      "CyberShield Australia <info@cybershieldau.com.au>",
    to:
      process.env.CONTACT_RECIPIENT_EMAIL ||
      process.env.CYBERSHIELD_INTERNAL_EMAIL ||
      "info@cybershieldau.com.au",
    subject: `Firewall 6.0 callback request — ${name}`,
    text: `
New Firewall 6.0 customer callback request

Name: ${name}
Phone: ${phone}
Email: ${email || "Not provided"}
Preferred callback time: ${callbackTime}

Source: Firewall 6.0 customer email campaign
    `.trim(),
  });

  redirect("/firewall-6?sent=1");
}

type PageProps = {
  searchParams: Promise<{
    sent?: string;
    error?: string;
  }>;
};

export default async function FirewallSixPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const error = params.error === "1";

  return (
    <main className={styles.page}>
      <div className={styles.glow} />

      <header className={styles.header}>
        <a href="/" className={styles.logo}>
          <span className={styles.shield}>◆</span>
          CYBERSHIELD
        </a>

        <span className={styles.customerLabel}>Customer Update</span>
      </header>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <div className={styles.badge}>FIREWALL 6.0</div>

          <h1>
            Is your current setup ready for{" "}
            <span>Firewall 6.0?</span>
          </h1>

          <p className={styles.lead}>
            Firewall 6.0 is now available for eligible CyberShield customers.
            Request a quick review and our team will check your current setup
            and explain whether an update is relevant for you.
          </p>

          <div className={styles.points}>
            <div>
              <span>✓</span>
              Review your existing security setup
            </div>

            <div>
              <span>✓</span>
              Check Firewall 6.0 suitability
            </div>

            <div>
              <span>✓</span>
              Speak directly with a CyberShield representative
            </div>
          </div>

          <div className={styles.note}>
            No changes will be made without discussing them with you first.
          </div>
        </div>

        <div className={styles.card}>
          {sent ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>✓</div>
              <h2>Callback requested</h2>
              <p>
                Thank you. A CyberShield representative will contact you to
                review your current setup and Firewall 6.0 suitability.
              </p>
              <a href="/" className={styles.secondaryButton}>
                Return to CyberShield
              </a>
            </div>
          ) : (
            <>
              <div className={styles.cardTop}>
                <span>EXISTING CUSTOMERS</span>
                <h2>Request your review</h2>
                <p>
                  It takes less than 30 seconds.
                </p>
              </div>

              {error && (
                <div className={styles.error}>
                  Please complete your name, phone number and preferred callback
                  time.
                </div>
              )}

              <form action={requestCallback} className={styles.form}>
                <label>
                  Your name
                  <input
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Full name"
                    required
                  />
                </label>

                <label>
                  Best phone number
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Your contact number"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Optional"
                  />
                </label>

                <label>
                  When should we call?
                  <select name="callbackTime" required defaultValue="">
                    <option value="" disabled>
                      Choose a time
                    </option>
                    <option value="As soon as possible">
                      As soon as possible
                    </option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </label>

                {/* Honeypot */}
                <input
                  className={styles.honeypot}
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <button type="submit" className={styles.button}>
                  Request My Firewall 6.0 Review
                  <span>→</span>
                </button>
              </form>

              <p className={styles.privacy}>
                Your details are used only to respond to this callback request.
              </p>
            </>
          )}
        </div>
      </section>

      <section className={styles.bottom}>
        <div>
          <strong>Not sure whether you need an update?</strong>
          <p>
            That is exactly what the review is for. We will first discuss your
            existing setup and whether Firewall 6.0 is relevant.
          </p>
        </div>

        <div className={styles.official}>
          <span>Official CyberShield channel</span>
          <strong>info@cybershieldau.com.au</strong>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} CyberShield Australia</span>
        <span>121 Collins St, Melbourne VIC 3000</span>
      </footer>
    </main>
  );
}
