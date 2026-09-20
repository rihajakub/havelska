import Link from "next/link";
import { saveCheckInTemplate } from "@/app/actions";
import { getCheckInTemplate } from "@/data/repository";

const fields = [
  ["title", "Page title"], ["introduction", "Introductory text"], ["stayLabel", "Stay label"], ["documentNotice", "Document notice"],
  ["arrivalLabel", "Arrival date"], ["departureLabel", "Departure date"], ["guestLabel", "Guest label"],
  ["firstNameLabel", "First name"], ["lastNameLabel", "Last name"], ["birthDateLabel", "Date of birth"], ["nationalityLabel", "Nationality"], ["travelDocumentLabel", "Travel document number"], ["visaLabel", "Visa / residence permit"], ["addressCountryLabel", "Address country"], ["addressLabel", "Address field"], ["addressHelp", "Address help text"], ["purposeLabel", "Purpose label"], ["purposeOtherLabel", "Other purpose"], ["addGuestLabel", "Add guest button"], ["removeGuestLabel", "Remove guest button"], ["submitLabel", "Submit button"],
] as const;

export default async function CheckInTemplatePage() {
  const template = await getCheckInTemplate();
  return <><section className="page-heading"><span className="eyebrow">Check-in template</span><h1>Guest-facing wording</h1><p>These texts appear in the public English check-in form. Changes affect newly opened links immediately.</p></section><form action={saveCheckInTemplate} className="form-card template-form">{fields.map(([key, label]) => <label key={key}><span>{label}</span><input required name={key} defaultValue={template[key]}/></label>)}<label><span>Purposes of stay (one option per line)</span><textarea required name="purposes" rows={8} defaultValue={template.purposes.join("\n")}/></label><div className="form-actions"><Link className="button secondary" href="/cizinecka-policie">Cancel</Link><button className="button" type="submit">Save template</button></div></form></>;
}
