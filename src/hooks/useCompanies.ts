import { useState, useEffect } from 'react';
import { db } from '../lib/firebase_config';
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

export interface Company {
  id: string;
  cnpj: string;
  corporateName: string;
  email: string;
  status: 'active' | 'suspended';
  createdAt: any;
}

export function useCompanies(customerId: string | undefined) {
  const [companies, setCompanies]       = useState<Company[]>([]);  
  const [loading, setLoading]           = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {

    if (!customerId) return;

    // Acessamos a subcoleção: customers -> {idDoGrupo} -> companies
    const companiesRef = collection(db, "customers", customerId, "companies");
    const q = query(companiesRef, orderBy("createdAt", "desc"));

    // Escuta os dados em tempo real
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
      
      setCompanies(data);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar empresas:", error);
      setLoading(false);
    });

    // Limpa a conexão quando saímos da página
    return () => unsub();
  }, [customerId]);

  // Função para adicionar uma nova empresa ao grupo
  const addCompany = async (companyData: Omit<Company, 'id' | 'status' | 'createdAt'>) => {
    if (!customerId) return;
    
    setIsSubmitting(true);
    try {
      const companiesRef = collection(db, "customers", customerId, "companies");
      await addDoc(companiesRef, {
        ...companyData,
        status: 'active', // Toda empresa nova começa ativa
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Erro ao adicionar empresa:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    companies, 
    loading, 
    isSubmitting, 
    addCompany 
  };

}