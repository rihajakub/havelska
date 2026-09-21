import Link from "next/link";
import { login } from "@/app/actions";

export const dynamic = "force-dynamic";
type LoginPageProps = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next = "/dashboard" } = await searchParams;
  return <main className="login-page"><section className="login-card">
    <Link className="login-brand" href="/"><span className="brand-mark">H</span><span>Havelská<br /><small>host area</small></span></Link>
    <span className="landing-kicker">Private access</span><h1>Welcome back</h1><p>Enter the host password to open the apartment dashboard.</p>
    <form action={login} className="login-form"><input type="hidden" name="next" value={next} /><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" autoFocus required />{error && <p className="login-error" role="alert">The password is incorrect. Please try again.</p>}<button className="button" type="submit">Open dashboard</button></form>
    <Link className="login-back" href="/">Back to apartment page</Link>
  </section></main>;
}
