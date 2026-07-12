import { AuthForm } from "@/components/auth-form";
import { registerAction } from "@/lib/actions/auth";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="welcome-screen min-h-dvh bg-white">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <AuthForm mode="register" action={registerAction} />
      </main>
    </div>
  );
}
