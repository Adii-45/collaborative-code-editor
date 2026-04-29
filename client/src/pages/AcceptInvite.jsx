import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Code2, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [projectId, setProjectId] = useState(null);
  
  // Use a ref to prevent double execution in React Strict Mode
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const acceptInvite = async () => {
      try {
        const { data } = await api.post(`/invite/${token}`);
        setProjectId(data.projectId);
        setStatus('success');
        toast.success(data.message || 'Successfully joined project');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Invalid or expired invite link');
      }
    };

    acceptInvite();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-[#21262d] p-3 rounded-2xl border border-[#30363d]">
            <Code2 size={40} className="text-blue-500" />
          </div>
        </div>

        {status === 'loading' && (
          <div className="py-8 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#30363d] border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying Invite...</h2>
            <p className="text-gray-400">Please wait while we set up your access.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You're in!</h2>
            <p className="text-gray-400 mb-8">You now have access to this project.</p>
            <button
              onClick={() => navigate(`/editor/${projectId}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              Open Project 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Invite Failed</h2>
            <p className="text-gray-400 mb-8">{errorMessage}</p>
            <Link
              to="/dashboard"
              className="w-full bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center inline-block"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
