import { notFound, redirect } from "next/navigation";
import { getCollectionById, getCategories } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import EditCollectionForm from "./EditCollectionForm";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) notFound();

  const profile = await getCurrentProfile();
  if (!profile || profile.id !== collection.owner_id) redirect(`/c/${id}`);

  const [categories, { t, locale }] = await Promise.all([getCategories(), getDict()]);

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t.editCollection.pageTitle}</h1>
      <EditCollectionForm collection={collection} categories={categories} locale={locale} />
    </div>
  );
}
