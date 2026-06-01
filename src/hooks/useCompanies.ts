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
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { isLicenseExpired } from '../utils/licenseStatus';

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

    const companiesRef = collection(db, "customers", customerId, "companies");
    const q = query(companiesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {

      // 1. Mapeia os dados crus do banco para o estado local
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Company[];

      setCompanies(data);
      setLoading(false);

      // 2. Sincronização separada: atualiza no banco as licenças que estão
      //    'active' mas com data vencida. Usa writeBatch para fazer tudo
      //    em uma única operação atômica, sem misturar com o mapeamento acima.
      const now = new Date();
      const expiradas = snapshot.docs.filter(docSnap => {
        const d = docSnap.data();
        return d.status === 'active' && isLicenseExpired(d.expiresAt, now);
      });

      if (expiradas.length > 0) {
        const batch = writeBatch(db);
        expiradas.forEach(docSnap => {
          batch.update(docSnap.ref, { status: 'suspended', updatedAt: new Date() });
        });
        batch.commit().catch(err =>
          console.error('Erro ao sincronizar status de licenças vencidas:', err)
        );
      }

    }, (error) => {
      console.error("Erro ao buscar empresas:", error);
      setLoading(false);
    });

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
      expirationDate.setHours(0, 0, 0, 0);

      const companiesRef = collection(db, "customers", customerId, "companies");
      await addDoc(companiesRef, {
        ...companyData,
        status: 'active',
        licenseKey: generateKey(),
        expiresAt: expirationDate,
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