import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Register from "../pages/register";
import Me from "../pages/me";
import Home from "../pages/home";
import EditProfile from "../pages/editProfile";
import QuestionList from "../pages/question/questionList";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/Home" replace />, // Redirect to login by default
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
    {
        path : "/Home",
        element : <Home />,
    },
    {
      path : "/questions",
      element : <QuestionList />,
    }
]);