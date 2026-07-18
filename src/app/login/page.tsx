import { AuthForm } from "@/components/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Sign in" };

type Props = {
  searchParams: Promise<{
    verify?: string;
    passwordUpdated?: string;
    guestError?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  let banner: string | undefined;
  if (params.passwordUpdated) {
    banner = "Password updated. Sign in with your username and new password.";
  } else if (params.guestError === "rate") {
    banner = "Too many guest starts from this network. Try again later, or create an account.";
  } else if (params.guestError) {
    banner = "Could not start guest mode. Try again or create an account.";
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
