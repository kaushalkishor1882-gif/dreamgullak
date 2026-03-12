import { ChatIntent } from "./chatIntents";

export const SAFE_RESPONSES: Record<ChatIntent, string> = {
  GREETING:
    "Hello 👋 I’m DreamGullak Support. How can I help you today?",

  ADD_MONEY:
    "To add money, go to Dashboard → Add Money and complete the payment using UPI.",

  WITHDRAW:
    "You can withdraw anytime from Wallet → Withdraw. The amount is sent to your linked bank account.",

  KYC:
    "KYC is required for withdrawals. Please complete it from Profile → KYC section.",

  PAYMENT_FAILED:
    "If payment failed but amount was debited, it is usually refunded within 3–5 working days.",

  ACCOUNT_HELP:
    "For account or login issues, please use the Forgot Password option or contact support.",

  OUT_OF_SCOPE:
    "I can help with app usage, KYC, payments, and withdrawals. For other issues, please contact support."
};
