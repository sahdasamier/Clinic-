// src/contexts/AppointmentContext.tsx
import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import { collection, query, onSnapshot, DocumentData, QuerySnapshot, Unsubscribe } from "firebase/firestore";
import { db } from '../firebase'; // import your Firestore instance

// Define the shape of an appointment (add your fields as needed)
export interface Appointment {
  id: string;
  [key: string]: any; // Allows for other properties not strictly defined
}

// Define the context value type
interface AppointmentContextType {
  appointments: Appointment[];
  loading: boolean;
}

// Create context with default values
const AppointmentContext = createContext<AppointmentContextType>({
  appointments: [],
  loading: true,
});

export const AppointmentProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // console.log("AppointmentProvider mounted. Setting up Firestore listener...");
    // (Optional) If filtering by clinicId or other criteria, use a query:
    // import { where } from "firebase/firestore";
    // const clinicId = /* get current clinic ID from auth or context */;
    // const appointmentsQuery = query(collection(db, "appointments"), where("clinicId", "==", clinicId));
    const appointmentsQuery = query(collection(db, "appointments"));

    // Set up the onSnapshot listener
    const unsubscribe: Unsubscribe = onSnapshot(appointmentsQuery, (querySnapshot: QuerySnapshot<DocumentData>) => {
      // console.log("Firestore snapshot received. Processing documents...");
      const appts: Appointment[] = [];
      querySnapshot.forEach(doc => {
        appts.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      // console.log(`Processed ${appts.length} appointments.`);
      setAppointments(appts);
      setLoading(false);
    }, error => {
      console.error("Error listening to appointments:", error);
      setLoading(false);
    });

    // Clean up listener on unmount to avoid memory leaks
    return () => {
      // console.log("AppointmentProvider unmounting. Unsubscribing from Firestore listener.");
      unsubscribe();
    };
  }, []);  // Empty dependency array = run once on mount and clean up on unmount

  return (
    <AppointmentContext.Provider value={{ appointments, loading }}>
      {children}
    </AppointmentContext.Provider>
  );
};

// Custom hook for easier consumption
export const useAppointments = (): AppointmentContextType => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
