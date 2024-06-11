import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:5002/getPasswords", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      <h1>Passwort-Manager</h1> <button onClick={logout}>Abmelden</button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Link</TableCell>
              <TableCell align="right">Username</TableCell>
              <TableCell align="right">Password</TableCell>
              <TableCell align="right">Anpassen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {passwords.map((row, index) => (
              <TableRow
                key={row.link}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.link}
                </TableCell>
                <TableCell align="right">{row.username}</TableCell>
                <TableCell align="right">
                  {visiblePasswords[row.link] ? row.password : maskPassword()}
                  <Button onClick={() => togglePasswordVisibility(row.link)}>
                    {visiblePasswords[row.link] ? "Hide" : "Show"}
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <button
                    onClick={() => navigate(`/passwordUpdate?id=${index}`)}
                  >
                    update
                  </button>
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
