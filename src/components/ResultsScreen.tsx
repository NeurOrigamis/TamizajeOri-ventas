import React, { useEffect, useRef } from 'react';
import { MessageCircle, RefreshCw, Heart, AlertTriangle } from 'lucide-react';
import { sendToSheetForm } from '../lib/sheets';

interface ResultsScreenProps {
  result: 'green' | 'yellow' | 'orange' | 'red';
  score: number;
  categoryScores: {
    scoreEstres: number;
    scoreAnimo: number;
    scoreControl: number;
  };
  triageRecommendation: {
    priority: string;
    recommendation: string;
    type: string;
  };
  sessionId: string;
  userData: { name: string; email: string } | null;
  safetyAlert?: boolean;
  safetyQuestionAnswer?: number | string | null;
  webAppUrl: string;
  onRestart: () => void;
}

const resultData = {
  green: {
    color: '🟩',
    title: '¡Excelente! 🌟 Tienes una base sólida',
    emoji: '😀',
    gradient: 'from-green-400 to-emerald-500',
    bgGradient: 'from-green-50 via-white to-emerald-50',
    interpretation: '¡Felicitaciones! 🎉 Tus respuestas muestran que tienes una excelente base emocional y manejas muy bien el día a día. Esto te coloca en una posición privilegiada: tienes la estabilidad perfecta para dar el siguiente paso y potenciar lo mejor de ti.',
    professional: 'Tu resultado verde te abre las puertas a un crecimiento extraordinario 🚀. Cuando ya tienes las bases sólidas, es el momento perfecto para desarrollar habilidades avanzadas que te lleven al siguiente nivel de bienestar y liderazgo.',
    recommendation: 'Es momento de invertir en tu crecimiento personal 💎. Con tu estabilidad actual, puedes desarrollar habilidades que te convertirán en la mejor versión de ti mismo/a.',
    whatsappMessage: 'Hola! Acabo de hacer el test emocional y salí en VERDE 🟩😀. Me gustaría saber más sobre cómo mantener mi bienestar y seguir mejorando.'
  },
  yellow: {
    color: '🟨',
    title: 'Ojo aquí 👀 Estás en amarillo',
    emoji: '😐',
    gradient: 'from-yellow-400 to-orange-500',
    bgGradient: 'from-yellow-50 via-white to-orange-50',
    interpretation: 'Mmm, parece que las cosas se están poniendo un poquito pesadas 😅. Tus respuestas muestran que hay algunas cositas que te están afectando más de lo normal. No es grave, pero sí es momento de poner atención 🚨.',
    professional: 'Tu resultado amarillo nos dice que es buen momento para actuar 🎯. Si le ponemos atención ahora, podemos evitar que las cosas se compliquen más adelante. ¡Es súper normal y tiene solución! 💡',
    recommendation: 'Te recomendamos buscar un poco de apoyo profesional 🤝. Unas sesiones cortas pueden ayudarte muchísimo a recuperar tu equilibrio. ¡No esperes más! ⏰',
    whatsappMessage: 'Hola! Acabo de hacer el test emocional y salí en AMARILLO 🟨. Me gustaría agendar una sesión para recuperar mi equilibrio emocional.'
  },
  orange: {
    color: '🟧',
    title: 'Alerta moderada 🔶 Estás en naranjo',
    emoji: '😰',
    gradient: 'from-orange-400 to-red-500',
    bgGradient: 'from-orange-50 via-white to-red-50',
    interpretation: 'Oye, las cosas se están poniendo complicadas 😰. Tus respuestas nos muestran que hay varias áreas que te están afectando bastante. Es momento de tomar acción más decidida 💪.',
    professional: 'Tu resultado naranjo indica que necesitas apoyo profesional pronto 🎯. Los síntomas que describes están impactando tu día a día de manera significativa, pero con ayuda adecuada puedes mejorar mucho 🌟.',
    recommendation: 'Te recomendamos buscar ayuda profesional en las próximas semanas 📅. No esperes a que las cosas empeoren, es el momento perfecto para actuar 🚀.',
    whatsappMessage: 'Hola! Acabo de hacer el test emocional y salí en NARANJO 🟧. Estoy al límite y necesito actuar ya para evitar una crisis.'
  },
  red: {
    color: '🟥',
    title: 'Necesitas apoyo ya 🚨 Estás en rojo',
    emoji: '😟',
    gradient: 'from-red-400 to-red-600',
    bgGradient: 'from-red-50 via-white to-pink-50',
    interpretation: 'Hey, sabemos que las cosas están difíciles ahora mismo 💔. Tus respuestas nos muestran que realmente necesitas apoyo profesional. No estás solo/a en esto y hay ayuda disponible 🤗.',
    professional: 'Tu resultado rojo nos dice que es súper importante que busques ayuda profesional pronto 🏥💜. Los síntomas que describes están afectando tu día a día, pero con el apoyo adecuado puedes sentirte mejor.',
    recommendation: 'Por favor, busca ayuda profesional lo antes posible 🙏. Un psicólogo o psiquiatra puede ayudarte muchísimo. ¡No lo dejes para después! Tu bienestar es lo más importante 💝.',
    whatsappMessage: 'Hola! Acabo de hacer el test emocional y salí en ROJO 🟥. Necesito contactar con su equipo de apoyo de manera prioritaria para recibir ayuda profesional.'
  }
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
  result, 
  score, 
  categoryScores, 
  triageRecommendation, 
  sessionId, 
  userData, 
  safetyAlert = false, 
  safetyQuestionAnswer,
  webAppUrl,
  onRestart 
}) => {
  // Determinar el resultado efectivo: si hay alerta de seguridad, siempre mostrar programa "Rojo"
  const effectiveResult = safetyAlert ? 'red' : result;
  
  const data = resultData[effectiveResult];
  const sentRef = useRef(false);

  // Enviar datos a Google Sheets después de renderizar
  useEffect(() => {
    if (sentRef.current) return; // evita doble ejecución (StrictMode / re-render)
    sentRef.current = true;

    if (userData) {
      void sendToSheetForm({
        timestamp: new Date().toISOString(),
        nombre: userData.name,
        email: userData.email,
        sessionId,
        userAgent: navigator.userAgent,
        scoreTotal: score,
        scoreEstres: categoryScores.scoreEstres,
        scoreAnimo: categoryScores.scoreAnimo,
        scoreConfianza: categoryScores.scoreControl,
        safetyQuestionAnswer: safetyQuestionAnswer ?? '',
        webAppUrl
      });
    }
  }, [userData, sessionId, score, categoryScores, safetyQuestionAnswer, webAppUrl]);
  
  const handleWhatsAppContact = () => {
    const phoneNumber = '56930179724';
    const personalizedMessage = userData 
      ? `Hola! Soy ${userData.name}, acabo de completar el Test de Estado Emocional y ${data.whatsappMessage}`
      : data.whatsappMessage;
    const message = encodeURIComponent(personalizedMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Función para determinar el estado de las subescalas
  const getSubescaleStatus = (score: number, type: 'stress' | 'mood' | 'control') => {
    if (type === 'stress') {
      return score >= 6 ? 'red' : score >= 5 ? 'yellow' : 'green';
    } else if (type === 'mood') {
      return score >= 5 ? 'red' : score >= 5 ? 'yellow' : 'green';
    } else { // control
      return score >= 7 ? 'red' : score >= 5 ? 'yellow' : 'green';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red': return 'text-red-600 bg-red-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${data.bgGradient} py-4 sm:py-8 px-2 sm:px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Safety Alert Banner */}
          {safetyAlert && (
            <div className="bg-red-600 text-white p-4 sm:p-6">
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-semibold">Atención Prioritaria Requerida</h3>
                  <p className="text-xs sm:text-sm mt-1">
                    Hemos detectado indicadores que requieren atención inmediata. Te recomendamos contactar con un profesional de la salud mental.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className={`bg-gradient-to-r ${data.gradient} p-6 sm:p-8 text-white text-center`}>
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{data.emoji}</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              🎯 ¡Aquí están tus resultados!
            </h1>
            <div className="text-lg sm:text-xl opacity-90">
              {data.color} {data.title}
            </div>
          </div>

          <div className="p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
            {/* Score */}
            <div className="text-center">
              {userData && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Hola {userData.name} 👋
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">Aquí están tus resultados personalizados</p>
                </div>
              )}
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl font-bold text-gray-700">{score}</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600">Puntuación total de 45 puntos posibles</p>
            </div>

            {/* Subescales */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">📊 Cómo te fue en cada área:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">😰 Estrés/Ansiedad</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubescaleStatus(categoryScores.scoreEstres, 'stress'))}`}>
                    {categoryScores.scoreEstres}/15
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">😔 Ánimo/Energía</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubescaleStatus(categoryScores.scoreAnimo, 'mood'))}`}>
                    {categoryScores.scoreAnimo}/15
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">🧠 Control Mental</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubescaleStatus(categoryScores.scoreControl, 'control'))}`}>
                    {categoryScores.scoreControl}/15
                  </div>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                💬 En palabras simples:
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {data.interpretation}
              </p>
            </div>

            {/* Professional Reading */}
            <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                🔍 Lo que esto significa:
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {data.professional}
              </p>
            </div>

            {/* Triage Recommendation */}
            <div className={`bg-gradient-to-r ${
              triageRecommendation.priority === 'high' ? 'from-red-100 to-red-50' : 
              triageRecommendation.priority === 'medium-high' ? 'from-orange-100 to-orange-50' :
              triageRecommendation.priority === 'medium' ? 'from-yellow-100 to-yellow-50' : 
              'from-green-100 to-green-50'
            } rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                💡 Nuestra recomendación:
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
                Basado en tus respuestas, te sugerimos: <strong>{triageRecommendation.recommendation}</strong> 🎯
              </p>
              {(triageRecommendation.type === 'clinical' || triageRecommendation.type === 'clinical-recommended') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-red-800 font-medium">
                    {triageRecommendation.type === 'clinical' ? 
                      '🚨 Es importante que busques ayuda profesional pronto.' :
                      '⚠️ Te recomendamos considerar una evaluación profesional.'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Recommendation */}
            <div className={`bg-gradient-to-r ${data.gradient} bg-opacity-10 rounded-xl sm:rounded-2xl p-4 sm:p-6 ${result === 'green' ? 'hidden' : ''}`}>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                🚀 ¿Qué hacer ahora?
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {data.recommendation}
              </p>
            </div>

            {/* Programa Verde - Solo para resultado verde */}
            {effectiveResult === 'green' && (
              <>
                {/* Hero Section del Programa */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white text-center mb-6 sm:mb-8">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🌟</div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                    Diagnóstico de Habilidades para el Bienestar
                  </h2>
                  <p className="text-lg sm:text-xl mb-4 sm:mb-6 opacity-90">
                    Potencia lo mejor de ti
                  </p>
                  <p className="text-sm sm:text-lg opacity-80 max-w-2xl mx-auto">
                    Un programa breve de <strong>4 sesiones</strong> para quienes ya se sienten bien y quieren crecer aún más
                  </p>
                </div>

                {/* Áreas a diagnosticar */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                    🎯 Áreas que desarrollaremos juntos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-green-100">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-white font-bold">💪</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-800">Corporal-somática</h4>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm">Conciencia corporal y energía vital</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-green-100">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-white font-bold">❤️</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-800">Emocional</h4>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm">Inteligencia emocional y resiliencia</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-green-100">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-white font-bold">🧠</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-800">Cognitiva</h4>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm">Estrategias de pensamiento positivo y enfoque</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-green-100">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-white font-bold">🤝</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-800">Relacional</h4>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm">Habilidades de comunicación asertiva y liderazgo</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-green-100 md:col-span-2">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-white font-bold">🛡️</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-800">Preventiva</h4>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm">Prácticas de excelencia y autocuidado a largo plazo</p>
                    </div>
                  </div>
                </div>

                {/* Resultados esperados */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 border border-green-100">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                    🎯 Lo que lograrás
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs sm:text-xs">✓</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700">Reconocer tus fortalezas actuales</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs sm:text-xs">✓</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700">Definir un plan de entrenamiento en habilidades avanzadas</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs sm:text-xs">✓</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700">Potenciar tu liderazgo, creatividad y bienestar sostenido</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs sm:text-xs">✓</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700">Llevar tus capacidades al siguiente nivel</p>
                    </div>
                  </div>
                </div>

                {/* Inversión */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">💎 Inversión en tu crecimiento</h3>
                  <div className="bg-white/20 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <p className="text-sm sm:text-lg mb-2">Programa completo (4 sesiones con profesionales)</p>
                    <div className="text-2xl sm:text-3xl font-bold mb-2">$490.000 CLP</div>
                    <p className="text-xs sm:text-sm opacity-90">(30% de descuento ya aplicado)</p>
                  </div>
                  <div className="bg-yellow-400 text-yellow-900 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-sm sm:text-base font-semibold">🎁 Beneficio especial ENAP</p>
                    <p className="text-xs sm:text-sm">Reembolso garantizado del 70%</p>
                  </div>
                  <p className="text-sm sm:text-lg font-medium">
                    Haz tu diagnóstico y lleva tus capacidades al siguiente nivel
                  </p>
                </div>

                {/* CTA Principal */}
                <div className="text-center mb-6 sm:mb-8">
                  <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                    🚀 ¿Listo para potenciar lo mejor de ti?
                  </p>
                </div>
              </>
            )}

            {/* Programa Amarillo - Solo para resultado amarillo */}
            {effectiveResult === 'yellow' && (
              <>
                {/* Hero Section del Programa */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white text-center mb-6 sm:mb-8">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⚠️</div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                    Diagnóstico de Habilidades para el Bienestar
                  </h2>
                  <p className="text-lg sm:text-xl mb-4 sm:mb-6 opacity-90">
                    Cuida tu bienestar antes de que se deteriore
                  </p>
                  <p className="text-sm sm:text-lg opacity-80 max-w-2xl mx-auto">
                    Un programa breve de <strong>4 sesiones</strong> para quienes se sienten relativamente bien, pero perciben señales de alerta como estrés, cansancio o tensiones
                  </p>
                </div>

                {/* Áreas a diagnosticar */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🎯 Áreas que fortaleceremos juntos
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">💪</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Corporal-somática</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Conciencia corporal y manejo del estrés</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">❤️</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Emocional</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Regulación de emociones en el día a día</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">🧠</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Cognitiva</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Hábitos de autocuidado y descanso</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">🤝</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Relacional</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Comunicación en relaciones cercanas y laborales</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 md:col-span-2">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-yellow-700 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">🛡️</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Preventiva</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Reconocimiento de señales tempranas y estrategias de prevención</p>
                    </div>
                  </div>
                </div>

                {/* Resultados esperados */}
                <div className="bg-white rounded-2xl p-8 mb-8 border border-yellow-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🎯 Lo que lograrás
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Claridad sobre señales tempranas de desgaste</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Identificación de hábitos protectores de tu bienestar</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Estrategias prácticas para reducir riesgos de crisis</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Plan de prevención personalizado</p>
                    </div>
                  </div>
                </div>

                {/* Inversión */}
                <div className="bg-gradient-to-r from-yellow-600 to-orange-700 rounded-2xl p-8 text-white text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">💎 Inversión en tu bienestar</h3>
                  <div className="bg-white/20 rounded-xl p-6 mb-6">
                    <p className="text-lg mb-2">Programa completo (4 sesiones con profesionales)</p>
                    <div className="text-3xl font-bold mb-2">$490.000 CLP</div>
                    <p className="text-sm opacity-90">(30% de descuento ya aplicado)</p>
                  </div>
                  <div className="bg-yellow-400 text-yellow-900 rounded-xl p-4 mb-6">
                    <p className="font-semibold">🎁 Beneficio especial ENAP</p>
                    <p className="text-sm">Reembolso garantizado del 70%</p>
                  </div>
                  <p className="text-lg font-medium">
                    Haz tu diagnóstico y fortalece tu salud emocional
                  </p>
                </div>

                {/* CTA Principal */}
                <div className="text-center mb-8">
                  <p className="text-xl font-semibold text-gray-800 mb-4">
                    ⚠️ ¿Listo para cuidar tu bienestar antes de que se deteriore?
                  </p>
                </div>
              </>
            )}

            {/* Programa Naranjo - Solo para resultado naranjo */}
            {effectiveResult === 'orange' && (
              <>
                {/* Hero Section del Programa */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white text-center mb-8">
                  <div className="text-4xl mb-4">🚨</div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Diagnóstico de Habilidades para el Bienestar
                  </h2>
                  <p className="text-xl mb-6 opacity-90">
                    Estás al límite, todavía es momento de actuar
                  </p>
                  <p className="text-lg opacity-80 max-w-2xl mx-auto">
                    Un programa breve de <strong>4 sesiones</strong> para personas con alto nivel de alerta: estrés extremo, problemas de sueño o conflictos frecuentes
                  </p>
                </div>

                {/* Áreas a diagnosticar */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🎯 Áreas críticas que trabajaremos juntos
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">💪</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Corporal-somática</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Conciencia corporal y manejo del estrés sostenido</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">❤️</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Emocional</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Regulación de emociones intensas en el día a día</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">🧠</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Cognitiva</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Hábitos de sueño y descanso</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">🤝</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Relacional</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Gestión de conflictos y comunicación bajo presión</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100 md:col-span-2">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-orange-700 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">🛡️</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Preventiva</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Reconocimiento de banderas naranjas y estrategias de prevención</p>
                    </div>
                  </div>
                </div>

                {/* Resultados esperados */}
                <div className="bg-white rounded-2xl p-8 mb-8 border border-orange-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🎯 Lo que lograrás
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Prevención de crisis futura</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Estrategias de autocuidado adaptadas</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Claridad sobre banderas naranjas y cómo revertirlas</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Disminución del riesgo de desgaste emocional</p>
                    </div>
                  </div>
                </div>

                {/* Inversión */}
                <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl p-8 text-white text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">💎 Inversión urgente en tu bienestar</h3>
                  <div className="bg-white/20 rounded-xl p-6 mb-6">
                    <p className="text-lg mb-2">Programa completo (4 sesiones con profesionales)</p>
                    <div className="text-3xl font-bold mb-2">$490.000 CLP</div>
                    <p className="text-sm opacity-90">(30% de descuento ya aplicado)</p>
                  </div>
                  <div className="bg-yellow-400 text-yellow-900 rounded-xl p-4 mb-6">
                    <p className="font-semibold">🎁 Beneficio especial ENAP</p>
                    <p className="text-sm">Reembolso garantizado del 70%</p>
                  </div>
                  <p className="text-lg font-medium">
                    Haz tu diagnóstico y evita llegar a una crisis
                  </p>
                </div>

                {/* CTA Principal */}
                <div className="text-center mb-8">
                  <p className="text-xl font-semibold text-gray-800 mb-4">
                    🚨 ¿Listo para actuar antes de que sea demasiado tarde?
                  </p>
                </div>
              </>
            )}

            {/* Programa Rojo - Solo para resultado rojo */}
            {effectiveResult === 'red' && (
              <>
                {/* Hero Section del Programa */}
                <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-3xl p-8 text-white text-center mb-8">
                  <div className="text-4xl mb-4">🆘</div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Diagnóstico de Habilidades para el Bienestar
                  </h2>
                  <p className="text-xl mb-6 opacity-90">
                    Encuentra calma ahora
                  </p>
                  <p className="text-lg opacity-80 max-w-2xl mx-auto">
                    Un programa breve de <strong>4 sesiones</strong> para personas en crisis emocional que necesitan apoyo inmediato y estrategias de recuperación
                  </p>
                </div>

                {/* Áreas a diagnosticar */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🎯 Áreas críticas que trabajaremos juntos
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">💪</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Corporal-somática</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Técnicas de relajación y manejo de síntomas físicos del estrés</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">❤️</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Emocional</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Regulación emocional en crisis y manejo de emociones intensas</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">🧠</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Cognitiva</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Reestructuración de pensamientos negativos y patrones destructivos</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">🤝</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Relacional</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Comunicación en crisis y reconstrucción de vínculos de apoyo</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 md:col-span-2">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">🛡️</span>
                        </div>
                        <h4 className="font-semibold text-gray-800">Preventiva</h4>
                      </div>
                      <p className="text-gray-600 text-sm">Plan de seguridad personalizado y estrategias de prevención de recaídas</p>
                    </div>
                  </div>
                </div>

                {/* Resultados esperados */}
                <div className="bg-white rounded-2xl p-8 mb-8 border border-red-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🎯 Lo que lograrás
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Recuperar la calma y estabilidad emocional inmediata</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Identificar patrones que llevaron a la crisis</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Reconocer y activar tus recursos internos de recuperación</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">Definir pasos concretos hacia la recuperación y el bienestar</p>
                    </div>
                  </div>
                </div>

                {/* Inversión */}
                <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">💎 Inversión urgente en tu bienestar</h3>
                  <div className="bg-white/20 rounded-xl p-6 mb-6">
                    <p className="text-lg mb-2">Programa completo (4 sesiones con profesionales)</p>
                    <div className="text-3xl font-bold mb-2">$490.000 CLP</div>
                    <p className="text-sm opacity-90">(30% de descuento ya aplicado)</p>
                  </div>
                  <div className="bg-yellow-400 text-yellow-900 rounded-xl p-4 mb-6">
                    <p className="font-semibold">🎁 Beneficio especial ENAP</p>
                    <p className="text-sm">Reembolso garantizado del 70%</p>
                  </div>
                  <p className="text-lg font-medium">
                    Haz tu diagnóstico y encuentra calma ahora
                  </p>
                </div>

                {/* CTA Principal */}
                <div className="text-center mb-8">
                  <p className="text-xl font-semibold text-gray-800 mb-4">
                    🆘 ¿Listo para encontrar calma y recuperar tu estabilidad?
                  </p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6">
              {/* Botón de psiquiatría - solo para resultado rojo */}
              {effectiveResult === 'red' && (
                <button
                  onClick={() => window.open('https://www.origamis.cl/psiquiatria/', '_blank')}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-2xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">🏥 agendar hora ya!</span>
                </button>
              )}

              {/* Botón de WhatsApp - siempre visible */}
              <button
                onClick={handleWhatsAppContact}
                className={`w-full bg-gradient-to-r ${data.gradient} text-white font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-2xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2`}
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">
                  {effectiveResult === 'green' ? '🚀 Quiero potenciar mis habilidades' : 
                   effectiveResult === 'yellow' ? '⚠️ Quiero cuidar mi bienestar' :
                   effectiveResult === 'orange' ? '🚨 Quiero evitar una crisis' :
                   '🆘 Necesito apoyo ahora'}
                </span>
              </button>

              {/* Botón de reiniciar - siempre visible */}
              <button
                onClick={onRestart}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-2xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">🔄 Hacer el test otra vez</span>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-gray-200">
              <p>
                ⚠️ IMPORTANTE: Este test es solo una orientación, no es un diagnóstico médico.
              </p>
              <p>
                Si te sientes mal o tienes dudas, siempre es mejor hablar con un profesional 👩‍⚕️👨‍⚕️
              </p>
              {safetyAlert && (
                <p className="text-red-600 font-medium mt-1 sm:mt-2">
                  🚨 Si tienes pensamientos de hacerte daño, llama ya: Salud Responde 600 360 7777 o ve a urgencias.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};