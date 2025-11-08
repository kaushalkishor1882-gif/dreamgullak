import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { sendUserEmail } from "../../../../lib/notify";
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const withdrawalId = url.searchParams.get("withdrawalId");
    const token = url.searchParams.get("token");
    const reason = url.searchParams.get("reason") || "Rejected by Admin";

    // ✅ Token check
    if (token !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!withdrawalId) {
      return NextResponse.json({ ok: false, error: "Missing withdrawalId" }, { status: 400 });
    }

    // 1️⃣ Fetch the withdrawal document
    const withdrawRef = doc(db, "withdrawals", withdrawalId);
    const withdrawSnap = await getDoc(withdrawRef);

    if (!withdrawSnap.exists()) {
      return NextResponse.json({ ok: false, error: "Withdrawal not found" }, { status: 404 });
    }

    const data = withdrawSnap.data();

    // 2️⃣ Update withdrawal status to rejected
    await updateDoc(withdrawRef, {
      status: "rejected",
      rejectReason: reason,
      adminActionAt: serverTimestamp(),
    });

    // 3️⃣ Send email to user
    if (data.userEmail && data.amount != null) {
      await sendUserEmail(
        data.userEmail,
        "Your withdrawal request was rejected ❌",
        `<p>Your withdrawal of <b>₹${data.amount}</b> (ID: <b>${withdrawalId}</b>) was rejected.</p>
         <p>Reason: <b>${reason}</b></p>
         <p>If you have questions, please <a href="mailto:support@example.com">contact support</a>.</p>`
      );
      console.log(`✅ User email sent to: ${data.userEmail}`);
    } else {
      console.warn(`Withdrawal ${withdrawalId} missing userEmail or amount, email not sent.`);
    }

    // 4️⃣ Redirect admin back to admin panel or confirmation page
    return NextResponse.redirect("http://localhost:3000/admin/withdrawals?msg=rejected");
  } catch (err: any) {
    console.error("Reject withdrawal error", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
