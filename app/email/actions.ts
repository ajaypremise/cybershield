"use server";

import { redirect } from "next/navigation";
import { validateAdminCsrf } from "@/lib/auth";
import { sendStaffTemplateEmail } from "@/lib/email";
import { STAFF_EMAIL_TEMPLATES, type StaffEmailTemplateId } from "@/lib/staff-email-templates";

export async function sendStaffEmailAction(formData: FormData) {
  const csrfToken = String(formData.get("csrfToken") || "");
  const template = String(formData.get("template") || "") as StaffEmailTemplateId;
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const company = String(formData.get("company") || "").trim();

  await validateAdminCsrf(csrfToken);

  if (!STAFF_EMAIL_TEMPLATES[template]) {
    redirect("/email?error=Invalid%20template");
  }

  if (!name || !email || !email.includes("@")) {
    redirect("/email?error=Please%20enter%20a%20valid%20name%20and%20email");
  }

  try {
    await sendStaffTemplateEmail(
      email,
      template,
      name,
      company || undefined
    );

    redirect("/email?success=Email%20sent");
  } catch {
    redirect("/email?error=Email%20could%20not%20be%20sent");
  }
}
