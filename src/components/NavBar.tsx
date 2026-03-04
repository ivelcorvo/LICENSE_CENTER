import { useState } from "react";
import { NavLink } from "react-router"

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "fa-solid fa-chart-line" },
  { name: "Licenças", path: "/licenses", icon: "fa-solid fa-key" },
  { name: "Clientes", path: "/clients", icon: "fa-solid fa-users" },
];

const NavBar = () => {

  const [isOpen, setIsOpen] = useState<Boolean>(false)

  return (
    <aside className={`bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0 ${isOpen ? "w-64" : "w-20"}`}>

      <button
        onClick={()=>{setIsOpen(!isOpen)}}
        className="absolute -right-3 top-10 bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center border border-zinc-800 cursor-pointer hover:bg-emerald-500 transition-colors z-50"
      >
        <i className={`fa-solid ${isOpen ? "fa-chevron-left" : "fa-chevron-right"} text-[10px]`}></i>
      </button>

      {/* ========================================================================================================= */}
      {/* Logo */}
      <div className={`p-6 overflow-hidden whitespace-nowrap ${!isOpen && "text-center"}`}>
        <h2 className="text-emerald-500 font-bold text-xl flex items-center gap-3">
          <i className="fa-solid fa-shield-halved min-w-6"></i>
          {isOpen && <span>LICENSE.sys</span>}
        </h2>
      </div>

      {/* ========================================================================================================= */}
      {/* Navegação */}
      <nav className="flex-1 px-4 py-2 overflow-hidden" aria-label="Navegação Principal">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                title={!isOpen ? item.name : ""} // Tooltip quando fechado
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 font-medium whitespace-nowrap ${
                    isActive 
                      ? "bg-emerald-600/10 text-emerald-500" 
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`
                }
              >
                <div className="w-6 text-center text-lg">
                  <i className={item.icon}></i>
                </div>
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer / Configurações */}
      {/* <div className="p-4 border-t border-zinc-800">
        <button className="flex items-center gap-4 px-4 py-3 w-full text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer">
          <div className="w-6 text-center text-lg">
            <i className="fa-solid fa-gear"></i>
          </div>
          <span className="font-medium">Configurações</span>
        </button>
      </div> */}
    </aside>
  );
}

export default NavBar