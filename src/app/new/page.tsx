import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import NewCollectionForm from "./NewCollectionForm";

export default async function NewCollectionPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [categories, { t, locale }] = await Promise.all([getCategories(), getDict()]);

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t.newCollection.pageTitle}</h1>
      <NewCollectionForm categories={categories} locale={locale} userId={profile.id} />
    </div>
  );
}
