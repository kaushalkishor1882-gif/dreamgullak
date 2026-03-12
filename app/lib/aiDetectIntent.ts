import OpenAI from "openai";
import { ChatIntent } from "./chatIntents";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ALLOWED_INTENTS: ChatIntent[] = [
  "GREETING",
  "ADD_MONEY",
  "WITHDRAW",
  "KYC",
  "PAYMENT_FAILED",
  "ACCOUNT_HELP",
  "HUMAN_SUPPORT",
  "OUT_OF_SCOPE"
];

export async function aiDetectIntent(
  message: string
): Promise<ChatIntent> {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are an intent classifier for a fintech support chatbot.

Return ONLY one intent from this list:
${ALLOWED_INTENTS.join(", ")}

Rules:
- Do not answer the user
- Do not explain
- Do not add extra text
- If unsure, return OUT_OF_SCOPE
`
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  const intent = res.choices[0].message.content?.trim();

  if (ALLOWED_INTENTS.includes(intent as ChatIntent)) {
    return intent as ChatIntent;
  }

  return "OUT_OF_SCOPE";
}

