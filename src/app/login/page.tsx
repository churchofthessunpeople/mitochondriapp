import { AuthForm } from "@/components/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Sign in" };

type Props = {
  searchParams: Promise<{ verify?: string; passwordUpdated?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  let banner: string | undefined;
  if (params.passwordUpdated) {
    banner = "Password updated. Sign in with your new password.";
  } else if (params.verify) {
    banner =
      "Check your email to verify your new address, then sign in here.";
  }

  return (
    <div className="welcome-screen min-h-dvh">
      <div className="flex justify-end px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <ThemeToggle size="sm" />
      </div>
      <main className="mx-auto flex w-full max-w-md flex-col justify-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4">
        <AuthForm mode="login" banner={banner} />
      </main>
    </div>
  );
}
