interface TableShellProps {
  columns: string[];
  children: React.ReactNode;
}

export function TableShell({ columns, children }: TableShellProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-zinc-950/50 text-zinc-500 text-[11px] uppercase tracking-widest border-b border-zinc-800">
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index} 
                className="px-6 py-4 font-bold"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {children}
        </tbody>
      </table>
    </div>
  );
}