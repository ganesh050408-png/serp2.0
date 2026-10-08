import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  MapPin, 
  Clock, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import { travelStorage, StoredJourney, ItineraryDay, ActivityItem } from '../../services/travelStorage';

interface JourneyCalendarProps {
  journeyId: string;
  onNavigate: (path: string) => void;
}

export const JourneyCalendar = ({ journeyId, onNavigate }: JourneyCalendarProps) => {
  const [journey, setJourney] = useState<StoredJourney | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('timeline');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  
  // Quick Edit Modal state
  const [editingActivity, setEditingActivity] = useState<{
    dayNumber: number;
    activity: ActivityItem;
  } | null>(null);
  
  // Drag and drop state
  const [draggedActivity, setDraggedActivity] = useState<{
    activityId: string;
    sourceDayNumber: number;
  } | null>(null);

  // Load journey data
  useEffect(() => {
    const list = travelStorage.getJourneys();
    const found = list.find(j => j.id === journeyId);
    if (found) {
      const normalized = {
        ...found,
        itinerary: (found.itinerary || []).map(d => ({
          ...d,
          activities: (d.activities || []).map((act: any, i: number): ActivityItem => 
            typeof act === 'string' ? {
              id: `act_${d.dayNumber}_${i}`,
              name: act,
              startTime: `${(9 + (i % 5) * 2).toString().padStart(2, '0')}:00`,
              endTime: `${(10 + (i % 5) * 2).toString().padStart(2, '0')}:30`,
              location: d.city,
            } : act
          )
        }))
      };
      setJourney(normalized as StoredJourney);
      
      // Expand all days by default
      const defaultExpanded: Record<number, boolean> = {};
      found.itinerary?.forEach(d => {
        defaultExpanded[d.dayNumber] = true;
      });
      setExpandedDays(defaultExpanded);
    }
  }, [journeyId]);

  if (!journey) {
    return (
      <div className="min-h-screen bg-warmBg flex flex-col items-center justify-center font-sans">
        <p className="text-mutedGray text-sm">Journey not found</p>
        <button onClick={() => onNavigate('/')} className="mt-4 text-xs font-mono underline hover:text-black">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Get date object for a given day index
  const getDayDate = (dayNumber: number): Date => {
    const base = journey.startDate ? new Date(journey.startDate) : new Date();
    const date = new Date(base);
    date.setDate(base.getDate() + dayNumber - 1);
    return date;
  };

  // Convert Date object to YYYY-MM-DD string
  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Check if two activities overlap
  const checkOverlap = (act1: ActivityItem, act2: ActivityItem): boolean => {
    if (!act1.startTime || !act1.endTime || !act2.startTime || !act2.endTime) return false;
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const s1 = toMinutes(act1.startTime);
    const e1 = toMinutes(act1.endTime);
    const s2 = toMinutes(act2.startTime);
    const e2 = toMinutes(act2.endTime);
    return s1 < e2 && s2 < e1;
  };

  // Check if an activity has conflict
  const hasConflict = (dayActivities: ActivityItem[], currentAct: ActivityItem): boolean => {
    return dayActivities.some(act => act.id !== currentAct.id && checkOverlap(currentAct, act));
  };

  // Collapsed status counts
  const getDayActivityCount = (day: ItineraryDay) => {
    return day.activities.length;
  };

  // Toggle day expansion
  const toggleDayExpanded = (dayNumber: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  // Add new activity to a specific day
  const handleAddActivity = (dayNumber: number) => {
    if (!journey.itinerary) return;
    const newItinerary = [...journey.itinerary];
    const dayIndex = newItinerary.findIndex(d => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const targetDay = { ...newItinerary[dayIndex] };
    const defaultStart = '09:00';
    const defaultEnd = '10:00';

    const newAct: ActivityItem = {
      id: crypto.randomUUID(),
      name: 'New Activity',
      startTime: defaultStart,
      endTime: defaultEnd,
      location: targetDay.city || '',
      description: 'Activity details and notes.',
      cost: 0
    };

    targetDay.activities = [...targetDay.activities, newAct];
    newItinerary[dayIndex] = targetDay;

    const updatedJourney = { ...journey, itinerary: newItinerary };
    setJourney(updatedJourney);
    travelStorage.saveJourney(updatedJourney);
    
    // Automatically open edit modal
    setEditingActivity({ dayNumber, activity: newAct });
  };

  // Delete activity
  const handleDeleteActivity = (dayNumber: number, activityId: string) => {
    if (!journey.itinerary) return;
    const newItinerary = [...journey.itinerary];
    const dayIndex = newItinerary.findIndex(d => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const targetDay = { ...newItinerary[dayIndex] };
    targetDay.activities = (targetDay.activities as any[]).filter(a => (typeof a === 'string' ? a !== activityId : a.id !== activityId));
    newItinerary[dayIndex] = targetDay;

    const updatedJourney = { ...journey, itinerary: newItinerary };
    setJourney(updatedJourney);
    travelStorage.saveJourney(updatedJourney);
  };

  // Reorder within a day (Up/Down)
  const handleReorderActivity = (dayNumber: number, activityIdx: number, direction: 'up' | 'down') => {
    if (!journey.itinerary) return;
    const newItinerary = [...journey.itinerary];
    const dayIndex = newItinerary.findIndex(d => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const targetDay = { ...newItinerary[dayIndex] };
    if (direction === 'up' && activityIdx === 0) return;
    if (direction === 'down' && activityIdx === targetDay.activities.length - 1) return;

    const targetIdx = direction === 'up' ? activityIdx - 1 : activityIdx + 1;
    const newList = [...targetDay.activities];
    const temp = newList[activityIdx];
    newList[activityIdx] = newList[targetIdx];
    newList[targetIdx] = temp;

    targetDay.activities = newList;
    newItinerary[dayIndex] = targetDay;

    const updatedJourney = { ...journey, itinerary: newItinerary };
    setJourney(updatedJourney);
    travelStorage.saveJourney(updatedJourney);
  };

  // Move activity to another day via dropdown selection
  const handleMoveActivityDay = (sourceDayNumber: number, activityIdx: number, targetDayNumber: number) => {
    if (!journey.itinerary) return;
    const newItinerary = [...journey.itinerary];
    
    const sourceIdx = newItinerary.findIndex(d => d.dayNumber === sourceDayNumber);
    const targetIdx = newItinerary.findIndex(d => d.dayNumber === targetDayNumber);
    if (sourceIdx === -1 || targetIdx === -1 || sourceIdx === targetIdx) return;

    const sourceDay = { ...newItinerary[sourceIdx] };
    const targetDay = { ...newItinerary[targetIdx] };

    const actToMove = sourceDay.activities[activityIdx];
    
    // Remove from source
    sourceDay.activities = sourceDay.activities.filter((_, idx) => idx !== activityIdx);
    
    // Add to target
    targetDay.activities = [...targetDay.activities, actToMove];

    newItinerary[sourceIdx] = sourceDay;
    newItinerary[targetIdx] = targetDay;

    const updatedJourney = { ...journey, itinerary: newItinerary };
    setJourney(updatedJourney);
    travelStorage.saveJourney(updatedJourney);
  };

  // Drag and Drop implementation
  const handleDragStart = (dayNumber: number, activityId: string) => {
    setDraggedActivity({ activityId, sourceDayNumber: dayNumber });
  };

  const handleDrop = (e: React.DragEvent, targetDayNumber: number) => {
    e.preventDefault();
    if (!draggedActivity || !journey.itinerary) return;
    
    const { activityId, sourceDayNumber } = draggedActivity;
    if (sourceDayNumber === targetDayNumber) return; // handled locally or ignored

    const newItinerary = [...journey.itinerary];
    const sourceIdx = newItinerary.findIndex(d => d.dayNumber === sourceDayNumber);
    const targetIdx = newItinerary.findIndex(d => d.dayNumber === targetDayNumber);

    if (sourceIdx === -1 || targetIdx === -1) return;

    const sourceDay = { ...newItinerary[sourceIdx] };
    const targetDay = { ...newItinerary[targetIdx] };

    const activityToMove = (sourceDay.activities as any[]).find(a => (typeof a === 'string' ? a === activityId : a.id === activityId));
    if (!activityToMove) return;

    // Remove from source
    sourceDay.activities = (sourceDay.activities as any[]).filter(a => (typeof a === 'string' ? a !== activityId : a.id !== activityId));
    
    // Add to target
    targetDay.activities = [...targetDay.activities, activityToMove];

    newItinerary[sourceIdx] = sourceDay;
    newItinerary[targetIdx] = targetDay;

    const updatedJourney = { ...journey, itinerary: newItinerary };
    setJourney(updatedJourney);
    travelStorage.saveJourney(updatedJourney);
    setDraggedActivity(null);
  };

  // Quick edit modal save
  const handleSaveEdit = (editedAct: ActivityItem) => {
    if (!journey.itinerary || !editingActivity) return;
    
    const newItinerary = [...journey.itinerary];
    const dayIndex = newItinerary.findIndex(d => d.dayNumber === editingActivity.dayNumber);
    if (dayIndex === -1) return;

    const targetDay = { ...newItinerary[dayIndex] };
    targetDay.activities = (targetDay.activities as any[]).map(a => (typeof a === 'string' ? (a === editedAct.id ? editedAct : a) : (a.id === editedAct.id ? editedAct : a)));
    newItinerary[dayIndex] = targetDay;

    const updatedJourney = { ...journey, itinerary: newItinerary };
    setJourney(updatedJourney);
    travelStorage.saveJourney(updatedJourney);
    setEditingActivity(null);
  };

  // Generate Month Grids for Calendar View
  const getCalendarMonthsSpanned = () => {
    const dates: Date[] = [];
    
    if (!journey.startDate || journey.datesDecided) {
      // Fallback: render current month
      dates.push(new Date());
    } else {
      const start = new Date(journey.startDate);
      const end = new Date(journey.endDate || journey.startDate);
      
      let curr = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);
      
      while (curr <= last) {
        dates.push(new Date(curr));
        curr.setMonth(curr.getMonth() + 1);
      }
    }
    return dates;
  };

  const spannedMonths = getCalendarMonthsSpanned();

  return (
    <div className="w-full min-h-screen bg-[#FFFFFF] text-black font-sans selection:bg-black selection:text-white pb-32">
      
      {/* 8. Trip Navigation Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-subtleBorder">
        <div className="space-y-2">
          <button
            onClick={() => onNavigate(`/journey/${journeyId}`)}
            className="flex items-center gap-2 text-xs font-mono text-mutedGray hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TRIP DETAILS</span>
          </button>

          <div className="space-y-1">
            <h1 className="font-instrument text-4xl sm:text-5xl text-black tracking-tight leading-none">
              {journey.destinations?.map(d => d.city).join(' · ') || journey.destination}
            </h1>
            <p className="text-xs text-mutedGray font-inter">
              {journey.datesDecided 
                ? 'Flexible Dates' 
                : `${new Date(journey.startDate || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — ${new Date(journey.endDate || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
              } · {journey.budgetValue?.label || `₹${journey.budget.toLocaleString()}`} budget
            </p>
          </div>
        </div>

        {/* 9. View Toggle Pill */}
        <div className="flex items-center gap-3">
          <div className="inline-flex bg-neutral-100 p-1 rounded-full text-xs text-mutedGray font-mono">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'hover:text-black'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Timeline View</span>
            </button>
            
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'hover:text-black'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-10">
        
        {/* 1. CALENDAR VIEW */}
        {viewMode === 'calendar' && (
          <div className="space-y-12 animate-fade-rise">
            {journey.datesDecided && (
              <div className="border border-subtleBorder rounded-2xl bg-warmBg p-5 text-sm text-mutedGray font-inter text-center">
                Note: Dates are currently flexible. Showing calendar view mapped starting from today. 
                Configure start dates in the trip editor to set firm Calendar blocks.
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {spannedMonths.map((monthDate, idx) => {
                const year = monthDate.getFullYear();
                const month = monthDate.getMonth();
                const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                
                // Calendar computations
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
                
                // Days grid array
                const cells: (Date | null)[] = [];
                for (let i = 0; i < firstDayIndex; i++) {
                  cells.push(null);
                }
                for (let day = 1; day <= daysInMonth; day++) {
                  cells.push(new Date(year, month, day));
                }

                return (
                  <div key={idx} className="border border-subtleBorder rounded-[24px] p-6 bg-white shadow-xs">
                    <h3 className="font-instrument text-2xl text-black mb-6 border-b border-neutral-100 pb-2">{monthName}</h3>
                    
                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-mutedGray uppercase tracking-wider mb-2">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>

                    {/* Cells Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((cell, cIdx) => {
                        if (!cell) {
                          return <div key={`empty-${cIdx}`} className="aspect-square bg-neutral-50/50 rounded-lg" />;
                        }

                        // Determine if cell date belongs to trip
                        let tripDayMatch: ItineraryDay | null = null;
                        
                        if (journey.itinerary) {
                          journey.itinerary.forEach((day) => {
                            const dDate = getDayDate(day.dayNumber);
                            if (formatDateString(dDate) === formatDateString(cell)) {
                              tripDayMatch = day;
                            }
                          });
                        }

                        const isToday = formatDateString(cell) === formatDateString(new Date());

                        return (
                          <div
                            key={`day-${cIdx}`}
                            onClick={() => {
                              if (tripDayMatch) {
                                setViewMode('timeline');
                                setTimeout(() => {
                                  const el = document.getElementById(`day-card-${(tripDayMatch as any).dayNumber}`);
                                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 300);
                              }
                            }}
                            className={`aspect-square p-1 sm:p-2 rounded-lg border flex flex-col justify-between cursor-pointer transition-all relative ${
                              tripDayMatch 
                                ? 'bg-warmBg border-black shadow-xs hover:scale-[1.03]' 
                                : 'bg-white border-neutral-100 hover:border-neutral-300'
                            }`}
                          >
                            <span className={`text-[10px] font-mono font-bold leading-none ${
                              isToday ? 'bg-black text-white w-4 h-4 rounded-full flex items-center justify-center' : 'text-neutral-400'
                            }`}>
                              {cell.getDate()}
                            </span>

                            {/* Small activities count or event tags */}
                            {tripDayMatch && (
                              <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                                <span className="text-[8px] font-mono uppercase bg-black text-white px-1 py-0.2 rounded truncate max-w-full block leading-none">
                                  {(tripDayMatch as any).city}
                                </span>
                                {(tripDayMatch as ItineraryDay).activities.length > 0 && (
                                  <span className="text-[8px] font-mono text-mutedGray font-semibold leading-none mt-0.5">
                                    {(tripDayMatch as ItineraryDay).activities.length} acts
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. TIMELINE/LIST VIEW */}
        {viewMode === 'timeline' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-rise">
            
            {(!journey.itinerary || journey.itinerary.length === 0) ? (
              <div className="border border-dashed border-subtleBorder rounded-3xl p-16 text-center bg-warmBg">
                <p className="text-mutedGray text-sm">No days or itinerary loaded for this journey.</p>
                <button
                  onClick={() => onNavigate(`/journey/${journeyId}`)}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-mono underline hover:text-black"
                >
                  Configure trip itinerary in editor
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {journey.itinerary.map((day) => {
                  const isExpanded = !!expandedDays[day.dayNumber];
                  const count = getDayActivityCount(day);
                  const dDate = getDayDate(day.dayNumber);
                  
                  const acts = (day.activities as any[]).map((a, i) => (typeof a === 'string' ? { id: `act-${i}`, name: a, startTime: '10:00', endTime: '12:00', location: day.city } : a)) as ActivityItem[];
                  const hasAnyConflict = acts.some(act => hasConflict(acts, act));

                  return (
                    <div 
                      id={`day-card-${day.dayNumber}`}
                      key={day.dayNumber}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, day.dayNumber)}
                      className={`border border-subtleBorder rounded-3xl overflow-hidden transition-all bg-white relative ${
                        hasAnyConflict ? 'border-amber-300 ring-1 ring-amber-100' : 'hover:border-black'
                      }`}
                    >
                      {/* Collapse Header Summary */}
                      <div 
                        onClick={() => toggleDayExpanded(day.dayNumber)}
                        className="p-5 sm:p-6 bg-warmBg/50 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white border border-subtleBorder flex items-center justify-center font-mono text-xs font-bold shadow-xs">
                            {String(day.dayNumber).padStart(2, '0')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-instrument text-2xl text-black leading-none">{day.city}</h3>
                              {hasAnyConflict && (
                                <span className="flex items-center gap-1 text-[9px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Conflict
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-mutedGray block mt-1 uppercase tracking-wider">
                              {journey.datesDecided ? `Day ${day.dayNumber}` : dDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-mutedGray">
                          <span>{count} {count === 1 ? 'activity' : 'activities'}</span>
                          <span className="text-neutral-300">|</span>
                          <span className="text-black text-[11px] underline">
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </span>
                        </div>
                      </div>

                      {/* 3. Expanded day details */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 border-t border-subtleBorder space-y-6">
                          
                          {acts.length === 0 ? (
                            <div className="border border-dashed border-neutral-100 rounded-xl p-8 text-center text-xs text-mutedGray font-inter">
                              "No activities planned for this day."
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {acts.map((act, actIdx) => {
                                const conflict = hasConflict(acts, act);

                                return (
                                  <div
                                    key={act.id || actIdx}
                                    draggable
                                    onDragStart={() => handleDragStart(day.dayNumber, act.id)}
                                    className={`group flex flex-col md:flex-row md:items-start justify-between bg-white border rounded-xl p-4 transition-all relative cursor-grab active:cursor-grabbing hover:border-black ${
                                      conflict ? 'border-amber-200 bg-amber-50/10' : 'border-subtleBorder'
                                    }`}
                                  >
                                    {/* Left Details column */}
                                    <div className="space-y-2 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-1 font-mono text-[10px] bg-neutral-100 text-mutedGray px-2 py-0.5 rounded">
                                          <Clock className="w-3 h-3" />
                                          <span>{act.startTime} — {act.endTime}</span>
                                        </div>
                                        <span className="font-medium text-sm text-black">{act.name}</span>
                                      </div>

                                      {/* 10. Conflict detection warnings */}
                                      {conflict && (
                                        <p className="text-[10px] font-mono text-amber-700 bg-amber-100/50 px-2 py-1 rounded inline-flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" />
                                          <span>This activity overlaps with another activity scheduled at this time.</span>
                                        </p>
                                      )}

                                      {act.description && (
                                        <p className="text-xs text-mutedGray leading-relaxed max-w-xl">
                                          {act.description}
                                        </p>
                                      )}

                                      <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-400">
                                        {act.location && (
                                          <span className="flex items-center gap-0.5">
                                            <MapPin className="w-3 h-3" /> {act.location}
                                          </span>
                                        )}
                                        {typeof act.cost === 'number' && act.cost > 0 && (
                                          <span className="flex items-center text-neutral-500 font-bold">
                                            ₹{act.cost.toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Actions & fallback controls */}
                                    <div className="flex items-center gap-2 md:gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100 mt-3 md:mt-0 justify-end">
                                      
                                      {/* Move to another Day selector */}
                                      {journey.itinerary && journey.itinerary.length > 1 && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-[9px] font-mono text-mutedGray">MOVE:</span>
                                          <select
                                            title="Move Day"
                                            value=""
                                            onChange={(e) => handleMoveActivityDay(day.dayNumber, actIdx, Number(e.target.value))}
                                            className="bg-neutral-50 border border-subtleBorder text-[10px] py-1 px-1.5 rounded cursor-pointer hover:border-black font-mono focus:outline-hidden"
                                          >
                                            <option value="" disabled>Day...</option>
                                            {journey.itinerary.map(d => (
                                              <option key={d.dayNumber} value={d.dayNumber}>Day {d.dayNumber}</option>
                                            ))}
                                          </select>
                                        </div>
                                      )}

                                      {/* Reordering Controls (Fallback) */}
                                      <div className="flex items-center border border-neutral-100 rounded bg-neutral-50">
                                        <button
                                          onClick={() => handleReorderActivity(day.dayNumber, actIdx, 'up')}
                                          disabled={actIdx === 0}
                                          className="p-1 text-mutedGray hover:text-black disabled:opacity-30"
                                          title="Move Up"
                                        >
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleReorderActivity(day.dayNumber, actIdx, 'down')}
                                          disabled={actIdx === day.activities.length - 1}
                                          className="p-1 text-mutedGray hover:text-black disabled:opacity-30"
                                          title="Move Down"
                                        >
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      {/* Quick Edit Trigger */}
                                      <button
                                        onClick={() => setEditingActivity({ dayNumber: day.dayNumber, activity: act })}
                                        className="p-2 text-mutedGray hover:text-black border border-subtleBorder hover:border-black rounded-lg transition-colors bg-white shadow-xs"
                                        title="Quick Edit"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Delete Button */}
                                      <button
                                        onClick={() => handleDeleteActivity(day.dayNumber, act.id)}
                                        className="p-2 text-mutedGray hover:text-red-500 border border-neutral-100 hover:border-red-200 rounded-lg transition-colors bg-neutral-50"
                                        title="Delete Activity"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 7. Add Activity Button */}
                          <div className="pt-2">
                            <button
                              onClick={() => handleAddActivity(day.dayNumber)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-subtleBorder hover:border-black py-3 text-xs font-mono text-mutedGray hover:text-black bg-neutral-50/50 hover:bg-neutral-50 transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Activity</span>
                            </button>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
          </div>
        )}

      </div>

      {/* 5. QUICK EDIT FORM OVERLAY MODAL */}
      {editingActivity && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fade-rise">
          <div className="bg-white border border-subtleBorder rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setEditingActivity(null)}
              className="absolute right-6 top-6 p-1 text-mutedGray hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-instrument text-3xl text-black">Edit Activity</h3>
              <p className="text-xs text-mutedGray font-mono uppercase tracking-wider">Day {editingActivity.dayNumber} Event Details</p>
            </div>

            {/* Quick Edit Form Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const edited: ActivityItem = {
                  id: editingActivity.activity.id,
                  name: String(fd.get('name')),
                  startTime: String(fd.get('startTime')),
                  endTime: String(fd.get('endTime')),
                  location: String(fd.get('location')),
                  cost: Number(fd.get('cost')),
                  description: String(fd.get('description'))
                };
                handleSaveEdit(edited);
              }}
              className="space-y-4"
            >
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-mutedGray uppercase tracking-wider">Activity Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  defaultValue={editingActivity.activity.name}
                  className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl px-4 py-2.5 text-xs font-inter"
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-mutedGray uppercase tracking-wider">Start Time</label>
                  <input
                    required
                    type="time"
                    name="startTime"
                    defaultValue={editingActivity.activity.startTime}
                    className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-mutedGray uppercase tracking-wider">End Time</label>
                  <input
                    required
                    type="time"
                    name="endTime"
                    defaultValue={editingActivity.activity.endTime}
                    className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Location & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-mutedGray uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingActivity.activity.location}
                    className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl px-4 py-2.5 text-xs font-inter"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-mutedGray uppercase tracking-wider">Cost (₹)</label>
                  <input
                    type="number"
                    name="cost"
                    defaultValue={editingActivity.activity.cost || 0}
                    className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl px-4 py-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-mutedGray uppercase tracking-wider">Short Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingActivity.activity.description || ''}
                  className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl p-4 text-xs font-inter resize-none"
                />
              </div>

              {/* Save CTA */}
              <div className="pt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-5 py-2.5 rounded-full text-mutedGray hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-black text-white hover:opacity-90 font-medium cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
