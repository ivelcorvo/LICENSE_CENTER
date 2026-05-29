interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Carregando..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <i className="fa-solid fa-circle-notch animate-spin text-2xl text-emerald-500"></i>
      <span className="text-sm font-medium text-zinc-500">{message}</span>
    </div>
  );
}