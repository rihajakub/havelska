"use client";

import { useState } from "react";
import { submitCheckInForm } from "@/app/actions";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = Array.from({ length: 26 * 26 }, (_, index) => `${String.fromCharCode(65 + Math.floor(index / 26))}${String.fromCharCode(65 + index % 26)}`)
  .map((code) => countryNames.of(code)).filter((name): name is string => Boolean(name && name.length > 2)).sort();
const purposes = ["Tourism", "Business", "Visiting family or friends", "Study", "Employment", "Transit", "Medical treatment", "Other"];
const emptyGuest = () => ({ firstName: "", lastName: "", birthDate: "", nationality: "", travelDocumentNumber: "", visaOrResidence: "", addressCountry: "", foreignAddress: "", purposeOfStay: "Tourism", purposeOther: "" });
type GuestInput = ReturnType<typeof emptyGuest>;

function CountrySelect({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return <label><span>{label}</span><select required value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select country</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></label>;
}

export function CheckInForm({ token, checkIn, checkOut }: { token: string; checkIn: string; checkOut: string }) {
  const [guests, setGuests] = useState<GuestInput[]>([emptyGuest(), emptyGuest()]);
  const setValue = (index: number, key: keyof GuestInput, value: string) => setGuests((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  return <form action={submitCheckInForm} className="form-card checkin-form">
    <input type="hidden" name="token" value={token}/><input type="hidden" name="guestCount" value={guests.length}/>
    <p className="notice">Stay: <strong>{checkIn} – {checkOut}</strong>. Please enter the details exactly as they appear on the travel document. We do not request photographs or copies of documents.</p>
    {guests.map((guest, index) => <fieldset className="guest-fields" key={index}><legend>Guest {index + 1}</legend>
      <div className="field-row"><label><span>First name</span><input required name={`guest-${index}-firstName`} value={guest.firstName} onChange={(event) => setValue(index, "firstName", event.target.value)}/></label><label><span>Last name</span><input required name={`guest-${index}-lastName`} value={guest.lastName} onChange={(event) => setValue(index, "lastName", event.target.value)}/></label></div>
      <div className="field-row"><label><span>Date of birth</span><input required type="date" name={`guest-${index}-birthDate`} value={guest.birthDate} onChange={(event) => setValue(index, "birthDate", event.target.value)}/></label><CountrySelect label="Nationality" value={guest.nationality} onChange={(value) => setValue(index, "nationality", value)}/></div>
      <label><span>Travel document number</span><input required name={`guest-${index}-travelDocumentNumber`} value={guest.travelDocumentNumber} onChange={(event) => setValue(index, "travelDocumentNumber", event.target.value)}/></label>
      <label><span>Visa / residence permit, if applicable</span><input name={`guest-${index}-visaOrResidence`} value={guest.visaOrResidence} onChange={(event) => setValue(index, "visaOrResidence", event.target.value)}/></label>
      <div className="field-row"><CountrySelect label="Country of permanent address" value={guest.addressCountry} onChange={(value) => setValue(index, "addressCountry", value)}/><label><span>Street address, city and postcode</span><input required autoComplete="street-address" placeholder="Start typing your address" value={guest.foreignAddress} onChange={(event) => setValue(index, "foreignAddress", event.target.value)}/><input type="hidden" name={`guest-${index}-foreignAddress`} value={`${guest.addressCountry}${guest.foreignAddress ? `, ${guest.foreignAddress}` : ""}`}/></label></div>
      <label><span>Purpose of stay in the Czech Republic</span><select required value={guest.purposeOfStay} onChange={(event) => setValue(index, "purposeOfStay", event.target.value)}>{purposes.map((purpose) => <option key={purpose} value={purpose}>{purpose}</option>)}</select></label>
      {guest.purposeOfStay === "Other" && <label><span>Please specify the purpose</span><input required value={guest.purposeOther} onChange={(event) => setValue(index, "purposeOther", event.target.value)}/></label>}<input type="hidden" name={`guest-${index}-purposeOfStay`} value={guest.purposeOfStay === "Other" ? guest.purposeOther : guest.purposeOfStay}/>
    </fieldset>)}
    <div className="form-actions">{guests.length < 4 && <button className="button secondary" type="button" onClick={() => setGuests((items) => [...items, emptyGuest()])}>Add guest</button>}{guests.length > 1 && <button className="button secondary" type="button" onClick={() => setGuests((items) => items.slice(0, -1))}>Remove last guest</button>}<button className="button" type="submit">Submit details</button></div>
  </form>;
}
