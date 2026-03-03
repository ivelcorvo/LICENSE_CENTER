interface StatCardProps {
  title: string;
  value: string | number;
  icon: string; // Classe do Font Awesome
  colorClass: string; // Ex: text-emerald-500
}

export function StatCard({ title, value, icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 ${colorClass}`}>
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}