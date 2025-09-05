import React from 'react';
import { Heart, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              Test de Estado Emocional
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              ¿En qué color estás hoy?
            </p>
            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
              Todos tenemos días buenos, regulares o difíciles... pero, ¿sabes realmente en qué punto estás ahora?
              En 5 minutos y 15 preguntas, este test te ayudará a descubrir si tu estado emocional está en verde, amarillo o rojo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800">5 minutos</h3>
                <p className="text-sm text-gray-600">Tiempo aproximado</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800">15 preguntas</h3>
                <p className="text-sm text-gray-600">Evaluación completa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
              <Heart className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800">Personalizado</h3>
                <p className="text-sm text-gray-600">Resultado único</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">✨ Lo que obtendrás:</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Tu color emocional actual (verde, amarillo o rojo)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>3 pasos concretos para mejorar tu día</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Una experiencia entretenida y fácil de responder</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
          >
            <span>Comenzar Evaluación</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
};