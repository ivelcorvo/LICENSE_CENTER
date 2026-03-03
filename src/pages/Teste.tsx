import { useEffect, useState } from "react";
import { 
  addDoc, 
  collection, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp 
} from "firebase/firestore";

import { db } from "../lib/firebase_config";

type License = {
  id: string;
  key: string;
  status: "active" | "suspended";
  createdAt?: unknown;
};

export default function Licenses() {
  const [items, setItems]     = useState<License[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const q  = query(
      collection(db, "licenses"),  // aponta para a coleção no Firestore.
      orderBy("createdAt", "desc")
    );    

    // onSnapshot(q, sucesso, erro)
      // Isso cria um listener em tempo real:
      // Assim que você abre a página, ele já faz uma leitura.
      // Se alguém inserir/editar/remover documentos dessa coleção, o Firestore envia uma atualização automaticamente.
      // Ele retorna uma função (unsub) que desliga esse listener.
    // snap é um “snapshot” (foto do resultado da consulta naquele momento).
      // snap.docs é um array com cada documento retornado.
      // d.id é o ID do documento (o Firestore não coloca isso dentro de data(), por isso a gente injeta manualmente).
      // d.data() é o conteúdo do documento (campos: key, status, createdAt etc).

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: License[] = snap.docs.map((d) => ({ // Para cada documento d, crie um objeto:
          id: d.id, // id: d.id
          ...(d.data() as Omit<License, "id">), // e “espalhe” (...) os campos do d.data() dentro do mesmo objeto
        }));
        setItems(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub(); // Isso é o cleanup do useEffect.
  }, []);

  async function createTestLicense() {
    const randomKey = `LIC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await addDoc(
      collection(db, "licenses"), 
      {
        key: randomKey,
        status: "active",
        createdAt: serverTimestamp(),
      }
    );
  }

  const testCreateLicense = async()=>{
    const randomkey = `lic-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    await addDoc(
      collection(db,"licenses"),
      {
        key: randomkey,
        status: "active",
        createdAt: serverTimestamp(),
      },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Licenças</h1>

        <button
          onClick={createTestLicense}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          + Criar licença teste
        </button>
      </div>

      <p className="mt-2 text-slate-300">
        Teste do Firestore: criar e listar documentos da coleção <span className="font-mono">licenses</span>.
      </p>

      <div className="mt-6">
        {loading ? (
          <div className="text-slate-300">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-slate-300">Nenhuma licença ainda.</div>
        ) : (
          <ul className="space-y-3">
            {items.map((x) => (
              <li key={x.id} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm">{x.key}</div>
                  <span
                    className={[
                      "text-xs font-semibold px-2 py-1 rounded-full",
                      x.status === "active" ? "bg-emerald-600/20 text-emerald-300" : "bg-rose-600/20 text-rose-300",
                    ].join(" ")}
                  >
                    {x.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-400">id: {x.id}</div>
              </li>
            ))}
          </ul>
        )}

        {loading ? (
          <div>carregar..</div>
        ) : items.length===0 ? (
          <div>nada</div>
        ) : (
          <ul>
            {items.map((x)=>(
              <li key={x.id}><div>{x.key}</div><span>{x.status}</span></li>
            ))}
          </ul>
        )} 

      </div>
    </div>
  );
}
