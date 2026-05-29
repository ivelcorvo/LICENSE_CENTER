import { useState } from "react";
import { db } from "../lib/firebase_config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

// =============================================================================
// DADOS SIMULADOS
// =============================================================================

const grupos = [
  { nickname: "Grupo Oliveira" },
  { nickname: "Rede Posto Ipiranga" },
  { nickname: "Farmácias Bem Estar" },
];

// Função auxiliar: retorna uma data relativa a hoje
const dataRelativa = (dias: number): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  return d;
};

// Função auxiliar: gera chave de licença
const gerarChave = () =>
  Math.random().toString(36).substring(2, 6).toUpperCase() + "-" +
  Math.random().toString(36).substring(2, 6).toUpperCase() + "-" +
  Math.random().toString(36).substring(2, 6).toUpperCase();

// Unidades por grupo (índice 0, 1, 2 = índice do grupo acima)
const unidadesPorGrupo = [
  // ============================================================
  // Grupo Oliveira
  [
    {
      corporateName: "Oliveira Combustíveis Ltda",
      cnpj: "12.345.678/0001-90",
      email: "fiscal@oliveiracomb.com.br",
      status: "active",
      expiresAt: dataRelativa(75), // Ativa — vence em 75 dias
    },
    {
      corporateName: "Oliveira Transportes S.A.",
      cnpj: "12.345.678/0002-71",
      email: "financeiro@oliveiratrans.com.br",
      status: "active",
      expiresAt: dataRelativa(3), // Prestes a vencer — 3 dias
    },
    {
      corporateName: "Oliveira Logística ME",
      cnpj: "12.345.678/0003-52",
      email: "contato@oliveiralog.com.br",
      status: "suspended",
      expiresAt: dataRelativa(-15), // Suspensa — vencida há 15 dias
    },
    {
      corporateName: "Oliveira Holding Ltda",
      cnpj: "12.345.678/0004-33",
      email: "holding@oliveira.com.br",
      status: "active",
      expiresAt: dataRelativa(90), // Ativa — vence em 90 dias
    },
  ],

  // ============================================================
  // Rede Posto Ipiranga
  [
    {
      corporateName: "Posto Ipiranga Centro Ltda",
      cnpj: "98.765.432/0001-10",
      email: "centro@ipiranga.com.br",
      status: "active",
      expiresAt: dataRelativa(1), // Prestes a vencer — amanhã
    },
    {
      corporateName: "Posto Ipiranga Norte ME",
      cnpj: "98.765.432/0002-00",
      email: "norte@ipiranga.com.br",
      status: "active",
      expiresAt: dataRelativa(60), // Ativa — vence em 60 dias
    },
    {
      corporateName: "Posto Ipiranga Sul Ltda",
      cnpj: "98.765.432/0003-81",
      email: "sul@ipiranga.com.br",
      status: "suspended",
      expiresAt: dataRelativa(-30), // Suspensa — vencida há 30 dias
    },
    {
      corporateName: "Posto Ipiranga Leste S.A.",
      cnpj: "98.765.432/0004-62",
      email: "leste@ipiranga.com.br",
      status: "suspended",
      expiresAt: dataRelativa(45), // Suspensa manualmente — data futura
    },
    {
      corporateName: "Posto Ipiranga Oeste ME",
      cnpj: "98.765.432/0005-43",
      email: "oeste@ipiranga.com.br",
      status: "active",
      expiresAt: dataRelativa(0), // Vence hoje
    },
  ],

  // ============================================================
  // Farmácias Bem Estar
  [
    {
      corporateName: "Farmácia Bem Estar Matriz Ltda",
      cnpj: "55.444.333/0001-22",
      email: "matriz@bemestar.com.br",
      status: "active",
      expiresAt: dataRelativa(6), // Prestes a vencer — 6 dias
    },
    {
      corporateName: "Farmácia Bem Estar Filial 01",
      cnpj: "55.444.333/0002-03",
      email: "filial01@bemestar.com.br",
      status: "active",
      expiresAt: dataRelativa(80), // Ativa — vence em 80 dias
    },
    {
      corporateName: "Farmácia Bem Estar Filial 02",
      cnpj: "55.444.333/0003-84",
      email: "filial02@bemestar.com.br",
      status: "suspended",
      expiresAt: dataRelativa(-7), // Suspensa — vencida há 7 dias
    },
    {
      corporateName: "Farmácia Bem Estar Filial 03",
      cnpj: "55.444.333/0004-65",
      email: "filial03@bemestar.com.br",
      status: "suspended",
      expiresAt: dataRelativa(30), // Suspensa manualmente — data futura
    },
  ],
];

