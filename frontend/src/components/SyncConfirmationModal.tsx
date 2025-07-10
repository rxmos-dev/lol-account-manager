import React, { useState } from 'react';
import { BiX, BiCloud, BiCloudUpload, BiCloudDownload } from 'react-icons/bi';
import { AiOutlineInfoCircle } from 'react-icons/ai';

interface SyncConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSync: () => Promise<void>;
  onForceUpload: () => Promise<void>;
  onForceDownload: () => Promise<void>;
  localAccountsCount: number;
  remoteAccountsCount?: number;
  conflictDetails?: {
    localNewer: string[];
    remoteNewer: string[];
    onlyLocal: string[];
    onlyRemote: string[];
  };
}

export const SyncConfirmationModal: React.FC<SyncConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmSync,
  onForceUpload,
  onForceDownload,
  localAccountsCount,
  remoteAccountsCount = 0,
  conflictDetails
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'smart' | 'upload' | 'download'>('smart');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      switch (selectedAction) {
        case 'smart':
          await onConfirmSync();
          break;
        case 'upload':
          await onForceUpload();
          break;
        case 'download':
          await onForceDownload();
          break;
      }
      onClose();
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Sincronização com Firebase</h2>
          <button
            onClick={onClose}
            className="text-foreground hover:text-primary transition-colors"
            disabled={isProcessing}
          >
            <BiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Informações sobre as contas */}
          <div className="bg-secondary/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AiOutlineInfoCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Status das Contas</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-foreground/70">Local:</span>
                <span className="ml-1 font-medium">{localAccountsCount} contas</span>
              </div>
              <div>
                <span className="text-foreground/70">Firebase:</span>
                <span className="ml-1 font-medium">{remoteAccountsCount} contas</span>
              </div>
            </div>
          </div>

          {/* Detalhes de conflitos, se houver */}
          {conflictDetails && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <h4 className="text-sm font-medium text-yellow-700 mb-2">Conflitos Detectados</h4>
              <div className="space-y-1 text-xs">
                {conflictDetails.localNewer.length > 0 && (
                  <div>
                    <span className="text-green-600">Mais recentes localmente:</span>
                    <span className="ml-1">{conflictDetails.localNewer.length} contas</span>
                  </div>
                )}
                {conflictDetails.remoteNewer.length > 0 && (
                  <div>
                    <span className="text-blue-600">Mais recentes no Firebase:</span>
                    <span className="ml-1">{conflictDetails.remoteNewer.length} contas</span>
                  </div>
                )}
                {conflictDetails.onlyLocal.length > 0 && (
                  <div>
                    <span className="text-orange-600">Apenas localmente:</span>
                    <span className="ml-1">{conflictDetails.onlyLocal.length} contas</span>
                  </div>
                )}
                {conflictDetails.onlyRemote.length > 0 && (
                  <div>
                    <span className="text-purple-600">Apenas no Firebase:</span>
                    <span className="ml-1">{conflictDetails.onlyRemote.length} contas</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Opções de sincronização */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Escolha uma opção:</label>
            
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/10">
                <input
                  type="radio"
                  name="syncAction"
                  value="smart"
                  checked={selectedAction === 'smart'}
                  onChange={(e) => setSelectedAction(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <BiCloud className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Sincronização Inteligente</span>
                  </div>
                  <p className="text-xs text-foreground/70 mt-1">
                    Combina automaticamente as versões mais recentes de cada conta
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/10">
                <input
                  type="radio"
                  name="syncAction"
                  value="upload"
                  checked={selectedAction === 'upload'}
                  onChange={(e) => setSelectedAction(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <BiCloudUpload className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Enviar para Firebase</span>
                  </div>
                  <p className="text-xs text-foreground/70 mt-1">
                    Substitui completamente os dados do Firebase pelos dados locais
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/10">
                <input
                  type="radio"
                  name="syncAction"
                  value="download"
                  checked={selectedAction === 'download'}
                  onChange={(e) => setSelectedAction(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <BiCloudDownload className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Baixar do Firebase</span>
                  </div>
                  <p className="text-xs text-foreground/70 mt-1">
                    Substitui completamente os dados locais pelos dados do Firebase
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-foreground hover:text-primary transition-colors"
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncConfirmationModal;