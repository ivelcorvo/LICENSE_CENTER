import { useDashboardStats } from "../hooks/useDashboardStats";

export default function Dashboard() {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return <div className="p-8 text-zinc-500 animate-pulse">Carregando indicadores...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Visão geral do ecossistema de licenças</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ========================================================================================================= */}
        {/* Card: Total de Grupos */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-users-rectangle text-xl"></i>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Grupos</span>
          </div>
          <p className="text-4xl font-black text-white">{stats.totalGroups}</p>
          <p className="text-zinc-500 text-xs mt-2 italic">Clientes corporativos cadastrados</p>
        </div>

        {/* ========================================================================================================= */}
        {/* Card: Total de Unidades */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-building text-xl"></i>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Unidades</span>
          </div>
          <p className="text-4xl font-black text-white">{stats.totalCompanies}</p>
          <p className="text-zinc-500 text-xs mt-2 italic">CNPJs ativos sob gestão</p>
        </div>

        {/* ========================================================================================================= */}
        {/* Card: Licenças Ativas */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-key text-xl"></i>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Licenças</span>
          </div>
          <p className="text-4xl font-black text-emerald-500">{stats.activeLicenses}</p>
          <p className="text-zinc-500 text-xs mt-2 italic">Chaves em operação no momento</p>
        </div>
      </div>

      {/* ========================================================================================================= */}
      {/* Espaço para um futuro gráfico ou atividade recente */}
      <div className="bg-zinc-900/20 border border-zinc-800/50 p-8 rounded-2xl border-dashed flex flex-col items-center justify-center gap-3">
        <i className="fa-solid fa-chart-line text-zinc-800 text-4xl"></i>
        <p className="text-zinc-600 text-sm italic text-center max-w-xs">
          Análise de crescimento e logs de ativação serão exibidos aqui conforme o volume de dados aumentar.
        </p>
      </div>
      
    </div>
  );
}