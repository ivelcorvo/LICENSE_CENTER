import { Outlet } from "react-router";
import NavBar from "../components/NavBar";

export default function RootLayout(){
  return(

    // <>
    //   <NavBar></NavBar>
    //   <div className="bg-gray-950 text-gray-300 min-h-screen flex">
    //     <main className="flex flex-col flex-1 justify-center items-center px-4 py-8">
    //       <section>
    //         <Outlet />
    //       </section>
    //     </main>
    //   </div>  
    // </>
    
   <div className="flex min-h-screen bg-zinc-950 text-zinc-300">      
      <NavBar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <section className="p-8 max-w-(--size-7xl) w-full mx-auto">
          <Outlet />
        </section>
      </main>
    </div> 

  );
};