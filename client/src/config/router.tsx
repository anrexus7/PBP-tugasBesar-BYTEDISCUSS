import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Register from "../pages/register";
import Me from "../pages/me";
import EditProfile from "../pages/editProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />, // Redirect to login by default
  },
  {
    path: "/auth",
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
    {
        path : "/me",
        element : <Me />,
    },
    {
        path : "/editProfile",
        element : <EditProfile />,
    },
]);