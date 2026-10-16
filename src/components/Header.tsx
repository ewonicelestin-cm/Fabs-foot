import React from "react";
import { RefreshCcw, Wifi, WifiOff, Sun, Moon } from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
import { AnalyzedMatch } from "../types";

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: string;
  connected: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  matches: AnalyzedMatch[];
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  loading,
  lastUpdated,
  connected,
  darkMode,
  onToggleDarkMode,
  matches
}) => {
  return (
    <header className="header">
      <div className="header-brand">
        <h1>⚽ FAB-FOOT <span className="pro-badge">PRO CENTER</span></h1>
        <div className="header-status">
          <p>Centre de pronostics et statistiques de football avancées</p>
          {lastUpdated && (
            <span className="last-sync">
              Synchronisé : {lastUpdated}
            </span>
          )}
        </div>
      </div>

      <div className="header-actions">
        <NotificationCenter matches={matches} lastUpdated={lastUpdated} />

        <button
          className="theme-toggle-btn"
          onClick={onToggleDarkMode}
          title={darkMode ? "Passer au mode clair" : "Passer au mode sombre"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
          {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{connected ? 'En ligne' : 'Hors ligne'}</span>
        </div>

        <button onClick={onRefresh} disabled={loading} className="refresh-btn">
          {loading ? (
            <span>Analyse...</span>
          ) : (
            <>
              <RefreshCcw size={18} />
              <span>Actualiser</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
