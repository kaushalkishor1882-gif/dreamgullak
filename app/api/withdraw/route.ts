import { NextResponse } from "next/server"; 
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
// ✅ Use relative path for notify.ts
import { sendUserEmail, sendAdminNotification } from "../../lib/notify"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Withdraw POST body:", body); // ✅ Debug

    const { uid, amount, userEmail, mode, bankInfo, upiId } = body;

    if (!uid || !amount || !userEmail) {
      return NextResponse.json({ ok: false, error: "Missing data" }, { status: 400 });
    }

    // 1️⃣ Get user balance
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    const amountNumber = Number(amount); // Ensure numeric
    const currentBalance = Number(userData.balance || 0);

    if (amountNumber > currentBalance) {
      return NextResponse.json({ ok: false, error: "Insufficient balance" }, { status: 400 });
    }

    // 2️⃣ Deduct balance
    await updateDoc(userRef, { balance: currentBalance - amountNumber });

    // 3️⃣ Create withdrawal record
    const withdrawalDoc = await addDoc(collection(db, "withdrawals"), {
      uid,
      userEmail,
      amount: amountNumber,
      mode,
      bankInfo: bankInfo || null,
      upiId: upiId || null,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // 4️⃣ Send email/notification
    await sendUserEmail(userEmail, `Your withdrawal of ₹${amountNumber} is pending.`);

    // ✅ Send admin email with Approve/Reject links
    await sendAdminNotification(userEmail, amountNumber, withdrawalDoc.id);

    return NextResponse.json({ ok: true, message: "Withdrawal created" });
  } catch (err: any) {
    console.error("POST /api/withdraw error", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

