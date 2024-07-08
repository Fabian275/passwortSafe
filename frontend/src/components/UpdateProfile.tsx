import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TableCell,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Nav from "./Nav";
import { VisibilityOff, Visibility } from "@mui/icons-material";

interface Props {
  setLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const UpdateProfile = (props: Props) => {
  const { setLoggedIn } = props;
  const [category, setCategory] = useState("");
  const [link, setLink] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const handleUpdate = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("Nicht authentifiziert");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5001/updatePassword",
        {
          pwId: id,
          link: link,
          username,
          password,
          category,
        },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      navigate("/password-manager");
    } catch (error) {
      setMessage("Aktualisierung fehlgeschlagen");
    }
  };

  const fetchPassword = async () => {
    try {
      const response = await axios.get("http://localhost:5001/getOnePassword", {
        withCredentials: true,
        params: {
          pwId: id,
        },
      });
      setCategory(response.data.category);
      setLink(response.data.link);
      setUsername(response.data.username);
      setPassword(response.data.password);
    } catch (error) {
      console.error("Fehler beim Holen der Passwörter:", error);
    }
  };

  useEffect(() => {
    fetchPassword();
  }, []);

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
        <Nav
          title="Daten aktualisieren"
          setLoggedIn={setLoggedIn}
          home={true}
        />
        <Box component="form" sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Kategorie</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              label="Kategorie hinzufügen"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value={"Websites"}>Websites</MenuItem>
              <MenuItem value={"Software-Lizenzen"}>Software-Lizenzen</MenuItem>
              <MenuItem value={"Bank"}>Bank</MenuItem>
              <MenuItem value={"E-Mail-Konten"}>E-Mail-Konten</MenuItem>
              <MenuItem value={"Soziale Medien"}>Soziale Medien</MenuItem>
              <MenuItem value={"WLAN-Passwörter"}>WLAN-Passwörter</MenuItem>
              <MenuItem value={"Identitäten"}>Identitäten</MenuItem>
              <MenuItem value={"Sicherheitsfragen"}>Sicherheitsfragen</MenuItem>
              <MenuItem value={"Notizen"}>Notizen</MenuItem>
              <MenuItem value={"Telefonnummern"}>Telefonnummern</MenuItem>
              <MenuItem value={"Arbeitskonten"}>Arbeitskonten</MenuItem>
              <MenuItem value={"Streaming-Dienste"}>Streaming-Dienste</MenuItem>
              <MenuItem value={"Gesundheitskonten"}>Gesundheitskonten</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            name="link"
            label="Neuer Link"
            id="password"
            autoComplete="current-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            id="username"
            label="Neuer Benutzername"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            id="outlined-adornment-password"
            label="Neues Passwort"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
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
            onClick={handleUpdate}
          >
            Aktualisieren
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: "red",
              color: "white",
              "&:hover": { backgroundColor: "darkred" },
            }}
            onClick={() => {
              navigate("/password-manager");
            }}
          >
            Abbrechen
          </Button>
          {message && <Typography color="error">{message}</Typography>}
        </Box>
      </Box>
    </Container>
  );
};

export default UpdateProfile;
