import jwt_decode from "jwt-decode";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    const decoded = jwt_decode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("authToken");
      return false;
    }
    return true;
  } catch (error) {
    localStorage.removeItem("authToken");
    return false;
  }
};
