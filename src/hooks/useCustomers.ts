import { useState, useEffect } from 'react';
import { db } from '../lib/firebase_config';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface Customer {
  id: string;
  nickname: string;
  createdAt: any;
}

export function useCustomers() {
  const [customers, setCustomers]       = useState<Customer[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================================================
  // LISTAGEM (Read)
  useEffect(() => {
    const q     = query(collection(db, "customers"), orderBy("nickname", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      setCustomers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // =====================================================================================
  // FUNÇÃO DE CRIAÇÃO (Write)
  const createCustomer = async (nickname: string) => {
    if (!nickname.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "customers"), {
        nickname: nickname,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error; // Repassa o erro para o componente tratar se quiser (ex: mostrar um toast)
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    customers, 
    loading, 
    isSubmitting, 
    createCustomer 
  };
}