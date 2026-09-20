import { getAppData } from "@/data/repository";

export const dynamic = "force-dynamic";

const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export async function GET() {
  const data = await getAppData();
  const rows = [["Příjezd", "Odjezd", "Hosté", "Zdroj", "Poznámka", "Osvobozeno od poplatku"]].concat(data.stays.map((stay) => [stay.checkIn, stay.checkOut, stay.guests, stay.source, stay.note, stay.taxExemptGuests ?? 0].map(escape)));
  return new Response(`\uFEFF${rows.map((row) => row.join(";")).join("\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=havelska-pobyty.csv" } });
}
