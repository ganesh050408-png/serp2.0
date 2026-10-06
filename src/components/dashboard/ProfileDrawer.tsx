import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Compass,
  Heart,
  Settings,
  LogOut,
  Check,
  Edit3,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { travelStorage, UserProfile } from '../../services/travelStorage';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [profile, setProfile] = useState<UserProfile>(travelStorage.getProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editBio, setEditBio] = useState(profile.bio);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'saved' | 'settings'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const p = travelStorage.getProfile();
      setProfile(p);
      setEditName(p.name);
      setEditEmail(p.email);
      setEditPhone(p.phone);
      setEditBio(p.bio);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: editName,
      email: editEmail,
      phone: editPhone,
      bio: editBio,
    };
    travelStorage.saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out of Aethera?')) {
      travelStorage.clearSession();
      onClose();
      if (onNavigate) {
        onNavigate('/');
      } else {
        window.location.href = '/';
      }
    }
  };

  const removeSavedDestination = (dest: string) => {
    const updated = {
      ...profile,
      savedDestinations: profile.savedDestinations.filter((d) => d !== dest),
    };
    travelStorage.saveProfile(updated);
    setProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 animate-fade-rise">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Slide-in Drawer Window */}
      <div className="relative w-full max-w-xl h-full bg-[#FAF8F5] border-l border-[#E7E5E2] shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-white border-b border-[#E7E5E2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-instrument font-bold">
              {profile.avatar}
            </div>
            <div>
              <h3 className="font-instrument text-2xl text-[#000000] leading-tight">
                {profile.name}
              </h3>
              <span className="text-xs font-mono text-[#6F6F6F]">{profile.email}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6F6F6F] hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-white px-6 border-b border-[#E7E5E2] text-xs font-mono">
          {[
            { id: 'profile', label: 'PROFILE', icon: User },
            { id: 'preferences', label: 'PREFERENCES', icon: Compass },
            { id: 'saved', label: `SAVED (${profile.savedDestinations.length})`, icon: Heart },
            { id: 'settings', label: 'SETTINGS', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-[#6F6F6F] hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile details updated successfully.</span>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {!isEditing ? (
                <>
                  <div className="bg-white border border-[#E7E5E2] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                      <span className="text-xs font-mono text-[#6F6F6F] uppercase">Travel Bio</span>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-mono text-black hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>
                    </div>

                    <p className="text-sm font-inter text-[#000000] leading-relaxed">
                      "{profile.bio}"
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Phone</span>
                        <span className="font-medium text-black">{profile.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Passport</span>
                        <span className="font-medium text-black flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {profile.passportValidity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E7E5E2] rounded-2xl p-6">
                    <span className="text-xs font-mono text-[#6F6F6F] uppercase block mb-3">
                      Traveler Tier & Status
                    </span>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-instrument text-2xl text-black">Aethera Pioneer</h4>
                        <p className="text-xs text-[#6F6F6F] font-inter">Global concierge priority access</p>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 bg-neutral-100 rounded-full border border-[#E7E5E2]">
                        VIP MEMBER
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSave} className="bg-white border border-[#E7E5E2] rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-neutral-50 border border-[#E7E5E2] rounded-xl px-4 py-2 text-sm text-black focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-neutral-50 border border-[#E7E5E2] rounded-xl px-4 py-2 text-sm text-black focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-neutral-50 border border-[#E7E5E2] rounded-xl px-4 py-2 text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Bio</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-50 border border-[#E7E5E2] rounded-xl px-4 py-2 text-sm text-black focus:outline-none focus:border-black resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-full text-xs font-mono text-[#6F6F6F] hover:text-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E7E5E2] rounded-2xl p-6">
                <span className="text-xs font-mono text-[#6F6F6F] uppercase block mb-3">
                  Curated Travel Styles
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.travelStyle.map((st) => (
                    <span
                      key={st}
                      className="px-3.5 py-1.5 bg-[#FAF8F5] border border-[#E7E5E2] text-xs text-black rounded-full font-inter"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#E7E5E2] rounded-2xl p-6 space-y-3">
                <span className="text-xs font-mono text-[#6F6F6F] uppercase block">
                  Regional Formats
                </span>
                <div className="flex items-center justify-between text-xs py-2 border-b border-neutral-100">
                  <span className="text-[#6F6F6F]">Preferred Currency</span>
                  <span className="font-mono font-medium text-black">{profile.currency}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2">
                  <span className="text-[#6F6F6F]">Language Interface</span>
                  <span className="font-mono font-medium text-black">{profile.language}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAVED DESTINATIONS */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              {profile.savedDestinations.map((dest) => (
                <div
                  key={dest}
                  className="bg-white border border-[#E7E5E2] rounded-2xl p-4 flex items-center justify-between hover:border-black transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-instrument text-2xl text-black leading-none">{dest}</h4>
                      <span className="text-[10px] font-mono text-[#6F6F6F]">Saved Haven</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('/planner/new');
                      }}
                      className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 cursor-pointer"
                    >
                      Plan Trip
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedDestination(dest)}
                      className="p-1.5 rounded-full text-neutral-400 hover:text-red-600 transition-colors"
                      title="Remove saved destination"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SETTINGS & LOGOUT */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E7E5E2] rounded-2xl p-6 space-y-4">
                <span className="text-xs font-mono text-[#6F6F6F] uppercase block">
                  Security & Authentication
                </span>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 text-xs">
                  <span>Two-Factor Authentication (2FA)</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                </div>
                <div className="flex items-center justify-between py-2 text-xs">
                  <span>Data Encryption</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">End-to-End 256-bit</span>
                </div>
              </div>

              <div className="bg-white border border-red-200 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-inter text-sm font-semibold text-red-950">Sign out of Aethera</h4>
                  <p className="text-xs text-red-800/80 font-inter">End current session on this device</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-[#E7E5E2] flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
          <span>AETHERA ID: #AE-2026-9840</span>
          <span>BUILD V2.4.0</span>
        </div>
      </div>
    </div>
  );
};
