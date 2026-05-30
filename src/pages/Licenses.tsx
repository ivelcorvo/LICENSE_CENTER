import { useState } from 'react';
import { useLicensesManager } from '../hooks/useLicensesManager';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function LicensesPage() {
  const {
    groupedData,
    updateSingle,
    updateGroup,
    updateGlobal,
    loading,
    isUpdating,
    error
  } = useLicensesManager();

  const [globalStatus, setGlobalStatus] = useState<'active' | 'suspended'>('active');
  const [globalDate, setGlobalDate]     = useState('');

  const handleGlobalUpdate = () => {
    if (!globalDate) {
      alert("ERRO: Para uma atualização global, você deve selecionar uma data de expiração obrigatória.");
      return;
    }

    const [year, month, day] = globalDate.split('-').map(Number);
    const dateToSave = new Date(year, month - 1, day);

    const statusText    = globalStatus === 'active' ? 'ATIVAR' : 'SUSPENDER';
    const dataFormatada = dateToSave.toLocaleDateString('pt-BR');

    const mensagem = `⚠️ ATENÇÃO: Você está prestes a ${statusText} TODAS as unidades do sistema com vencimento em ${dataFormatada}.\n\nEsta ação afetará todos os clientes cadastrados. Deseja continuar?`;

    if (window.confirm(mensagem)) {
      updateGlobal({
        status: globalStatus,
        expiresAt: dateToSave
      });
    }
  };

  if (loading) return <LoadingSpinner message="Carregando dados do sistema..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ========================================================================================================= */}
      {/* Cabeçalho */}
      <PageHeader
        title="Gestão de Licenciamento"
        subtitle="Controle global e por grupos de unidades"
        icon="fa-solid fa-shield-halved"
      />

      {/* ========================================================================================================= */}
      {/* ALTERAR | TODOS */}
      <SectionCard className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
        <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-6">Alterar Todos</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Alterar Status Geral</label>
            <select
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer"
              value={globalStatus}
              onChange={(e) => setGlobalStatus(e.target.value as 'active' | 'suspended')}
            >
              <option value="active">Ativar Todas as Unidades</option>
              <option value="suspended">Suspender Todas as Unidades</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-rose-500 uppercase ml-1">Nova Data de Expiração</label>
            <input
              type="date"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all color-scheme-dark"
              value={globalDate}
              onChange={(e) => setGlobalDate(e.target.value)}
            />
          </div>

          <button
            disabled={isUpdating}
            onClick={handleGlobalUpdate}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
          >
            {isUpdating
              ? <i className="fa-solid fa-spinner fa-spin"></i>
              : <i className="fa-solid fa-bolt"></i>
            }
            EXECUTAR GLOBALMENTE
          </button>
        </div>
      </SectionCard>

      {/* ========================================================================================================= */}
      {/* Mensagem de erro */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm animate-in slide-in-from-top-2">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
        </div>
      )}

      {/* ========================================================================================================= */}
      {/* ALTERAR | POR GRUPO */}
      <div className="space-y-6">
        {Object.entries(groupedData).map(([customerId, group]) => (

          <div key={customerId} className="overflow-x-auto rounded-2xl border border-zinc-800">
            <div className="bg-zinc-900/40 min-w-[600px]">

              {/* Header do Grupo */}
              <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                    <i className="fa-solid fa-users text-emerald-500"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{group.customerName || "Carregando..."}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {group.companies.length} Unidades sob gestão
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateGroup(group.companies, { status: 'active' })}
                    className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-check"></i> ATIVAR GRUPO
                  </button>
                  <button
                    onClick={() => updateGroup(group.companies, { status: 'suspended' })}
                    className="text-[10px] font-bold bg-zinc-800/50 text-zinc-400 border cursor-pointer border-zinc-700 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-ban"></i> SUSPENDER GRUPO
                  </button>
                </div>
              </div>

              {/* ALTERAR | UNIDADE */}
              <div className="divide-y divide-zinc-800/50">
                {group.companies.map((company) => (
                  <div key={company.id} className="p-5 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <StatusBadge status={company.status} variant="dot" />
                      <div>
                        <p className="text-zinc-200 font-semibold">{company.corporateName}</p>
                        <p className="text-xs text-zinc-500 font-mono">{company.cnpj}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">

                      {/* Seletor de Status Individual */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Status</label>
                        <select
                          value={company.status}
                          onChange={(e) => updateSingle(company, { status: e.target.value as 'active' | 'suspended' })}
                          className={`text-xs font-bold bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer ${company.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}
                        >
                          <option value="active">Ativo</option>
                          <option value="suspended">Suspenso</option>
                        </select>
                      </div>

                      {/* Expiração Individual */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-rose-400 uppercase ml-1 tracking-wider">Expiração</label>
                        <div className="flex items-center gap-3 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 focus-within:border-emerald-500/50 transition-all">
                          <input
                            type="date"
                            className="bg-transparent text-xs outline-none border-none p-0 w-28 text-zinc-400 font-medium color-scheme-dark"
                            value={(() => {
                              if (!company.expiresAt) return '';
                              const d = company.expiresAt.toDate ? company.expiresAt.toDate() : new Date(company.expiresAt.seconds * 1000);
                              const y = d.getFullYear();
                              const m = String(d.getMonth() + 1).padStart(2, '0');
                              const day = String(d.getDate()).padStart(2, '0');
                              return `${y}-${m}-${day}`;
                            })()}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) return;
                              const [y, m, d] = val.split('-').map(Number);
                              updateSingle(company, { expiresAt: new Date(y, m - 1, d) });
                            }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        ))}
      </div>

    </div>
  );
}