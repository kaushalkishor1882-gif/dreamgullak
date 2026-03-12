/**
 * -------------------------------------------------------
 * updateGoal.ts
 * FIXED VERSION (Safe for Next.js App Router)
 * -------------------------------------------------------
 * Client-side = Uses Firebase client SDK
 * Server-side = Dynamically imports Firebase Admin
 * This prevents "Can't resolve 'net'" errors.
 * -------------------------------------------------------
 */

//
// 🔵 CLIENT-SIDE FUNCTION (Browser)
// Uses Firestore client SDK only
//
import { db } from "./firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export const addMoneyToGoal = async (goalId: string, amount: number) => {
  try {
    const goalRef = doc(db, "goals", goalId);
    await updateDoc(goalRef, {
      currentAmount: increment(amount),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating goal:", error.message);
    return { success: false, error: error.message };
  }
};


//
// 🟣 SERVER-SIDE FUNCTION (Webhook)
// Uses Firebase Admin SAFELY.
// Imported dynamically so it NEVER loads in client bundle.
// ---------------------------------------------------------
// ❗ DO NOT import firebase-admin at the top of the file ❗
// ---------------------------------------------------------
//
export const addMoneyToGoalServer = async (goalId: string, amount: number) => {
  try {
    // Dynamic import (server-only)
    const admin = (await import("./firebaseAdmin")).default;

    const goalRef = admin.firestore().collection("goals").doc(goalId);

    await goalRef.update({
      currentAmount: admin.firestore.FieldValue.increment(amount),
    });

    console.log(`Goal ${goalId} incremented by ₹${amount} (SERVER)`);
    return { success: true };
  } catch (error: any) {
    console.error("Server Goal Update Error:", error.message);
    return { success: false, error: error.message };
  }
};
