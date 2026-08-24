import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import PublicFeed from "./pages/PublicFeed";
import ProtectedRoute from "./components/ProtectedRoute";
import SideBar from "./components/SideBar";
import ProjectLogs from "./components/logsPage/ProjectLogs";
import PublicProjectView from "./components/publicLogs/PublicProjectView";

import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import axios from "./axiosConfig/axiosConfig";
import AuthContext from "./context/AuthContext";
// import "./App.css";

function App() {
  const { handleReload } = useContext(AuthContext);
  const location = useLocation();

  // pages where sidebar should NOT appear....
  const authPages = ["/", "/Login", "/Register"];
  const showSidebar = !authPages.includes(location.pathname);
  // console.log(location.pathname, showSidebar);
  // this useEffect is only there to handle page reload
  // console.log("token on mount:", localStorage.getItem("token"));
  useEffect(() => {
    if (localStorage.getItem("token")) {
      axios
        .get("/api/users/profile", {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        })
        .then((response) => {
          handleReload(response.data);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, []);

  // if (localStorage.getItem("token") && !user) {
  //   return <p>loading ...</p>;
  // }
  return (
    <div className="flex">
      {showSidebar && <SideBar />}
      <main className={showSidebar ? "ml-56 flex-1 min-h-screen" : "flex-1"}>
        {" "}
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route
            path="/"
            element={
              localStorage.getItem("token") ? (
                <Navigate to="/Dashboard" replace />
              ) : (
                <Login />
              )
            }
          />

          <Route path="/Register" element={<Register />} />
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Project"
            element={
              <ProtectedRoute>
                <Project />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Project/:id"
            element={
              <ProtectedRoute>
                <ProjectLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/PublicFeed"
            element={
              <ProtectedRoute>
                <PublicFeed />
              </ProtectedRoute>
            }
          />
          <Route path="/public/:id" element={<PublicProjectView />} />
          {/* to prevent from going to random routes which is not present .... */}
          <Route
            path="*"
            element={
              localStorage.getItem("token") ? (
                <Navigate to="/Dashboard" replace />
              ) : (
                <Navigate to="/Login" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
