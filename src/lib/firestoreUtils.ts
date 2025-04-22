import { doc, setDoc, getDoc, collection, DocumentData } from "firebase/firestore"; 
import { db } from "./firebaseConfig"; // Assuming db is exported from firebaseConfig

export interface FitnessEntryData {
  fitnessData: string;
  recommendations: string | null;
  parsedData: any | null; // Consider defining a more specific type for parsedData
}

// Function to save a fitness entry for a specific user and date
export const saveFitnessEntry = async (
  userId: string, 
  date: string, // Expecting 'yyyy-MM-dd' format
  data: FitnessEntryData
): Promise<void> => {
  try {
    // Construct the document path: /users/{userId}/fitnessEntries/{date}
    const entryRef = doc(db, "users", userId, "fitnessEntries", date);
    await setDoc(entryRef, data, { merge: true }); // Use merge: true to update fields without overwriting the entire doc
    console.log("Fitness entry saved successfully for date:", date);
  } catch (error) {
    console.error("Error saving fitness entry:", error);
    throw new Error("Failed to save fitness entry.");
  }
};

// Function to load a fitness entry for a specific user and date
export const loadFitnessEntry = async (
  userId: string, 
  date: string // Expecting 'yyyy-MM-dd' format
): Promise<FitnessEntryData | null> => {
  try {
    const entryRef = doc(db, "users", userId, "fitnessEntries", date);
    const docSnap = await getDoc(entryRef);

    if (docSnap.exists()) {
      console.log("Fitness entry loaded successfully for date:", date);
      // Ensure the loaded data conforms to the FitnessEntryData interface
      const data = docSnap.data() as FitnessEntryData;
      return {
        fitnessData: data.fitnessData || "",
        recommendations: data.recommendations || null,
        parsedData: data.parsedData || null,
      };
    } else {
      console.log("No fitness entry found for date:", date);
      return null; // Return null if no document exists for that date
    }
  } catch (error) {
    console.error("Error loading fitness entry:", error);
    throw new Error("Failed to load fitness entry.");
  }
};
