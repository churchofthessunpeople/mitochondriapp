import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/lib/actions/auth";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="welcome-screen min-h-dvh bg-white">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <AuthForm mode="login" action={loginAction} />
      </main>
    </div>
  );
}
