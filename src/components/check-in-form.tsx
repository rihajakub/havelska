"use client";

import { FormEvent, useState } from "react";
import { submitCheckInForm } from "@/app/actions";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = Array.from({ length: 26 * 26 }, (_, index) => `${String.fromCharCode(65 + Math.floor(index / 26))}${String.fromCharCode(65 + index % 26)}`)
  .map((code) => countryNames.of(code)).filter((name): name is string => Boolean(name && name.length > 2)).sort();
const purposes = ["Tourism", "Business", "Visiting family or friends", "Study", "Employment", "Transit", "Medical treatment", "Other"];
const labels = { firstName: "First name", lastName: "Last name", birthDate: "Date of birth", nationality: "Nationality", travelDocumentNumber: "Travel document number", visaOrResidence: "Visa or residence permit", addressCountry: "Country of permanent address", foreignAddress: "Street address, city and postcode", purposeOfStay: "Purpose of stay", purposeOther: "Purpose of stay" } as const;
const emptyGuest = () => ({ firstName: "", lastName: "", birthDate: "", nationality: "", travelDocumentNumber: "", visaOrResidence: "", addressCountry: "", foreignAddress: "", purposeOfStay: "Tourism", purposeOther: "" });
type GuestInput = ReturnType<typeof emptyGuest>;

