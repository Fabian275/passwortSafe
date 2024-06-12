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

interface Props {
  setLoggedIn: Dispatch<SetStateAction<boolean>>;
  title: string;
  home?: boolean;
}

const Nav = (props: Props) => {
  const navigate = useNavigate();
  const { setLoggedIn, title, home } = props;
  const logout = () => {
    localStorage.removeItem("authToken");
    setLoggedIn(false);
    navigate("/");
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
