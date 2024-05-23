// src/App.tsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import PasswordManager from "./components/PasswordManager";
import UpdateProfile from "./components/UpdateProfile";
import PrivateRoute from "./routes/PrivateRoute";
import { isLoggedIn } from "./utils/auth";

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              <Navigate to="/password-manager" />
            ) : (
              <Login setLoggedIn={setLoggedIn} />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route path="/password-manager" element={<PasswordManager />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
