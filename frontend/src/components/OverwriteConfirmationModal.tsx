import React from 'react';
import { BiX } from 'react-icons/bi';
import { AiOutlineWarning } from 'react-icons/ai';

interface OverwriteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  localAccountsCount: number;
  existingAccountsCount: number;
}

export const OverwriteConfirmationModal: React.FC<OverwriteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  localAccountsCount,
  existingAccountsCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Do you want overwrite data?</h2>
          <button
            onClick={onClose}
            className="text-foreground hover:text-primary hover:cursor-pointer transition-colors"
          >
            <BiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AiOutlineWarning className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-700 mb-1">
                Warning: Data will be overwritten
              </p>
              <p className="text-xs text-foreground/70">
                There are already {existingAccountsCount} accounts saved in Firebase. 
                If you continue, they will be replaced by your {localAccountsCount} local accounts.
              </p>
            </div>
          </div>

          <div className="bg-secondary/20 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-foreground/70">Local accounts:</span>
                <span className="ml-1 font-medium">{localAccountsCount}</span>
              </div>
              <div>
                <span className="text-foreground/70">Firebase accounts:</span>
                <span className="ml-1 font-medium">{existingAccountsCount}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-foreground/60">
            This action cannot be undone. Do you want to continue?
          </p>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-foreground hover:text-primary hover:cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 hover:cursor-pointer transition-colors"
          >
            Overwrite
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverwriteConfirmationModal;
