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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Камера не поддерживается вашим браузером. Убедитесь, что используете HTTPS.");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user', 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          },
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Важно: на мобильных устройствах требуется play() и playsInline
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Ошибка воспроизведения видео:", e));
            setIsActive(true);
          };
        }
      } catch (err: any) {
        console.error("Camera Error:", err);
        setError("Нет доступа к камере. Проверьте разрешения в браузере.");
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
    if (videoRef.current && canvasRef.current && isActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  }, [onCapture, isActive]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f1e] shadow-2xl flex flex-col">
        <div className="p-5 flex justify-between items-center border-b border-white/5 bg-slate-900/40">
          <div>
            <h3 className="text-xl font-bold text-white">Камера</h3>
            <p className="text-xs text-slate-500">Посмотрите в объектив</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center">
          {error ? (
            <div className="p-10 text-center text-red-400">{error}</div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${isActive ? 'opacity-100' : 'opacity-0'}`}
              />
              {!isActive && <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>}
              {isActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-64 border-2 border-white/20 rounded-[100px] border-dashed"></div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-8 flex justify-center bg-slate-900/60">
          <button
            onClick={capturePhoto}
            disabled={!isActive}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
          >
            <i className="fas fa-camera text-2xl text-slate-900"></i>
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraView;