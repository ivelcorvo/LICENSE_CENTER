import { useLicenses } from "../hooks/useLicenses";

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  companyId: string;
  companyName: string;
}

export function LicenseModal({ isOpen, onClose, customerId, companyId, companyName }: LicenseModalProps) {
  const { licenses, loading, generateLicense, deleteLicense, toggleLicenseStatus } = useLicenses(customerId, companyId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Chave copiada!"); // Depois podemos trocar por um Toast mais bonito
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        
        {/* ========================================================================================================= */}        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Gerenciar Licenças</h2>
            <p className="text-zinc-500 text-sm">{companyName}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* ========================================================================================================= */}
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">Chaves Geradas</h3>
            <button 
              onClick={generateLicense}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-plus"></i>
              Gerar Nova Chave
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-center py-10 text-zinc-600">Carregando licenças...</p>
            ) : licenses.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-xl">
                <i className="fa-solid fa-key text-zinc-800 text-3xl mb-2"></i>
                <p className="text-zinc-600 italic text-sm">Nenhuma licença gerada para esta unidade.</p>
              </div>
            ) : (
              licenses.map((license) => (

                <div key={license.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => copyToClipboard(license.key)}
                      className="text-zinc-600 hover:text-emerald-500 transition-colors cursor-pointer"
                      title="Copiar Chave"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                    <div className="flex flex-col gap-1">
                      <span className="text-emerald-500 font-mono font-bold tracking-wider">{license.key}</span>
                      <span className="text-[10px] text-zinc-600 uppercase">Gerada em: {license.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Botão de Alternar Status */}
                    <button 
                      onClick={() => toggleLicenseStatus(license.id, license.status)}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase cursor-pointer transition-all ${
                        license.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                      }`}
                    >
                      {license.status === 'active' ? 'Ativa' : 'Expirada'}
                    </button>
                    
                    <button 
                      onClick={() => deleteLicense(license.id)}
                      className="text-zinc-800 hover:text-rose-600 transition-colors cursor-pointer ml-2"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================================================================================= */}
        {/* Footer */}
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 text-right">
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm font-semibold px-4 py-2 cursor-pointer">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}