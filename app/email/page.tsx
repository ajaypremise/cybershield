import { requireAdmin } from "@/lib/auth";
import { InternalShell } from "@/components/internal/InternalShell";
import { adminLogoutAction } from "@/app/admin/login/actions";
import { sendStaffEmailAction } from "./actions";

export default async function EmailPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await requireAdmin();
  const { success, error } = await searchParams;

  return (
    <InternalShell role="Administrator" logoutAction={adminLogoutAction}>
      <p className="internal-eyebrow">Email tools</p>
      <h1>Send Email</h1>
      <p className="internal-lead">
        Choose an approved template and send an email to a recipient.
      </p>

      {success && <div className="sign-alert">{success}</div>}
      {error && <div className="sign-alert">{error}</div>}

      <section
        className="internal-card"
        style={{ padding: "1.5rem", marginTop: "1.25rem" }}
      >
        <form action={sendStaffEmailAction} className="internal-form">
          <input type="hidden" name="csrfToken" value={session.csrfToken} />

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
            <input name="name" placeholder="John Smith" required />
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

          <button className="internal-primary" type="submit">
            Send Email
          </button>
        </form>
      </section>
    </InternalShell>
  );
}
