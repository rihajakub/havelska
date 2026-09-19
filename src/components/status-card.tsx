import Link from "next/link";
import { ArrowIcon } from "./icons";

export function StatusCard({ tone, eyebrow, title, text, href, action }: {
  tone: "good" | "warn" | "neutral";
  eyebrow: string;
  title: string;
  text: string;
  href?: string;
  action?: string;
}) {
  const content = <>
    <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>
    {href && <ArrowIcon className="arrow"/>}
  </>;
  return href ? <Link className={`status-card ${tone}`} href={href} aria-label={action ?? title}>{content}</Link> : <section className={`status-card ${tone}`}>{content}</section>;
}

