import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { t } = await getDict();

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t.settings.pageTitle}</h1>
      <SettingsForm profile={profile} />
    </div>
  );
}
