import React, { useState } from 'react';
import { X, Github, ArrowUpRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CommitModal = ({ isOpen, onClose, projectId }) => {
  const [message, setMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsCommitting(true);
    try {
      await api.post('/github/commit', {
        projectId,
        message: message.trim()
      });
      toast.success('Changes committed and pushed to GitHub!');
      setMessage('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to commit and push');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Github size={20} /> Commit & Push
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <p className="text-sm text-gray-400 mb-4">
            Enter a commit message. Your changes will be committed and pushed to the linked GitHub repository.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Commit Message
            </label>
            <textarea
              autoFocus
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Fix bug in file tree rendering"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm text-gray-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCommitting || !message.trim()}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isCommitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ArrowUpRight size={16} /> Push Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommitModal;
