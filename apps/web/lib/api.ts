const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Admin = { id: number; email: string; role: "admin" };

export async function login(email: string, password: string): Promise<Admin> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message ?? "Invalid email or password");
  return data.admin as Admin;
}

export async function getSession(): Promise<Admin | null> {
  const response = await fetch(`${API_URL}/api/auth/session`, {
    credentials: "include",
    cache: "no-store",
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Unable to check session");
  return (await response.json()).admin as Admin;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getDashboard(range: "7d" | "30d" | "all" = "all") {
  const response = await fetch(`${API_URL}/api/dashboard?range=${range}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to load dashboard");
  return response.json() as Promise<{
    kpis: Record<string, number>;
    conversations_by_airline: { label: string; value: number }[];
    intent_distribution: { label: string; value: number }[];
    feedback_distribution: { label: string; value: number }[];
  }>;
}
