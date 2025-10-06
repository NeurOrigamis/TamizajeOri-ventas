import React from 'react';
import { Heart, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-3 md:p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-12 border border-white/20">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 mb-4 md:mb-6 overflow-hidden rounded-full shadow-lg">
              <img
                src="https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                alt="Bienestar emocional"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4 leading-tight px-2">
              Cuestionario de Bienestar
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-4 md:mb-6 font-medium">
              ¿En qué color estás hoy?
            </p>
            <p className="text-sm md:text-base text-gray-600 max-w-lg mx-auto leading-relaxed px-2">
              Todos tenemos días buenos, regulares o difíciles... pero, ¿sabes realmente en qué punto estás ahora?
              En 5 minutos y 10 preguntas, este test te ayudará a descubrir si tu estado emocional está en verde, amarillo o rojo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-blue-50 rounded-xl">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-800">5 minutos</h3>
                <p className="text-xs md:text-sm text-gray-600">Tiempo aproximado</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-green-50 rounded-xl">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-800">10 preguntas</h3>
                <p className="text-xs md:text-sm text-gray-600">Evaluación completa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-purple-50 rounded-xl">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-800">Personalizado</h3>
                <p className="text-xs md:text-sm text-gray-600">Resultado único</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">✨ Lo que obtendrás:</h2>
            <ul className="space-y-2 text-sm md:text-base text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Tu color emocional actual (verde, amarillo, naranjo o rojo)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>3 pasos concretos para mejorar tu día</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Una experiencia entretenida y fácil de responder</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold py-3.5 md:py-4 px-6 md:px-8 rounded-xl md:rounded-2xl hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group text-base md:text-lg"
          >
            <span>Comenzar Evaluación</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
};