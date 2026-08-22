import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export default function useAuthError() {
  const { handleLogout } = useContext(AuthContext);

  const handleAuthError = (err) => {
    const status = err.response?.status;
    const error = err.response?.data?.error;

    if (status === 401 && error === "jwt expired") {
      handleLogout();
    }
  };

  return handleAuthError;
}
