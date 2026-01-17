
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Inter']">
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-id-card-clip text-xl text-white"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Psycho-Age Scanner
            </h1>
          </div>
          {state.image && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {!state.image ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="text-center mb-12 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white leading-tight">
                Раскрой секреты <span className="text-indigo-500">первого впечатления</span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Используя нейросети Gemini Pro, мы анализируем биологические маркеры 
                для оценки возраста и психологических архетипов с высокой точностью.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              <button
                onClick={() => setIsCameraOpen(true)}
                className="group relative h-64 glass-card rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all hover:bg-slate-800/80 hover:scale-[1.02] border-2 border-transparent hover:border-indigo-500/30"
              >
                <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-indigo-400">
                  <i className="fas fa-camera text-4xl"></i>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">Камера</h3>
                  <p className="text-slate-500 text-sm">Сделать живое фото</p>
                </div>
              </button>

              <label className="group relative h-64 glass-card rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all hover:bg-slate-800/80 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-indigo-500/30">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all text-emerald-400">
                  <i className="fas fa-upload text-4xl"></i>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">Загрузить</h3>
                  <p className="text-slate-500 text-sm">Выбрать из галереи</p>
                </div>
              </label>
            </div>
            
            <p className="mt-12 text-slate-600 text-xs flex items-center gap-2">
              <i className="fas fa-shield-halved"></i>
              Конфиденциальность: фото обрабатываются мгновенно и не сохраняются.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {!state.result ? (
              <div className="flex flex-col items-center justify-center max-w-xl mx-auto space-y-8 animate-fade-in">
                <div className="relative group w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl">
                  <img src={state.image} alt="Target" className="w-full h-full object-cover" />
                  {state.analyzing && (
                    <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <div className="w-24 h-24 relative mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                        <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
                        <i className="fas fa-brain absolute inset-0 flex items-center justify-center text-2xl animate-pulse"></i>
                      </div>
                      <p className="text-xl font-bold tracking-wider animate-pulse uppercase text-center">Идет нейроанализ...</p>
                      <p className="text-indigo-200 mt-2 text-sm opacity-80">Консультация с ядром Gemini</p>
                    </div>
                  )}
                </div>

                {!state.analyzing && (
                  <div className="flex flex-col items-center w-full gap-4">
                    <button
                      onClick={startAnalysis}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                    >
                      <i className="fas fa-bolt"></i>
                      Начать анализ
                    </button>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, image: null }))}
                      className="text-slate-400 hover:text-white font-medium transition-colors"
                    >
                      Выбрать другое фото
                    </button>
                  </div>
                )}

                {state.error && (
                  <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center flex items-center gap-3 justify-center">
                    <i className="fas fa-circle-exclamation"></i>
                    {state.error}
                  </div>
                )}
              </div>
            ) : (
              <ResultDisplay result={state.result} image={state.image} />
            )}
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-white/5 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; 2024 AI Personality Lab. Биометрия анализируется при помощи Google Gemini.
          </p>
        </div>
      </footer>

      {isCameraOpen && (
        <CameraView 
          onCapture={handleCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
