import { useState, useEffect } from 'react';
import { APIClient, APIError } from '@/lib/api';

interface UseAPIOptions {
  immediate?: boolean;
}

interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAPI<T>(
  apiCall: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAPIOptions = {}
) {
  const { immediate = true } = options;
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, deps);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('architectai_token');
    if (token) {
      // Verify token and get user info
      APIClient.getUserProfile()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('architectai_token');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await APIClient.login({ email, password });
    setUser(result.user);
    setIsAuthenticated(true);
    return result;
  };

  const logout = async () => {
    try {
      await APIClient.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
}
