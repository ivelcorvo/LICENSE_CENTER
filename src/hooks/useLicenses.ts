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
  deleteDoc
} from 'firebase/firestore';

export interface License {
  id: string;
  key: string;
  status: 'active' | 'expired';
  createdAt: any;
}

export function useLicenses(customerId: string, companyId: string) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading]   = useState(true);

  // Caminho da subcoleção: customers > {cId} > companies > {coId} > licenses
  const licensesRef = collection(db, "customers", customerId, "companies", companyId, "licenses");

  useEffect(() => {
    const q = query(licensesRef, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as License[];
      setLicenses(data);
      setLoading(false);
    });
    return () => unsub();
  }, [customerId, companyId]);

  // ===============================================================================================
  // GERAR CHAVA ALEATÓRIA
  const generateLicense = async () => {
    const newKey = Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + 
                   Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      await addDoc(licensesRef, {
        key: newKey,
        status: 'active',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Erro ao gerar licença:", error);
    }
  };

  // ===============================================================================================
  // ALTERAR STATUS DA LICENÇA
  const toggleLicenseStatus = async (licenseId: string, currentStatus: string) => {
    const newStatus     = currentStatus === 'active' ? 'expired' : 'active';
    const licenseDocRef = doc(db, "customers", customerId, "companies", companyId, "licenses", licenseId);
    
    try {
      await updateDoc(licenseDocRef, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar status da licença:", error);
    }
  };

  // ===============================================================================================
  // EXCLUÍ LICENÇA
  const deleteLicense = async (licenseId: string) => {
    const licenseDocRef = doc(db, "customers", customerId, "companies", companyId, "licenses", licenseId);
    try {
      await deleteDoc(licenseDocRef);
    } catch (error) {
      console.error("Erro ao deletar licença:", error);
    }
  };

  return { 
    licenses, 
    loading, 
    generateLicense, 
    toggleLicenseStatus,
    deleteLicense,
  };

}