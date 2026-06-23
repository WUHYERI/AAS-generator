import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAasStore } from '../store/useAasStore';
import { apiUrl } from '../lib/api';

export interface GenerationProgress {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  percent: number;
  message: string;
  error?: string | null;
}

export const useAasApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const activeJobId = useRef<string | null>(null);
  const pollingTimer = useRef<number | null>(null);

  const setAasResult = useAasStore((state) => state.setAasResult);

  const stopPolling = useCallback(() => {
    if (pollingTimer.current !== null) {
      window.clearInterval(pollingTimer.current);
      pollingTimer.current = null;
    }
  }, []);

  const checkProgress = useCallback(
    async (jobId = activeJobId.current) => {
      if (!jobId) return;
      try {
        const response = await axios.get<GenerationProgress>(
          apiUrl(`/api/generate/${jobId}/progress`),
        );
        setProgress(response.data);
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          stopPolling();
        }
      } catch (progressError) {
        // The first poll can arrive before the server has registered the job.
        if (!axios.isAxiosError(progressError) || progressError.response?.status !== 404) {
          console.warn('AAS 생성 진행률을 확인하지 못했습니다.', progressError);
        }
      }
    },
    [stopPolling],
  );

  useEffect(() => stopPolling, [stopPolling]);

  const generateAas = async (formData: FormData) => {
    stopPolling();
    const jobId = crypto.randomUUID();
    activeJobId.current = jobId;
    setLoading(true);
    setError(null);
    setProgress({
      job_id: jobId,
      status: 'queued',
      percent: 0,
      message: '생성 요청을 서버에 전달했습니다.',
    });
    formData.append('generationId', jobId);
    pollingTimer.current = window.setInterval(() => {
      void checkProgress(jobId);
    }, 1000);
    void checkProgress(jobId);

    try {
      const response = await axios.post(apiUrl('/api/generate'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAasResult(response.data.aas_json, response.data.id, response.data.mapping_plan);
      setProgress({
        job_id: jobId,
        status: 'completed',
        percent: 100,
        message: 'AAS 생성이 완료되었습니다.',
      });
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const errorMsg =
          e.response?.data?.detail || e.response?.data?.message || e.message || 'AAS 생성 실패';
        setError(errorMsg);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('알 수 없는 에러가 발생했습니다.');
      }
      throw e;
    } finally {
      stopPolling();
      setLoading(false);
    }
  };

  return { generateAas, loading, error, progress, checkProgress };
};
