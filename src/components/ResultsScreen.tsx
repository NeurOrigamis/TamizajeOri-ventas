import React, { useEffect, useState } from 'react';
import { Heart, RefreshCw, CheckCircle, AlertTriangle, AlertCircle, Clock, Loader2, Sparkles, Shield, TrendingUp, Target, Users, Award, Stethoscope } from 'lucide-react';
import { sendToSheetForm } from '../lib/sheets';

interface DetailedAnswer {
  questionId: number;
  questionText: string;
  category: string;
  value: number;
  isReversed: boolean;
}

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
  detailedAnswers: DetailedAnswer[];
  sessionId: string;
  userData: { name: string; email: string } | null;
  webAppUrl: string;
  onRestart: () => void;
}

const resultConfig = {
  green: {
    color: '#3CB371',
    bgGradient: 'from-green-50 via-white to-emerald-50',
    cardBg: 'bg-green-50',
    accentColor: 'text-green-600',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    headline: 'Potencia tus fortalezas y lleva tu bienestar al siguiente nivel',
    subheadline: 'Tienes un buen nivel de bienestar emocional, pero no te detengas aquí',
    ctaButton: 'Agenda tu diagnóstico ahora',
    emotion: 'aspiracional',
    resultLabel: 'Bienestar Alto',
    benefits: [
      { icon: '🚀', title: 'Crecimiento continuo', text: 'Desarrolla resiliencia y liderazgo emocional avanzado' },
      { icon: '💪', title: 'Fortalece lo que ya tienes', text: 'Convierte tus capacidades actuales en superpoderes' },
      { icon: '🎯', title: 'Prevención proactiva', text: 'Mantén tu bienestar alto incluso bajo presión' },
      { icon: '⭐', title: 'Impacto duradero', text: 'Herramientas que te acompañarán toda la vida' }
    ]
  },
  yellow: {
    color: '#FFD43B',
    bgGradient: 'from-yellow-50 via-white to-amber-50',
    cardBg: 'bg-yellow-50',
    accentColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    icon: Clock,
    iconBg: 'bg-yellow-100',
    headline: 'Estás en una fase de alerta temprana. Actúa ahora para cuidarte',
    subheadline: 'Tu cuerpo y mente te envían señales de advertencia que conviene escuchar',
    ctaButton: 'Agenda tu diagnóstico ahora',
    emotion: 'preventivo',
    resultLabel: 'Alerta Temprana',
    benefits: [
      { icon: '🛡️', title: 'Protección inmediata', text: 'Fortalece hábitos antes de que el desgaste avance' },
      { icon: '⏰', title: 'El momento ideal', text: 'Prevenir es más fácil y efectivo que revertir' },
      { icon: '📊', title: 'Plan personalizado', text: 'Estrategias adaptadas a tu situación específica' },
      { icon: '🌱', title: 'Recuperación rápida', text: 'Restaura tu energía y equilibrio emocional' }
    ]
  },
  orange: {
    color: '#FF8C42',
    bgGradient: 'from-orange-50 via-white to-red-50',
    cardBg: 'bg-orange-50',
    accentColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    icon: AlertTriangle,
    iconBg: 'bg-orange-100',
    headline: 'Estás al límite: aún puedes recuperar el control',
    subheadline: 'Alta tensión emocional que requiere acción inmediata',
    ctaButton: 'Evita la crisis, agenda tu diagnóstico ahora',
    emotion: 'urgente',
    resultLabel: 'Al Límite',
    benefits: [
      { icon: '🔥', title: 'Intervención especializada', text: 'Herramientas probadas para manejar presión intensa' },
      { icon: '⚡', title: 'Aún estás a tiempo', text: 'Reversible con el apoyo y estrategias correctas' },
      { icon: '🎯', title: 'Regulación emocional', text: 'Aprende a controlar emociones intensas efectivamente' },
      { icon: '💡', title: 'Claridad mental', text: 'Recupera tu capacidad de pensar con calma' }
    ]
  },
  red: {
    color: '#E63946',
    bgGradient: 'from-red-50 via-white to-pink-50',
    cardBg: 'bg-red-50',
    accentColor: 'text-red-600',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    iconBg: 'bg-red-100',
    headline: 'Estás en sobrecarga emocional',
    subheadline: 'Contención inmediata y recursos para recuperar la calma',
    ctaButton: 'Recupera tu calma hoy mismo',
    emotion: 'contención',
    resultLabel: 'Sobrecarga',
    benefits: [
      { icon: '💙', title: 'Apoyo inmediato', text: 'No tienes que enfrentar esto solo/a' },
      { icon: '🤝', title: 'Acompañamiento experto', text: 'Profesionales especializados en crisis emocionales' },
      { icon: '🆘', title: 'Estrategias de emergencia', text: 'Herramientas inmediatas para recuperar estabilidad' },
      { icon: '🌅', title: 'Camino hacia la calma', text: 'Paso a paso hacia tu recuperación emocional' }
    ]
  }
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  score,
  categoryScores,
  triageRecommendation,
  detailedAnswers,
  sessionId,
  userData,
  webAppUrl,
  onRestart
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const config = resultConfig[result];
  const IconComponent = config.icon;

  // Determinar si mostrar botón de psiquiatría (naranja/rojo general o cualquier sub-item en rojo)
  const showPsychiatryButton =
    result === 'orange' ||
    result === 'red' ||
    categoryScores.scoreEstres >= 8 ||
    categoryScores.scoreAnimo >= 8 ||
    categoryScores.scoreControl >= 8;

  // Función para obtener el mensaje de WhatsApp según el resultado
  const getWhatsAppMessage = () => {
    const baseMessage = `Hola, acabo de completar el cuestionario de bienestar emocional.`;
    const userName = userData?.name ? ` Mi nombre es ${userData.name}.` : '';

    const messages = {
      green: `${baseMessage}${userName} Obtuve un resultado de Bienestar Alto y me gustaría agendar una sesión para potenciar mis fortalezas y llevar mi bienestar al siguiente nivel. ¿Podrían ayudarme con más información?`,
      yellow: `${baseMessage}${userName} Obtuve un resultado de Alerta Temprana y me gustaría actuar de manera preventiva. ¿Podrían ayudarme a agendar un diagnóstico para cuidar mi bienestar antes de que avance el desgaste?`,
      orange: `${baseMessage}${userName} Obtuve un resultado de Al Límite y siento que necesito apoyo. Me gustaría agendar un diagnóstico para recuperar el control. ¿Podrían contactarme?`,
      red: `${baseMessage}${userName} Obtuve un resultado de Situación Crítica y necesito ayuda profesional. Por favor, quisiera agendar una evaluación. ¿Podrían contactarme cuando tengan disponibilidad?`
    };

    return encodeURIComponent(messages[result]);
  };

  const whatsappUrl = `https://wa.me/56930179724?text=${getWhatsAppMessage()}`;

  const getResultColorText = (color: string) => {
    const colorMap = {
      'green': 'VERDE',
      'yellow': 'AMARILLO',
      'orange': 'NARANJO',
      'red': 'ROJO'
    };
    return colorMap[color as keyof typeof colorMap] || color.toUpperCase();
  };

  // Función para analizar respuestas individuales y generar interpretación personalizada
  const getPersonalizedInterpretation = () => {
    const { scoreEstres, scoreAnimo, scoreControl } = categoryScores;

    // Analizar respuestas específicas por pregunta
    const getAnswer = (questionId: number) => {
      const answer = detailedAnswers.find(a => a.questionId === questionId);
      return answer ? answer.value : 0;
    };

    // Normalizar puntajes a porcentaje
    const estresPercent = (scoreEstres / 9) * 100;
    const animoPercent = (scoreAnimo / 9) * 100;
    const controlPercent = (scoreControl / 12) * 100;

    // Categorizar cada área
    const categorizeScore = (percent: number) => {
      if (percent >= 66.67) return 'critical';
      if (percent >= 44.44) return 'warning';
      if (percent >= 22.22) return 'moderate';
      return 'good';
    };

    const estresLevel = categorizeScore(estresPercent);
    const animoLevel = categorizeScore(animoPercent);
    const controlLevel = categorizeScore(controlPercent);

    // Identificar la(s) área(s) más crítica(s)
    const scores = [
      { name: 'estrés', percent: estresPercent, level: estresLevel, score: scoreEstres, max: 9 },
      { name: 'ánimo', percent: animoPercent, level: animoLevel, score: scoreAnimo, max: 9 },
      { name: 'control cognitivo', percent: controlPercent, level: controlLevel, score: scoreControl, max: 12 }
    ];

    scores.sort((a, b) => b.percent - a.percent);
    const mostCritical = scores[0];
    const secondMostCritical = scores[1];

    // Generar interpretación personalizada basada en respuestas específicas
    let interpretation = '';
    let focusAreas: string[] = [];
    let strengths: string[] = [];
    let specificInsights: string[] = [];

    // === ANÁLISIS DE ESTRÉS/ANSIEDAD (Preguntas 1-3) ===
    const preocupacion = getAnswer(1); // Preocupación/concentración
    const relajacion = getAnswer(2); // Dificultad para relajarse
    const irritabilidad = getAnswer(3); // Irritabilidad

    if (estresLevel === 'critical') {
      interpretation += 'Tu nivel de estrés y ansiedad está significativamente elevado. ';

      if (preocupacion >= 2) {
        specificInsights.push('Mencionas que las preocupaciones te impiden concentrarte, lo cual afecta tu productividad y capacidad de estar presente');
      }
      if (relajacion >= 2) {
        specificInsights.push('Te cuesta desconectar y relajarte incluso en tus momentos libres, lo que impide la recuperación necesaria');
      }
      if (irritabilidad >= 2) {
        specificInsights.push('La irritabilidad frecuente puede estar afectando tus relaciones y aumentando tu nivel de tensión general');
      }

      focusAreas.push('Técnicas inmediatas de regulación del sistema nervioso (respiración, grounding)');
      focusAreas.push('Manejo de preocupaciones excesivas y pensamientos ansiosos');
    } else if (estresLevel === 'warning') {
      interpretation += 'Experimentas niveles moderados de estrés que requieren atención. ';

      if (preocupacion >= 2) {
        specificInsights.push('Las preocupaciones están comenzando a afectar tu concentración');
      }
      if (relajacion >= 2) {
        specificInsights.push('Notas dificultad para desconectar y relajarte plenamente');
      }

      focusAreas.push('Estrategias preventivas de manejo del estrés y ansiedad');
    } else if (estresLevel === 'good') {
      strengths.push('Manejas bien el estrés cotidiano y mantienes la calma bajo presión');
    }

    // === ANÁLISIS DE ÁNIMO/ANHEDONIA (Preguntas 4-6) ===
    const interes = getAnswer(4); // Pérdida de interés
    const tristeza = getAnswer(5); // Estado de ánimo bajo
    const sueno = getAnswer(6); // Problemas de sueño

    if (animoLevel === 'critical') {
      interpretation += 'Tu estado de ánimo muestra señales importantes que requieren atención. ';

      if (interes >= 2) {
        specificInsights.push('Has perdido interés en actividades que antes disfrutabas, una señal clara de anhedonia');
        focusAreas.push('Activación conductual: retomar actividades placenteras de forma gradual');
      }
      if (tristeza >= 2) {
        specificInsights.push('Experimentas tristeza o decaimiento frecuente que afecta tu día a día');
        focusAreas.push('Regulación emocional y procesamiento de emociones difíciles');
      }
      if (sueno >= 2) {
        specificInsights.push('Los problemas de sueño están afectando tu recuperación física y emocional');
        focusAreas.push('Higiene del sueño y rutinas de descanso reparador');
      }
    } else if (animoLevel === 'warning') {
      interpretation += 'Tu estado de ánimo presenta fluctuaciones que merecen atención. ';

      if (interes >= 1) {
        specificInsights.push('Notas cierta disminución en el disfrute de tus actividades habituales');
      }
      if (sueno >= 2) {
        specificInsights.push('El sueño irregular está afectando tu energía y bienestar');
        focusAreas.push('Mejora de hábitos de sueño y descanso');
      }

      focusAreas.push('Cultivo de emociones positivas y actividades significativas');
    } else if (animoLevel === 'good') {
      strengths.push('Mantienes un buen estado de ánimo y motivación en tu día a día');
    }

    // === ANÁLISIS DE CONTROL COGNITIVO (Preguntas 7-10) ===
    const rumiacion = getAnswer(7); // Dar vueltas a pensamientos
    const autocritica = getAnswer(8); // Pensamientos de inadecuación
    const evitacion = getAnswer(9); // Evitar actividades
    const regulacion = getAnswer(10); // Dificultad para manejar emociones

    if (controlLevel === 'critical') {
      interpretation += 'Tu control sobre pensamientos y emociones está significativamente comprometido. ';

      if (rumiacion >= 2) {
        specificInsights.push('Das muchas vueltas a los mismos pensamientos sin llegar a soluciones, lo que aumenta tu malestar');
        focusAreas.push('Técnicas de defusión cognitiva para romper ciclos de rumiación');
      }
      if (autocritica >= 2) {
        specificInsights.push('Los pensamientos autocríticos ("no estoy a la altura") erosionan tu confianza y bienestar');
        focusAreas.push('Trabajo en autocompasión y reestructuración de pensamientos negativos');
      }
      if (evitacion >= 2) {
        specificInsights.push('La evitación de actividades importantes por malestar emocional limita tu vida');
        focusAreas.push('Exposición gradual y tolerancia al malestar emocional');
      }
      if (regulacion >= 2) {
        specificInsights.push('Te sientes desbordado/a por tus emociones cuando aparecen');
        focusAreas.push('Herramientas de regulación emocional en tiempo real');
      }
    } else if (controlLevel === 'warning') {
      interpretation += 'Tu control cognitivo muestra algunos desafíos que conviene abordar. ';

      if (rumiacion >= 2) {
        specificInsights.push('Tiendes a darle vueltas a tus preocupaciones más de lo que te gustaría');
        focusAreas.push('Mindfulness y técnicas para soltar pensamientos repetitivos');
      }
      if (autocritica >= 1) {
        specificInsights.push('Aparecen pensamientos autocríticos que afectan tu autoconfianza');
      }

      focusAreas.push('Fortalecimiento del control atencional y flexibilidad cognitiva');
    } else if (controlLevel === 'good') {
      strengths.push('Tienes buen control sobre tus pensamientos y manejas bien tus preocupaciones');
    }

    // === CONSTRUIR MENSAJE FINAL ===
    let finalMessage = '';
    const userName = userData?.name ? `${userData.name}, ` : '';

    if (mostCritical.level === 'critical') {
      finalMessage = `${userName}basándome en tus respuestas, tu área de mayor preocupación es ${mostCritical.name} (puntaje: ${mostCritical.score}/${mostCritical.max}). `;
      finalMessage += interpretation;

      if (specificInsights.length > 0) {
        finalMessage += '\n\nEspecíficamente, observo lo siguiente en tus respuestas:\n\n';
        specificInsights.forEach(insight => {
          finalMessage += `• ${insight}\n`;
        });
      }

      if (secondMostCritical.level === 'critical' || secondMostCritical.level === 'warning') {
        finalMessage += `\n\nAdemás, tu ${secondMostCritical.name} también requiere atención (${secondMostCritical.score}/${secondMostCritical.max}).`;
      }

      if (strengths.length > 0) {
        finalMessage += `\n\nComo aspectos positivos, ${strengths.join(' y ')}, lo cual es una base sólida sobre la que construir.`;
      }
    } else if (mostCritical.level === 'warning') {
      finalMessage = `${userName}${interpretation.charAt(0).toLowerCase()}${interpretation.slice(1)}`;

      if (specificInsights.length > 0) {
        finalMessage += '\n\nEn tus respuestas noto que:\n\n';
        specificInsights.forEach(insight => {
          finalMessage += `• ${insight}\n`;
        });
      }

      if (strengths.length > 0) {
        finalMessage += `\n\nTus fortalezas incluyen: ${strengths.join(' y ')}.`;
      }
    } else {
      finalMessage = `${userName}tus respuestas muestran un buen equilibrio emocional general. ` + strengths.join(', ') + '. ';

      if (specificInsights.length > 0) {
        finalMessage += '\n\nAlgunas observaciones de tus respuestas:\n\n';
        specificInsights.forEach(insight => {
          finalMessage += `• ${insight}\n`;
        });
      }

      finalMessage += '\n\nSin embargo, siempre hay espacio para crecer y fortalecer tus capacidades de bienestar.';
    }

    // === GENERAR CONSECUENCIAS DE NO ACTUAR ===
    let consequences: string[] = [];

    // Identificar áreas problemáticas para agrupar consecuencias
    const hasStressIssues = estresLevel === 'critical' || estresLevel === 'warning';
    const hasMoodIssues = animoLevel === 'critical' || animoLevel === 'warning';
    const hasControlIssues = controlLevel === 'critical' || controlLevel === 'warning';

    // Contar síntomas activos para determinar la severidad
    const activeSymptoms = [
      preocupacion >= 2, relajacion >= 2, irritabilidad >= 2,
      interes >= 2, tristeza >= 2, sueno >= 2,
      rumiacion >= 2, autocritica >= 2, evitacion >= 2, regulacion >= 2
    ].filter(Boolean).length;

    // Agrupar consecuencias por área de impacto según el área más crítica
    if (mostCritical.level === 'critical') {
      // Salud mental y física
      if (hasStressIssues && (preocupacion >= 2 || relajacion >= 2)) {
        consequences.push('El estrés sostenido puede evolucionar a trastornos de ansiedad severos, burnout, y problemas de salud física como hipertensión o problemas cardiovasculares');
      }

      // Estado de ánimo y depresión
      if (hasMoodIssues && (interes >= 2 || tristeza >= 2)) {
        consequences.push('La pérdida de interés y tristeza persistente pueden profundizarse hasta una depresión clínica que afecte todas las áreas de tu vida');
      }

      // Relaciones y vida social
      if ((irritabilidad >= 2 || evitacion >= 2) && activeSymptoms >= 3) {
        consequences.push('El aislamiento progresivo y los conflictos interpersonales pueden llevar a la pérdida de relaciones importantes y redes de apoyo');
      }

      // Funcionamiento cognitivo
      if ((rumiacion >= 2 || autocritica >= 2 || sueno >= 2) && activeSymptoms >= 3) {
        consequences.push('El deterioro cognitivo y emocional puede resultar en dificultades para mantener trabajo estable, tomar decisiones, y funcionar en la vida diaria');
      }

      // Mensaje de cierre crítico
      consequences.push('Sin intervención, estos síntomas se intensificarán y el proceso de recuperación será más largo y difícil');
    } else if (mostCritical.level === 'warning') {
      // Para nivel de advertencia, consolidar en máximo 3 consecuencias
      if (hasStressIssues || hasMoodIssues) {
        consequences.push('Los síntomas actuales pueden escalar a problemas de ansiedad o depresión más severos que afecten tu salud física y rendimiento');
      }

      if ((irritabilidad >= 2 || evitacion >= 2 || regulacion >= 2)) {
        consequences.push('Las dificultades emocionales pueden deteriorar tus relaciones personales y laborales, limitando tu calidad de vida');
      }

      consequences.push('Actuar ahora es más fácil que esperar: prevenir requiere menos tiempo y esfuerzo que revertir un deterioro mayor');
    } else {
      // Nivel moderado o bueno - mensaje preventivo breve
      if (activeSymptoms > 0) {
        consequences.push('Aunque tu situación es manejable, sin atención estos síntomas pueden evolucionar y afectar tu bienestar a largo plazo');
      }
    }

    return {
      message: finalMessage,
      focusAreas: [...new Set(focusAreas)], // Eliminar duplicados
      strengths,
      specificInsights,
      consequences: [...new Set(consequences)], // Eliminar duplicados
      mostCritical: mostCritical.name,
      criticalScore: `${mostCritical.score}/${mostCritical.max}`
    };
  };

  const interpretation = getPersonalizedInterpretation();

  useEffect(() => {
    const submitResults = async () => {
      if (!userData || isSubmitting || submitStatus !== 'idle') return;

      setIsSubmitting(true);
      try {
        await sendToSheetForm({
          timestamp: new Date().toISOString(),
          nombre: userData.name,
          email: userData.email,
          sessionId,
          userAgent: navigator.userAgent,
          scoreTotal: score,
          scoreEstres: categoryScores.scoreEstres,
          scoreAnimo: categoryScores.scoreAnimo,
          scoreConfianza: categoryScores.scoreControl,
          resultColor: getResultColorText(result),
          webAppUrl
        });
        setSubmitStatus('success');
      } catch (error) {
        console.error('Error al enviar resultados:', error);
        setSubmitStatus('error');
      } finally {
        setIsSubmitting(false);
      }
    };

    submitResults();
  }, [userData, sessionId, score, categoryScores, result, webAppUrl, isSubmitting, submitStatus]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient}`}>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-24 h-24 ${config.iconBg} rounded-3xl mb-6 shadow-lg`}>
            <IconComponent className={`w-12 h-12 ${config.accentColor}`} />
          </div>

          {/* Result Label */}
          <div className="mb-4">
            <span className={`inline-block px-6 py-2 ${config.cardBg} rounded-full text-sm font-semibold ${config.accentColor} uppercase tracking-wide`}>
              {config.resultLabel}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight max-w-4xl mx-auto">
            {userData?.name && <span className="block mb-2 text-2xl md:text-3xl text-gray-700">Hola {userData.name},</span>}
            {config.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-center md:text-justify">
            {config.subheadline}
          </p>

          {/* Score Badge */}
          <div className="mt-8 inline-flex items-center bg-white rounded-2xl px-8 py-4 shadow-lg border border-gray-100">
            <span className="text-lg text-gray-600 mr-2">Tu puntaje:</span>
            <span className={`text-3xl font-bold ${config.accentColor}`}>{score}/30</span>
          </div>
        </div>

        {/* Personalized Interpretation Section */}
        <div className={`${config.cardBg} rounded-3xl shadow-xl p-8 md:p-12 mb-12 border-2 ${config.borderColor || 'border-gray-200'}`}>
          <div className="flex items-start space-x-4 mb-6">
            <div className={`flex-shrink-0 w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center`}>
              <IconComponent className={`w-8 h-8 ${config.accentColor}`} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {userData?.name ? `${userData.name}, ¿qué significan tus resultados?` : '¿Qué significan tus resultados?'}
              </h2>
              <p className="text-gray-600">Interpretación personalizada basada en tu perfil emocional</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
            <div className="prose prose-lg max-w-none">
              {interpretation.message.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0 text-justify">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {interpretation.focusAreas.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className={`w-6 h-6 mr-2 ${config.accentColor}`} />
                {userData?.name ? `${userData.name}, tu plan de acción personalizado` : 'Tu plan de acción personalizado'}
              </h3>
              <ul className="space-y-3">
                {interpretation.focusAreas.map((area, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className={`flex-shrink-0 w-6 h-6 ${config.iconBg} ${config.accentColor} rounded-full flex items-center justify-center text-sm font-bold`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-700 pt-0.5 text-justify">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {interpretation.consequences.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 md:p-8 border-2 border-red-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
                ¿Qué puede pasar si no tomas acción?
              </h3>
              <p className="text-gray-700 mb-4 font-medium text-justify">
                {userData?.name ? `${userData.name}, basándome` : 'Basándome'} en tus respuestas específicas, estas son las posibles consecuencias de no abordar tu situación actual:
              </p>
              <ul className="space-y-3">
                {interpretation.consequences.map((consequence, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      !
                    </span>
                    <span className="text-gray-700 leading-relaxed text-justify">{consequence}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-white rounded-xl border-l-4 border-red-500">
                <p className="text-gray-800 font-semibold text-justify">
                  La buena noticia: Todo esto es prevenible y reversible con el apoyo adecuado.
                </p>
                <p className="text-gray-600 mt-2 text-justify">
                  Actuar ahora significa elegir un camino más corto y menos doloroso hacia tu bienestar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Value Proposition Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Programa de 4 Sesiones con Profesionales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-center">
              Un plan breve, práctico y acompañado por especialistas que te guiarán paso a paso
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {config.benefits.map((benefit, index) => (
              <div key={index} className={`${config.cardBg} rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300`}>
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-justify">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What You Get Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Lo que obtendrás
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Diagnóstico Personalizado</h3>
                  <p className="text-gray-600 text-sm text-justify">Evaluación completa de tu estado emocional actual</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Herramientas Prácticas</h3>
                  <p className="text-gray-600 text-sm text-justify">Técnicas concretas para manejar ansiedad y estrés</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Plan Individualizado</h3>
                  <p className="text-gray-600 text-sm text-justify">Estrategias adaptadas a tu nivel de alerta</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Acompañamiento Experto</h3>
                  <p className="text-gray-600 text-sm text-justify">Respaldo profesional y científico continuo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className={`${config.cardBg} rounded-3xl shadow-xl p-8 md:p-12 mb-12 border-2 border-gray-200`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Inversión
          </h2>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 mb-6 text-center shadow-lg">
              <div className="mb-4">
                <div className="text-gray-500 text-lg line-through">$700.000 CLP</div>
                <div className={`text-5xl md:text-6xl font-bold ${config.accentColor} mb-2`}>
                  $490.000 CLP
                </div>
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  30% de descuento incluido
                </div>
              </div>
              <p className="text-gray-600 text-lg text-center md:text-justify">
                Programa completo de 4 sesiones con profesionales especializados
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl p-6 text-white text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 mr-3" />
                <h3 className="text-2xl font-bold">Beneficio Exclusivo ENAP</h3>
              </div>
              <p className="text-xl mb-2">Reembolso garantizado del 70%</p>
              <p className="text-blue-100">Tu inversión real: $147.000 CLP</p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Compatible con ISAPREs y Seguros Complementarios</h3>
              </div>
              <p className="text-gray-700 text-center text-sm md:text-base text-justify">
                Esta inversión es compatible con reembolsos de ISAPREs y seguros complementarios de salud. Consulta con tu aseguradora sobre los beneficios de salud mental disponibles para maximizar tu cobertura.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          <div className="flex items-center justify-center mb-8">
            <Users className="w-8 h-8 text-gray-400 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Lo que dicen nuestros participantes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-200 rounded-full mr-3 flex items-center justify-center text-blue-700 font-bold">
                  MC
                </div>
                <div>
                  <div className="font-semibold text-gray-900">María C.</div>
                  <div className="text-sm text-gray-500">ENAP</div>
                </div>
              </div>
              <p className="text-gray-700 italic text-justify">
                "El programa me ayudó a recuperar el control cuando más lo necesitaba. Ahora tengo herramientas reales para manejar el estrés."
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full mr-3 flex items-center justify-center text-green-700 font-bold">
                  JR
                </div>
                <div>
                  <div className="font-semibold text-gray-900">José R.</div>
                  <div className="text-sm text-gray-500">ENAP</div>
                </div>
              </div>
              <p className="text-gray-700 italic text-justify">
                "Invertir en este programa fue la mejor decisión. Aprendí a manejar mi ansiedad y mejoró mi calidad de vida."
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full mr-3 flex items-center justify-center text-purple-700 font-bold">
                  AS
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Ana S.</div>
                  <div className="text-sm text-gray-500">ENAP</div>
                </div>
              </div>
              <p className="text-gray-700 italic text-justify">
                "El acompañamiento profesional hizo toda la diferencia. Hoy me siento más fuerte y preparada."
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xl text-gray-600">
              Más de <span className="font-bold text-gray-900">100 personas</span> ya transformaron su bienestar con nuestro programa
            </p>
          </div>
        </div>

        {/* Category Scores */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Tu Perfil Emocional
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Estrés/Ansiedad */}
            {(() => {
              const score = categoryScores.scoreEstres;
              const maxScore = 9;
              let bgColor, borderColor, textColor, barBgColor, barColor, categoryLabel;

              if (score <= 1) {
                // Verde
                bgColor = 'from-green-50 to-emerald-50';
                borderColor = 'border-green-300';
                textColor = 'text-green-800';
                barBgColor = 'bg-green-200';
                barColor = 'bg-green-500';
                categoryLabel = 'text-green-700';
              } else if (score <= 4) {
                // Amarillo
                bgColor = 'from-yellow-50 to-amber-50';
                borderColor = 'border-yellow-300';
                textColor = 'text-yellow-800';
                barBgColor = 'bg-yellow-200';
                barColor = 'bg-yellow-500';
                categoryLabel = 'text-yellow-700';
              } else if (score <= 7) {
                // Naranjo
                bgColor = 'from-orange-50 to-red-50';
                borderColor = 'border-orange-300';
                textColor = 'text-orange-800';
                barBgColor = 'bg-orange-200';
                barColor = 'bg-orange-500';
                categoryLabel = 'text-orange-700';
              } else {
                // Rojo
                bgColor = 'from-red-50 to-rose-50';
                borderColor = 'border-red-400';
                textColor = 'text-red-800';
                barBgColor = 'bg-red-200';
                barColor = 'bg-red-600';
                categoryLabel = 'text-red-700';
              }

              return (
                <div className={`bg-gradient-to-br ${bgColor} rounded-2xl p-6 border-2 ${borderColor}`}>
                  <h3 className={`font-semibold ${categoryLabel} mb-2`}>Estrés/Ansiedad</h3>
                  <div className={`text-3xl font-bold ${textColor} mb-2`}>{score}/{maxScore}</div>
                  <div className={`w-full ${barBgColor} rounded-full h-3`}>
                    <div
                      className={`${barColor} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Ánimo/Anhedonia */}
            {(() => {
              const score = categoryScores.scoreAnimo;
              const maxScore = 9;
              let bgColor, borderColor, textColor, barBgColor, barColor, categoryLabel;

              if (score <= 1) {
                // Verde
                bgColor = 'from-green-50 to-emerald-50';
                borderColor = 'border-green-300';
                textColor = 'text-green-800';
                barBgColor = 'bg-green-200';
                barColor = 'bg-green-500';
                categoryLabel = 'text-green-700';
              } else if (score <= 4) {
                // Amarillo
                bgColor = 'from-yellow-50 to-amber-50';
                borderColor = 'border-yellow-300';
                textColor = 'text-yellow-800';
                barBgColor = 'bg-yellow-200';
                barColor = 'bg-yellow-500';
                categoryLabel = 'text-yellow-700';
              } else if (score <= 7) {
                // Naranjo
                bgColor = 'from-orange-50 to-red-50';
                borderColor = 'border-orange-300';
                textColor = 'text-orange-800';
                barBgColor = 'bg-orange-200';
                barColor = 'bg-orange-500';
                categoryLabel = 'text-orange-700';
              } else {
                // Rojo
                bgColor = 'from-red-50 to-rose-50';
                borderColor = 'border-red-400';
                textColor = 'text-red-800';
                barBgColor = 'bg-red-200';
                barColor = 'bg-red-600';
                categoryLabel = 'text-red-700';
              }

              return (
                <div className={`bg-gradient-to-br ${bgColor} rounded-2xl p-6 border-2 ${borderColor}`}>
                  <h3 className={`font-semibold ${categoryLabel} mb-2`}>Ánimo/Anhedonia</h3>
                  <div className={`text-3xl font-bold ${textColor} mb-2`}>{score}/{maxScore}</div>
                  <div className={`w-full ${barBgColor} rounded-full h-3`}>
                    <div
                      className={`${barColor} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Control Cognitivo */}
            {(() => {
              const score = categoryScores.scoreControl;
              const maxScore = 12;
              let bgColor, borderColor, textColor, barBgColor, barColor, categoryLabel;

              if (score <= 1) {
                // Verde
                bgColor = 'from-green-50 to-emerald-50';
                borderColor = 'border-green-300';
                textColor = 'text-green-800';
                barBgColor = 'bg-green-200';
                barColor = 'bg-green-500';
                categoryLabel = 'text-green-700';
              } else if (score <= 4) {
                // Amarillo
                bgColor = 'from-yellow-50 to-amber-50';
                borderColor = 'border-yellow-300';
                textColor = 'text-yellow-800';
                barBgColor = 'bg-yellow-200';
                barColor = 'bg-yellow-500';
                categoryLabel = 'text-yellow-700';
              } else if (score <= 7) {
                // Naranjo
                bgColor = 'from-orange-50 to-red-50';
                borderColor = 'border-orange-300';
                textColor = 'text-orange-800';
                barBgColor = 'bg-orange-200';
                barColor = 'bg-orange-500';
                categoryLabel = 'text-orange-700';
              } else {
                // Rojo
                bgColor = 'from-red-50 to-rose-50';
                borderColor = 'border-red-400';
                textColor = 'text-red-800';
                barBgColor = 'bg-red-200';
                barColor = 'bg-red-600';
                categoryLabel = 'text-red-700';
              }

              return (
                <div className={`bg-gradient-to-br ${bgColor} rounded-2xl p-6 border-2 ${borderColor}`}>
                  <h3 className={`font-semibold ${categoryLabel} mb-2`}>Control Cognitivo</h3>
                  <div className={`text-3xl font-bold ${textColor} mb-2`}>{score}/{maxScore}</div>
                  <div className={`w-full ${barBgColor} rounded-full h-3`}>
                    <div
                      className={`${barColor} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Submit Status */}
        {isSubmitting && (
          <div className="bg-blue-50 rounded-2xl p-4 mb-6 flex items-center justify-center max-w-2xl mx-auto">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
            <span className="text-blue-700">Enviando resultados...</span>
          </div>
        )}

        {submitStatus === 'success' && (
          <div className="bg-green-50 rounded-2xl p-4 mb-6 flex items-center justify-center max-w-2xl mx-auto">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            <span className="text-green-700">Resultados enviados correctamente</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 rounded-2xl p-4 mb-6 flex items-center justify-center max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            <span className="text-red-700">Error al enviar resultados</span>
          </div>
        )}

        {/* CTA Final */}
        <div className="text-center mb-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: config.color }}
            className={`inline-flex items-center justify-center px-12 py-6 ${result === 'yellow' ? 'text-gray-900' : 'text-white'} text-xl font-bold rounded-2xl hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-2xl w-full md:w-auto`}
          >
            <Heart className="w-6 h-6 mr-3" />
            {config.ctaButton}
          </a>
          <p className="mt-4 text-gray-500 text-sm">
            Da el primer paso hacia tu bienestar hoy
          </p>
        </div>

        {/* Botón de Psiquiatría Online - Solo para casos críticos */}
        {showPsychiatryButton && (
          <div className="text-center mb-8">
            <div className="max-w-2xl mx-auto mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
              <p className="text-gray-800 font-semibold mb-2">
                ⚕️ Tu situación requiere atención especializada
              </p>
              <p className="text-gray-600 text-sm">
                Considerando tu nivel de alerta, te recomendamos una evaluación psiquiátrica profesional para un diagnóstico preciso y tratamiento adecuado
              </p>
            </div>
            <a
              href="https://saludorigamis.site.agendapro.com/cl/sucursal/352735"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-12 py-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-2xl w-full md:w-auto"
            >
              <Stethoscope className="w-6 h-6 mr-3" />
              Agendar Hora de Psiquiatría Online
            </a>
            <p className="mt-4 text-gray-600 text-sm">
              Atención profesional inmediata con psiquiatras especializados
            </p>
          </div>
        )}

        {/* Secondary Action */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Realizar Nuevo Test</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500 space-y-2">
          <p>ID de Sesión: {sessionId}</p>
          <p className="max-w-2xl mx-auto">
            Este cuestionario es un tamizaje y no reemplaza una evaluación clínica profesional.
            Los resultados son confidenciales y solo se utilizan para ofrecerte el mejor programa personalizado.
          </p>
        </div>
      </div>

      {/* Sticky CTA Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-2xl md:hidden border-t border-gray-200">
        {showPsychiatryButton ? (
          <div className="space-y-2">
            <a
              href="https://saludorigamis.site.agendapro.com/cl/sucursal/352735"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base font-bold rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center"
            >
              <Stethoscope className="w-5 h-5 mr-2" />
              Psiquiatría Online
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: config.color }}
              className={`w-full py-3 ${result === 'yellow' ? 'text-gray-900' : 'text-white'} text-sm font-bold rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center`}
            >
              {config.ctaButton}
            </a>
          </div>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: config.color }}
            className={`w-full py-4 ${result === 'yellow' ? 'text-gray-900' : 'text-white'} text-lg font-bold rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center`}
          >
            {config.ctaButton}
          </a>
        )}
      </div>
    </div>
  );
};
