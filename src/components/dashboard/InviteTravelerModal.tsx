import React, { useState, useEffect } from 'react';
import { X, Users, Copy, Check, Send } from 'lucide-react';

interface InviteTravelerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTraveler?: (name: string, role: string) => void;
}

export const InviteTravelerModal: React.FC<InviteTravelerModalProps> = ({
  isOpen,
  onClose,
  onAddTraveler,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Explorer');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !name.trim()) return;

    if (onAddTraveler) {
      onAddTraveler(name || email.split('@')[0], role);
    }
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setEmail('');
      setName('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 overflow-y-auto animate-fade-rise">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white border border-[#E7E5E2] rounded-[32px] p-6 sm:p-8 shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-instrument text-2xl text-black">Invite Travel Companion</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6F6F6F] hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-instrument text-3xl text-black">Invitation Dispatched</h4>
            <p className="text-xs font-inter text-[#6F6F6F] max-w-xs mx-auto">
              We've sent a collaborative studio pass to {email || name}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Companion Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram R."
                className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@example.com"
                className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Trip Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="Co-Planner">Co-Planner (Full Edit Permissions)</option>
                <option value="Explorer">Explorer (Can Add Notes & Votes)</option>
                <option value="Gastronomy Lead">Gastronomy Lead (Dining Reservations)</option>
                <option value="Viewer">Viewer (Read Only)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-full py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Collaboration Invite</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E7E5E2]" />
              <span className="flex-shrink mx-4 text-[10px] font-mono uppercase text-[#6F6F6F]">or share link</span>
              <div className="flex-grow border-t border-[#E7E5E2]" />
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full rounded-full py-3 border border-[#E7E5E2] hover:border-black text-xs font-mono text-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Workspace Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6F6F6F]" />
                  <span>Copy Direct Invite Link</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
