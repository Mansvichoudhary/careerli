import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

export interface Problem { id: string; title: string; description: string; created_at: string }

export const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchProblems = async () => {
    setLoading(true);
    try { setProblems(await apiRequest<Problem[]>('/problems')); } finally { setLoading(false); }
  };
  const createProblem = async (title: string, description: string) => { await apiRequest('/problems', 'POST', { title, description }); await fetchProblems(); };
  useEffect(() => { fetchProblems(); }, []);
  return { problems, loading, fetchProblems, createProblem };
};
