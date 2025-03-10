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
import MapPage from './Pages/MapPage';
import ClubClassPage from './Pages/ClubClassPage';
import CPage from './Pages/CPage';
import VerifyPage from './Pages/VerifyPage';
import CalendarPage from './Pages/CalendarPage';

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
    path: "/c/:cName",
    element: <CPage/>
  },
  {
    path: "/verify/:token/email/:email",
    element: <VerifyPage/>
  },
  {
    path: "/Map",
    element: <MapPage/>
  },
  {
    path: "/calendar",
    element: <CalendarPage/>
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalProvider>
     <RouterProvider router={router} />
    </GlobalProvider>
  </React.StrictMode>
);

