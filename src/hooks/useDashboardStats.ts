import { useState, useEffect } from 'react';
import { db } from '../lib/firebase_config';
import { collection, onSnapshot, collectionGroup, query, where } from 'firebase/firestore';

export function useDashboardStats() {

  const [stats, setStats] = useState({
    totalGroups: 0,
    totalCompanies: 0,
    activeLicenses: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Conta Grupos
    const unsubGroups = onSnapshot(collection(db, "customers"), (snap) => {
      const groupCount = snap.size;
      
      // 2. Conta Empresas e Licenças usando collectionGroup
      // Nota: Para usar collectionGroup você precisará criar índices no Console do Firebase se houver filtros.
      const qCompanies = query(collectionGroup(db, "companies"));
      const qLicenses  = query(collectionGroup(db, "licenses"), where("status", "==", "active"));

      const unsubComp = onSnapshot(qCompanies, (compSnap) => {
        const compCount = compSnap.size;
        
        const unsubLic = onSnapshot(qLicenses, (licSnap) => {
          setStats({
            totalGroups: groupCount,
            totalCompanies: compCount,
            activeLicenses: licSnap.size
          });
          setLoading(false);
        });
        return () => unsubLic();
      });
      return () => unsubComp();
    });

    return () => unsubGroups();
  }, []);

  return { 
    stats, 
    loading 
  };

}


/**
 * COMO LIBERAR BUSCAS GLOBAIS (COLLECTION GROUP):
 * * 1. O QUE É COLLECTION GROUP?
 * É quando o código busca em TODAS as subcoleções com o mesmo nome (ex: 'licenses') 
 * de todos os clientes ao mesmo tempo, ignorando quem é o "pai" (customer) delas.
 * * 2. POR QUE PRECISA DE CONFIGURAÇÃO?
 * O Firebase bloqueia filtros (where) em buscas globais por padrão. Você precisa 
 * autorizar que o campo (ex: 'status') seja indexado para o sistema inteiro.
 * * 3. PASSO A PASSO REAL NO CONSOLE:
 * - Vá em Firestore -> Índices -> Aba 'Automático'.
 * - Clique no botão 'Adicionar isenção'.
 * - Código da coleção: Digite 'licenses'.
 * - Caminho do campo: Digite 'status'.
 * - Escopo da consulta: Marque apenas 'Grupo de coleções'.
 * - Clique em Avançar e ative as chaves 'Crescente' e 'Decrescente'.
 * - Clique em Salvar e aguarde o status ficar 'Ativo'.
 * * 4. CONCLUSÃO:
 * Mesmo que o link de erro te leve para o console, você deve conferir e preencher 
 * esses campos manualmente para garantir que a isenção seja criada no lugar certo.
 */