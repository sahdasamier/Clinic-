import { useContext } from "react";
import { AuthContext } from "../app/AuthProvider";

export const useAuth = () => useContext(AuthContext); 