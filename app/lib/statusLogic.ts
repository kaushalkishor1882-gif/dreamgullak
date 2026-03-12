import { ChatIntent } from "./chatIntents";

export function getStatusExplanation(intent: ChatIntent): string | null {
  switch (intent) {
    case "PAYMENT_FAILED":
      return "If a payment fails but money is debited, it is usually auto-refunded within 3–5 working days.";

    case "KYC":
      return "KYC verification usually takes 24–48 hours after submission.";

    default:
      return null;
  }
}
