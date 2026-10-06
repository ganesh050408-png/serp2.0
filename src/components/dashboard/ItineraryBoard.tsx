import { useState } from 'react';
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Compass,
  BedDouble,
  TrainFront,
  Utensils,
  ShoppingBag,
  CalendarPlus,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import type { ActivityType } from '../../services/db';

// ── activity type presentation ──
const ACT_TYPES: { value: ActivityType; label: string; Icon: typeof Compass }[] = [
  { value: 'activity', label: 'Activity', Icon: Compass },
  { value: 'stay', label: 'Stay', Icon: BedDouble },
  { value: 'transport', label: 'Transport', Icon: TrainFront },
  { value: 'food', label: 'Food', Icon: Utensils },
  { value: 'shopping', label: 'Shopping', Icon: ShoppingBag },
];
const iconFor = (t: ActivityType) => ACT_TYPES.find((x) => x.value === t)?.Icon ?? Compass;

interface DragState {
  fromDayId: string;
  activityId: string;
}
interface DropHint {
  dayId: string;
  beforeActivityId: string | null; // null → append to end
}

const formatStamp = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ItineraryBoard = () => {
  const {
    activeTrip,
    addActivity,
    updateActivity,
    removeActivity,
    reorderActivities,
    moveActivity,
    addDay,
  } = useTrip();

  const [drag, setDrag] = useState<DragState | null>(null);
  const [dropHint, setDropHint] = useState<DropHint | null>(null);

  // inline editing (one at a time)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editType, setEditType] = useState<ActivityType>('activity');

  // inline add-activity (per day)
  const [addingDayId, setAddingDayId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<ActivityType>('activity');

  // add-day
  const [showAddDay, setShowAddDay] = useState(false);
  const [newCity, setNewCity] = useState('');

  if (!activeTrip) return null;

  // ── drag & drop ──
  const performDrop = async (targetDayId: string, beforeActivityId: string | null) => {
    const d = drag;
    setDrag(null);
    setDropHint(null);
    if (!d) return;
    if (d.fromDayId === targetDayId) {
      const day = activeTrip.days.find((x) => x.id === targetDayId);
      if (!day) return;
      const ids = day.activities.map((a) => a.id).filter((id) => id !== d.activityId);
      const insertIdx = beforeActivityId ? ids.indexOf(beforeActivityId) : ids.length;
      ids.splice(insertIdx < 0 ? ids.length : insertIdx, 0, d.activityId);
      await reorderActivities(targetDayId, ids);
    } else {
      const target = activeTrip.days.find((x) => x.id === targetDayId);
      if (!target) return;
      const toIndex = beforeActivityId
        ? target.activities.findIndex((a) => a.id === beforeActivityId)
        : target.activities.length;
      await moveActivity(d.fromDayId, targetDayId, d.activityId, toIndex < 0 ? target.activities.length : toIndex);
    }
  };

  // ── edit ──
  const startEdit = (aId: string, title: string, time: string, type: ActivityType) => {
    setEditingId(aId);
    setEditTitle(title);
    setEditTime(time);
    setEditType(type);
  };
  const saveEdit = async (dayId: string, aId: string) => {
    if (!editTitle.trim()) return;
    await updateActivity(dayId, aId, {
      title: editTitle.trim(),
      time: editTime.trim() || undefined,
      type: editType,
    });
    setEditingId(null);
  };

  // ── add activity ──
  const startAdd = (dayId: string) => {
    setAddingDayId(dayId);
    setNewTitle('');
    setNewTime('');
    setNewType('activity');
  };
  const saveAdd = async (dayId: string) => {
    if (!newTitle.trim()) return;
    await addActivity(dayId, {
      title: newTitle.trim(),
      time: newTime.trim() || undefined,
      type: newType,
    });
    setNewTitle('');
    setNewTime('');
    // keep the form open for rapid entry
  };

  const saveAddDay = async () => {
    if (!newCity.trim()) return;
    await addDay(newCity.trim());
    setNewCity('');
    setShowAddDay(false);
  };

  return (
    <section
      id="itinerary"
      className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
            01 / ITINERARY
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
            Shape every day.
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-lg">
            Drag to reorder, move activities between days, edit anything — changes save instantly.
          </p>
        </div>
        <div className="text-left lg:text-right">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#6F6F6F] block">
            Last updated
          </span>
          <span className="font-mono text-xs text-[#000000]">{formatStamp(activeTrip.updatedAt)}</span>
        </div>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
        {activeTrip.days.map((day) => (
          <div
            key={day.id}
            className="rounded-3xl border border-[#E7E5E2] bg-white shadow-sm flex flex-col"
            onDragOver={(e) => {
              if (drag) {
                e.preventDefault();
                // hovering the column background → append
                if (e.target === e.currentTarget) setDropHint({ dayId: day.id, beforeActivityId: null });
              }
            }}
            onDrop={(e) => {
              if (drag) {
                e.preventDefault();
                void performDrop(day.id, null);
              }
            }}
          >
            {/* Day header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E7E5E2]">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#6F6F6F]">
                  Day {String(day.dayNumber).padStart(2, '0')}
                </span>
                <h3 className="font-instrument text-2xl text-[#000000] leading-tight">{day.city}</h3>
              </div>
              {day.date && (
                <span className="font-mono text-xs text-[#6F6F6F]">{day.date}</span>
              )}
            </div>

            {/* Activities */}
            <div className="p-3 flex-1 min-h-[80px]">
              {day.activities.length === 0 && !drag && (
                <p className="font-inter text-xs text-[#6F6F6F] px-2 py-3">
                  Nothing planned yet.
                </p>
              )}

              {day.activities.map((a) => {
                const Icon = iconFor(a.type);
                const isEditing = editingId === a.id;
                const isDragging = drag?.activityId === a.id;
                const showLineBefore =
                  dropHint?.dayId === day.id && dropHint.beforeActivityId === a.id;

                if (isEditing) {
                  return (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-[#F598F2] bg-[#FAF8F5] p-3 mb-2"
                    >
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-lg border border-[#E7E5E2] bg-white px-3 py-2 text-sm text-black mb-2"
                        placeholder="Activity title"
                      />
                      <div className="flex gap-2 mb-2">
                        <input
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="w-24 rounded-lg border border-[#E7E5E2] bg-white px-2 py-1.5 text-xs text-black font-mono"
                          placeholder="09:30"
                        />
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as ActivityType)}
                          className="flex-1 rounded-lg border border-[#E7E5E2] bg-white px-2 py-1.5 text-xs text-black"
                        >
                          {ACT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(day.id, a.id)}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 bg-black text-white text-xs hover:bg-neutral-800"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 border border-[#E7E5E2] text-[#6F6F6F] text-xs hover:bg-neutral-50"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={a.id}>
                    {showLineBefore && (
                      <div className="h-0.5 rounded-full bg-[#F598F2] mx-2 mb-2" />
                    )}
                    <div
                      draggable
                      onDragStart={(e) => {
                        setDrag({ fromDayId: day.id, activityId: a.id });
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', a.id);
                      }}
                      onDragEnd={() => {
                        setDrag(null);
                        setDropHint(null);
                      }}
                      onDragOver={(e) => {
                        if (drag) {
                          e.preventDefault();
                          setDropHint({ dayId: day.id, beforeActivityId: a.id });
                        }
                      }}
                      onDrop={(e) => {
                        if (drag) {
                          e.preventDefault();
                          e.stopPropagation();
                          void performDrop(day.id, a.id);
                        }
                      }}
                      className={`group flex items-start gap-2 rounded-2xl border border-transparent hover:border-[#E7E5E2] hover:bg-neutral-50/60 px-2 py-2.5 mb-1 transition-all ${
                        isDragging ? 'opacity-40' : ''
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-neutral-300 mt-0.5 cursor-grab shrink-0 group-hover:text-neutral-400" />
                      <div className="w-14 shrink-0 pt-0.5">
                        {a.time && (
                          <span className="font-mono text-[11px] text-[#6F6F6F]">{a.time}</span>
                        )}
                      </div>
                      <Icon className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm text-[#000000] leading-snug">{a.title}</p>
                        {a.notes && (
                          <p className="font-inter text-xs text-[#6F6F6F] mt-0.5 line-clamp-2">
                            {a.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => startEdit(a.id, a.title, a.time ?? '', a.type)}
                          className="p-1.5 text-[#6F6F6F] hover:text-black rounded-lg hover:bg-neutral-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => removeActivity(day.id, a.id)}
                          className="p-1.5 text-[#6F6F6F] hover:text-red-600 rounded-lg hover:bg-neutral-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* append drop indicator */}
              {dropHint?.dayId === day.id && dropHint.beforeActivityId === null && drag && (
                <div className="h-0.5 rounded-full bg-[#F598F2] mx-2 my-1" />
              )}

              {/* Add activity */}
              {addingDayId === day.id ? (
                <div className="rounded-2xl border border-[#E7E5E2] bg-[#FAF8F5] p-3 mt-2">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void saveAdd(day.id);
                    }}
                    className="w-full rounded-lg border border-[#E7E5E2] bg-white px-3 py-2 text-sm text-black mb-2"
                    placeholder="What's the plan?"
                  />
                  <div className="flex gap-2 mb-2">
                    <input
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-24 rounded-lg border border-[#E7E5E2] bg-white px-2 py-1.5 text-xs text-black font-mono"
                      placeholder="09:30"
                    />
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as ActivityType)}
                      className="flex-1 rounded-lg border border-[#E7E5E2] bg-white px-2 py-1.5 text-xs text-black"
                    >
                      {ACT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveAdd(day.id)}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 bg-black text-white text-xs hover:bg-neutral-800"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingDayId(null)}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 border border-[#E7E5E2] text-[#6F6F6F] text-xs hover:bg-neutral-50"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startAdd(day.id)}
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#E7E5E2] px-3 py-2.5 text-xs font-medium text-[#6F6F6F] hover:border-neutral-400 hover:text-black transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add activity
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add day */}
        <div className="rounded-3xl border border-dashed border-[#E7E5E2] bg-[#FAF8F5]/40 flex items-center justify-center p-6 min-h-[160px]">
          {showAddDay ? (
            <div className="w-full">
              <input
                autoFocus
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void saveAddDay();
                }}
                className="w-full rounded-lg border border-[#E7E5E2] bg-white px-3 py-2 text-sm text-black mb-2"
                placeholder="City for the new day"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveAddDay}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 bg-black text-white text-xs hover:bg-neutral-800"
                >
                  <Check className="w-3 h-3" /> Add day
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDay(false)}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 border border-[#E7E5E2] text-[#6F6F6F] text-xs hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddDay(true)}
              className="inline-flex flex-col items-center gap-2 text-[#6F6F6F] hover:text-black transition-colors"
            >
              <CalendarPlus className="w-6 h-6" />
              <span className="font-mono text-xs uppercase tracking-wider">Add a day</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
