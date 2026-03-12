import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { sendUserEmail } from "@/app/lib/notify";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const withdrawalId = url.searchParams.get("withdrawalId");
    const token = url.searchParams.get("token");

    if (!withdrawalId || token !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const wRef = doc(db, "withdrawals", withdrawalId);
    const wSnap = await getDoc(wRef);

    if (!wSnap.exists()) {
      return NextResponse.json({ ok: false, error: "Withdrawal not found" }, { status: 404 });
    }

    const w = wSnap.data() as any;

    if (w.status === "completed" || w.status === "approved") {
      return NextResponse.json({ ok: false, error: "Already approved" }, { status: 400 });
    }

    // Deduct from goals atomically
    await runTransaction(db, async (tx) => {
      const goalsQ = query(collection(db, "goals"), where("uid", "==", w.uid));
      const goalsSnap = await getDocs(goalsQ);
      let remaining = Number(w.amount);

      for (const gdoc of goalsSnap.docs) {
        if (remaining <= 0) break;
        const gRef = doc(db, "goals", gdoc.id);
        const cur = Number(gdoc.data().currentAmount || 0);
        if (cur <= 0) continue;
        const deduct = Math.min(cur, remaining);
        tx.update(gRef, { currentAmount: cur - deduct });
        remaining -= deduct;
      }

      tx.update(wRef, {
        status: "approved",
        approvedAt: serverTimestamp(),
        adminActionAt: serverTimestamp(),
      });
    });

    // Send user email
    if (w.userEmail) {
      await sendUserEmail(
        w.userEmail,
        "Your withdrawal has been approved ✅",
        `Your withdrawal of ₹${w.amount} has been successfully processed.`,
        `<p>Your withdrawal of <b>₹${w.amount}</b> has been approved and paid.</p>`
      );
    }

    return NextResponse.redirect("http://localhost:3000/admin/withdrawals?msg=approved");
  } catch (err: any) {
    console.error("Approve withdrawal error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
