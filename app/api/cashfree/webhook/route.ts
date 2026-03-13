import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { addDoc, collection, updateDoc, doc, increment } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const event = data?.event;
    const linkId = data?.data?.payment_link_id;
    const amount = data?.data?.order_amount;

    if (event !== "payment_link.paid") {
      return NextResponse.json({ status: "ignored" });
    }

    const goalId = data?.data?.link_notes?.goal_id;
    const userId = data?.data?.link_notes?.user_id;

    if (goalId && amount) {
      await updateDoc(doc(db, "goals", goalId), {
        currentAmount: increment(Number(amount)),
      });

      await addDoc(collection(db, "transactions"), {
        uid: userId,
        goalId,
        amount,
        type: "Cashfree Link",
        status: "Success",
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "webhook error" });
  }
}
