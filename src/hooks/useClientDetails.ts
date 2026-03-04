import { useState, useEffect } from 'react';
import { db } from '../lib/firebase_config';
import { doc, getDoc } from 'firebase/firestore';

export function useClientDetails(id: string | undefined) {
  const [clientName, setClientName] = useState("");
  const [loading, setLoading]       = useState<Boolean>(true);

  useEffect(() => {
    async function getClient() {
      
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Criamos uma referência direta ao documento do cliente
        const docRef  = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Se o documento existir, pegamos o apelido (nickname)
          setClientName(docSnap.data().nickname);
        } else {
          console.warn("Nenhum grupo encontrado com este ID");
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do cliente:", err);
      } finally {
        setLoading(false);
      }
    }

    getClient();

  }, [id]);

  return { 
    clientName, 
    loading 
  };
  
}