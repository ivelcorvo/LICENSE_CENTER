import './index.css';

import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router";

import RootLayout from './layouts/RootLayout';

import Clients from './pages/Clients';
import Licenses from './pages/Licenses';
import Dashboard from './pages/Dashboard';

export default function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "licenses", element: <Licenses /> },
        { path: "clients", element: <Clients /> },
        { path: "*", element: <Navigate to="/dashboard" replace /> },
      ],
    },    
  ]);

  return <RouterProvider router={router} />;
};