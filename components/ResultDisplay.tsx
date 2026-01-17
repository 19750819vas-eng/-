
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { speakAnalysis } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';

interface ResultDisplayProps {
  result: AnalysisResult;
  image: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, image }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    setIsSpeaking(true);
    const speechText = `Анализ предполагает возраст в диапазоне ${result.ageRange}. Выявленный психотип: ${result.psychotype}. ${result.description} Основные черты включают: ${result.traits.join(', ')}. Общая атмосфера: ${result.vibe}.`;
    try {
      await speakAnalysis(speechText);
    } catch (err) {
      console.error("Ошибка озвучки", err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(22);
    doc.text('Отчет об анализе личности', 10, 20);
    
    doc.setFontSize(12);
    doc.text(`Возраст: ${result.ageRange}`, 10, 35);
    doc.text(`Психотип: ${result.psychotype}`, 10, 45);
    doc.text(`Энергетика: ${result.vibe}`, 10, 55);
    
    doc.text('Анализ характера:', 10, 70);
    const splitText = doc.splitTextToSize(result.description, pageWidth - 20);
    doc.text(splitText, 10, 80);
    
    doc.text('Черты характера:', 10, 110);
    result.traits.forEach((trait, i) => {
      doc.text(`- ${trait}`, 15, 120 + (i * 10));
    });

    // Add image if possible
    try {
      doc.addImage(image, 'JPEG', 10, 160, 60, 80);
    } catch(e) { console.error("Could not add image to PDF", e); }
    
    doc.save('AI_Analysis_Report.pdf');
  };

  const exportPPTX = () => {
    const pres = new pptxgen();

    // Slide 1: Photo
    const slide1 = pres.addSlide();
    slide1.addText('Анализ объекта: Исходное изображение', { x: 0.5, y: 0.5, fontSize: 24, color: '363636' });
    slide1.addImage({ data: image, x: 2.5, y: 1.2, w: 5, h: 6 });

    // Slide 2: Conclusions
    const slide2 = pres.addSlide();
    slide2.addText('Основные выводы', { x: 0.5, y: 0.5, fontSize: 24, color: '363636' });
    slide2.addText(`Психотип: ${result.psychotype}`, { x: 0.5, y: 1.5, fontSize: 20, bold: true });
    slide2.addText(result.description, { x: 0.5, y: 2.5, fontSize: 16, w: 9 });

    // Slide 3: Source Data
    const slide3 = pres.addSlide();
    slide3.addText('Исходные данные и черты', { x: 0.5, y: 0.5, fontSize: 24, color: '363636' });
    slide3.addText(`Оценка возраста: ${result.ageRange}`, { x: 0.5, y: 1.5, fontSize: 18 });
    slide3.addText(`Вайб: ${result.vibe}`, { x: 0.5, y: 2.1, fontSize: 18 });
    slide3.addText('Ключевые черты:', { x: 0.5, y: 3.0, fontSize: 18, underline: true });
    
    result.traits.forEach((trait, i) => {
      slide3.addText(`• ${trait}`, { x: 0.8, y: 3.6 + (i * 0.5), fontSize: 16 });
    });
    
    slide3.addText(`Точность анализа: ${(result.confidence * 100).toFixed(1)}%`, { x: 0.5, y: 6.5, fontSize: 12, color: '888888' });

    pres.writeFile({ fileName: 'AI_Personality_Presentation.pptx' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
      {/* Subject Preview */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
          <img src={image} alt="Объект" className="w-full aspect-[3/4] object-cover" />
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Текущий вайб</p>
          <p className="text-2xl font-bold text-indigo-400 capitalize">{result.vibe}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={exportPDF}
            className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-all"
          >
            <i className="fas fa-file-pdf text-red-400"></i> PDF
          </button>
          <button 
            onClick={exportPPTX}
            className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-all"
          >
            <i className="fas fa-file-powerpoint text-orange-400"></i> PPTX
          </button>
        </div>
      </div>

      {/* Analysis Details */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Отчет об анализе объекта</h2>
            <p className="text-slate-400">Биометрическая и психологическая оценка</p>
          </div>
          <button 
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
              isSpeaking 
              ? 'bg-indigo-900 text-indigo-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isSpeaking ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-volume-up"></i>
            )}
            {isSpeaking ? 'Озвучивание...' : 'Прослушать отчет'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3 text-emerald-400">
              <i className="fas fa-hourglass-half"></i>
              <span className="font-semibold uppercase text-xs tracking-wider">Оценочный возраст</span>
            </div>
            <p className="text-2xl font-bold">{result.ageRange}</p>
          </div>
          
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3 text-amber-400">
              <i className="fas fa-brain"></i>
              <span className="font-semibold uppercase text-xs tracking-wider">Психотип</span>
            </div>
            <p className="text-2xl font-bold">{result.psychotype}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h4 className="text-lg font-semibold text-slate-200 border-b border-white/10 pb-2">Характеристика личности</h4>
          <p className="text-slate-300 leading-relaxed text-lg italic">
            "{result.description}"
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h4 className="text-lg font-semibold text-slate-200 mb-4">Ключевые черты</h4>
          <div className="flex flex-wrap gap-3">
            {result.traits.map((trait, idx) => (
              <span 
                key={idx} 
                className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-4">
          <p>Точность анализа: {(result.confidence * 100).toFixed(1)}%</p>
          <p>Технология Gemini AI Vision</p>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
