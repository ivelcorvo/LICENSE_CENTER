import { useState, useEffect } from 'react';
import { db } from '../lib/firebase_config';
import { 
  collection, 
  onSnapshot, 
  collectionGroup, 
  query 
} from 'firebase/firestore';

/**
 * HOOK: useDashboardStats
 * Objetivo: Centralizar os contadores globais do sistema.
 * Lógica: Pega todas as empresas e filtra por data/status no cliente para economizar leituras.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalCompanies: 0,
    activeLicenses: 0,
    expired: 0,        // Já venceram
    expiring24h: 0,    // Vencem hoje ou amanhã
    expiringWeek: 0    // Vencem nos próximos 7 dias
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 0. verificação de expiração das lisenças
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    now.setHours(0,0,0,0); // Zerar as horas para comparações precisas
    tomorrow.setHours(23,59,59,999);
    nextWeek.setHours(23,59,59,999);

    // 1. Contador de Grupos
    const unsubGroups = onSnapshot(collection(db, "customers"), (snap) => {
      const groupCount = snap.size;

      // 2. Busca Global de Unidades (Sem filtro de status para poder contar tudo)
      const qAllCompanies = query(collectionGroup(db, "companies"));
      
      const unsubAllComp = onSnapshot(qAllCompanies, (compSnap) => {
        // Mapeamos os dados uma única vez para evitar repetição no processamento
        const allDocs = compSnap.docs.map(d => ({
          status: d.data().status,
          expDate: d.data().expiresAt?.toDate()
        }));

        setStats({
          totalGroups: groupCount,
          totalCompanies: compSnap.size,
          // Filtros realizados no JavaScript (Memória)
          activeLicenses: allDocs.filter(d => d.status === 'active').length,
          
          expired: allDocs.filter(d => 
            d.status === 'suspended' && d.expDate < now
          ).length,
          
          expiring24h: allDocs.filter(d => 
            d.status === 'active' && d.expDate >= now && d.expDate <= tomorrow
          ).length,
          
          // expiringWeek: allDocs.filter(d => 
          //   d.status === 'active' && d.expDate > tomorrow && d.expDate <= nextWeek
          // ).length
          expiringWeek: allDocs.filter(d => 
            d.expDate >= now && d.expDate <= nextWeek
          ).length
        });

        setLoading(false);
      });

      return () => unsubAllComp();
    });

    return () => unsubGroups();
  }, []);

  return { stats, loading };
}

/** * Isenção de Índice para a coleção 'companies'
 * 1. Acesse o Console do Firebase -> Firestore Database -> Índices -> Automático.
 * 2. Adicionar isenção: ID da coleção: 'companies' | Campo: 'status'.
 * 3. Escopo: Grupo de coleções.
 * 4. Ative Crescente/Decrescente e Salve.
 */