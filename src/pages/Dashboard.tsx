import { StatCard } from "../components/StatCard";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">Bem-vindo de volta ao seu painel de controle.</p>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Licenças" 
          value="1,284" 
          icon="fa-solid fa-key" 
          colorClass="text-emerald-500" 
        />
        <StatCard 
          title="Clientes Ativos" 
          value="852" 
          icon="fa-solid fa-users" 
          colorClass="text-blue-500" 
        />
        <StatCard 
          title="Faturamento (Mês)" 
          value="R$ 12.450" 
          icon="fa-solid fa-money-bill-trend-up" 
          colorClass="text-purple-500" 
        />
        <StatCard 
          title="Alertas" 
          value="3" 
          icon="fa-solid fa-triangle-exclamation" 
          colorClass="text-rose-500" 
        />
      </div>

      {/* Área de conteúdo inferior (Exemplo de lista) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4 text-white">Atividade Recente</h2>
          <p className="text-zinc-500 text-sm">Nenhuma atividade registrada hoje.</p>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4 text-white">Status do Sistema</h2>
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm">API Firestore Online</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}