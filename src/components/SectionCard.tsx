interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <section className={`bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 ${className}`}>
      {children}
    </section>
  );
}