'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  fileName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  fileName,
  onConfirm,
  onCancel,
  isLoading = false
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Delete Analysis?</h3>
        </div>

        <p className="text-gray-300 mb-2">
          You&apos;re about to permanently delete:
        </p>
        <p className="text-cyan-400 font-medium mb-6 break-all">{fileName}</p>

        <p className="text-sm text-gray-400 mb-6">
          This action cannot be undone. The analysis results and report will be deleted.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2 px-4 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800/50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 px-4 rounded-lg bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 transition-colors font-medium disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
