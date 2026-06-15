import { redirect } from "next/navigation";
import { requireOrgContext } from "@/server/auth/context";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    redirect("/sign-in");
  }

  const org = {
    id: auth.ctx.organization.id,
    name: auth.ctx.organization.name,
    primary_language: auth.ctx.organization.primary_language,
    alert_email:
      auth.ctx.organization.default_alert_email ??
      auth.ctx.organization.alert_email ??
      null,
  };

  return <SettingsForm organization={org} />;
}
