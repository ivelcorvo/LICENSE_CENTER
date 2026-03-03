import { useParams, useNavigate } from "react-router";

export default function ClientDetails() {
  const { id }   = useParams(); // Pega o ID que vem na URL
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate("/clients")}
        className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 text-sm cursor-pointer"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Voltar para lista
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white">Gerenciar Unidades</h1>
        <p className="text-zinc-400">ID do Grupo: <span className="font-mono text-emerald-500">{id}</span></p>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl text-center">
        <p className="text-zinc-500 italic">Em breve: Lista de CNPJs e empresas deste grupo.</p>
      </div>
    </div>
  );
}