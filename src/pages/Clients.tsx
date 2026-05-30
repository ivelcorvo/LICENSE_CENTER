import { useState } from "react";
import { useNavigate } from "react-router";
import { useCustomers } from "../hooks/useCustomers";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { TableShell } from "../components/TableShell";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";

export default function Clients() {
  const [nickname, setNickname] = useState("");
  const { customers, loading, isSubmitting, createCustomer } = useCustomers();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(nickname);
      setNickname("");
    } catch (err) {
      alert("Erro ao cadastrar o grupo.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ========================================================================================================= */}
      {/* Cabeçalho da Página */}
      <PageHeader
        title="Clientes (Grupos)"
        subtitle="Cadastre e gerencie os grupos empresariais para vincular suas unidades e CNPJs."
      />

      {/* ========================================================================================================= */}
      {/* Card do Formulário de Cadastro */}
      <SectionCard>
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
      </SectionCard>

      {/* ========================================================================================================= */}
      {/* Tabela de Listagem */}
      <SectionCard className="overflow-hidden p-0">
        <TableShell columns={["Informações do Grupo", "Ações"]}>
          {loading ? (
            <tr>
              <td colSpan={2}>
                <LoadingSpinner message="Sincronizando com o banco de dados..." />
              </td>
            </tr>
          ) : customers.length === 0 ? (
            <EmptyState message="Nenhum grupo encontrado." />
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
                      <span className="text-zinc-200 font-semibold tracking-wide whitespace-nowrap">
                        {customer.nickname}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-mono uppercase whitespace-nowrap">
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
        </TableShell>
      </SectionCard>

    </div>
  );
}
