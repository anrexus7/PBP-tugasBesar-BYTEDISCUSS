import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Register from "../pages/Register";
import QuestionPage from "../pages/QuestionPage";
import AnswerPage from "../pages/AnswerPage";
import MainPage from "../pages/index";
import ProfilePage from "../pages/ProfilePage";
import EditProfile from "../pages/EditProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />,
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
    path: "/me",
    element: <ProfilePage />,
  },
  {
    path: "/editProfile",
    element: <EditProfile />,
  },
  {
    path: "/questions/new",
    element: <QuestionPage />, 
  },
  {
    path: "/questions/:id",
    element: <AnswerPage />,
  },
  {
    path: "/mainPage",
    element: <MainPage />,
  },
]);