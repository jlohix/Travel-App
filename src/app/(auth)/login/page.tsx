import { AuthForm } from "@/components/AuthForm";
import { loginAction } from "../actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await getSession()) redirect("/map");
  return <AuthForm mode="login" action={loginAction} />;
}
