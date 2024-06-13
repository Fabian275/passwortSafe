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
  IconButton,
  InputAdornment,
} from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const regex =
      /^(?=(.*[a-z]){3,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;
    return regex.test(password);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwörter stimmen nicht überein");
      return;
    }

    if (!validatePassword(password)) {
      setMessage(
        "Das Passwort erfüllt nicht die Anforderungen (mindestens 8 Zeichen lang, mindestens 3 klein Buchstaben, mindestens 2 Grossbuchstaben, mindestens 2 Zahlen, mindestens 1 Sonderzeichen)"
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/register",
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      const { token } = response.data;
      localStorage.setItem("authToken", token);
      navigate("/password-manager");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(
          error.response.data.message || "Registrierung fehlgeschlagen"
        );
      } else {
        setMessage("Registrierung fehlgeschlagen");
      }
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
          Registrieren
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
            id="outlined-adornment-password"
            label="Passwort"
            required
            variant="outlined"
            margin="normal"
            fullWidth
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            id="outlined-adornment-confirmPassword"
            label="Passwort bestätigen"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirmPassword visibility"
                    onClick={handleClickShowConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleRegister}
          >
            Registrieren
          </Button>
          {message && <Typography color="error">{message}</Typography>}
          <Link href="/" variant="body2">
            {"Bereits ein Konto? Anmelden"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
