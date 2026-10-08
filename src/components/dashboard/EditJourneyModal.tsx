import React, { useState } from 'react';
import {
  X,
  Edit3,
  Save,
  MapPin,
  Check,
} from 'lucide-react';
import { StoredJourney, travelStorage } from '../../services/travelStorage';

interface EditJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  journey: StoredJourney;
  onUpdateJourney: (updated: StoredJourney) => void;
}

export const EditJourneyModal: React.FC<EditJourneyModalProps> = ({
  isOpen,
  onClose,
  journey,
  onUpdateJourney,
}) => {
  const [destination, setDestination] = useState(journey.destination || '');
  const [startDate, setStartDate] = useState(journey.startDate || '');
  const [endDate, setEndDate] = useState(journey.endDate || '');
  const [travelers, setTravelers] = useState(journey.travelers || 2);
  const [travelType, setTravelType] = useState<'friends' | 'family' | 'solo'>(
    journey.travelType || 'friends'
  );
  const [style, setStyle] = useState(journey.style || 'Slow Luxury');
  const [status, setStatus] = useState<'Planning' | 'Upcoming' | 'Completed'>(
    journey.status || 'Planning'
  );
  const [notes, setNotes] = useState(journey.notes || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: StoredJourney = {
      ...journey,
      destination: destination.trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      travelers: Number(travelers) || 1,
      travelType,
      style: style.trim(),
      status,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    // If budgetPlanner exists, also update travelers count and total budget if needed
    if (updated.budgetPlanner) {
      updated.budgetPlanner.travelersCount = Number(travelers) || 1;
    }

    travelStorage.saveJourney(updated);
    onUpdateJourney(updated);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-rise">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E7E5E2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-instrument text-2xl text-black">Edit Journey Details</h3>
              <span className="text-xs font-mono text-[#6F6F6F]">
                Update parameters in-place without duplicating
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

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-mono text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Journey parameters updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination */}
          <div>
            <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
              Journey Title & Destination
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#6F6F6F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. MUMBAI · GOA · JAIPUR"
                className="w-full bg-white border border-[#E7E5E2] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-[#E7E5E2] rounded-2xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-[#E7E5E2] rounded-2xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
              />
            </div>
          </div>

          {/* Travelers & Companion Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                Number of Travelers
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full bg-white border border-[#E7E5E2] rounded-2xl px-3 py-2 text-sm text-black focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                Travel Party Type
              </label>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value as any)}
                className="w-full bg-white border border-[#E7E5E2] rounded-2xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
              >
                <option value="friends">👥 Friends (Split Expenses)</option>
                <option value="family">👨‍👩‍👧‍👦 Family (Shared Costs)</option>
                <option value="solo">👤 Solo (Individual)</option>
              </select>
            </div>
          </div>

          {/* Style & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                Travel Style / Pace
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. Slow Luxury, Adventure"
                className="w-full bg-white border border-[#E7E5E2] rounded-2xl px-3 py-2 text-sm text-black focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                Journey Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-white border border-[#E7E5E2] rounded-2xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
              >
                <option value="Planning">Planning</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
              Private Journey Notes & Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Packing reminders, emergency contact info, hotel check-in codes..."
              rows={3}
              className="w-full bg-white border border-[#E7E5E2] rounded-2xl p-3 text-sm text-black focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E5E2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-mono text-[#6F6F6F] hover:text-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
