import React from "react";
import { RefreshCcw, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: string;
  connected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  loading,
  lastUpdated,
  connected
}) => {
  return (
    <header className="header">
      <div className="header-brand">
        <h1>⚽ FAB-FOOT</h1>
        <div className="header-status">
          <p>Centre de football et analyse statistique</p>
          {lastUpdated && (
            <span className="last-sync">
              Dernière mise à jour : {lastUpdated}
            </span>
          )}
        </div>
      </div>

      <div className="header-actions">
        <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
          {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{connected ? 'Connecté' : 'Erreur'}</span>
        </div>

        <button onClick={onRefresh} disabled={loading} className="refresh-btn">
          {loading ? (
            "Analyse..."
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
