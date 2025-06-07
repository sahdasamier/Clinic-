export interface Clinic {
  id: string;
  name: string;
  branches: Branch[];
}

export interface Branch {
    id: string;
    name: string;
    clinicId: string;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "doctor" | "receptionist";
  clinicId: string;
  branchId?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  clinicId: string;
  branchId?: string;
  // ...
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  branchId: string;
  date: string;
  status: "scheduled" | "checked-in" | "completed" | "cancelled";
  // ...
}
// Add more as needed 