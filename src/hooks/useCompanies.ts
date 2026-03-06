import { useState, useEffect } from 'react';
import { db } from '../lib/firebase_config';
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  serverTimestamp,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';

export interface Company {
  id: string;
  cnpj: string;
  corporateName: string;
  email: string;
  status: 'active' | 'suspended';
  licenseKey?: string; 
  expiresAt?: any;
  customerId?: string;
  createdAt: any;
}

export function useCompanies(customerId: string | undefined) {
  const [companies, setCompanies]       = useState<Company[]>([]);  
  const [loading, setLoading]           = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função auxiliar para gerar uma chave aleatória (Ex: XXXX-XXXX-XXXX)
  const generateKey = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
           Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
           Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  useEffect(() => {

    if (!customerId) return;

    // Acessamos a subcoleção: customers -> {idDoGrupo} -> companies
    const companiesRef = collection(db, "customers", customerId, "companies");
    const q = query(companiesRef, orderBy("createdAt", "desc"));

    // Escuta os dados em tempo real
    const unsub = onSnapshot(q, (snapshot) => {

      const now = new Date();

      const data = snapshot.docs.map(docSnap => {
        const companyData = docSnap.data();
        const expiresAt = companyData.expiresAt?.toDate();
        
        // REGRA: Se a data ja expirou e ainda estiver "ativo", precisamos "desativar"
        if (companyData.status === 'active' && expiresAt && expiresAt < now) {
          // Atualiza o banco silenciosamente
          updateDoc(docSnap.ref, { status: 'suspended' });
          return { id: docSnap.id, ...companyData, status: 'suspended' };
        }

        return { id: docSnap.id, ...companyData };
      }) as Company[];
      
      setCompanies(data);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar empresas:", error);
      setLoading(false);
    });

    // Limpa a conexão quando saímos da página
    return () => unsub();
  }, [customerId]);

  // =========================================================================================
  // ADICIONA EMPRESA AO GRUPO
  const addCompany = async (companyData: Omit<Company, 'id' | 'status' | 'createdAt' | 'licenseKey' | 'expiresAt' >) => {
   
    if (!customerId) return;
    
    setIsSubmitting(true);
    try {

      // Cálculo de expiração: Agora + 24 horas (1 dia) |  APENAS PARA TESTE
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1);

      const companiesRef = collection(db, "customers", customerId, "companies");
      await addDoc(companiesRef, {
        ...companyData,
        status: 'active', // Toda empresa nova começa ativa
        licenseKey: generateKey(), // Chave gerada automaticamente
        expiresAt: expirationDate,  // Expira em 1 dia
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Erro ao adicionar empresa:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================================
  // EDITAR EMPRESA
  const updateCompany = async (companyId: string, newData: Partial<Company>) => {
   
    if (!customerId) return;

    const companyDocRef = doc(db, "customers", customerId, "companies", companyId);

    try {
      await updateDoc(companyDocRef, newData);
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      throw error;
    }
  };

  return { 
    companies, 
    loading, 
    isSubmitting, 
    addCompany,
    updateCompany 
  };

}