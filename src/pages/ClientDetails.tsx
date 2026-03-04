import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useClientDetails } from "../hooks/useClientDetails";
import { useCompanies } from "../hooks/useCompanies";

import { LicenseModal } from "../components/LicenseModal";
import { EditCompanyModal } from "../components/EditCompanyModal";

import { type Company } from "../hooks/useCompanies";

export default function ClientDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { clientName, loading: loadingClient } = useClientDetails(id);
  const { companies, loading: loadingCompanies, isSubmitting, addCompany, updateCompany } = useCompanies(id);

  // Estados para o formulário
  const [cnpj, setCnpj]                   = useState("");
  const [corporateName, setCorporateName] = useState("");
  const [email, setEmail]                 = useState("");

  // Função simples para máscara de CNPJ (00.000.000/0000-00)
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
    if (value.length > 14) value = value.slice(0, 14);
    
    value = value.replace(/^(\dt{2})(\dt{3})(\dt{3})(\dt{4})(\dt{2}).*/, "$1.$2.$3/$4-$5");
    // Nota: Essa regex é simplificada. Para uma máscara perfeita enquanto digita:
    setCnpj(e.target.value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").slice(0, 18));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCompany({ cnpj, corporateName, email });
      // Limpa os campos após sucesso
      setCnpj("");
      setCorporateName("");
      setEmail("");
    } catch (err) {
      alert("Erro ao cadastrar unidade.");
    }
  };


  // ===========================================================================
  // MODAL | status licença
    const [isModalOpen, setIsModalOpen]         = useState<boolean>(false);
    const [selectedCompany, setSelectedCompany] = useState<{id: string, name: string} | null>(null);
    const handleOpenModal = (id: string, name: string) => {
      setSelectedCompany({ id, name });
      setIsModalOpen(true);
    }

  // ===========================================================================
  // MODAL | status licença
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
    const handleOpenEditModal = (company: Company) => {
      setCompanyToEdit(company);
      setIsEditModalOpen(true);
    };


  if (loadingClient) return <div className="p-8 text-zinc-500">Carregando dados do grupo...</div>;

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
      {/* Título do Grupo */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{clientName}</h1>
        <p className="text-zinc-500 text-sm mt-1 uppercase font-mono">Gestão de Unidades e CNPJs</p>
      </div>

      {/* ========================================================================================================= */}
      {/* Formulário de Nova Unidade */}
      <section className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
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
          <div className="space-y-2 md:col-span-1">
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
      </section>

      {/* ========================================================================================================= */}
      {/* Tabela de Unidades cadastradas (Onde as licenças aparecerão) */}
      <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 text-zinc-500 text-[10px] uppercase tracking-widest border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">Empresa / CNPJ</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loadingCompanies ? (
              <tr><td colSpan={4} className="p-10 text-center text-zinc-600">Carregando unidades...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-zinc-600 italic">Nenhuma unidade vinculada a este grupo.</td></tr>
            ) : (
              companies.map(company => (
                <tr key={company.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-200 font-semibold">{company.corporateName}</span>
                      <span className="text-xs text-zinc-500 font-mono">{company.cnpj}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{company.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${company.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {company.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">                     
                    <div className="flex items-center gap-4 justify-end">
                      {/* Botão de Licenças */}
                      <button 
                        onClick={() => handleOpenModal(company.id, company.corporateName)}
                        className="text-emerald-500 hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Licenças <i className="fa-solid fa-key ml-1"></i>
                      </button>

                      {/*  Botão de Editar */}
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
          </tbody>
        </table>
      </section>

      {/* ========================================================================================================= */}
      {/* MODAL | LICENÇA */}
      {selectedCompany && (
        <LicenseModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customerId={id!} 
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
        />
      )}

      {/* ========================================================================================================= */}
      {/* MODAL | editar empresas */}
      <EditCompanyModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        company={companyToEdit}
        onUpdate={updateCompany} // Função que vem do useCompanies
      />

    </div>
  );
}