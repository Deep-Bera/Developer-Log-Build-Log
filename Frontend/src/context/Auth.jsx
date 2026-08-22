import { useReducer } from "react"; // Removed unused useContext
import AuthContext from "./AuthContext";
import reducer from "../reducers/AuthReducer";
import { useNavigate } from "react-router-dom";

const initialState = {
  isLoggedIn: !!localStorage.getItem("token"),
  role: localStorage.getItem("role") || "user",
  user: null,
};

export default function AuthProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const handleLogin = (user, token) => {
    // console.log(user._id);
    localStorage.setItem("id", user._id);
    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("username", user.name);
    dispatch({ type: "Login", payload: user });
    navigate("/Dashboard");
  };

  const handleLogout = () => {
    dispatch({ type: "Logout" });
    navigate("/Login");
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("role");
  };
  const handleReload = (user) => {
    dispatch({ type: "Reload", payload: user });
  };
  return (
    <AuthContext.Provider
      value={{ ...state, dispatch, handleLogin, handleLogout, handleReload }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
