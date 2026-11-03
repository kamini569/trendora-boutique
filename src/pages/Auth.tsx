import { ProductImage } from "@/components/store/ProductImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/admin",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth = "/admin" }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Failed to send the sign-in code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect, { replace: true });
    } catch {
      setError("That code doesn't look right. Check your email and try again.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  }

  async function resendCode() {
    if (typeof step !== "object") return;
    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.set("email", step.email);
      await signIn("email-otp", formData);
      setOtp("");
      setNotice("A fresh six-digit code is on its way.");
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "The code could not be resent. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.04fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        <ProductImage
          src={AUTH_IMAGE}
          alt="The Trendora studio rail"
          eager
          className="absolute inset-0"
          imgClassName="opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/25" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
          <Link
            to="/"
            className="font-display text-2xl font-semibold tracking-[-0.045em] text-[#fbf6f0]"
          >
            Trendora
            <span className="ml-2 align-middle text-[8px] font-medium uppercase tracking-[0.22em] text-[#fbf6f0]/55">
              boutique
            </span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f8e8c8]">
              <Sparkles className="size-3 text-marigold" />
              Owner studio
            </div>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-[#fbf6f0] xl:text-6xl">
              Your boutique,
              <br />
              behind the rail.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#fbf6f0]/65">
              One quiet place to publish pieces, keep inventory honest, and
              decide what the shopfront shows. Sign in with the email tied to
              the studio.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#fbf6f0]/45">
            <LockKeyhole className="size-3.5" />
            Private workspace · email code only
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <Link
            to="/"
            className="font-display text-xl font-semibold tracking-[-0.04em] text-ink lg:hidden"
          >
            Trendora
          </Link>
          <Button
            asChild
            variant="ghost"
            className="h-9 rounded-full px-3 text-[11px] font-medium text-muted-foreground hover:text-primary"
          >
            <Link to="/shop">
              <ArrowLeft className="size-3.5" />
              Back to the boutique
            </Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[24rem]">
            <p className="eyebrow">Owner sign in</p>
            <h2 className="mt-3 font-display text-[2.2rem] font-semibold leading-tight tracking-[-0.04em] text-ink">
              {step === "signIn" ? "Welcome back." : "Check your inbox."}
            </h2>
            <p className="mt-2.5 text-[13px] leading-6 text-muted-foreground">
              {step === "signIn"
                ? "We'll email a six-digit code — no password to remember."
                : `We've sent a six-digit code to ${step.email}. It expires in 15 minutes.`}
            </p>

            {step === "signIn" ? (
              <form onSubmit={handleEmailSubmit} className="mt-7">
                <label htmlFor="auth-email" className="field-label">
                  Email address
                </label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-email"
                    name="email"
                    placeholder="owner@trendora.studio"
                    type="email"
                    autoComplete="email"
                    className="h-12 rounded-xl border-border bg-card pl-10 text-sm"
                    disabled={isLoading}
                    required
                  />
                </div>

                {error && (
                  <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-5 h-12 w-full rounded-full text-[11px] font-semibold uppercase tracking-[0.14em]"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  Send sign-in code
                </Button>

                <div className="mt-6 rounded-xl border border-border/70 bg-card px-4 py-3.5">
                  <p className="text-[11px] leading-5 text-muted-foreground">
                    <span className="font-semibold text-ink">
                      Just here to shop?
                    </span>{" "}
                    No account needed — the full edit is open to everyone.{" "}
                    <Link
                      to="/shop"
                      className="font-medium text-primary underline decoration-primary/30 underline-offset-4"
                    >
                      Browse the rail
                    </Link>
                    .
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="mt-7">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />

                <label className="field-label">Six-digit code</label>
                <div className="mt-3">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        otp.length === 6 &&
                        !isLoading
                      ) {
                        const form = (event.target as HTMLElement).closest("form");
                        form?.requestSubmit();
                      }
                    }}
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="size-11 rounded-xl border border-border bg-card text-base"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
                    {error}
                  </p>
                )}
                {notice && (
                  <p className="mt-3 rounded-lg border border-primary/15 bg-blush/60 px-3 py-2 text-[12px] text-primary">
                    {notice}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="mt-5 h-12 w-full rounded-full text-[11px] font-semibold uppercase tracking-[0.14em]"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  Enter the studio
                </Button>

                <div className="mt-5 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("signIn");
                      setOtp("");
                      setError(null);
                      setNotice(null);
                    }}
                    className="text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                  >
                    Use a different email
                  </button>
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={isLoading}
                    className="font-medium text-primary disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}

            <p className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
              <LockKeyhole className="size-3" />
              Owner access is limited to this email
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/60 lg:text-left">
          © {new Date().getFullYear()} Trendora Boutique
        </p>
      </main>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
