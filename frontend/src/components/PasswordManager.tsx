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
  const [passwords, setPasswords] = useState<PasswordData[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  useEffect(() => {
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

  const logout = () => {
    localStorage.removeItem("authToken");
    setLoggedIn(false);
    navigate("/");
  };

  return (
    <div>
      <h1>Passwort-Manager</h1>
      <Button variant="contained" onClick={logout}>
        Abmelden
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Link</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Password</TableCell>
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
                />
              </TableCell>
              <TableCell component="th" scope="row">
                <TextField
                  id="outlined-basic"
                  label="Username hinzufügen"
                  variant="outlined"
                />
              </TableCell>
              <TableCell component="th" scope="row">
                <TextField
                  id="outlined-adornment-password"
                  label="Password"
                  variant="outlined"
                  type={showPassword ? "text" : "password"}
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
                <Button variant="contained">Hinzufügen</Button>
              </TableCell>
            </TableRow>
            {passwords.map((row, index) => (
              <TableRow
                key={row.link}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.link}
                </TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>
                  {visiblePasswords[row.link] ? row.password : maskPassword()}
                  <Button onClick={() => togglePasswordVisibility(row.link)}>
                    {visiblePasswords[row.link] ? "Hide" : "Show"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/passwordUpdate?id=${index}`)}
                  >
                    Update
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
