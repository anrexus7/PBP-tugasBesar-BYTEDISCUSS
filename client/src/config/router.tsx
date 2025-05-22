import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Register from "../pages/register";
import Me from "../pages/me";
import EditProfile from "../pages/editProfile";
import QuestionPage from "../pages/question";
import QuestionList from "../pages/questionList";
import AnswerPage from "../pages/answer";
import MainPage from "../pages/mainPage";

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
  {
    path: "/questions",
    element: <QuestionList />,
  },
  {
    path: "/questions/new",
    element: <QuestionPage />, 
  },
  {
    path: "/questions/:id", // detail per pertanyaan
    element: <AnswerPage />,
  },
  {
    path: "/mainPage",
    element: <MainPage />,
  },
]);