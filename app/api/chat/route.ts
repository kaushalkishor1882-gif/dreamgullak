import { NextResponse } from "next/server";
import { detectIntent } from "../../lib/detectIntent";
import { aiDetectIntent } from "../../lib/aiDetectIntent";
import { aiGenerateReply } from "../../lib/aiGenerateReply";
import { ChatContext } from "../../lib/chatContext";
import { checkRateLimit } from "../../lib/rateLimiter";
import { getStatusExplanation } from "../../lib/statusLogic";

// ----------------------------------
// In-memory short-term chat context
// (MVP-safe, no personal data)
// ----------------------------------
let chatContext: ChatContext = {};

export async function POST(req: Request) {
  try {
    // -------------------------------
    // 1️⃣ Parse & validate request
    // -------------------------------
    const { message, language } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ reply: "Invalid message." });
    }

    // -------------------------------
    // 2️⃣ Rate limiting (ANTI-ABUSE)
    // -------------------------------
    const userKey =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("user-agent") ??
      "local-dev";

    if (!checkRateLimit(userKey)) {
      return NextResponse.json({
        reply:
          "You are sending messages too frequently. Please wait a while and try again."
      });
    }

    // -------------------------------
    // 3️⃣ Intent detection
    // -------------------------------
    let intent = detectIntent(message);

    if (intent === "OUT_OF_SCOPE") {
      intent = await aiDetectIntent(message);
    }

    // -------------------------------
    // 4️⃣ Safe status explanation
    // (NO DB, NO user data)
    // -------------------------------
    const statusInfo = getStatusExplanation(intent);
    if (statusInfo) {
      chatContext = {
        lastIntent: intent,
        lastMessage: message
      };

      return NextResponse.json({ reply: statusInfo });
    }

    // -------------------------------
    // 5️⃣ AI reply (approved knowledge only)
    // -------------------------------
    const reply = await aiGenerateReply(
      intent,
      message,
      chatContext,
      language // 🌐 language passed safely
    );

    // -------------------------------
    // 6️⃣ Update short-term context
    // -------------------------------
    chatContext = {
      lastIntent: intent,
      lastMessage: message
    };

    return NextResponse.json({ reply });
  } catch (err) {
    // -------------------------------
    // 7️⃣ Crash protection (FINAL SAFETY NET)
    // -------------------------------
    console.error("Chatbot error:", err);

    return NextResponse.json({
      reply:
        "Something went wrong. Please try again later or contact support."
    });
  }
}
