import type { CheckInTemplate } from "@/domain/types";

export const defaultCheckInTemplate: CheckInTemplate = {
  title: "Accommodation details",
  introduction: "The main guest should complete this form for every foreign guest in the reservation, up to four people.",
  stayLabel: "Stay",
  documentNotice: "Please enter the details exactly as they appear on the travel document. We do not request photographs or copies of documents.",
  arrivalLabel: "Arrival date", departureLabel: "Departure date", guestLabel: "Guest",
  firstNameLabel: "First name", lastNameLabel: "Last name", birthDateLabel: "Date of birth", nationalityLabel: "Nationality",
  travelDocumentTypeLabel: "Type of travel document", travelDocumentLabel: "Travel document number", visaLabel: "Visa / residence permit",
  addressCountryLabel: "Country of permanent address", addressLabel: "Street address, city and postcode",
  addressHelp: "Enter your full address. Your browser may offer a saved address, but suggestions are optional.",
  purposeLabel: "Purpose of stay in the Czech Republic", purposeOtherLabel: "Please specify the purpose",
  addGuestLabel: "Add guest", removeGuestLabel: "Remove last guest", submitLabel: "Submit details",
  purposes: ["Tourism", "Business", "Visiting family or friends", "Study", "Employment", "Transit", "Medical treatment", "Other"],
};
