import { useState } from 'react';
import axios from 'axios';
import { useAasStore } from '../store/useAasStore';

export const useAasApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAasEnvironment = useAasStore((state) => state.setAasEnvironment);

  const generateAas = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/api/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAasEnvironment(response.data.aas_json);
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const errorMsg = e.response?.data?.message || e.message || 'AAS 생성 실패';
        setError(errorMsg);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('알 수 없는 에러가 발생했습니다.');
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { generateAas, loading, error };
};
