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
 * * NOTA SOBRE ÍNDICES:
 * 1. Acesse o Console do Firebase -> Firestore Database -> Índices -> Automático.
 * 2. Adicionar isenção: ID da coleção: 'companies' | Campo: 'status'.
 * 3. Escopo: Grupo de coleções.
 * 4. Ative Crescente/Decrescente e Salve.
 */

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalCompanies: 0,
    activeLicenses: 0,
    expired: 0,
    expiring24h: 0,
    expiringWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Definição precisa das janelas de tempo (Local 00:00:00)
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(now.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const nextWeekEnd = new Date(now);
    nextWeekEnd.setDate(now.getDate() + 7);
    nextWeekEnd.setHours(23, 59, 59, 999);

    // #### Listener | Grupos ####
    const unsubGroups = onSnapshot(collection(db, "customers"), (snap) => {
      const groupCount = snap.size;
      setStats(prev => ({ ...prev, totalGroups: groupCount }));
    });

    // #### Listener | Unidades (Collection Group) ####
    const qAllCompanies = query(collectionGroup(db, "companies"));
    const unsubAllComp = onSnapshot(qAllCompanies, (compSnap) => {
      const allDocs = compSnap.docs.map(d => ({
        status: d.data().status,
        expDate: d.data().expiresAt?.toDate() // Firebase já traz como Timestamp
      }));

      // Filtros em memória (mais rápido que múltiplas queries)
      setStats(prev => ({
        ...prev,
        totalCompanies: compSnap.size,
        activeLicenses: allDocs.filter(d => d.status === 'active').length,
        
        // Unidades que já estão suspensas por data retroativa
        expired: allDocs.filter(d => 
          d.status === 'suspended' && d.expDate < now
        ).length,
        
        // Ativas que vencem hoje ou amanhã
        expiring24h: allDocs.filter(d => 
          d.status === 'active' && d.expDate >= now && d.expDate <= tomorrowEnd
        ).length,
        
        // Ativas que vencem do terceiro dia até o sétimo (Exclusividade)
        expiringWeek: allDocs.filter(d => 
          d.status === 'active' && d.expDate > tomorrowEnd && d.expDate <= nextWeekEnd
        ).length
      }));
      setLoading(false);
    });

    // Limpeza correta dos dois ouvintes
    return () => {
      unsubGroups();
      unsubAllComp();
    };
  }, []);

  return { 
    stats, 
    loading 
  };

}