// Capacitor type extensions for the window object
declare global {
  interface Window {
    Capacitor?: {
      platform: string;
      isNativePlatform(): boolean;
    };
  }
}

export {};
