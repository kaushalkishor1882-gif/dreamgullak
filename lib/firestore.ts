import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";

// ✅ Create new goal
export async function createGoal(goalData: any) {
  try {
    const docRef = await addDoc(collection(db, "goals"), {
      ...goalData,
      createdAt: Timestamp.now(),
    });
    console.log("✅ Goal saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error saving goal:", error);
    throw error;
  }
}

// ✅ Fetch all goals (latest first)
export async function getAllGoals() {
  try {
    const q = query(collection(db, "goals"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ Error fetching goals:", error);
    return [];
  }
}

// ✅ Mark goal completed
export async function markGoalCompleted(goalId: string) {
  try {
    const ref = doc(db, "goals", goalId);
    await updateDoc(ref, { is_completed: true });
  } catch (error) {
    console.error("❌ Error updating goal:", error);
  }
}