export function CheckInForm({ token, checkIn, checkOut }: { token: string; checkIn: string; checkOut: string }) {
  const [guests, setGuests] = useState<GuestInput[]>([emptyGuest(), emptyGuest()]);
  const [arrivalDate, setArrivalDate] = useState(checkIn);
  const [departureDate, setDepartureDate] = useState(checkOut);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState("");
  const clearError = (key: string) => setErrors((items) => { const next = new Set(items); next.delete(key); return next; });
  const setValue = (index: number, key: keyof GuestInput, value: string) => { setGuests((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item)); clearError(`${index}-${key}`); };
  const invalid = (index: number, key: keyof GuestInput) => errors.has(`${index}-${key}`);
  const validate = (event: FormEvent<HTMLFormElement>) => {
    const missing = new Set<string>(); const names: string[] = [];
    if (!arrivalDate) { missing.add("stay-arrival"); names.push("Arrival date"); }
    if (!departureDate) { missing.add("stay-departure"); names.push("Departure date"); }
    if (arrivalDate && departureDate && departureDate <= arrivalDate) { missing.add("stay-arrival"); missing.add("stay-departure"); names.push("Departure date must be after arrival date"); }
    guests.forEach((guest, index) => (Object.keys(labels) as Array<keyof typeof labels>).forEach((key) => {
      if ((key === "purposeOther" && guest.purposeOfStay !== "Other") || (key === "purposeOfStay" && !guest.purposeOfStay)) return;
      if (!guest[key].trim()) { missing.add(`${index}-${key}`); names.push(`Guest ${index + 1}: ${labels[key]}`); }
    }));
    if (missing.size) { event.preventDefault(); setErrors(missing); setErrorMessage(`Please complete: ${names.join(", ")}.`); }
  };
  const fieldClass = (index: number, key: keyof GuestInput) => invalid(index, key) ? "field-error" : undefined;
  return <form action={submitCheckInForm} onSubmit={validate} noValidate className="form-card checkin-form">
    <input type="hidden" name="token" value={token}/><input type="hidden" name="guestCount" value={guests.length}/>
    <p className="notice">Stay: <strong>{checkIn} – {checkOut}</strong>. Please enter the details exactly as they appear on the travel document. We do not request photographs or copies of documents.</p>
    {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
    <div className="field-row"><label><span>Arrival date</span><input className={errors.has("stay-arrival") ? "field-error" : undefined} aria-invalid={errors.has("stay-arrival")} type="date" name="submittedCheckIn" value={arrivalDate} onChange={(event) => { setArrivalDate(event.target.value); clearError("stay-arrival"); }}/></label><label><span>Departure date</span><input className={errors.has("stay-departure") ? "field-error" : undefined} aria-invalid={errors.has("stay-departure")} type="date" name="submittedCheckOut" value={departureDate} onChange={(event) => { setDepartureDate(event.target.value); clearError("stay-departure"); }}/></label></div>
    {guests.map((guest, index) => <fieldset className="guest-fields" key={index}><legend>Guest {index + 1}</legend>
      <div className="field-row"><label><span>First name</span><input className={fieldClass(index, "firstName")} aria-invalid={invalid(index, "firstName")} name={`guest-${index}-firstName`} value={guest.firstName} onChange={(event) => setValue(index, "firstName", event.target.value)}/></label><label><span>Last name</span><input className={fieldClass(index, "lastName")} aria-invalid={invalid(index, "lastName")} name={`guest-${index}-lastName`} value={guest.lastName} onChange={(event) => setValue(index, "lastName", event.target.value)}/></label></div>
      <div className="field-row"><label><span>Date of birth</span><input className={fieldClass(index, "birthDate")} aria-invalid={invalid(index, "birthDate")} type="date" name={`guest-${index}-birthDate`} value={guest.birthDate} onChange={(event) => setValue(index, "birthDate", event.target.value)}/></label><label><span>Nationality</span><select className={fieldClass(index, "nationality")} aria-invalid={invalid(index, "nationality")} name={`guest-${index}-nationality`} value={guest.nationality} onChange={(event) => setValue(index, "nationality", event.target.value)}><option value="">Select nationality</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></label></div>
      <label><span>Travel document number</span><input className={fieldClass(index, "travelDocumentNumber")} aria-invalid={invalid(index, "travelDocumentNumber")} name={`guest-${index}-travelDocumentNumber`} value={guest.travelDocumentNumber} onChange={(event) => setValue(index, "travelDocumentNumber", event.target.value)}/></label>
      <label><span>Visa / residence permit</span><input className={fieldClass(index, "visaOrResidence")} aria-invalid={invalid(index, "visaOrResidence")} placeholder="Enter the number, or N/A if not applicable" name={`guest-${index}-visaOrResidence`} value={guest.visaOrResidence} onChange={(event) => setValue(index, "visaOrResidence", event.target.value)}/></label>
      <div className="field-row"><label><span>Country of permanent address</span><select className={fieldClass(index, "addressCountry")} aria-invalid={invalid(index, "addressCountry")} value={guest.addressCountry} onChange={(event) => setValue(index, "addressCountry", event.target.value)}><option value="">Select country</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></label><label><span>Street address, city and postcode</span><input className={fieldClass(index, "foreignAddress")} aria-invalid={invalid(index, "foreignAddress")} autoComplete="street-address" placeholder="Start typing your address" value={guest.foreignAddress} onChange={(event) => setValue(index, "foreignAddress", event.target.value)}/><input type="hidden" name={`guest-${index}-foreignAddress`} value={`${guest.addressCountry}${guest.foreignAddress ? `, ${guest.foreignAddress}` : ""}`}/></label></div>
      <label><span>Purpose of stay in the Czech Republic</span><select className={fieldClass(index, "purposeOfStay")} aria-invalid={invalid(index, "purposeOfStay")} value={guest.purposeOfStay} onChange={(event) => setValue(index, "purposeOfStay", event.target.value)}>{purposes.map((purpose) => <option key={purpose} value={purpose}>{purpose}</option>)}</select></label>
      {guest.purposeOfStay === "Other" && <label><span>Please specify the purpose</span><input className={fieldClass(index, "purposeOther")} aria-invalid={invalid(index, "purposeOther")} value={guest.purposeOther} onChange={(event) => setValue(index, "purposeOther", event.target.value)}/></label>}<input type="hidden" name={`guest-${index}-purposeOfStay`} value={guest.purposeOfStay === "Other" ? guest.purposeOther : guest.purposeOfStay}/>
    </fieldset>)}
    <div className="form-actions">{guests.length < 4 && <button className="button secondary" type="button" onClick={() => setGuests((items) => [...items, emptyGuest()])}>Add guest</button>}{guests.length > 1 && <button className="button secondary" type="button" onClick={() => setGuests((items) => items.slice(0, -1))}>Remove last guest</button>}<button className="button" type="submit">Submit details</button></div>
  </form>;
}
