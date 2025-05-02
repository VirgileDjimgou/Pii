export class CameraService {
  private stream: MediaStream | null = null;

  // Start the camera and return the video stream
  async startCamera(): Promise<MediaStream> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API is not supported in this browser.');
    }

    this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    return this.stream;
  }

  // Stop the camera
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}