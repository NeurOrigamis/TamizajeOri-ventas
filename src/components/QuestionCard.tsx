import React from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface QuestionCardProps {
  question: { id: number | string; text: string; category?: string; subtitle?: string };
  questionNumber: number;
  totalQuestions: number;
  category?: string;
  selectedAnswer: number | null;
  onAnswerSelect: (answer: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  showSafetyQuestion?: boolean;
  showAbandonmentQuestion?: boolean;
  safetyAlert?: boolean;
}

const defaultAnswerOptions = [
  { label: 'Nunca o 1 día', value: 0, color: 'from-green-400 to-green-500', emoji: '😊' },
  { label: 'Varios días (2-6)', value: 1, color: 'from-yellow-400 to-yellow-500', emoji: '😐' },
  { label: 'Más de la mitad (7-11)', value: 2, color: 'from-orange-400 to-orange-500', emoji: '😟' },
  { label: 'Casi todos los días (12-14)', value: 3, color: 'from-red-400 to-red-500', emoji: '😩' }
];

const abandonmentAnswerOptions = [
  { label: 'No, me siento cómodo/a avanzando en el cuestionario.', value: 0, color: 'from-green-400 to-green-500', emoji: '😊' },
  { label: 'No, pero algunas preguntas me generan inquietud o incomodidad.', value: 1, color: 'from-yellow-400 to-yellow-500', emoji: '😐' },
  { label: 'Sí, me siento cansado/a o con poca motivación.', value: 2, color: 'from-orange-400 to-orange-500', emoji: '😟' },
  { label: 'Sí, me incomoda conectarme con emociones difíciles.', value: 3, color: 'from-red-400 to-red-500', emoji: '😩' }
];

const categoryColors = {
  'Estrés/Ansiedad': 'from-red-500 to-pink-500',
  'Ánimo/Anhedonia': 'from-blue-500 to-purple-500',
  'Control cognitivo/Rumiación': 'from-green-500 to-teal-500'
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  category,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  showSafetyQuestion = false,
  showAbandonmentQuestion = false,
  safetyAlert = false
}) => {
  const handleNext = () => {
    onNext();
  };

  const progress = (questionNumber / totalQuestions) * 100;
  const categoryColor = showSafetyQuestion 
    ? 'from-red-500 to-red-600' 
    : showAbandonmentQuestion
    ? 'from-purple-500 to-indigo-600'
    : categoryColors[category as keyof typeof categoryColors] || 'from-blue-500 to-purple-500';

  const answerOptions = showAbandonmentQuestion ? abandonmentAnswerOptions : defaultAnswerOptions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-100">
            <div 
              className={`h-full bg-gradient-to-r ${categoryColor} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-8 md:p-12">
            {/* Instructions - Solo mostrar en la primera pregunta */}
            {questionNumber === 1 && !showSafetyQuestion && !showAbandonmentQuestion && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">ℹ️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">Instrucciones</h3>
                </div>
                <p className="text-blue-700 leading-relaxed pl-11">
                  <strong>Marque la alternativa que mejor describa su experiencia en los últimos 14 días.</strong> 
                  Responda todas las preguntas. Este cuestionario es un tamizaje y no reemplaza una evaluación clínica.
                </p>
              </div>
            )}

            {/* Safety Alert */}
            {safetyAlert && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-r-2xl p-6 mb-8 shadow-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Importante</h3>
                    <p className="text-red-700 mt-2">
                      Hemos detectado que podrías necesitar apoyo inmediato. Te recomendamos contactar con un profesional de la salud mental o llamar a una línea de crisis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              {!showSafetyQuestion && !showAbandonmentQuestion && category && (
                <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r ${categoryColor} text-white text-sm font-medium mb-2 shadow-lg`}>
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  {category}
                </div>
              )}
              {!showSafetyQuestion && !showAbandonmentQuestion && category && (
                <p className="text-sm text-gray-500 mt-2 mb-4 font-medium">
                  En los últimos 14 días
                </p>
              )}
              {showSafetyQuestion && (
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium mb-6 shadow-lg">
                  ⚠️ Pregunta de Seguridad
                </div>
              )}
              {showAbandonmentQuestion && (
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium mb-6 shadow-lg">
                  💭 Reflexión sobre tu experiencia
                </div>
              )}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                {question.text}
              </h2>
              {question.subtitle && (
                <p className="text-lg text-gray-600 mt-4 italic">
                  {question.subtitle}
                </p>
              )}
              {showSafetyQuestion && (
                <p className="text-sm text-gray-600 mt-4 italic bg-gray-50 px-4 py-2 rounded-lg">
                  Esta pregunta no suma al puntaje total, pero es importante para tu seguridad.
                </p>
              )}
            </div>
            <div className="space-y-4 mb-8">
              {answerOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAnswerSelect(option.value)}
                  className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] text-left group ${
                    selectedAnswer === option.value
                      ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-xl scale-[1.02]`
                      : 'border-gray-200 bg-white/70 hover:border-gray-300 hover:shadow-lg hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className={`text-lg font-medium mb-1 ${
                        selectedAnswer === option.value ? 'text-white' : 'text-gray-800'
                      }`}>
                        <span className="mr-3 text-xl">{option.emoji}</span>
                        {option.label}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedAnswer === option.value
                        ? 'border-white bg-white/30 shadow-lg'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {selectedAnswer === option.value && (
                        <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  canGoPrevious
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 transform hover:scale-105'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Anterior</span>
              </button>

              <div className="text-sm text-gray-500">
                {questionNumber}/{totalQuestions}
              </div>

              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  canGoNext
                    ? `bg-gradient-to-r ${categoryColor} text-white hover:opacity-90 transform hover:scale-105 shadow-lg hover:shadow-xl`
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>{questionNumber === totalQuestions ? 'Ver Resultados' : 'Siguiente'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};