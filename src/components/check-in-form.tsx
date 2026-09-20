"use client";

import { useState } from "react";
import { submitCheckInForm } from "@/app/actions";

const emptyGuest = () => ({ firstName: "", lastName: "", birthDate: "", nationality: "", travelDocumentNumber: "", visaOrResidence: "", foreignAddress: "", purposeOfStay: "Turistika" });

export function CheckInForm({ token, checkIn, checkOut }: { token: string; checkIn: string; checkOut: string }) {
  const [guests, setGuests] = useState([emptyGuest(), emptyGuest()]);
  const setValue = (index: number, key: keyof ReturnType<typeof emptyGuest>, value: string) => setGuests((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  return <form action={submitCheckInForm} className="form-card checkin-form">
    <input type="hidden" name="token" value={token}/><input type="hidden" name="guestCount" value={guests.length}/>
    <p className="notice">Pobyt: <strong>{checkIn} – {checkOut}</strong>. Vyplňte údaje přesně podle cestovního dokladu. Nežádáme fotografie ani kopie dokladů.</p>
    {guests.map((guest, index) => <fieldset className="guest-fields" key={index}><legend>Host {index + 1}</legend><div className="field-row"><label><span>Jméno</span><input required name={`guest-${index}-firstName`} value={guest.firstName} onChange={(event) => setValue(index, "firstName", event.target.value)}/></label><label><span>Příjmení</span><input required name={`guest-${index}-lastName`} value={guest.lastName} onChange={(event) => setValue(index, "lastName", event.target.value)}/></label></div><div className="field-row"><label><span>Datum narození</span><input required type="date" name={`guest-${index}-birthDate`} value={guest.birthDate} onChange={(event) => setValue(index, "birthDate", event.target.value)}/></label><label><span>Státní občanství</span><input required name={`guest-${index}-nationality`} value={guest.nationality} onChange={(event) => setValue(index, "nationality", event.target.value)}/></label></div><label><span>Číslo cestovního dokladu</span><input required name={`guest-${index}-travelDocumentNumber`} value={guest.travelDocumentNumber} onChange={(event) => setValue(index, "travelDocumentNumber", event.target.value)}/></label><label><span>Vízum / povolení k pobytu (pokud je relevantní)</span><input name={`guest-${index}-visaOrResidence`} value={guest.visaOrResidence} onChange={(event) => setValue(index, "visaOrResidence", event.target.value)}/></label><label><span>Trvalá adresa v zahraničí</span><input required name={`guest-${index}-foreignAddress`} value={guest.foreignAddress} onChange={(event) => setValue(index, "foreignAddress", event.target.value)}/></label><label><span>Účel pobytu v ČR</span><input required name={`guest-${index}-purposeOfStay`} value={guest.purposeOfStay} onChange={(event) => setValue(index, "purposeOfStay", event.target.value)}/></label></fieldset>)}
    <div className="form-actions">{guests.length < 4 && <button className="button secondary" type="button" onClick={() => setGuests((items) => [...items, emptyGuest()])}>Přidat hosta</button>}{guests.length > 1 && <button className="button secondary" type="button" onClick={() => setGuests((items) => items.slice(0, -1))}>Odebrat posledního</button>}<button className="button" type="submit">Odeslat údaje</button></div>
  </form>;
}
