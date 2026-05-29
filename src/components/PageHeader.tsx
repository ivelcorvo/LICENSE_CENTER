interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
        {icon && <i className={`${icon} text-emerald-500 text-2xl`}></i>}
        {title}
      </h1>
      <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>
    </div>
  );
}