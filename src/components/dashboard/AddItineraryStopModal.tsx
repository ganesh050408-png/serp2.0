import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface AddItineraryStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayLabel: string;
  onAddEvent: (event: { time: string; title: string; location: string; category: string; notes?: string }) => void;
}

export const AddItineraryStopModal: React.FC<AddItineraryStopModalProps> = ({
  isOpen,
  onClose,
  dayLabel,
  onAddEvent,
}) => {
  const [time, setTime] = useState('11:00');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Activity');
  const [notes, setNotes] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      time,
      title,
      location: location || 'Curated Stop',
      category,
      notes: notes || undefined,
    });

    setTitle('');
    setLocation('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 overflow-y-auto animate-fade-rise">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white border border-[#E7E5E2] rounded-[32px] p-6 sm:p-8 shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#6F6F6F]">TIMELINE STOP</span>
            <h3 className="font-instrument text-2xl text-black">Add Stop to {dayLabel}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6F6F6F] hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="Activity">Activity</option>
                <option value="Dining">Dining</option>
                <option value="Heritage">Heritage</option>
                <option value="Leisure">Leisure</option>
                <option value="Stay">Stay</option>
                <option value="Transit">Transit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Moment / Activity Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset drinks & jazz at Latin Quarter"
              className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Location Address or Landmark</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Panaji Waterfront, Goa"
              className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Notes / Reservation Details</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirmed for 4 guests, outdoor balcony"
              className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full rounded-full py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop to Itinerary</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
