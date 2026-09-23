import Link from "next/link";
import { login } from "@/app/actions";

export const dynamic = "force-dynamic";
type LoginPageProps = { searchParams: Promise<{ error?: string; google?: string; next?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, google, next = "/dashboard" } = await searchParams;
  return <main className="login-page"><section className="login-card">
    <Link className="login-brand" href="/"><span className="brand-mark">H</span><span>Havelská<br /><small>host area</small></span></Link>
    <span className="landing-kicker">Private access</span><h1>Welcome back</h1><p>Sign in with the authorised Google account to open the apartment dashboard.</p>
    <a className="button google-login" href={`/api/auth/google?next=${encodeURIComponent(next)}`}><span aria-hidden="true">G</span>Continue with Google</a>
    {google === "not-allowed" && <p className="login-error" role="alert">This Google account is not authorised for the dashboard.</p>}{google === "not-configured" && <p className="login-error" role="alert">Google sign-in has not been configured yet.</p>}{google === "failed" && <p className="login-error" role="alert">Google sign-in could not be completed. Please try again.</p>}
    <details className="password-login"><summary>Use password instead</summary><form action={login} className="login-form"><input type="hidden" name="next" value={next} /><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required />{error && <p className="login-error" role="alert">The password is incorrect. Please try again.</p>}<button className="button secondary" type="submit">Open dashboard</button></form></details>
    <Link className="login-back" href="/">Back to apartment page</Link>
  </section></main>;
}
