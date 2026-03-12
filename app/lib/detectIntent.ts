import { ChatIntent } from "./chatIntents";

export function detectIntent(message: string): ChatIntent {
  const text = message.toLowerCase();

// GREETING
if (["hi", "hello", "hey", "hii"].some(w => text.includes(w)))
  return "GREETING";

// HUMAN SUPPORT
if (
  text.includes("agent") ||
  text.includes("human") ||
  text.includes("talk") ||
  text.includes("support") ||
  text.includes("complaint")
)
  return "HUMAN_SUPPORT";


  // ADD MONEY
  if (
    (text.includes("add") || text.includes("deposit")) &&
    (text.includes("money") || text.includes("paisa"))
  )
    return "ADD_MONEY";

// WITHDRAW (English + Hinglish)
if (
  text.includes("withdraw") ||
  text.includes("nikal") ||
  text.includes("nikalne") ||
  text.includes("paise nikale") ||
  text.includes("paise kaise nikale") ||
  (text.includes("paise") && text.includes("nikal"))
)
  return "WITHDRAW";

  // KYC
  if (
    text.includes("kyc") ||
    text.includes("pan") ||
    text.includes("verify")
  )
    return "KYC";

  // PAYMENT / REFUND / CREDIT TIME
  if (
    text.includes("debit") ||
    text.includes("failed") ||
    text.includes("refund") ||
    text.includes("kab milega") ||
    text.includes("kab aayega") ||
    text.includes("credit kab")
  )
    return "PAYMENT_FAILED";

  // ACCOUNT HELP
  if (
    text.includes("login") ||
    text.includes("account") ||
    text.includes("password")
  )
    return "ACCOUNT_HELP";

  return "OUT_OF_SCOPE";
}
