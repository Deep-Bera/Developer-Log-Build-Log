import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export default function NavBar() {
  const { isLoggedIn, handleLogout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      {/* links */}
      <ul className="nav-links">
        {isLoggedIn ? (
          <>
            <li>Welcome to Build Log</li>
            <li>
              <Link to="/Dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/Project">Projects</Link>
            </li>

            <button
              className="nav-logout"
              onClick={() => {
                handleLogout();
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <li>
              <Link to="/Login">Sign in</Link>
            </li>
            <li>
              <Link to="/Register">Create account</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
