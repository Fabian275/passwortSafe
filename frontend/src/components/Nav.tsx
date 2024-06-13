import { Cookie } from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  CssBaseline,
} from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Props {
  setLoggedIn: Dispatch<SetStateAction<boolean>>;
  title: string;
  home?: boolean;
}

const Nav = (props: Props) => {
  const navigate = useNavigate();
  const { setLoggedIn, title, home } = props;
  const logout = async () => {
    try {
      // Sende eine Anfrage an den Server, um das Token-Cookie zu löschen
      await axios.post(
        "http://localhost:5001/logout",
        {},
        { withCredentials: true }
      );

      // Lösche das Token-Cookie auf dem Client
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("authToken");
      setLoggedIn(false);
      navigate("/");
      // Umleitung auf die Login-Seite
    } catch (error) {
      console.error("Logout fehlgeschlagen:", error);
    }
  };
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            sx={{ mr: 2, display: { sm: "none" } }}
          ></IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            {title}
          </Typography>
          {home ? (
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Button
                key="Logout"
                sx={{ color: "#fff" }}
                onClick={() => {
                  navigate("/password-manager");
                }}
              >
                Home
              </Button>
            </Box>
          ) : (
            ""
          )}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button key="Logout" sx={{ color: "#fff" }} onClick={logout}>
              Abmelden
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Nav;
