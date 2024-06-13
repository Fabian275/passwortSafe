import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Button,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Password, Visibility, VisibilityOff } from "@mui/icons-material";
import Nav from "./Nav";

interface PasswordData {
  link: string;
  username: string;
  password: string;
}

interface Props {
  setLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const PasswordManager = (props: Props) => {
  const { setLoggedIn } = props;
  const navigate = useNavigate();
  const [link, setLink] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwords, setPasswords] = useState<PasswordData[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const fetchPasswords = async () => {
    try {
      const response = await axios.get("http://localhost:5001/getPasswords", {
        withCredentials: true,
      });
      setPasswords(response.data);
    } catch (error) {
      console.error("Fehler beim Holen der Passwörter:", error);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  const togglePasswordVisibility = (link: string) => {
    setVisiblePasswords((prevState) => ({
      ...prevState,
      [link]: !prevState[link],
    }));
  };

  const maskPassword = () => {
    return "•••••••••••";
  };

  const addNewPW = async (e: any) => {
    console.log(e);
    try {
      if (link !== "" && username !== "" && password !== "") {
        const response = await axios.post(
          "http://localhost:5001/addNewPassword",
          {
            link,
            username,
            password,
          },
          { withCredentials: true }
        );
        fetchPasswords();
        setLink("");
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Nav title={"Passwort-Manager"} setLoggedIn={setLoggedIn} />
      <h1>Passwort-Manager</h1>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Link</TableCell>
              <TableCell>Benutzername</TableCell>
              <TableCell>Passwort</TableCell>
              <TableCell>Anpassen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              key="newEntry"
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <TextField
                  id="outlined-basic"
                  label="Link hinzufügen"
                  variant="outlined"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </TableCell>
              <TableCell component="th" scope="row">
                <TextField
                  id="outlined-basic"
                  label="Benutzername hinzufügen"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </TableCell>
              <TableCell component="th" scope="row">
                <TextField
                  id="outlined-adornment-password"
                  label="Passwort hinzufügen"
                  variant="outlined"
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
              </TableCell>
              <TableCell component="th" scope="row">
                <Button variant="contained" type="button" onClick={addNewPW}>
                  Hinzufügen
                </Button>
              </TableCell>
            </TableRow>
            {passwords.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.link}
                </TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>
                  {visiblePasswords[row.link] ? row.password : maskPassword()}
                  <Button onClick={() => togglePasswordVisibility(row.link)}>
                    {visiblePasswords[row.link] ? "Verstecken" : "Zeigen"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/update-profile/${index}`)}
                  >
                    Ändern
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default PasswordManager;
