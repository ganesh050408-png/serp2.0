import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  Calendar,
  DollarSign,
  Building,
  Plane,
  Compass,
  FileText,
  Users,
  Shield,
} from 'lucide-react';
import {
  StoredJourney,
  JourneyShareSettings,
  travelStorage,
} from '../../services/travelStorage';

interface JourneyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  journey: StoredJourney;
  onUpdateJourney: (updated: StoredJourney) => void;
}

export const JourneyShareModal: React.FC<JourneyShareModalProps> = ({
  isOpen,
  onClose,
  journey,
  onUpdateJourney,
}) => {
  const defaultSettings: JourneyShareSettings = journey.shareSettings || {
    isPublic: true,
    shareToken: journey.id.slice(0, 10),
    allowedSections: {
      itinerary: true,
      dates: true,
      budget: false, // budget is private by default
      hotels: true,
      transport: true,
      activities: true,
      bookings: false,
      notes: false,
      collaborators: false,
    },
  };

  const [settings, setSettings] = useState<JourneyShareSettings>(defaultSettings);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/journey/${journey.id}?share=${settings.shareToken}`;

  const handleTogglePublic = (isPublic: boolean) => {
    const updated: JourneyShareSettings = {
      ...settings,
      isPublic,
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleSection = (section: keyof JourneyShareSettings['allowedSections']) => {
    const updated: JourneyShareSettings = {
      ...settings,
      allowedSections: {
        ...settings.allowedSections,
        [section]: !settings.allowedSections[section],
      },
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const saveSettings = (updated: JourneyShareSettings) => {
    const updatedJourney = {
      ...journey,
      shareSettings: updated,
    };
    travelStorage.saveJourney(updatedJourney);
    onUpdateJourney(updatedJourney);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Adhira Journey: ${journey.destination}`,
          text: `Check out our planned journey to ${journey.destination} on Adhira!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error with native share:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const SECTIONS = [
    { key: 'itinerary', label: 'Day-by-Day Itinerary', icon: Calendar },
    { key: 'dates', label: 'Travel Dates & Timeline', icon: Calendar },
    { key: 'hotels', label: 'Saved Hotels & Stays', icon: Building },
    { key: 'activities', label: 'Experiences & Activities', icon: Compass },
    { key: 'transport', label: 'Routes & Trajectory', icon: Plane },
    { key: 'budget', label: 'Budget & Split Breakdown', icon: DollarSign, sensitive: true },
    { key: 'bookings', label: 'Confirmed Ticket References', icon: FileText, sensitive: true },
    { key: 'collaborators', label: 'Collaborators List', icon: Users },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-rise">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Modal Card */}
      <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E7E5E2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-instrument text-2xl text-black">Share Journey</h3>
              <span className="text-xs font-mono text-[#6F6F6F]">
                Granular privacy & section access
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#6F6F6F] hover:text-black rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Public vs Private Link Switch */}
        <div className="bg-white border border-[#E7E5E2] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.isPublic ? (
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-black">
                {settings.isPublic ? 'Public Link Sharing Active' : 'Restricted Link Sharing'}
              </h4>
              <p className="text-xs font-inter text-[#6F6F6F]">
                {settings.isPublic
                  ? 'Anyone with the link can view allowed sections'
                  : 'Only invited collaborators can view this journey'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTogglePublic(!settings.isPublic)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer ${
              settings.isPublic
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            {settings.isPublic ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Share Link Copy Field */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block">
            Shareable Web Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-white border border-[#E7E5E2] rounded-2xl px-4 py-2.5 text-xs font-mono text-black select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-2xl bg-black text-white text-xs font-mono hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2] text-black hover:bg-neutral-100 cursor-pointer"
                title="Share via device apps"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Granular Section Visibility Checkboxes */}
        <div className="bg-white border border-[#E7E5E2] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <span className="text-xs font-mono uppercase text-[#6F6F6F]">
              Visible Sections in Shared View
            </span>
            <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Granular access control
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isChecked = settings.allowedSections[sec.key];

              return (
                <label
                  key={sec.key}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-[#FAF8F5] border-black text-black'
                      : 'bg-white border-[#E7E5E2] text-[#6F6F6F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-mono">
                    <Icon className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{sec.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSection(sec.key)}
                    className="rounded border-neutral-300 text-black focus:ring-0 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Done Action */}
        <div className="flex items-center justify-end pt-2 border-t border-[#E7E5E2]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

