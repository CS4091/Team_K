import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import LandingPage from './Pages/LandingPage';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ViewPostPage from './Pages/ViewPostPage';
import { GlobalProvider } from './Context/GlobalContext';
import { CreatePage } from './Pages/CreatePage';
import UserPage from './Pages/UserPage';
import ClassPage from './Pages/ClassPage';
import ClubClassPage from './Pages/ClubClassPage';
import ClubPage from './Pages/ClubPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/post/:_id",
    element: <ViewPostPage />
  },
  {
    path: "/create",
    element: <CreatePage />
  },
  {
    path: "/createClass",
    element: <ClubClassPage />
  },
  {
    path: "/user/:userId",
    element: <UserPage/>
  },
  {
    path: "/class/:cName",
    element: <ClassPage />
  },
  {
    path: "/club/:cName",
    element: <ClubPage />
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalProvider>
     <RouterProvider router={router} />
    </GlobalProvider>
  </React.StrictMode>
);

