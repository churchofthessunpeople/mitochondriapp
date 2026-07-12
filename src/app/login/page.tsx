import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { loginAction } from "@/lib/actions/auth";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl items-start justify-center px-4 py-12 sm:px-6">
        <AuthForm mode="login" action={loginAction} />
      </main>
    </div>
  );
}
