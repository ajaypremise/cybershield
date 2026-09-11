import { requireAdmin } from "@/lib/auth";
import { InternalShell } from "@/components/internal/InternalShell";
import { adminLogoutAction } from "@/app/admin/login/actions";

export default async function EmailPage() {
  await requireAdmin();

  return (
    <InternalShell role="Administrator" logoutAction={adminLogoutAction}>
      <p className="internal-eyebrow">Email tools</p>
      <h1>Send Email</h1>
      <p className="internal-lead">
        Choose an approved template and send an email to a recipient.
      </p>

      <section
        className="internal-card"
        style={{ padding: "1.5rem", marginTop: "1.25rem" }}
      >
        <form className="internal-form-grid">
          <label>
            Template
            <select name="template" defaultValue="initial">
              <option value="initial">Initial Outreach</option>
              <option value="followup">Follow-up</option>
              <option value="final">Final Follow-up</option>
            </select>
          </label>

          <label>
            Recipient name
            <input name="name" placeholder="John Smith" />
          </label>

          <label>
            Recipient email
            <input
              name="email"
              type="email"
              placeholder="john@example.com"
              required
            />
          </label>

          <label>
            Company
            <input name="company" placeholder="ABC Pty Ltd" />
          </label>

          <button className="internal-primary" type="submit" disabled>
            Send Email
          </button>
        </form>

        <p style={{ marginTop: "1rem", opacity: 0.7 }}>
          Sending will be enabled in the next step.
        </p>
      </section>
    </InternalShell>
  );
}
