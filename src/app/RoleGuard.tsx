import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

interface RoleGuardProps {
  role: string;
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ role, children }) => {
  const { user } = useAuth();
  // TODO: The user object from Firebase Auth does not contain role information.
  // You need to fetch the user's profile from your database (e.g., Firestore)
  // and extend the user object in the AuthContext to include the role.
  // For now, we cast to any to bypass the type error.
  if (!user || (user as any).role !== role) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

export default RoleGuard; 