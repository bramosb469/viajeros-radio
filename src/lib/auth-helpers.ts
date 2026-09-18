import { redirect } from "next/navigation";

async function fetchSession() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    if (!cookieHeader) return null;

    const proto = process.env.BETTER_AUTH_URL?.startsWith("https") ? "https" : "http";
    const host = process.env.BETTER_AUTH_URL?.replace(/^https?:\/\//, "") || "localhost";
    const baseUrl = `${proto}://${host}`;

    const res = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.session) return null;
    return data;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await fetchSession();
  if (!session?.user) {
    redirect("/admin/login");
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}

export async function getSession() {
  return await fetchSession();
}
