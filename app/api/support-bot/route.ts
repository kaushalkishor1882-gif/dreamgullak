import { NextResponse } from "next/server";
import { supportFaq } from "../../lib/supportFaq";

export async function POST(req: Request) {
  const { message } = await req.json();
  const userText = message.toLowerCase();

  const match = supportFaq.find(faq =>
    faq.keywords.some(k => userText.includes(k))
  );

  if (match) {
    return NextResponse.json({ reply: match.answer });
  }

  return NextResponse.json({
    reply:
      "I can help with KYC, payments, withdrawals, and account issues. Please contact support for complex problems."
  });
}
