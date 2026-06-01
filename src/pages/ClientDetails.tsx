import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useClientDetails } from "../hooks/useClientDetails";
import { useCompanies } from "../hooks/useCompanies";
import { useToast } from "../contexts/ToastContext";

import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { TableShell } from "../components/TableShell";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { EditCompanyModal } from "../components/EditCompanyModal";

import { type Company } from "../hooks/useCompanies";

const formatDate = (timestamp: any) => {
  if (!timestamp) return "---";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export default function ClientDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { clientName, loading: loadingClient } = useClientDetails(id);
  const { companies, loading: loadingCompanies, isSubmitting, addCompany, updateCompany } = useCompanies(id);
  const { showToast } = useToast();

  const [cnpj, setCnpj]                   = useState("");
  const [corporateName, setCorporateName] = useState("");
  const [email, setEmail]                 = useState("");

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(
      e.target.value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCompany({ cnpj, corporateName, email });
      setCnpj("");
      setCorporateName("");
      setEmail("");
    } catch (err) {
      showToast("Erro ao cadastrar unidade.", "error");
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit]     = useState<Company | null>(null);

  const handleOpenEditModal = (company: Company) => {
    setCompanyToEdit(company);
    setIsEditModalOpen(true);
  };

  if (loadingClient) return <LoadingSpinner message="Carregando dados do grupo..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ========================================================================================================= */}
      {/* Botão Voltar */}
      <button
        onClick={() => navigate("/clients")}
        className="text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-2 text-sm cursor-pointer group"
      >
        <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
        Voltar para Grupos
      </button>

      {/* ========================================================================================================= */}
      {/* Cabeçalho */}
      <PageHeader
        title={clientName}
        subtitle="Gestão de Unidades e CNPJs"
      />

      {/* ========================================================================================================= */}
      {/* Formulário de Nova Unidade */}
      <SectionCard>
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-plus-circle text-emerald-500"></i>
          Adicionar Nova Unidade
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">CNPJ</label>
            <input
              required
              value={cnpj}
              onChange={handleCnpjChange}
              placeholder="00.000.000/0000-00"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Razão Social</label>
            <input
              required
              value={corporateName}
              onChange={(e) => setCorporateName(e.target.value)}
              placeholder="Ex: Posto Silva Ltda"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">E-mail de Contato</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="financeiro@empresa.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
          <button
            disabled={isSubmitting}
            className="md:col-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Salvando..." : "Cadastrar Unidade"}
          </button>
        </form>
      </SectionCard>

      {/* ========================================================================================================= */}
      {/* Tabela de Unidades */}
      <SectionCard className="overflow-hidden p-0">
        <TableShell columns={["Empresa / CNPJ", "Chave da Licença", "Expiração", "Status", "Ações"]}>
          {loadingCompanies ? (
            <tr>
              <td colSpan={5}>
                <LoadingSpinner message="Carregando unidades..." />
              </td>
            </tr>
          ) : companies.length === 0 ? (
            <EmptyState message="Nenhuma unidade vinculada a este grupo." />
          ) : (
            companies.map(company => (
              <tr key={company.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-zinc-200 font-semibold whitespace-nowrap">{company.corporateName}</span>
                    <span className="text-xs text-zinc-500 font-mono whitespace-nowrap">{company.cnpj}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="bg-zinc-950 border border-zinc-800 px-3 py-1 rounded text-xs font-mono text-emerald-400 whitespace-nowrap">
                    {company.licenseKey || 'SEM CHAVE'}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-zinc-400">
                  {formatDate(company.expiresAt)}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={company.status} />
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center gap-4">
                    {company.licenseKey && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(company.licenseKey!);
                          showToast("Chave copiada!", "success");
                        }}
                        className="text-zinc-500 hover:text-emerald-500 transition-colors cursor-pointer"
                        title="Copiar Chave"
                      >
                        <i className="fa-solid fa-copy"></i>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(company)}
                      className="text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer"
                      title="Editar Unidade"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                  </div>
                </td>

              </tr>
            ))
          )}
        </TableShell>
      </SectionCard>

      {/* ========================================================================================================= */}
      {/* Modal de edição */}
      <EditCompanyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        company={companyToEdit}
        onUpdate={updateCompany}
      />

    </div>
  );
}