import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Calendar,
  CloudSun,
  CreditCard,
  UserCheck,
  Info,
  ExternalLink,
  Check,
} from 'lucide-react';
import { StoredNotification, travelStorage } from '../../services/travelStorage';

interface TripNotificationCenterProps {
  journeyId?: string;
  onNavigate?: (tab: string) => void;
}

export const TripNotificationCenter: React.FC<TripNotificationCenterProps> = ({
  journeyId,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadNotifications = () => {
    const list = travelStorage.getNotifications(journeyId);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, [journeyId]);

  const handleRequestPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
          setToastMessage('Web Push notifications enabled for trip reminders & weather alerts!');
          new Notification('Aethera Travel', {
            body: 'Trip notifications enabled for upcoming departures and emergency alerts.',
            icon: '/vite.svg',
          });
        }
      } catch (err) {
        console.error('Error requesting push permission:', err);
      }
    }
  };

  const handleMarkAsRead = (id: string) => {
    travelStorage.markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      travelStorage.markNotificationAsRead(n.id);
    });
    loadNotifications();
    setToastMessage('All notifications marked as read.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleClearAll = () => {
    if (!confirm('Are you sure you want to clear all trip notifications?')) return;
    travelStorage.clearNotifications(journeyId);
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'weather':
        return <CloudSun className="w-4 h-4 text-amber-500" />;
      case 'budget':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'collaborator':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'departure':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-black" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F]">
                DISPATCH & ALERT STREAM
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-mono font-bold">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <h2 className="font-instrument text-3xl sm:text-4xl text-black">
              Trip Notifications & Live Alerts
            </h2>
            <p className="text-sm font-inter text-[#6F6F6F] mt-1">
              Real-time dispatches regarding departure windows, weather conditions, and budget alerts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#E7E5E2] text-black text-xs font-mono hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#E7E5E2] text-[#6F6F6F] hover:text-red-600 text-xs font-mono hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear history</span>
              </button>
            )}
          </div>
        </div>

        {/* Web Push Notification Opt-in Card */}
        {typeof window !== 'undefined' && 'Notification' in window && (
          <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-instrument text-2xl text-black leading-tight">
                  Browser Push Dispatch
                </h4>
                <p className="text-xs text-[#6F6F6F] font-inter mt-0.5">
                  Receive live weather alerts, departure gate updates, and collaborator mentions directly on your screen.
                </p>
              </div>
            </div>

            <div>
              {pushPermission === 'granted' ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Push Active</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPush}
                  className="px-4 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 cursor-pointer whitespace-nowrap"
                >
                  Enable Push Notifications
                </button>
              )}
            </div>
          </div>
        )}

        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-mono text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white border border-[#E7E5E2] rounded-3xl p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
            <h4 className="font-instrument text-2xl text-black">No alerts right now</h4>
            <p className="text-xs font-mono text-[#6F6F6F] max-w-sm mx-auto">
              Your itinerary schedule, budget burn rate, and weather conditions are running smoothly with no pending flags.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`border rounded-3xl p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !n.read
                  ? 'bg-white border-black shadow-sm'
                  : 'bg-[#FAF8F5] border-[#E7E5E2] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-[#E7E5E2] flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 text-[#6F6F6F]">
                      {n.type || 'SYSTEM'}
                    </span>
                    <span className="text-[10px] font-mono text-[#6F6F6F]">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>

                  <h4 className="font-instrument text-2xl text-black">{n.title}</h4>
                  <p className="text-xs font-inter text-[#6F6F6F] leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {n.actionUrl && onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkAsRead(n.id);
                      onNavigate(n.actionUrl!);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}

                {!n.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(n.id)}
                    className="px-3 py-1.5 rounded-full bg-white border border-[#E7E5E2] hover:bg-neutral-100 text-xs font-mono text-black cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

