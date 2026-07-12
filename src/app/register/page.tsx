import { AuthForm } from "@/components/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="welcome-screen min-h-dvh">
      <div className="flex justify-end px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <ThemeToggle size="sm" />
      </div>
      <main className="mx-auto flex w-full max-w-md flex-col justify-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4">
        <AuthForm mode="register" />
      </main>
    </div>
  );
}
