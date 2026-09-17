import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";

/**
 * Use in server components/pages to require a logged-in user.
 * Redirects to /login when there is no session.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
