import OpenAI from "openai";
import { ChatIntent } from "./chatIntents";
import { KNOWLEDGE_BASE } from "./knowledgeBase";
import { ChatContext } from "./chatContext";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function aiGenerateReply(
  intent: ChatIntent,
  userMessage: string,
  context?: ChatContext
): Promise<string> {
  // ✅ FAILSAFE: never allow undefined knowledge
  const knowledge =
    KNOWLEDGE_BASE[intent] ||
    "I can help with KYC, payments, withdrawals, and account issues.";

  const contextInfo =
    context?.lastIntent && context.lastIntent !== intent
      ? `Previous user intent was ${context.lastIntent}.`
      : "";

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
You are DreamGullak Support Assistant.

Rules:
- Use ONLY the approved information.
- Never access balances or transactions.
- Never provide financial advice.
- Never assume personal data.
- Use conversation context only to clarify intent.

Context:
${contextInfo}

Approved Information:
"""
${knowledge}
"""
`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    return (
      response.choices[0].message.content ||
      "Please contact support for further assistance."
    );
  } catch (error) {
    // ✅ FINAL SAFETY NET (never crash API)
    console.error("AI reply generation failed:", error);
    return "I can help with KYC, payments, withdrawals, and account issues. Please contact support for complex problems.";
  }
}

