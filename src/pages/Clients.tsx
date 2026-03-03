import { useState } from "react";
import { useNavigate } from "react-router";
import { useCustomers } from "../hooks/useCustomers";

export default function Clients() {
  const [nickname, setNickname] = useState("");
  const { customers, loading, isSubmitting, createCustomer } = useCustomers();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(nickname);
      setNickname(""); // Limpa o input após o sucesso
    } catch (err) {
      // O erro já é logado no hook, mas aqui você poderia disparar um toast
      alert("Erro ao cadastrar o grupo.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ========================================================================================================= */}
      {/* Cabeçalho da Página */}      
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Clientes (Grupos)
        </h1>
        <p className="text-zinc-400 text-sm">
          Cadastre e gerencie os grupos empresariais para vincular suas unidades e CNPJs.
        </p>
      </div>

      {/* ========================================================================================================= */}
      {/* Card do Formulário de Cadastro */}
      <section className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label 
              htmlFor="nickname" 
              className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1"
            >
              Apelido do Grupo / Cliente
            </label>
            <input 
              id="nickname"
              type="text" 
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}              
              placeholder="Ex: Rede de Postos Silva"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
            />
          </div>
          <button 
            disabled={isSubmitting || !nickname.trim()}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold px-8 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            {isSubmitting ? (
              <i className="fa-solid fa-spinner animate-spin"></i>
            ) : (
              <>
                <i className="fa-solid fa-plus text-xs"></i>
                Criar Grupo
              </>
            )}
          </button>
        </form>
      </section>

      {/* ========================================================================================================= */}
      {/* Tabela de Listagem */}
      <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-950/50 text-zinc-500 text-[11px] uppercase tracking-widest border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-bold">Informações do Grupo</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-3">
                      <i className="fa-solid fa-circle-notch animate-spin text-2xl text-emerald-500"></i>
                      <span className="text-sm font-medium">Sincronizando com o banco de dados...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-zinc-600 italic">
                    Nenhum grupo encontrado.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-emerald-500/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                          <i className="fa-solid fa-folder-tree"></i>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-200 font-semibold tracking-wide">
                            {customer.nickname}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono uppercase">
                            UID: {customer.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/clients/${customer.id}`)}
                        className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-sm font-bold cursor-pointer transition-all pr-2 hover:pr-0"
                      >
                        Gerenciar Unidades 
                        <i className="fa-solid fa-chevron-right text-[10px]"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}