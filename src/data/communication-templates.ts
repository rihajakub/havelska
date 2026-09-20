import type { CommunicationTemplate } from "@/domain/types";

export const defaultCommunicationTemplates: CommunicationTemplate[] = [
  { id: "booking", name: "Potvrzení rezervace", body: "Hello {guest}, thank you for your reservation at Quiet 2BR Old Town Apartment. We look forward to welcoming you from {checkIn} to {checkOut}." },
  { id: "checkin", name: "Check-in formulář", body: "Hello {guest}, before your arrival please complete our secure guest registration form: {checkInLink}. Thank you." },
  { id: "arrival", name: "Instrukce k příjezdu", body: "Hello {guest}, we look forward to welcoming you today. Your arrival is arranged for {arrivalTime}. We will send the final key instructions shortly before arrival." },
  { id: "departure", name: "Odjezd", body: "Hello {guest}, we hope you enjoyed your stay. Check-out is by 11:00 on {checkOut}. Please leave the keys as agreed. Thank you." },
  { id: "review", name: "Poděkování a recenze", body: "Thank you for staying with us, {guest}. We would be grateful if you could leave a short review on Airbnb. Safe travels!" },
];
