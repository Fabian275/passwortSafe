// src/components/Login.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Link,
} from "@mui/material";

interface LoginProps {
  setLoggedIn: (loggedIn: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5002/login", {
        username,
        password,
      });
      const { token } = response.data;
      localStorage.setItem("authToken", token);
      setLoggedIn(true);
      navigate("/password-manager");
    } catch (error) {
      setMessage("Anmeldung fehlgeschlagen");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Anmelden
        </Typography>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Benutzername"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Passwort"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            Anmelden
          </Button>
          {message && <Typography color="error">{message}</Typography>}
          <Link href="/register" variant="body2">
            {"Noch kein Konto? Registrieren"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
