import React from 'react';
import { MessageCircle, RefreshCw, Heart } from 'lucide-react';

interface ResultsScreenProps {
  result: 'green' | 'yellow' | 'red';
  score: number;
  onRestart: () => void;
}

const resultData = {
  green: {
    color: '🟩',
    title: 'VERDE – Bienestar Estable',
    emoji: '😀',
    gradient: 'from-green-400 to-emerald-500',
    bgGradient: 'from-green-50 via-white to-emerald-50',
    interpretation: 'Tus respuestas muestran un estado de regulación emocional adecuado. Esto significa que tu sistema nervioso mantiene un buen balance entre las demandas externas y tus propios recursos internos. Presentas capacidad para procesar el estrés cotidiano, recuperar energía y sostener un funcionamiento estable en la vida personal y laboral.',
    professional: 'Estar en verde no implica ausencia total de dificultades, sino que indica que posees estrategias de afrontamiento activas (hábitos, redes de apoyo, recursos psicológicos) que te permiten mantener la homeostasis emocional. En este estado, la clave es la prevención: fortalecer tus recursos antes de que aparezcan señales de desgaste.',
    recommendation: 'Continúa cultivando prácticas de autocuidado (descanso, ejercicio, espacios seguros de conversación) y busca nuevas herramientas que optimicen tu bienestar. Las personas en verde suelen beneficiarse de programas de crecimiento personal y aprendizaje en regulación emocional, que potencian la resiliencia y la eficiencia.',
    whatsappMessage: 'Hola! Acabo de completar el Test de Estado Emocional y mi resultado fue VERDE - Bienestar Estable 🟩😀. Me gustaría obtener más información sobre recursos y herramientas prácticas para mantener mi bienestar.'
  },
  yellow: {
    color: '🟨',
    title: 'AMARILLO – Desgaste en Proceso',
    emoji: '😐',
    gradient: 'from-yellow-400 to-orange-500',
    bgGradient: 'from-yellow-50 via-white to-orange-50',
    interpretation: 'Tus respuestas reflejan un estado intermedio de regulación, donde ya se evidencian signos de fatiga psicológica: menor motivación, sensación de esfuerzo sostenido y dificultad para mantener hábitos de autocuidado o concentración plena. Esto indica que tu sistema nervioso está funcionando en una fase de sobrecarga compensada, es decir, que sigues respondiendo, pero a un costo energético mayor.',
    professional: 'La literatura en psicología de la salud muestra que este nivel corresponde a una fase de riesgo moderado, en la que las tensiones no resueltas comienzan a acumularse y afectar de manera progresiva el bienestar. Intervenir en este punto resulta altamente efectivo: evita la cronificación del malestar y favorece una recuperación más rápida y sostenida.',
    recommendation: 'Este es el momento de buscar acompañamiento estructurado, ya sea a través de procesos terapéuticos breves para el manejo emocional, o coaching focalizado en organización, hábitos y claridad mental. El objetivo es recuperar equilibrio antes de pasar a un estado rojo, logrando mayor claridad, calma y energía disponible.',
    whatsappMessage: 'Hola! Acabo de completar el Test de Estado Emocional y mi resultado fue AMARILLO - Desgaste en Proceso 🟨😐. Me interesa agendar una sesión de diagnóstico personal para recuperar mi equilibrio emocional.'
  },
  red: {
    color: '🟥',
    title: 'ROJO – Alerta Emocional',
    emoji: '😟',
    gradient: 'from-red-400 to-red-600',
    bgGradient: 'from-red-50 via-white to-pink-50',
    interpretation: 'Tus respuestas indican un estado de alta desregulación emocional, caracterizado por ansiedad persistente, dificultades de sueño, pensamientos recurrentes y sensación de falta de recursos internos. Esto corresponde a un nivel crítico en la autorregulación neuropsicológica, donde el sistema nervioso permanece en modo de alerta constante y pierde capacidad de recuperación espontánea.',
    professional: 'La evidencia clínica muestra que permanecer en este estado aumenta el riesgo de deterioro en la salud física, en las relaciones y en el rendimiento laboral. No se trata de un signo de debilidad, sino de un indicador de que tus mecanismos de afrontamiento actuales no son suficientes frente a las exigencias que enfrentas. Este resultado debe interpretarse como una señal clara de intervención inmediata.',
    recommendation: 'Es fundamental contactar a un especialista de manera urgente, para recibir apoyo que restaure la estabilidad emocional y fisiológica. La intervención temprana es clave: permite reducir los síntomas, prevenir complicaciones mayores y recuperar una base sólida de bienestar. Pedir ayuda en esta fase no es un signo de fragilidad, sino un acto de responsabilidad con tu salud y tu entorno.',
    whatsappMessage: 'Hola! Acabo de completar el Test de Estado Emocional y mi resultado fue ROJO - Alerta Emocional 🟥😟. Necesito contactar con su equipo de apoyo de manera urgente para recibir asistencia profesional.'
  }
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, score, onRestart }) => {
  const data = resultData[result];
  
  const handleWhatsAppContact = () => {
    const phoneNumber = '56930179724';
    const message = encodeURIComponent(data.whatsappMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${data.bgGradient} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${data.gradient} p-8 text-white text-center`}>
            <div className="text-6xl mb-4">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              📊 Tu Semáforo Emocional
            </h1>
            <div className="text-xl opacity-90">
              {data.color} {data.title}
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            {/* Score */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <span className="text-2xl font-bold text-gray-700">{score}</span>
              </div>
              <p className="text-gray-600">Puntuación total de 45 puntos posibles</p>
            </div>

            {/* Interpretation */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-500" />
                Interpretación técnica:
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.interpretation}
              </p>
            </div>

            {/* Professional Reading */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Lectura profesional:
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.professional}
              </p>
            </div>

            {/* Recommendation */}
            <div className={`bg-gradient-to-r ${data.gradient} bg-opacity-10 rounded-2xl p-6`}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recomendación:
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.recommendation}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleWhatsAppContact}
                className={`flex-1 bg-gradient-to-r ${data.gradient} text-white font-semibold py-4 px-8 rounded-2xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contactar por WhatsApp</span>
              </button>

              <button
                onClick={onRestart}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-2xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Realizar Test Nuevamente</span>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p>
                Este test es una herramienta de orientación y no sustituye la evaluación profesional.
                Si experimentas malestar persistente, consulta con un especialista.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};