import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  selectedAnswer: number | null;
  onAnswerSelect: (answer: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const emojiOptions = [
  { emoji: '😀', label: 'Nunca', value: 0, color: 'from-green-400 to-green-500' },
  { emoji: '🙂', label: 'A veces', value: 1, color: 'from-yellow-400 to-yellow-500' },
  { emoji: '😐', label: 'Casi siempre', value: 2, color: 'from-orange-400 to-orange-500' },
  { emoji: '😟', label: 'Siempre', value: 3, color: 'from-red-400 to-red-500' }
];

const categoryColors = {
  'Estrés y nerviosismo': 'from-red-500 to-pink-500',
  'Ánimo y energía': 'from-blue-500 to-purple-500',
  'Confianza y disfrute': 'from-green-500 to-teal-500'
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
  canGoPrevious
}) => {
  const progress = (questionNumber / totalQuestions) * 100;
  const categoryColor = categoryColors[category as keyof typeof categoryColors] || 'from-blue-500 to-purple-500';

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
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${categoryColor} text-white text-sm font-medium mb-4`}>
                🔹 {category}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Pregunta {questionNumber} de {totalQuestions}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                {question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {emojiOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAnswerSelect(option.value)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                    selectedAnswer === option.value
                      ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-lg`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className={`text-sm font-medium ${
                    selectedAnswer === option.value ? 'text-white' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  canGoPrevious
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
                onClick={onNext}
                disabled={!canGoNext}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  canGoNext
                    ? `bg-gradient-to-r ${categoryColor} text-white hover:opacity-90 transform hover:scale-105 shadow-lg`
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