import { firestore } from "./firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { Patient } from "../types/models";

export async function getPatients(clinicId: string): Promise<Patient[]> {
  const q = query(collection(firestore, "clinics", clinicId, "patients"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Patient));
}
// Add create, update, delete, etc. 