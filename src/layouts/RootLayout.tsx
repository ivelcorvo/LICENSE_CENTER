import { Outlet } from "react-router";

export default function RootLayout(){
  return(

    <div className="bg-gray-950 text-gray-300 min-h-screen flex">
      <main className="flex flex-col flex-1 justify-center items-center px-4 py-8">
        <section>
          <Outlet />
        </section>
      </main>
    </div>      

  );
};