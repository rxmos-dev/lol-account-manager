import React, { useState, useEffect } from 'react';
import { UpdateStatus } from '../types';

export const useAutoUpdater = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    isUpdateAvailable: false,
    isUpdateDownloaded: false,
    downloadProgress: 0
  });
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = async () => {
    setIsChecking(true);
    setError(null);
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('check-for-updates');
      
      if (result.success) {
        setUpdateStatus(prev => ({
          ...prev,
          updateInfo: result.updateInfo
        }));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao verificar atualizações');
      console.error('Error checking for updates:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const downloadUpdate = async () => {
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('download-update');
      
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao baixar atualização');
      console.error('Error downloading update:', err);
    }
  };

  const installUpdate = () => {
    try {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.invoke('quit-and-install');
    } catch (err) {
      setError('Erro ao instalar atualização');
      console.error('Error installing update:', err);
    }
  };

  const getUpdateStatus = async () => {
    try {
      const { ipcRenderer } = window.require('electron');
      const status = await ipcRenderer.invoke('get-update-status');
      setUpdateStatus(prev => ({ ...prev, ...status }));
    } catch (err) {
      console.error('Error getting update status:', err);
    }
  };

  useEffect(() => {
    try {
      const { ipcRenderer } = window.require('electron');

      // Listen for auto-updater events
      const handleUpdateAvailable = (updateInfo: any) => {
        setUpdateStatus(prev => ({
          ...prev,
          isUpdateAvailable: true,
          updateInfo
        }));
      };

      const handleUpdateNotAvailable = () => {
        setUpdateStatus(prev => ({
          ...prev,
          isUpdateAvailable: false
        }));
      };

      const handleDownloadProgress = (progress: any) => {
        setUpdateStatus(prev => ({
          ...prev,
          downloadProgress: progress.percent
        }));
      };

      const handleUpdateDownloaded = () => {
        setUpdateStatus(prev => ({
          ...prev,
          isUpdateDownloaded: true,
          downloadProgress: 100
        }));
      };

      const handleError = (error: any) => {
        setError(error.message || 'Erro no auto-updater');
      };

      // Register event listeners
      ipcRenderer.on('update-available', handleUpdateAvailable);
      ipcRenderer.on('update-not-available', handleUpdateNotAvailable);
      ipcRenderer.on('download-progress', handleDownloadProgress);
      ipcRenderer.on('update-downloaded', handleUpdateDownloaded);
      ipcRenderer.on('updater-error', handleError);

      // Initial status check
      getUpdateStatus();

      // Cleanup
      return () => {
        ipcRenderer.removeListener('update-available', handleUpdateAvailable);
        ipcRenderer.removeListener('update-not-available', handleUpdateNotAvailable);
        ipcRenderer.removeListener('download-progress', handleDownloadProgress);
        ipcRenderer.removeListener('update-downloaded', handleUpdateDownloaded);
        ipcRenderer.removeListener('updater-error', handleError);
      };
    } catch (err) {
      console.error('Error setting up auto-updater listeners:', err);
    }
  }, []);

  return {
    updateStatus,
    isChecking,
    error,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    clearError: () => setError(null)
  };
};
