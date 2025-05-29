import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Register from "../pages/register";
import QuestionPage from "../components/QuestionPage/QuestionPage";
import AnswerPage from "../pages/answer";
import MainPage from "../pages/mainPage";
import ProfilePage from "../components/ProfilePage/ProfilePage";
import EditProfile from "../components/EditProfile/EditProfile";

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