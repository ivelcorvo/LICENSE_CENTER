interface EmptyStateProps {
  message: string;
  icon?: string;
}

export function EmptyState({ message, icon = "fa-solid fa-inbox" }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <i className={`${icon} text-2xl text-zinc-700`}></i>
          <span className="text-sm text-zinc-600 italic">{message}</span>
        </div>
      </td>
    </tr>
  );
}