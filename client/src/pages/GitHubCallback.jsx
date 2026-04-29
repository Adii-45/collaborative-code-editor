import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Github, Loader2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GitHubCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('Connecting to GitHub...');
  const processedRef = useRef(false);

  useEffect(() => {
    const processCode = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      const params = new URLSearchParams(location.search);
      const code = params.get('code');

      if (!code) {
        toast.error('No authorization code found');
        navigate('/dashboard');
        return;
      }

      try {
        await api.post('/github/connect', { code });
        toast.success('GitHub connected successfully!');
        navigate('/dashboard');
      } catch (error) {
        setStatus('Failed to connect.');
        toast.error(error.response?.data?.message || 'Failed to connect to GitHub');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    processCode();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-[#161b22] p-4 rounded-full border border-[#30363d]">
          <Github size={48} className="text-white" />
        </div>
        <div className="flex items-center gap-2 text-xl font-medium">
          {status === 'Connecting to GitHub...' && <Loader2 className="animate-spin" size={24} />}
          {status}
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;
