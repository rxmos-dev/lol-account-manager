interface Window {
  electron: {
    ipcRenderer: {
      send(channel: string, data?: any): void;
      on(channel: string, func: (...args: any[]) => void): void;
      once(channel: string, func: (...args: any[]) => void): void;
      removeListener(channel: string, func: (...args: any[]) => void): void;
      removeAllListeners(channel: string): void;
      invoke(channel: string, ...args: any[]): Promise<any>;
    };
  };
}
