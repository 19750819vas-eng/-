
import React, { useState } from 'react';
import { AppState } from './types';
import { analyzeFace } from './services/geminiService';
import CameraView from './components/CameraView';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    analyzing: false,
    result: null,
    error: null,
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setState(prev => ({ ...prev, image: result, result: null, error: null }));
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!state.image) return;
    
    setState(prev => ({ ...prev, analyzing: true, error: null }));
    try {
      const result = await analyzeFace(state.image);
      setState(prev => ({ ...prev, result, analyzing: false }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        analyzing: false, 
        error: "Анализ лица не удался. Убедитесь, что лицо человека хорошо видно." 
      }));
    }
  };

  const handleCapture = (imageData: string) => {
    setState(prev => ({ ...prev, image: imageData, result: null, error: null }));
    setIsCameraOpen(false);
  };

  const reset = () => {
    setState({
      image: null,
      analyzing: false,
      result: null,
      error: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 flex flex-col font-['Inter'] selection:bg-indigo-500/30">
      {/* Фоновое свечение */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[120px] pointer-events-none"></div>

      <header className="border-b border-white/5 bg-slate-900/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-fingerprint text-white"></i>
            </div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
              NeuroScan AI
            </h1>
          </div>
          {state.image && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <i className="fas fa-rotate-left text-xs"></i>
              Сбросить
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 relative z-10">
        {!state.image ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
            <div className="text-center mb-10 max-w-2xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                Технология Gemini 2.5
              </span>
              <h2 className="text-4xl md:text-6xl font-black mb-6 text-white leading-[1.1]">
                Визуальный <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Психоанализ</span>
              </h2>
              <p className="text-lg text-slate-400/80 leading-relaxed font-medium">
                Интеллектуальное сканирование личности и возраста по биометрическим данным лица.
              </p>
            </div>

            {/* Окно выбора действий */}
            <div className="w-full max-w-4xl p-1 bg-gradient-to-b from-white/10 to-transparent rounded-[2.5rem] shadow-2xl">
              <div className="bg-[#0a0f1e]/90 backdrop-blur-2xl rounded-[2.4rem] p-8 md:p-12 overflow-hidden relative">
                {/* Декоративные элементы сетки */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {/* Сделать фото */}
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="group flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-500"
                  >
                    <div className="w-24 h-24 mb-6 relative">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="relative w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-indigo-600 transition-colors duration-300 shadow-xl">
                        <i className="fas fa-camera text-3xl text-indigo-400 group-hover:text-white transition-colors"></i>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Использовать камеру</h3>
                    <p className="text-slate-500 text-sm text-center leading-relaxed">
                      Запустите камеру устройства для моментального снимка
                    </p>
                  </button>

                  {/* Загрузить файл */}
                  <label className="group flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-500 cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    <div className="w-24 h-24 mb-6 relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="relative w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-emerald-600 transition-colors duration-300 shadow-xl">
                        <i className="fas fa-cloud-arrow-up text-3xl text-emerald-400 group-hover:text-white transition-colors"></i>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Загрузить файл</h3>
                    <p className="text-slate-500 text-sm text-center leading-relaxed">
                      Выберите готовую фотографию из памяти вашего устройства
                    </p>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <i className="fas fa-lock text-indigo-500/50"></i>
                Безопасно
              </div>
              <div className="w-px h-3 bg-white/10"></div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <i className="fas fa-bolt text-amber-500/50"></i>
                Быстро
              </div>
              <div className="w-px h-3 bg-white/10"></div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <i className="fas fa-microchip text-emerald-500/50"></i>
                ИИ Анализ
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-10">
            {!state.result ? (
              <div className="flex flex-col items-center justify-center space-y-10 animate-fade-in">
                <div className="relative group w-full max-w-2xl rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-slate-900">
                  <img src={state.image} alt="Target" className="w-full h-auto object-cover max-h-[70vh]" />
                  
                  {state.analyzing && (
                    <div className="absolute inset-0 bg-[#050810]/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-8">
                      <div className="w-32 h-32 relative mb-10">
                        <div className="absolute inset-0 rounded-full border-[6px] border-indigo-500/10"></div>
                        <div className="absolute inset-0 rounded-full border-t-[6px] border-indigo-500 animate-spin"></div>
                        <div className="absolute inset-4 rounded-full border-b-[6px] border-purple-500/40 animate-reverse-spin"></div>
                        <i className="fas fa-brain absolute inset-0 flex items-center justify-center text-3xl text-white animate-pulse"></i>
                      </div>
                      <h4 className="text-2xl font-black tracking-[0.2em] uppercase mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        Анализ данных
                      </h4>
                      <p className="text-slate-400 text-center max-w-xs leading-relaxed font-medium">
                        Нейросеть сканирует микровыражения и биометрию лица...
                      </p>
                    </div>
                  )}
                </div>

                {!state.analyzing && (
                  <div className="flex flex-col items-center w-full max-w-sm gap-5">
                    <button
                      onClick={startAnalysis}
                      className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider"
                    >
                      <i className="fas fa-wand-magic-sparkles text-sm"></i>
                      Запустить сканер
                    </button>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, image: null }))}
                      className="px-6 py-2 text-slate-400 hover:text-white font-semibold transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10"
                    >
                      Выбрать другое изображение
                    </button>
                  </div>
                )}

                {state.error && (
                  <div className="w-full max-w-lg p-5 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 text-center flex items-center gap-4 justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-circle-exclamation"></i>
                    </div>
                    <span className="font-medium">{state.error}</span>
                  </div>
                )}
              </div>
            ) : (
              <ResultDisplay result={state.result} image={state.image} />
            )}
          </div>
        )}
      </main>

      <footer className="py-10 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm font-medium">
            &copy; 2024 AI NeuroScan. Конфиденциальный биометрический анализ.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemini Pro Engine
            </span>
            <div className="w-px h-3 bg-white/10"></div>
            <span className="text-xs text-slate-600">v1.4.2 stable</span>
          </div>
        </div>
      </footer>

      {isCameraOpen && (
        <CameraView 
          onCapture={handleCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      <style>{`
        @keyframes reverse-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-reverse-spin {
          animation: reverse-spin 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
