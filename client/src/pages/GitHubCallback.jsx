import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { githubLogin } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processLogin = async () => {
      console.log('GitHubCallback: Component mounted, extracting token from URL...');
      const token = searchParams.get('token');
      
      if (!token) {
        console.error('GitHubCallback: No token found in URL parameters.');
        setError('No authentication token received.');
        return;
      }

      console.log('GitHubCallback: Token received, passing to AuthContext...');
      try {
        await githubLogin(token);
        console.log('GitHubCallback: Authentication successful, redirecting to dashboard...');
        toast.success('Successfully logged in with GitHub!');
        navigate('/dashboard');
      } catch (err) {
        console.error('GitHubCallback: Login failed with error:', err);
        setError('Failed to fetch user profile. Please try again.');
        toast.error('GitHub login failed');
      }
    };

    processLogin();
  }, [searchParams, navigate, githubLogin]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="flex flex-col items-center bg-[#161b22] border border-[#30363d] rounded-xl p-8 max-w-sm w-full text-center">
        <Github size={48} className="text-white mb-6" />
        
        {error ? (
          <>
            <h2 className="text-xl font-bold text-red-400 mb-2">Authentication Failed</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white mb-2">Authenticating</h2>
            <p className="text-gray-400 mb-6">Completing GitHub sign in...</p>
            <Loader2 size={24} className="text-blue-500 animate-spin" />
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubCallback;
