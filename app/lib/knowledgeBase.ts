import { ChatIntent } from "./chatIntents";
import adminData from "./adminKnowledge.json";

const DEFAULT_KNOWLEDGE: Record<ChatIntent, string> = {
  GREETING:
    "DreamGullak is a digital savings app where users can save money toward personal goals.",

  ADD_MONEY:
    "Users can add money from Dashboard → Add Money using UPI. Money is added instantly after successful payment.",

  WITHDRAW:
    "You can withdraw your money anytime from Wallet → Withdraw. Amount is credited to your linked bank account.",

  KYC:
    "KYC is required for withdrawals. Please complete it from Profile → KYC.",

  PAYMENT_FAILED:
    "If a payment fails but money is debited, it is usually auto-refunded within 3–5 working days.",

  ACCOUNT_HELP:
    "For account or login issues, please use Forgot Password or contact support.",

  HUMAN_SUPPORT:
    "Please contact our support team at support@dreamgullak.in for further assistance.",

  OUT_OF_SCOPE:
    "I can help with KYC, payments, withdrawals, and account issues."
};

function safeGet(
  key: ChatIntent,
  adminValue: unknown
): string {
  return typeof adminValue === "string" && adminValue.length > 0
    ? adminValue
    : DEFAULT_KNOWLEDGE[key];
}

export const KNOWLEDGE_BASE: Record<ChatIntent, string> = {
  GREETING: safeGet("GREETING", adminData.GREETING),
  ADD_MONEY: safeGet("ADD_MONEY", adminData.ADD_MONEY),
  WITHDRAW: safeGet("WITHDRAW", adminData.WITHDRAW),
  KYC: safeGet("KYC", adminData.KYC),
  PAYMENT_FAILED: safeGet("PAYMENT_FAILED", adminData.PAYMENT_FAILED),
  ACCOUNT_HELP: safeGet("ACCOUNT_HELP", adminData.ACCOUNT_HELP),
  HUMAN_SUPPORT: safeGet("HUMAN_SUPPORT", adminData.HUMAN_SUPPORT),
  OUT_OF_SCOPE: safeGet("OUT_OF_SCOPE", adminData.OUT_OF_SCOPE)
};
