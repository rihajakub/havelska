import { getCheckInRegistrations } from "@/data/repository";

export const dynamic = "force-dynamic";
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const escape = (value: string | number | undefined) => `"${String(value ?? "").replaceAll('"', '""')}"`;

function overlapsMonth(checkIn: string, checkOut: string, month: string) {
  const start = `${month}-01`;
  const next = new Date(`${start}T12:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  return checkIn < next.toISOString().slice(0, 10) && checkOut > start;
}

export async function GET(request: Request) {
  const selected = new URL(request.url).searchParams.get("month") ?? "";
  const month = monthPattern.test(selected) ? selected : "";
  const registrations = await getCheckInRegistrations();
  const rows: Array<Array<string | number | undefined>> = [["Příjezd", "Odjezd", "Jméno", "Příjmení", "Datum narození", "Státní občanství", "Typ dokladu", "Číslo dokladu", "Vízum / pobytové oprávnění", "Bydliště", "Účel pobytu", "UbyPort"]];
  for (const item of registrations) {
    const checkIn = item.registration.submittedCheckIn ?? item.stay.checkIn;
    const checkOut = item.registration.submittedCheckOut ?? item.stay.checkOut;
    if (month && !overlapsMonth(checkIn, checkOut, month)) continue;
    for (const guest of item.guests ?? []) rows.push([checkIn, checkOut, guest.firstName, guest.lastName, guest.birthDate, guest.nationality, guest.travelDocumentType, guest.travelDocumentNumber, guest.visaOrResidence, guest.foreignAddress, guest.purposeOfStay, item.registration.reportedAt ? "Odesláno" : "Neodesláno"]);
  }
  const csv = `\uFEFF${rows.map((row) => row.map(escape).join(";")).join("\n")}`;
  return new Response(csv, { headers: { "Cache-Control": "no-store", "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="domovni-kniha${month ? `-${month}` : ""}.csv"` } });
}
