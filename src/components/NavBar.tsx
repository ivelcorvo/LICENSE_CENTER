import { useState } from "react";
import { NavLink } from "react-router"

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "fa-solid fa-chart-line" },
  { name: "Licenças", path: "/licenses", icon: "fa-solid fa-key" },
  { name: "Clientes", path: "/clients", icon: "fa-solid fa-users" },
  { name: "Seed", path: "/seed", icon: "fa-solid fa-flask" }, // gerar dados simulados no banco 
];

const NavBar = () => {

  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <>
      {/* Botão de toggle — sempre fixo na tela */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-2 top-2 z-50 bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center border border-zinc-800 cursor-pointer hover:bg-emerald-500 transition-colors shadow-lg"
      >
        <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"} text-[11px]`}></i>
      </button>

      {/* Overlay — aparece atrás do menu quando aberto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-zinc-950/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu lateral */}
      <aside className={`fixed left-0 top-0 z-40 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300 overflow-hidden ${isOpen ? "w-64" : "w-0"}`}>

        {/* Logo */}
        <div className="p-6 whitespace-nowrap mt-2">
          <h2 className="text-emerald-500 font-bold text-xl flex items-center gap-3">
            <i className="fa-solid fa-shield-halved min-w-6"></i>
            <span>LICENSE CENTER</span>
          </h2>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-4 py-2 overflow-hidden" aria-label="Navegação Principal">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsOpen(false)}
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
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

      </aside>
    </>
  );
}

export default NavBar