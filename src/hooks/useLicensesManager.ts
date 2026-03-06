import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase_config';
import { 
  collection, 
  onSnapshot, 
  collectionGroup, 
  query, 
  doc, 
  writeBatch 
} from 'firebase/firestore';
import { type Company } from './useCompanies';

interface GroupedLicenses {
  [customerId: string]: {
    customerName: string;
    companies: Company[];
  };
}

export function useLicensesManager() {
  const [groupedData, setGroupedData]   = useState<GroupedLicenses>({});
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isUpdating, setIsUpdating]     = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    
    // Listener de Clientes para mapear nomes aos IDs
    const unsubCustomers = onSnapshot(collection(db, "customers"), 
      (custSnap) => {
        const customerMap: Record<string, string> = {};
        custSnap.forEach(d => { customerMap[d.id] = d.data().nickname; });

        // Listener Global de Unidades
        const qCompanies = query(collectionGroup(db, "companies"));
        const unsubCompanies = onSnapshot(qCompanies, 
          (compSnap) => {
            const list = compSnap.docs.map(d => ({
              id: d.id,
              ...d.data(),
              customerId: d.ref.parent.parent?.id  // extrai o ID do Grupo "escalando" as pastas do Firebase de baixo para cima.
            })) as unknown as Company[];

            setAllCompanies(list);

            // const grouped = list.reduce((acc, company) => { ... }, {} as GroupedLicenses);
            const grouped = list.reduce((acc, company) => {
              const cid = company.customerId;
              if (!cid) return acc;
              if (!acc[cid]) {
                acc[cid] = { 
                  customerName: customerMap[cid] || "Carregando...", 
                  companies: [] 
                };
              }
              acc[cid].companies.push(company);
              return acc;
            }, {} as GroupedLicenses);

            setGroupedData(grouped);
            setLoading(false);
          },
          (err) => {
            console.error("Erro ao carregar unidades:", err);
            setError("Falha ao sincronizar dados das unidades.");
          }
        );

        return () => unsubCompanies();
      },
      (err) => {
        console.error("Erro ao carregar clientes:", err);
        setError("Falha ao sincronizar dados dos clientes.");
      }
    );

    return () => unsubCustomers();
  }, []);

  // ==================================================================================
  // ATUALIZAÇÃO 
  const updateBatch = useCallback(async (targets: Company[], data: Partial<Company>) => {

    if (targets.length === 0) return;
    
    setIsUpdating(true);
    setError(null);
    const batch = writeBatch(db);

    try {
      targets.forEach(comp => {
        if (!comp.customerId || !comp.id) throw new Error(`Dados inválidos para a unidade: ${comp.corporateName}`);
        
        const docRef = doc(db, `customers/${comp.customerId}/companies/${comp.id}`);
        batch.update(docRef, {
          ...data,
          updatedAt: new Date() 
        });
      });

      await batch.commit();
      return { success: true };
    } catch (err: any) {
      console.error("Erro na atualização em lote:", err);
      setError(err.message || "Erro ao processar atualização.");
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // ==================================================================================s
  // Helpers específicos para a UI
  const updateSingle = (company: Company, data: Partial<Company>) => updateBatch([company], data);
  const updateGroup  = (companies: Company[], data: Partial<Company>) => updateBatch(companies, data);
  const updateGlobal = (data: Partial<Company>) => updateBatch(allCompanies, data);

  return { 
    groupedData, 
    allCompanies, 
    updateSingle, 
    updateGroup, 
    updateGlobal, 
    loading, 
    isUpdating, 
    error 
  };
}