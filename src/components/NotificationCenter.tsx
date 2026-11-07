import React, { useState, useEffect } from "react";
import { Bell, BellOff, Settings, Check, Trash2, Info } from "lucide-react";
import { AnalyzedMatch } from "../types";
import { getMatchStatusCategory } from "../services/matchStatus";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "start" | "finish" | "stats" | "info";
  read: boolean;
}

interface NotificationCenterProps {
  matches: AnalyzedMatch[];
  lastUpdated: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ matches, lastUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // User notification preferences persisted in localStorage
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("fabs_foot_notif_prefs");
      return saved ? JSON.parse(saved) : { enabled: true, startAlerts: true, finishAlerts: true, statsAlerts: true };
    } catch {
      return { enabled: true, startAlerts: true, finishAlerts: true, statsAlerts: true };
    }
  });

  // Notifications list persisted in localStorage with anti-duplicate tracking
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("fabs_foot_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("fabs_foot_notif_prefs", JSON.stringify(preferences));
      localStorage.setItem("fabs_foot_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [preferences, notifications]);

  // Generate real notifications based on actual API match data without fake simulation
  useEffect(() => {
    if (!preferences.enabled || matches.length === 0) return;

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const newNotifs = [...prev];
      let added = false;

      // Check for stats update notification
      const statsId = `stats-sync-${lastUpdated}`;
      if (preferences.statsAlerts && lastUpdated && !existingIds.has(statsId)) {
        newNotifs.unshift({
          id: statsId,
          title: "Nouvelles Données Statistiques",
          message: `Les statistiques et probabilités IA ont été actualisées avec succès (${matches.length} matchs analysés).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "stats",
          read: false
        });
        added = true;
      }

      // Check for match status events from actual API data
      for (const m of matches) {
        const status = m.match.strStatus || "Programmé";
        const statusCategory = getMatchStatusCategory(m.match);
        if (statusCategory === "finished") {
          const finishId = `finish-${m.match.idEvent}`;
          if (preferences.finishAlerts && !existingIds.has(finishId)) {
            newNotifs.unshift({
              id: finishId,
              title: "Fin de Rencontre (Officiel)",
              message: `Le match ${m.match.strHomeTeam} vs ${m.match.strAwayTeam} s'est terminé (Statut: ${status}).`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "finish",
              read: false
            });
            added = true;
          }
        } else if (statusCategory === "upcoming") {
          const startId = `start-${m.match.idEvent}`;
          if (preferences.startAlerts && !existingIds.has(startId)) {
            newNotifs.unshift({
              id: startId,
              title: "Rencontre Programmée",
              message: `Le match ${m.match.strHomeTeam} vs ${m.match.strAwayTeam} est programmé dans ${m.match.strLeague || m.competition.label}.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "start",
              read: false
            });
            added = true;
          }
        }
      }

      return added ? newNotifs.slice(0, 30) : prev;
    });
  }, [matches, lastUpdated, preferences]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-toggle-btn"
        style={{ position: 'relative' }}
        title="Centre de notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', right: 0, top: '50px', width: 'min(360px, 90vw)', background: 'var(--panel)', border: '1px solid var(--line-strong)', borderRadius: '14px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 1000, overflow: 'hidden' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 18px', borderBottom: '1px solid var(--line)', background: 'var(--panel-strong)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} style={{ color: '#0ea5e9' }} />
              <strong style={{ fontSize: '14px' }}>Notifications ({unreadCount})</strong>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Préférences"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={markAllAsRead}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
                title="Tout marquer comme lu"
              >
                <Check size={16} />
              </button>
            </div>
          </div>

          {showSettings ? (
            <div style={{ padding: '18px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <span>Activer les notifications</span>
                <input
                  type="checkbox"
                  checked={preferences.enabled}
                  onChange={(e) => setPreferences({ ...preferences, enabled: e.target.checked })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <span>Alertes début de match</span>
                <input
                  type="checkbox"
                  checked={preferences.startAlerts}
                  onChange={(e) => setPreferences({ ...preferences, startAlerts: e.target.checked })}
                  disabled={!preferences.enabled}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <span>Alertes fin de rencontre</span>
                <input
                  type="checkbox"
                  checked={preferences.finishAlerts}
                  onChange={(e) => setPreferences({ ...preferences, finishAlerts: e.target.checked })}
                  disabled={!preferences.enabled}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Nouvelles données statistiques</span>
                <input
                  type="checkbox"
                  checked={preferences.statsAlerts}
                  onChange={(e) => setPreferences({ ...preferences, statsAlerts: e.target.checked })}
                  disabled={!preferences.enabled}
                />
              </div>
              <button
                onClick={() => setShowSettings(false)}
                style={{ width: '100%', marginTop: '15px', padding: '8px', background: 'var(--primary)', color: 'var(--bg)', borderRadius: '6px', fontWeight: 'bold' }}
              >
                Enregistrer
              </button>
            </div>
          ) : (
            <div>
              {notifications.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Aucune notification pour le moment.
                </div>
              ) : (
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid var(--line)',
                        background: n.read ? 'transparent' : 'rgba(14, 165, 233, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>{n.title}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-soft)', lineHeight: '1.4' }}>{n.message}</p>
                    </div>
                  ))}
                  <div style={{ padding: '10px', textAlign: 'center' }}>
                    <button
                      onClick={clearNotifications}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={12} /> Effacer toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
