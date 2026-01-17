
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (err) {
        setError("Доступ к камере запрещен или камера недоступна.");
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl glass-card">
        <div className="p-4 flex justify-between items-center border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Захват изображения</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        <div className="relative aspect-video bg-gray-900 overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <p className="text-red-400 font-medium">{error}</p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"
              >
                Вернуться
              </button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                 <div className="w-64 h-80 border-2 border-white/30 rounded-[100px] border-dashed"></div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 flex justify-center bg-slate-800/50">
          <button
            onClick={capturePhoto}
            disabled={!isActive}
            className="group relative flex items-center justify-center w-16 h-16 bg-white rounded-full transition-transform active:scale-95 disabled:opacity-50"
          >
            <div className="w-12 h-12 border-2 border-slate-900 rounded-full group-hover:scale-110 transition-transform"></div>
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraView;