// =============================================================================
// COMPONENTE
// =============================================================================

export default function Seed() {
  const [log, setLog]         = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone]   = useState(false);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const handleSeed = async () => {
    if (!window.confirm("⚠️ ATENÇÃO: Isso vai APAGAR todos os dados do banco e recriar com dados simulados. Confirma?")) return;

    setIsRunning(true);
    setIsDone(false);
    setLog([]);

    try {

      // ===========================================================
      // 1. LIMPAR BANCO
      // ===========================================================
      addLog("🗑️  Limpando banco de dados...");

      const customersSnap = await getDocs(collection(db, "customers"));

      for (const customerDoc of customersSnap.docs) {
        const companiesSnap = await getDocs(
          collection(db, "customers", customerDoc.id, "companies")
        );
        for (const companyDoc of companiesSnap.docs) {
          await deleteDoc(doc(db, "customers", customerDoc.id, "companies", companyDoc.id));
        }
        await deleteDoc(doc(db, "customers", customerDoc.id));
      }

      addLog(`✅ ${customersSnap.size} grupos removidos.`);

      // ===========================================================
      // 2. REPOVOAR BANCO
      // ===========================================================
      addLog("🌱 Criando dados simulados...");

      for (let i = 0; i < grupos.length; i++) {
        const grupo = grupos[i];

        // Cria o grupo
        const grupoRef = await addDoc(collection(db, "customers"), {
          nickname: grupo.nickname,
          createdAt: serverTimestamp(),
        });

        addLog(`📁 Grupo criado: ${grupo.nickname}`);

        // Cria as unidades do grupo
        const unidades = unidadesPorGrupo[i];
        for (const unidade of unidades) {
          await addDoc(collection(db, "customers", grupoRef.id, "companies"), {
            corporateName: unidade.corporateName,
            cnpj:          unidade.cnpj,
            email:         unidade.email,
            status:        unidade.status,
            licenseKey:    gerarChave(),
            expiresAt:     Timestamp.fromDate(unidade.expiresAt),
            customerId:    grupoRef.id,
            createdAt:     serverTimestamp(),
          });
          addLog(`   └─ Unidade criada: ${unidade.corporateName} (${unidade.status} — vence em ${unidade.expiresAt.toLocaleDateString('pt-BR')})`);
        }
      }

      addLog("✅ Banco repovoado com sucesso!");
      setIsDone(true);

    } catch (err: any) {
      addLog(`❌ Erro: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <i className="fa-solid fa-flask text-amber-500 text-2xl"></i>
          Seed do Banco de Dados
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Limpa o banco e recria com dados simulados baseados na data atual.
        </p>
      </div>

      {/* Aviso */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm flex items-start gap-3">
        <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
        <span>
          Esta página é apenas para demonstração. Ao executar, <strong>todos os dados reais serão apagados</strong> e substituídos por dados simulados.
          Comente a rota <code className="font-mono bg-zinc-950 px-1 rounded">/seed</code> no <code className="font-mono bg-zinc-950 px-1 rounded">App.tsx</code> após o uso.
        </span>
      </div>

      {/* Botão */}
      <button
        onClick={handleSeed}
        disabled={isRunning}
        className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-3"
      >
        {isRunning
          ? <><i className="fa-solid fa-spinner fa-spin"></i> Executando...</>
          : <><i className="fa-solid fa-bolt"></i> Limpar e Repovoar Banco</>
        }
      </button>

      {/* Log de execução */}
      {log.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 font-mono text-sm space-y-1">
          {log.map((line, i) => (
            <p key={i} className={
              line.startsWith("❌") ? "text-rose-400" :
              line.startsWith("✅") ? "text-emerald-400" :
              line.startsWith("📁") ? "text-blue-400" :
              line.startsWith("   └─") ? "text-zinc-400" :
              "text-zinc-500"
            }>
              {line}
            </p>
          ))}
          {isDone && (
            <p className="text-emerald-400 font-bold pt-2 border-t border-zinc-800 mt-2">
              🎉 Concluído! Acesse o Dashboard para ver os dados.
            </p>
          )}
        </div>
      )}

    </div>
  );
}
