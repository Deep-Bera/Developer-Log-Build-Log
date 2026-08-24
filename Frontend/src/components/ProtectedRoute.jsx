import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  // console.log("ProtectedRoute rendered, token:", !!token);
  if (!token) {
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
