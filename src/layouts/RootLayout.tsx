import { Outlet } from "react-router";
import NavBar from "../components/NavBar";
import { ToastProvider } from "../contexts/ToastContext";

export default function RootLayout(){
  return(
    <ToastProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-300">      
        <NavBar />
        <main className="flex flex-col h-screen overflow-y-auto">
          <section className="p-8 max-w-(--size-7xl) w-full mx-auto">
            <Outlet />
          </section>
        </main>
      </div>
    </ToastProvider>
  );
};