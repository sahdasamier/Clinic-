import { db } from "./firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { Patient } from "../types/models";

export async function getPatients(clinicId: string): Promise<Patient[]> {
  const q = query(collection(db, "clinics", clinicId, "patients"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Patient));
}
// Add create, update, delete, etc. 