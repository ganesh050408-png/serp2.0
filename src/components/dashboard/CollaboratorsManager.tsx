import React, { useState } from 'react';
import { Users, UserPlus, Check, Trash2, Mail, Link as LinkIcon, Eye, Edit3, Crown } from 'lucide-react';
import { StoredJourney, JourneyCollaborator, CollaboratorRole, travelStorage } from '../../services/travelStorage';

interface CollaboratorsManagerProps {
  journey: StoredJourney;
  onUpdateJourney?: (updated: StoredJourney) => void;
  currentUserRole?: CollaboratorRole;
}

const ROLE_META: Record<CollaboratorRole, { title: string; desc: string; icon: any; bg: string }> = {
  owner: {
    title: 'Owner',
    desc: 'Full control: edit journey, manage members, bookings & finances.',
    icon: Crown,
    bg: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  editor: {
    title: 'Editor',
    desc: 'Can edit itinerary days, add curated activities & notes.',
    icon: Edit3,
    bg: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  viewer: {
    title: 'Viewer',
    desc: 'Read-only access: view itinerary, destination dossier & bookings.',
    icon: Eye,
    bg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
  },
};

export const CollaboratorsManager: React.FC<CollaboratorsManagerProps> = ({
  journey,
  onUpdateJourney,
  currentUserRole = 'owner',
}) => {
  const isOwner = currentUserRole === 'owner';
  const collaborators = journey.collaborators || [];

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>('editor');
  const [copiedLink, setCopiedLink] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Add collaborator
  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newCollab: JourneyCollaborator = {
      id: crypto.randomUUID ? crypto.randomUUID() : `collab_${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      avatar: inviteName.trim().charAt(0).toUpperCase(),
      joinedAt: new Date().toISOString(),
      status: 'active',
    };

    const updatedCollabs = [...collaborators, newCollab];
    const updated: StoredJourney = {
      ...journey,
      collaborators: updatedCollabs,
    };

    travelStorage.saveJourney(updated);
    if (onUpdateJourney) onUpdateJourney(updated);

    // Add journey notification
    travelStorage.addNotification({
      id: `notif_collab_${Date.now()}`,
      journeyId: journey.id,
      title: 'New Collaborator Added',
      message: `${newCollab.name} was added to "${journey.destination}" as ${ROLE_META[inviteRole].title}.`,
      type: 'collaborator',
      createdAt: new Date().toISOString(),
      read: false,
    });

    setInviteName('');
    setInviteEmail('');
    setSuccessToast(`✓ ${newCollab.name} successfully added as ${ROLE_META[inviteRole].title}!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Remove collaborator
  const handleRemoveCollaborator = (id: string) => {
    if (!isOwner) return;
    const target = collaborators.find((c) => c.id === id);
    if (target?.role === 'owner' && collaborators.filter((c) => c.role === 'owner').length <= 1) {
      alert('A journey must have at least one owner.');
      return;
    }

    const updatedCollabs = collaborators.filter((c) => c.id !== id);
    const updated: StoredJourney = {
      ...journey,
      collaborators: updatedCollabs,
    };
    travelStorage.saveJourney(updated);
    if (onUpdateJourney) onUpdateJourney(updated);
  };

  // Change collaborator role
  const handleChangeRole = (id: string, newRole: CollaboratorRole) => {
    if (!isOwner) return;
    const updatedCollabs = collaborators.map((c) => (c.id === id ? { ...c, role: newRole } : c));
    const updated: StoredJourney = {
      ...journey,
      collaborators: updatedCollabs,
    };
    travelStorage.saveJourney(updated);
    if (onUpdateJourney) onUpdateJourney(updated);
  };

  // Copy shareable invitation link
  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/journey/${journey.id}?invite=${journey.id}&role=${inviteRole}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-rise">
      {/* Toast */}
      {successToast && (
        <div className="p-4 bg-black text-white rounded-2xl text-xs font-mono flex items-center gap-2 shadow-lg border border-neutral-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Header & Role Summary */}
      <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-instrument text-2xl sm:text-3xl text-black">
                Journey Collaborators
              </h3>
              <span className="text-xs font-mono text-neutral-500">
                {collaborators.length} Members Sharing This Workspace
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-300 hover:border-black text-xs font-mono text-black transition-all cursor-pointer bg-[#FAF8F5]"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Invite Link Copied!' : 'Copy Invite Link'}</span>
          </button>
        </div>

        {/* Roles explanation pill cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {(['owner', 'editor', 'viewer'] as CollaboratorRole[]).map((role) => {
            const meta = ROLE_META[role];
            const Icon = meta.icon;
            return (
              <div key={role} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${meta.bg}`}>
                    <Icon className="w-3 h-3" />
                    <span>{meta.title}</span>
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-inter leading-relaxed">{meta.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Add New Collaborator Form (Owners only) */}
      {isOwner && (
        <form
          onSubmit={handleAddCollaborator}
          className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-black" />
            <h4 className="font-instrument text-2xl text-black">Invite New Collaborator</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                Full Name / Nickname
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Maya Lin"
                required
                className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-black font-inter focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g. maya@example.com"
                required
                className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-black font-inter focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                Workspace Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
                className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-black font-inter focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="editor">Editor (Can edit itinerary & activities)</option>
                <option value="viewer">Viewer (Read-only)</option>
                <option value="owner">Co-Owner (Full permissions)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Invitation</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Collaborators List */}
      <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 shadow-xs">
        <h4 className="font-instrument text-2xl text-black mb-4">Workspace Members</h4>

        <div className="divide-y divide-neutral-100">
          {collaborators.map((c) => {
            const meta = ROLE_META[c.role] || ROLE_META.viewer;
            const Icon = meta.icon;

            return (
              <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">
                    {c.avatar || c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-black">{c.name}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${meta.bg}`}>
                        <Icon className="w-3 h-3" />
                        <span>{meta.title}</span>
                      </span>
                    </div>
                    <span className="text-xs font-mono text-neutral-500">{c.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role Selector (Owner only) */}
                  {isOwner && c.id !== 'collab_owner' && (
                    <select
                      value={c.role}
                      onChange={(e) => handleChangeRole(c.id, e.target.value as CollaboratorRole)}
                      className="bg-[#FAF8F5] border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-mono text-black focus:outline-none focus:border-black cursor-pointer"
                    >
                      <option value="owner">Owner</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  )}

                  {/* Remove button */}
                  {isOwner && c.id !== 'collab_owner' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(c.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
