import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import NewCollectionForm from "./NewCollectionForm";

export default async function NewCollectionPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Yeni koleksiyon</h1>
      <NewCollectionForm categories={categories} />
    </div>
  );
}
