"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import type { ReportReason, ReportTargetType } from "@/lib/types";

export async function submitReport(
  targetType: ReportTargetType,
  targetId: string,
  reason: ReportReason,
  details: string,
) {
  const supabase = await createClient();
  const { t } = await getDict();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details.trim() || null,
  });

  if (error) {
    if (error.code === "23505") return { success: true, alreadyReported: true };
    return { error: t.report.error };
  }

  return { success: true };
}
