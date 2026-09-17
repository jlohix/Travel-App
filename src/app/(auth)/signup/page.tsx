import { AuthForm } from "@/components/AuthForm";
import { signupAction } from "../actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  if (await getSession()) redirect("/map");
  return <AuthForm mode="signup" action={signupAction} />;
}
