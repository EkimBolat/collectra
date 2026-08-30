"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

export async function signUp(formData: FormData) {
  const { t } = await getDict();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return { error: t.auth.usernameInvalid };
  }
  if (password.length < 6) {
    return { error: t.auth.passwordTooShort };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, display_name: username } },
  });

  if (error) {
    if (error.message.includes("duplicate") || error.code === "23505") {
      return { error: t.auth.usernameTaken };
    }
    return { error: error.message };
  }

  redirect("/");
}

export async function signIn(formData: FormData) {
  const { t } = await getDict();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: t.auth.invalidCredentials };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
