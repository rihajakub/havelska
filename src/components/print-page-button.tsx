"use client";

export function PrintPageButton() {
  return <button className="button secondary" onClick={() => window.print()} type="button">Tisk / PDF</button>;
}
