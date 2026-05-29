interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  colorClass: string;
  description: string;
}

export function StatCard({ title, value, icon, colorClass, description }: StatCardProps) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${colorClass}`}>
          <i className={`${icon} text-xl`}></i>
        </div>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{title}</span>
      </div>
      <p className="text-4xl font-black text-white">{value}</p>
      <p className="text-zinc-500 text-xs mt-2 italic">{description}</p>
    </div>
  );
}