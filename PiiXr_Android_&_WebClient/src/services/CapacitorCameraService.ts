import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CameraService } from './CameraService';

export class CapacitorCameraService extends CameraService {
  private isCapacitorAvailable: boolean = false;

  constructor() {
    super();
    // Check if we're running in a Capacitor environment
    this.isCapacitorAvailable = typeof window !== 'undefined' && 
                               window.Capacitor !== undefined;
  }

  // Enhanced camera start method that works with both web and native
  async startCamera(): Promise<MediaStream> {
    if (this.isCapacitorAvailable) {
      // When running in native app, we still use web camera for live preview
      // but we can also use native camera for photos
      return super.startCamera();
    } else {
      // Fallback to regular web camera
      return super.startCamera();
    }
  }

  // New method for taking photos using native camera
  async takePhoto(): Promise<string | null> {
    if (!this.isCapacitorAvailable) {
      console.log('Native camera not available, using web camera');
      return null;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      return image.base64String || null;
    } catch (error) {
      console.error('Error taking photo with native camera:', error);
      return null;
    }
  }

  // Method to select photo from gallery
  async selectFromGallery(): Promise<string | null> {
    if (!this.isCapacitorAvailable) {
      console.log('Native gallery not available');
      return null;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      return image.base64String || null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      return null;
    }
  }

  // Check if running in native environment
  isNativeEnvironment(): boolean {
    return this.isCapacitorAvailable;
  }
}
