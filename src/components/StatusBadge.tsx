interface StatusBadgeProps {
  status: 'active' | 'suspended';
  variant?: 'badge' | 'dot';
}

export function StatusBadge({ status, variant = 'badge' }: StatusBadgeProps) {
  
  if (variant === 'dot') {
    return (
      <div className={`w-2.5 h-2.5 rounded-full ${
        status === 'active' 
          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
          : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
      }`} />
    );
  }

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
      status === 'active' 
        ? 'bg-emerald-500/10 text-emerald-500' 
        : 'bg-rose-500/10 text-rose-500'
    }`}>
      {status === 'active' ? 'Ativo' : 'Suspenso'}
    </span>
  );
}