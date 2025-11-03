// 📁 app/lib/updateGoal.ts
import { db } from "./firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

// 🧠 This function increases the currentAmount for a goal in Firestore
export const addMoneyToGoal = async (goalId: string, amount: number) => {
  try {
    const goalRef = doc(db, "goals", goalId);
    await updateDoc(goalRef, {
      currentAmount: increment(amount), // increases by given amount
    });
    alert("💰 Money added successfully!");
  } catch (error: any) {
    console.error("Error updating goal:", error.message);
    alert("⚠️ Failed to add money. Try again!");
  }
};
