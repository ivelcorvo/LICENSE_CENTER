import { useDashboardStats } from "../hooks/useDashboardStats";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function Dashboard() {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return <LoadingSpinner message="Carregando indicadores..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ========================================================================================================= */}
      {/* Cabeçalho */}
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do ecossistema de licenças"
      />

      {/* ########################################################################################################################################### */}
      {/* Grid de Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Grupos"
          value={stats.totalGroups}
          icon="fa-solid fa-users-rectangle"
          colorClass="bg-blue-500/10 text-blue-500"
          description="Clientes corporativos cadastrados"
        />
        <StatCard
          title="Unidades"
          value={stats.totalCompanies}
          icon="fa-solid fa-building"
          colorClass="bg-purple-500/10 text-purple-500"
          description="CNPJs ativos sob gestão"
        />
        <StatCard
          title="Licenças"
          value={stats.activeLicenses}
          icon="fa-solid fa-key"
          colorClass="bg-emerald-500/10 text-emerald-500"
          description="Chaves em operação no momento"
        />
      </div>

      {/* ########################################################################################################################################### */}
      {/* Alertas de Expiração - Visíveis apenas se houver urgência */}
      {(stats.expired > 0 || stats.expiring24h > 0 || stats.expiringWeek > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ========================================================================================================= */}
          {/* Card: Já Expiradas */}
          <div className={`p-6 rounded-2xl border transition-all ${
            stats.expired > 0
              ? 'bg-rose-500/5 border-rose-500/20 text-rose-500'
              : 'bg-zinc-900/20 border-zinc-800 opacity-40'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <i className="fa-solid fa-skull-crossbones"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest">Expiradas</span>
            </div>
            <p className="text-3xl font-black">{stats.expired}</p>
            <p className="text-zinc-500 text-[10px] mt-1 uppercase font-bold tracking-tighter">Licença expirada</p>
          </div>

          {/* ========================================================================================================= */}
          {/* Card: Vencem em 24h */}
          <div className={`p-6 rounded-2xl border transition-all ${
            stats.expiring24h > 0
              ? 'bg-orange-500/5 border-orange-500/20 text-orange-500'
              : 'bg-zinc-900/20 border-zinc-800 opacity-40'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <i className="fa-solid fa-hourglass-half"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest">Vencem em 24h</span>
            </div>
            <p className="text-3xl font-black">{stats.expiring24h}</p>
            <p className="text-zinc-500 text-[10px] mt-1 uppercase font-bold tracking-tighter">Urgência de renovação</p>
          </div>

          {/* ========================================================================================================= */}
          {/* Card: Vencem na semana */}
          <div className={`p-6 rounded-2xl border transition-all ${
            stats.expiringWeek > 0
              ? 'bg-amber-500/5 border-amber-500/20 text-amber-500'
              : 'bg-zinc-900/20 border-zinc-800 opacity-40'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <i className="fa-solid fa-calendar-day"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest">Vencem na semana</span>
            </div>
            <p className="text-3xl font-black">{stats.expiringWeek}</p>
            <p className="text-zinc-500 text-[10px] mt-1 uppercase font-bold tracking-tighter">Planejamento semanal</p>
          </div>

        </div>
      )}

      {/* ########################################################################################################################################### */}
      {/* Seção de Gráficos e Atividade Recente */}
      <div className="bg-zinc-900/20 border border-zinc-800/50 p-8 rounded-2xl border-dashed flex flex-col items-center justify-center gap-3">
        <i className="fa-solid fa-chart-line text-zinc-800 text-4xl"></i>
        <p className="text-zinc-600 text-sm italic text-center max-w-xs">
          Análise de crescimento e logs de ativação serão exibidos aqui conforme o volume de dados aumentar.
        </p>
      </div>

    </div>
  );
}
