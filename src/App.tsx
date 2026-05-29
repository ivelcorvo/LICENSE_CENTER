import './index.css';

import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router";

import RootLayout from './layouts/RootLayout';

import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Licenses from './pages/Licenses';
import Dashboard from './pages/Dashboard';
import Seed from './pages/Seed';

export default function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "licenses", element: <Licenses /> },
        { path: "clients", children: [
            { index: true, element: <Clients /> },
            { path: ":id", element: <ClientDetails /> }
          ]
        },
        { path: "seed", element: <Seed /> }, // apenas para renovar o banco com dados simulados
        { path: "*", element: <Navigate to="/dashboard" replace /> },
      ],
    },    
  ]);

  return <RouterProvider router={router} />;
};