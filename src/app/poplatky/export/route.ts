import { getAppData, getCheckInRegistrations } from "@/data/repository";
import { buildMonthlyTaxReports, LOCAL_TAX_RATE } from "@/domain/tax-report";

export const dynamic = "force-dynamic";
const esc = (value: unknown) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const cell = (value: unknown, type = "String") => `<Cell><Data ss:Type="${type}">${esc(value)}</Data></Cell>`;

export async function GET(request: Request) {
  const month = new URL(request.url).searchParams.get("month") ?? "";
  if (!/^\d{4}-\d{2}$/.test(month)) return new Response("Neplatný měsíc.", { status: 400 });
  const data = await getAppData();
  const registrations = await getCheckInRegistrations();
  const report = buildMonthlyTaxReports(data.stays.filter((stay) => stay.status !== "cancelled"), registrations.map((item) => ({ stayId: item.stay.id, guests: item.guests }))).get(month);
  if (!report) return new Response("Pro zvolený měsíc nejsou data.", { status: 404 });
  const rows = report.rows.map((row) => `<Row>${cell(row.stay.checkIn)}${cell(row.stay.checkOut)}${cell(row.nights, "Number")}${cell(row.recordedGuests, "Number")}${cell(row.expectedGuests, "Number")}${cell(row.automaticMinors, "Number")}${cell(row.manualExemptions, "Number")}${cell(row.chargeableGuests, "Number")}${cell(LOCAL_TAX_RATE, "Number")}${cell(row.amount, "Number")}${cell(row.complete ? "kompletní" : "odhad")}</Row>`).join("");
  const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Poplatek ${month}"><Table><Row>${["Příjezd","Odjezd","Nocí","Evidováno hostů","Očekáváno hostů","Nezletilí","Další osvobození","Zpoplatněno","Sazba Kč","Částka Kč","Stav dat"].map((item) => cell(item)).join("")}</Row>${rows}<Row>${cell("CELKEM")}${cell("")}${cell("")}${cell("")}${cell("")}${cell("")}${cell("")}${cell("")}${cell("")}${cell(report.total, "Number")}${cell(report.complete ? "kompletní" : "odhad")}</Row></Table></Worksheet></Workbook>`;
  return new Response(xml, { headers: { "Content-Type": "application/vnd.ms-excel; charset=utf-8", "Content-Disposition": `attachment; filename="poplatek-${month}.xls"` } });
}
