// src/components/PasswordManager.tsx
import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function createData(link: string, username: string, password: string) {
  return { link, username, password };
}

const rows = [
  createData("google.com", "fabian", "hjer"),
  createData("abc.com", "fabian", "ergerg"),
  createData("cdf.com", "fabian", "erg"),
  createData("web.com", "fabian", "rthrytjh"),
  createData("123.com", "fabian", "hjurtbh"),
];

const PasswordManager: React.FC = () => {
  const navigate = useNavigate();
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: string]: boolean;
  }>({});

  const togglePasswordVisibility = (link: string) => {
    setVisiblePasswords((prevState) => ({
      ...prevState,
      [link]: !prevState[link],
    }));
  };

  const maskPassword = (password: string) => {
    return "•".repeat(password.length);
  };

  return (
    <div>
      <h1>Passwort-Manager</h1>
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
            {rows.map((row, index) => (
              <TableRow
                key={row.link}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.link}
                </TableCell>
                <TableCell align="right">{row.username}</TableCell>
                <TableCell align="right">
                  {visiblePasswords[row.link]
                    ? row.password
                    : maskPassword(row.password)}
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
