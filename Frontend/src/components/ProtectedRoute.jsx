import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, role } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  // console.log("ProtectedRoute rendered, token:", !!token);
  if (!token || !isLoggedIn) {
    return <Navigate to="/Login" replace />;
  }
  // if allowedRoles is passed, check if user's role is in the list
  // if not, send them to dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/Dashboard" replace />;
  }

  return children;
}

//this is how we should pass the role for role specific pages
{
  /* <Route path="/admin" element={
  <ProtectedRoute allowedRoles={["admin"]}>
    <AdminPanel />
  </ProtectedRoute>
} /> */
}
