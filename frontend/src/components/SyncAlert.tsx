import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import { BiX, BiCloudUpload, BiSync } from 'react-icons/bi';

interface SyncAlertProps {
  onSyncRequested?: () => void;
}

export const SyncAlert: React.FC<SyncAlertProps> = ({ onSyncRequested }) => {
  const { user } = useAuth();
  const { isSyncing, syncError, isAuthenticated } = useFirebaseSync();

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isSyncing) {
    return (
      <div className="fixed top-20 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <BiSync className="w-4 h-4 animate-spin" />
        <span className="text-sm">Enviando para Firebase...</span>
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="fixed top-20 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-sm">
        <BiX className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-medium">Erro no envio</span>
          <p className="text-xs opacity-90 mt-1">{syncError}</p>
        </div>
        <button
          onClick={onSyncRequested}
          className="text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded ml-2"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return null;
};

interface SyncControlsProps {
  onSyncRequested?: () => void;
}

export const SyncControls: React.FC<SyncControlsProps> = ({ onSyncRequested }) => {
  const { user } = useAuth();
  const { isSyncing, isAuthenticated } = useFirebaseSync();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-1">
      <button
        onClick={onSyncRequested}
        className="flex flex-row items-center justify-center gap-1 text-[11px] px-2.5 py-2 rounded-sm hover:cursor-pointer transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Enviar dados para Firebase"
        disabled={isSyncing}
      >
        <BiCloudUpload className={`w-3 h-3 ${isSyncing ? "animate-pulse" : ""}`} />
        upload
      </button>
    </div>
  );
};

export default SyncAlert;