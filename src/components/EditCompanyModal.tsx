import { useState, useEffect } from "react";

import { type Company } from "../hooks/useCompanies";

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onUpdate: (id: string, data: Partial<Company>) => Promise<void>;
}

export function EditCompanyModal({ isOpen, onClose, company, onUpdate }: EditCompanyModalProps) {

  const [formData, setFormData] = useState({
    cnpj: "",
    corporateName: "",
    email: "",
    licenseKey: "", 
    expiresAt: "",  
    status: "" as "active" | "suspended" | ""
  });

  const [isSaving, setIsSaving] = useState(false);

  // Efeito para preencher o formulário quando o modal abre com uma empresa selecionada
  useEffect(() => {
    if (company && isOpen) {

      // Converte o Timestamp para String YYYY-MM-DD
      let dateString = "";
      if (company.expiresAt) {
        const date = company.expiresAt.toDate ? company.expiresAt.toDate() : new Date(company.expiresAt.seconds * 1000);
        dateString = date.toISOString().split('T')[0];
      }

      setFormData({
        cnpj: company.cnpj,
        corporateName: company.corporateName,
        email: company.email,
        licenseKey: company.licenseKey || "",
        expiresAt: dateString,          
        status: company.status       
      });
    }
  }, [company, isOpen]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company) return;

    const selectedDate = new Date(formData.expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas os dias

    // REGRA: Não pode ativar se a data for menor ou igual a hoje
    if (formData.status === 'active' && selectedDate <= today) {
      alert("Para ativar a unidade, a data de expiração deve ser maior que a data atual.");
      return;
    }

    // REGRA: Pode desativar mesmo que a data seja futura (segue normal para o update)
    setIsSaving(true);
    try {
      const dataToUpdate: Partial<Company> = {
        cnpj: formData.cnpj,
        corporateName: formData.corporateName,
        email: formData.email,
        licenseKey: formData.licenseKey,
        status: formData.status as "active" | "suspended",
        // Converte string "2026-03-06" para objeto Date
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null 
      };
      await onUpdate(company.id, dataToUpdate);
      onClose();
    } catch (err) {
      alert("Erro ao atualizar dados.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-md">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Editar Unidade</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Razão Social</label>
              <input 
                required
                value={formData.corporateName}
                onChange={(e) => setFormData({...formData, corporateName: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CNPJ</label>
                <input 
                  required
                  value={formData.cnpj}
                  onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">E-mail</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          <hr className="border-zinc-800 my-2" />

          {/* Seção de Licença */}
          <div className="space-y-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Chave da Licença</label>
              <input 
                value={formData.licenseKey}
                onChange={(e) => setFormData({...formData, licenseKey: e.target.value.toUpperCase()})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-emerald-400 font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Data de Expiração</label>
              <input 
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 outline-none focus:ring-2 focus:ring-rose-500/20 color-scheme-dark"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status da Unidade</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as "active" | "suspended"})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              >
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl transition-all cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50">
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}