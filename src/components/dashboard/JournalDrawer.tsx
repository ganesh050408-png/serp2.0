import React, { useState, useEffect } from 'react';
import { X, Plus, BookOpen, MapPin, Calendar, Trash2, Save } from 'lucide-react';
import { travelStorage, JournalEntry } from '../../services/travelStorage';

interface JournalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JournalDrawer: React.FC<JournalDrawerProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate] = useState('14 June 2026');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags] = useState('Goa, Architecture, Travel');
  const [newImage] = useState('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop');

  useEffect(() => {
    if (isOpen) {
      const list = travelStorage.getJournalEntries();
      setEntries(list);
      if (list.length > 0 && !activeEntry) {
        setActiveEntry(list[0]);
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const entry: JournalEntry = {
      id: 'j_' + Date.now(),
      title: newTitle,
      location: newLocation || 'Goa, India',
      date: newDate,
      excerpt: newExcerpt || newContent.slice(0, 100) + '...',
      content: newContent,
      image: newImage,
      tags: newTags.split(',').map((t) => t.trim()),
    };

    travelStorage.saveJournalEntry(entry);
    const updated = travelStorage.getJournalEntries();
    setEntries(updated);
    setActiveEntry(entry);
    setIsCreating(false);

    // Reset fields
    setNewTitle('');
    setNewLocation('');
    setNewExcerpt('');
    setNewContent('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this journal entry?')) {
      travelStorage.deleteJournalEntry(id);
      const updated = travelStorage.getJournalEntries();
      setEntries(updated);
      setActiveEntry(updated[0] || null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 overflow-y-auto animate-fade-rise">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-5xl h-[90vh] bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-white border-b border-[#E7E5E2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-instrument text-3xl text-black leading-none">Travel Journal</h2>
              <p className="text-xs text-[#6F6F6F] font-inter mt-1">Reflections, field notes & sensory archives</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="px-4 py-2 rounded-full bg-black text-white text-xs font-mono flex items-center gap-1.5 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? 'View Entries' : 'New Entry'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#6F6F6F] hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close journal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {isCreating ? (
            /* Create Entry Form */
            <form onSubmit={handleCreateNew} className="flex-1 p-6 sm:p-10 overflow-y-auto bg-white space-y-5">
              <span className="text-xs font-mono uppercase text-[#6F6F6F] block mb-2">Write a New Entry</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Sunset over Mandovi estuary"
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black font-instrument text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Reis Magos, Goa"
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Short Excerpt / Teaser</label>
                <input
                  type="text"
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  placeholder="One sentence that captures the essence of this moment..."
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Entry Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={8}
                  placeholder="Write your impressions, architecture details, tastes, and thoughts..."
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-4 text-sm text-black focus:outline-none focus:border-black font-inter leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-mono text-[#6F6F6F] hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish to Journal</span>
                </button>
              </div>
            </form>
          ) : (
            /* Left List + Right Reader Layout */
            <>
              {/* Left Sidebar List */}
              <div className="w-full md:w-80 border-r border-[#E7E5E2] bg-white overflow-y-auto p-4 space-y-3 shrink-0">
                <span className="text-[10px] font-mono uppercase text-[#6F6F6F] px-2 block">
                  ENTRIES ({entries.length})
                </span>

                {entries.map((entry) => {
                  const isSelected = activeEntry?.id === entry.id;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setActiveEntry(entry)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF8F5] border-black shadow-xs'
                          : 'border-[#E7E5E2] hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-[#6F6F6F] block mb-1">
                        {entry.date} · {entry.location}
                      </span>
                      <h4 className="font-instrument text-xl text-black leading-tight mb-1">
                        {entry.title}
                      </h4>
                      <p className="text-xs text-[#6F6F6F] line-clamp-2 font-inter">
                        {entry.excerpt}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Right Entry Reader */}
              <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-[#FAF8F5]">
                {activeEntry ? (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-900 shadow-sm relative">
                      <img
                        src={activeEntry.image}
                        alt={activeEntry.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E2]">
                      <div className="flex items-center gap-3 text-xs font-mono text-[#6F6F6F]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {activeEntry.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {activeEntry.location}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(activeEntry.id)}
                        className="p-1.5 rounded-full text-neutral-400 hover:text-red-600 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h1 className="font-instrument text-4xl sm:text-5xl text-black leading-tight">
                      {activeEntry.title}
                    </h1>

                    <p className="text-sm font-inter text-black/90 leading-relaxed whitespace-pre-line">
                      {activeEntry.content}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-6 border-t border-[#E7E5E2]">
                      {activeEntry.tags.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 bg-white border border-[#E7E5E2] rounded-full text-xs font-mono text-[#6F6F6F]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#6F6F6F]">
                    <p className="font-instrument text-2xl text-black">No Journal Entries Found</p>
                    <p className="text-xs font-inter mt-1">Start writing your first travel note today.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
