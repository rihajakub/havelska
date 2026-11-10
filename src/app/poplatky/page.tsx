import Link from "next/link";
import { markTaxSettlement, saveTaxExemption } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getAppData, getCheckInRegistrations } from "@/data/repository";
import { buildMonthlyTaxReports } from "@/domain/tax-report";

export const dynamic = "force-dynamic";
const date = new Intl.DateTimeFormat("cs-CZ", {
  day: "numeric",
  month: "numeric",
});
const monthName = new Intl.DateTimeFormat("cs-CZ", {
  month: "long",
  year: "numeric",
});
const fromIso = (value: string) => new Date(`${value}T12:00:00`);

export default async function LocalTaxPage() {
  const data = await getAppData();
  let registrations: Awaited<ReturnType<typeof getCheckInRegistrations>> = [];
  let registrationError = "";
  try {
    registrations = await getCheckInRegistrations();
  } catch (error) {
    registrationError =
      error instanceof Error
        ? error.message
        : "Data hostů se nepodařilo načíst.";
  }
  const settlements = new Map(
    (data.taxSettlements ?? []).map((item) => [item.month, item]),
  );
  const reports = buildMonthlyTaxReports(
    data.stays.filter((stay) => stay.status !== "cancelled"),
    registrations.map((item) => ({
      stayId: item.stay.id,
      guests: item.guests,
    })),
  );
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (!reports.has(currentMonth))
    reports.set(currentMonth, { rows: [], total: 0, complete: true });
  const months = [...reports.entries()].sort(([a], [b]) => {
    const aPaid = Boolean(settlements.get(a)?.paidAt);
    const bPaid = Boolean(settlements.get(b)?.paidAt);
    if (aPaid !== bPaid) return aPaid ? 1 : -1;
    if (a === currentMonth) return -1;
    if (b === currentMonth) return 1;
    if (!aPaid && a > currentMonth && b > currentMonth)
      return a.localeCompare(b);
    return b.localeCompare(a);
  });

  return (
    <>
      <section className="page-heading split">
        <div>
          <span className="eyebrow">Městská administrativa</span>
          <h1>Poplatek z pobytu</h1>
          <p>
            Praha 1: 50 Kč za zpoplatněnou osobu a noc. Nezletilé aplikace
            odečte podle data narození; u neúplných check-inů ukazuje bezpečný
            odhad.
          </p>
        </div>
      </section>
      {registrationError && <p className="tax-warning">{registrationError}</p>}
      <div className="tax-list">
        {months.map(([month, report]) => {
          const settlement = settlements.get(month);
          const due = new Date(`${month}-01T12:00:00`);
          due.setMonth(due.getMonth() + 1);
          due.setDate(15);
          const paid = Boolean(settlement?.paidAt);
          return (
            <section
              className={`tax-card${paid ? " tax-card-paid" : ""}${month === currentMonth ? " tax-card-current" : ""}`}
              key={month}
            >
              <div className="tax-card-heading">
                <div>
                  <div className="tax-month-label">
                    <span className="eyebrow">
                      {monthName.format(fromIso(`${month}-01`))}
                    </span>
                    {month === currentMonth && (
                      <span className="status-pill current">
                        Aktuální měsíc
                      </span>
                    )}
                    {paid && (
                      <span className="status-pill success">✓ Zaplaceno</span>
                    )}
                  </div>
                  <h2>{report.total.toLocaleString("cs-CZ")} Kč</h2>
                  <p>
                    {report.rows.length}{" "}
                    {report.rows.length === 1 ? "pobyt" : "pobytů"} · termín
                    úhrady do 15. dne následujícího měsíce (
                    {new Intl.DateTimeFormat("cs-CZ", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    }).format(due)}
                    ).
                  </p>
                  {!report.complete && (
                    <p className="tax-warning">
                      Odhad: u některých pobytů chybí údaje všech hostů.
                    </p>
                  )}
                </div>
                <div className="tax-status">
                  <span className={report.complete ? "done" : ""}>
                    {report.complete ? "Data kompletní ✓" : "Data neúplná"}
                  </span>
                  <span className={settlement?.reportedAt ? "done" : ""}>
                    Hlášení {settlement?.reportedAt ? "✓" : "—"}
                  </span>
                  <span className={paid ? "done" : ""}>
                    Platba {paid ? "✓" : "—"}
                  </span>
                </div>
              </div>
              {report.rows.length > 0 ? (
                <div className="tax-stays">
                  {report.rows.map((row) => (
                    <form
                      action={saveTaxExemption}
                      key={`${row.stay.id}-${month}`}
                    >
                      <input type="hidden" name="stayId" value={row.stay.id} />
                      <span>
                        {date.format(fromIso(row.stay.checkIn))} –{" "}
                        {date.format(fromIso(row.stay.checkOut))} · {row.nights}{" "}
                        nocí · {row.chargeableGuests} zpoplatněno ·{" "}
                        {row.amount.toLocaleString("cs-CZ")} Kč
                        <small>
                          {row.complete
                            ? `${row.recordedGuests}/${row.expectedGuests} hostů v domovní knize${row.automaticMinors ? ` · ${row.automaticMinors} nezletilých` : ""}`
                            : `jen ${row.recordedGuests}/${row.expectedGuests} hostů v domovní knize`}
                        </small>
                      </span>
                      <label>
                        Další osvobození
                        <input
                          name="exemptGuests"
                          type="number"
                          min="0"
                          max={row.stay.guests}
                          defaultValue={row.stay.taxExemptGuests ?? 0}
                        />
                      </label>
                      <FormSubmitButton
                        className="button secondary"
                        pendingText="Ukládám…"
                      >
                        Uložit
                      </FormSubmitButton>
                    </form>
                  ))}
                </div>
              ) : (
                <p className="tax-empty-month">
                  V tomto měsíci zatím není žádný zpoplatněný pobyt.
                </p>
              )}
              <div className="inline-actions">
                {report.rows.length > 0 && (
                  <Link
                    className="button secondary"
                    href={`/poplatky/export?month=${month}`}
                  >
                    Stáhnout Excel podklad
                  </Link>
                )}
                {!settlement?.reportedAt && (
                  <form action={markTaxSettlement}>
                    <input type="hidden" name="month" value={month} />
                    <input type="hidden" name="action" value="reported" />
                    <FormSubmitButton
                      className="button secondary"
                      pendingText="Ukládám…"
                    >
                      Označit ohlášení
                    </FormSubmitButton>
                  </form>
                )}
                {!paid && (
                  <form action={markTaxSettlement}>
                    <input type="hidden" name="month" value={month} />
                    <input type="hidden" name="action" value="paid" />
                    <FormSubmitButton pendingText="Ukládám…">
                      Označit platbu
                    </FormSubmitButton>
                  </form>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
