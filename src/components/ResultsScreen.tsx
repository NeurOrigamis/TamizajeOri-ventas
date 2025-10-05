import React, { useEffect, useState } from 'react';
import { Heart, RefreshCw, CheckCircle, AlertTriangle, AlertCircle, Clock, Loader2, Sparkles, Shield, TrendingUp, Target, Users, Award, Stethoscope } from 'lucide-react';
import { sendToSheetForm } from '../lib/sheets';
import { generateAIAnalysis, AIAnalysisError, AIServiceError } from '../lib/aiAnalysis';

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
      { icon: '🔥', title: 'Fortalecimiento preventivo', text: 'Potencia tu resiliencia con técnicas basadas en evidencia' },
      { icon: '⚡', title: 'Herramientas duraderas', text: 'Estrategias prácticas de regulación y autocuidado personalizadas' },
      { icon: '🎯', title: 'Diagnóstico preciso', text: 'Evaluación completa de tu perfil emocional actual' },
      { icon: '💡', title: 'Prevención sostenible', text: 'Mantiene tu bienestar alto incluso bajo presión futura' }
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
      { icon: '🛡️', title: 'Detección temprana', text: 'Identifica y revierte signos de deterioro antes de la crisis' },
      { icon: '⏰', title: 'El momento ideal', text: 'Intervenir ahora es más fácil que esperar el cuadro consolidado' },
      { icon: '📊', title: 'Diagnóstico completo', text: 'Evaluación precisa de estrés, ánimo, autocontrol y rumiación' },
      { icon: '🌱', title: 'Plan de acción claro', text: 'Estrategias prácticas de regulación adaptadas a ti' }
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
      { icon: '🔥', title: 'Detección antes de crisis', text: 'Programa diseñado para revertir signos críticos de deterioro' },
      { icon: '⚡', title: 'Aún estás a tiempo', text: 'Reversible con diagnóstico preciso y plan personalizado' },
      { icon: '🎯', title: 'Regulación del sistema nervioso', text: 'Técnicas somáticas para recuperar el control emocional' },
      { icon: '💡', title: 'Diagnóstico + Plan de acción', text: 'Estrategias prácticas de recuperación personalizadas' }
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
      { icon: '💙', title: 'Contención inmediata', text: 'Respuesta especializada a crisis emocionales agudas' },
      { icon: '🤝', title: 'Diagnóstico rápido', text: 'Evaluación precisa de tu estado emocional actual' },
      { icon: '🆘', title: 'Intervención urgente', text: 'Plan de acción antes de que se consolide el cuadro clínico' },
      { icon: '🌅', title: 'Reversión del deterioro', text: 'Detectar, comprender y revertir signos críticos de sobrecarga' }
    ]
  }
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  score,
  categoryScores,
  detailedAnswers,
  sessionId,
  userData,
  webAppUrl,
  onRestart
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [aiAnalysis, setAiAnalysis] = useState<{
    interpretation: string;
    actionPlan: string[];
    consequences: string[];
  } | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [aiError, setAiError] = useState(false);
  const [aiErrorType, setAiErrorType] = useState<AIAnalysisError | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string>('');
  const [canRetryAI, setCanRetryAI] = useState(false);

  const config = resultConfig[result];
  const IconComponent = config.icon;

  // Extraer solo el primer nombre si hay múltiples palabras
  const getFirstName = (fullName: string | undefined) => {
    if (!fullName) return undefined;
    return fullName.trim().split(/\s+/)[0];
  };

  const firstName = getFirstName(userData?.name);

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

  const fetchAIAnalysis = async () => {
    try {
      setIsLoadingAI(true);
      setAiError(false);
      setAiErrorType(null);
      setAiErrorMessage('');

      const analysis = await generateAIAnalysis(
        detailedAnswers,
        categoryScores,
        result,
        userData?.name
      );
      setAiAnalysis(analysis);
      setCanRetryAI(false);
    } catch (error) {
      console.error('Error al generar análisis con IA:', error);
      setAiError(true);

      if (error instanceof AIServiceError) {
        setAiErrorType(error.type);
        setAiErrorMessage(error.message);
        setCanRetryAI(
          error.type === AIAnalysisError.NETWORK_ERROR ||
          error.type === AIAnalysisError.RATE_LIMIT
        );
      } else {
        setAiErrorMessage('Error inesperado al generar el análisis.');
        setCanRetryAI(true);
      }

      setAiAnalysis(getFallbackInterpretation());
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  // Función para generar 3 pasos concretos para mejorar el día
  const getDailyTips = () => {
    const { scoreEstres, scoreAnimo, scoreControl } = categoryScores;

    const stressTips = [
      'Establece rutinas diarias estructuradas que incluyan horarios fijos de descanso, alimentación y actividad física',
      'Practica respiración diafragmática o técnicas de respiración 4-7-8 para reducir la activación del sistema simpático',
      'Introduce pausas breves de atención plena durante el día (mindfulness de 3 minutos)',
      'Evita la sobreexposición a estímulos estresantes, como redes sociales o noticias negativas',
      'Realiza actividad física aeróbica regular (al menos 30 minutos diarios)',
      'Duerme entre 7 y 8 horas por noche, evitando el uso de pantallas una hora antes de dormir',
      'Aliméntate equilibradamente, priorizando alimentos ricos en triptófano, magnesio y omega-3',
      'Evita el consumo excesivo de cafeína, alcohol o tabaco',
      'Establece límites claros entre trabajo y vida personal, reservando espacios de desconexión',
      'Aprende a reconocer señales corporales tempranas de estrés (tensión muscular, taquicardia) y responde con técnicas de relajación inmediata'
    ];

    const animoTips = [
      'Realiza actividades placenteras o creativas, aunque inicialmente no generen disfrute, para reentrenar el circuito de recompensa',
      'Practica gratitud diaria escribiendo tres cosas positivas al finalizar el día',
      'Mantén vínculos sociales significativos y pide apoyo emocional cuando sea necesario',
      'Desarrolla autocompasión mediante ejercicios de diálogo interno amable y no crítico',
      'Dedica tiempo diario a actividades contemplativas o relajantes (pasear, leer, escuchar música o meditar)',
      'Establece metas realistas y alcanzables, dividiendo las tareas complejas en pasos pequeños para favorecer la sensación de logro'
    ];

    const controlTips = [
      'Identifica pensamientos automáticos negativos y cuestiona su veracidad mediante reestructuración cognitiva',
      'Utiliza técnicas de anclaje sensorial (focalizarse en un estímulo del entorno) para regresar al presente durante episodios de rumiación',
      'Monitorea tu propio estado emocional y registra desencadenantes para reconocer patrones de pensamiento repetitivo'
    ];

    // Determinar las áreas más problemáticas
    const areas = [
      { name: 'estres', score: scoreEstres, max: 9, tips: stressTips },
      { name: 'animo', score: scoreAnimo, max: 9, tips: animoTips },
      { name: 'control', score: scoreControl, max: 12, tips: controlTips }
    ];

    // Ordenar por porcentaje (score/max) descendente
    areas.sort((a, b) => (b.score / b.max) - (a.score / a.max));

    // Seleccionar tips según la prioridad de las áreas
    const selectedTips: string[] = [];

    // Obtener el área más problemática
    const topArea = areas[0];
    const secondArea = areas[1];
    const thirdArea = areas[2];

    // Si el área más crítica tiene un score significativo (>33% de su máximo), tomar 2 tips de ella
    if (topArea.score / topArea.max > 0.33) {
      // Tomar 2 tips aleatorios del área más crítica
      const shuffled = [...topArea.tips].sort(() => Math.random() - 0.5);
      selectedTips.push(shuffled[0], shuffled[1]);

      // Tomar 1 tip del segunda área más crítica
      if (secondArea.score / secondArea.max > 0.2) {
        const shuffled2 = [...secondArea.tips].sort(() => Math.random() - 0.5);
        selectedTips.push(shuffled2[0]);
      } else {
        // Si la segunda área es baja, tomar otro del área principal
        selectedTips.push(shuffled[2] || shuffled[0]);
      }
    } else {
      // Si todas las áreas están relativamente equilibradas, tomar 1 de cada
      selectedTips.push(
        topArea.tips[Math.floor(Math.random() * topArea.tips.length)],
        secondArea.tips[Math.floor(Math.random() * secondArea.tips.length)],
        thirdArea.tips[Math.floor(Math.random() * thirdArea.tips.length)]
      );
    }

    return selectedTips;
  };

  // Función de respaldo si falla la IA
  const getFallbackInterpretation = () => {
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
    const focusAreas: string[] = [];
    const strengths: string[] = [];
    const specificInsights: string[] = [];

    // === ANÁLISIS DE ESTRÉS/ANSIEDAD (Preguntas 1-3) ===
    const preocupacion = getAnswer(1); // Preocupación/concentración
    const relajacion = getAnswer(2); // Dificultad para relajarse
    const irritabilidad = getAnswer(3); // Irritabilidad

    if (estresLevel === 'critical') {
      interpretation += 'Tu nivel de estrés y ansiedad está significativamente elevado. ';

      // Consolidar insights en lugar de agregar múltiples items
      const stressSymptoms = [];
      if (preocupacion >= 2) stressSymptoms.push('preocupaciones constantes');
      if (relajacion >= 2) stressSymptoms.push('dificultad para relajarte');
      if (irritabilidad >= 2) stressSymptoms.push('irritabilidad frecuente');

      if (stressSymptoms.length > 0) {
        specificInsights.push(`Experimentas ${stressSymptoms.join(', ')}, lo que está afectando tu bienestar diario`);
      }

      focusAreas.push('Técnicas de regulación del sistema nervioso y manejo de preocupaciones');
    } else if (estresLevel === 'warning') {
      interpretation += 'Experimentas niveles moderados de estrés y ansiedad que, aunque no son severos, representan señales de alerta temprana importantes. ';

      const stressSymptoms = [];
      if (preocupacion >= 2) stressSymptoms.push('preocupaciones frecuentes que afectan tu concentración');
      if (relajacion >= 2) stressSymptoms.push('dificultad significativa para desconectar y relajarte');
      if (preocupacion >= 1 && preocupacion < 2) stressSymptoms.push('preocupaciones ocasionales');
      if (relajacion >= 1 && relajacion < 2) stressSymptoms.push('cierta dificultad para relajarte completamente');

      if (stressSymptoms.length > 0) {
        specificInsights.push(`Identifico ${stressSymptoms.join(', ')}. Estos patrones, si se mantienen, pueden evolucionar hacia ansiedad crónica o agotamiento`);
      }

      focusAreas.push('Técnicas de regulación del sistema nervioso (respiración diafragmática, relajación muscular progresiva)');
      focusAreas.push('Estrategias de gestión preventiva del estrés y establecimiento de límites saludables');
    } else if (estresLevel === 'good') {
      strengths.push('Manejas bien el estrés cotidiano y mantienes la calma bajo presión');
      if (preocupacion === 0 && relajacion === 0 && irritabilidad === 0) {
        specificInsights.push('Tu capacidad para mantenerte calmado/a y concentrado/a es una fortaleza importante');
      }
    }

    // === ANÁLISIS DE ÁNIMO/ANHEDONIA (Preguntas 4-6) ===
    const interes = getAnswer(4); // Pérdida de interés
    const tristeza = getAnswer(5); // Estado de ánimo bajo
    const sueno = getAnswer(6); // Problemas de sueño

    if (animoLevel === 'critical') {
      interpretation += 'Tu estado de ánimo muestra señales importantes que requieren atención. ';

      const moodSymptoms = [];
      if (interes >= 2) moodSymptoms.push('pérdida de interés');
      if (tristeza >= 2) moodSymptoms.push('tristeza frecuente');
      if (sueno >= 2) moodSymptoms.push('problemas de sueño');

      if (moodSymptoms.length > 0) {
        specificInsights.push(`Presentas ${moodSymptoms.join(', ')}, lo que impacta tu energía y bienestar emocional`);
      }

      focusAreas.push('Activación conductual y regulación emocional');
      if (sueno >= 2) {
        focusAreas.push('Mejora de la higiene del sueño');
      }
    } else if (animoLevel === 'warning') {
      interpretation += 'Tu estado de ánimo presenta fluctuaciones significativas que indican una fase de vulnerabilidad emocional. ';

      const moodSymptoms = [];
      if (interes >= 2) moodSymptoms.push('pérdida notable de interés o placer en actividades que antes disfrutabas');
      if (interes >= 1 && interes < 2) moodSymptoms.push('disminución del disfrute en ciertas actividades');
      if (tristeza >= 2) moodSymptoms.push('episodios frecuentes de tristeza o desánimo');
      if (tristeza >= 1 && tristeza < 2) moodSymptoms.push('momentos de bajón emocional');
      if (sueno >= 2) moodSymptoms.push('alteraciones importantes del sueño que afectan tu energía diaria');
      if (sueno >= 1 && sueno < 2) moodSymptoms.push('irregularidades en el patrón de sueño');

      if (moodSymptoms.length > 0) {
        specificInsights.push(`Observo ${moodSymptoms.join(', ')}. La anhedonia (pérdida de capacidad para sentir placer) y el bajo ánimo sostenidos son factores de riesgo para depresión si no se abordan`);
      }

      focusAreas.push('Activación conductual: retomar actividades placenteras de forma gradual y estructurada');
      focusAreas.push('Higiene del sueño y rutinas que favorezcan la regulación del estado de ánimo');
      if (interes >= 1) {
        focusAreas.push('Reconexión con fuentes de significado y propósito personal');
      }
    } else if (animoLevel === 'good') {
      strengths.push('Mantienes un buen estado de ánimo y motivación en tu día a día');
      if (interes === 0 && tristeza === 0) {
        specificInsights.push('Tu capacidad para mantener el interés y disfrutar de la vida es una gran fortaleza');
      }
    }

    // === ANÁLISIS DE CONTROL COGNITIVO (Preguntas 7-10) ===
    const rumiacion = getAnswer(7); // Dar vueltas a pensamientos
    const autocritica = getAnswer(8); // Pensamientos de inadecuación
    const evitacion = getAnswer(9); // Evitar actividades
    const regulacion = getAnswer(10); // Dificultad para manejar emociones

    if (controlLevel === 'critical') {
      interpretation += 'Tu control sobre pensamientos y emociones está significativamente comprometido. ';

      const cognitiveSymptoms = [];
      if (rumiacion >= 2) cognitiveSymptoms.push('rumiación');
      if (autocritica >= 2) cognitiveSymptoms.push('autocrítica');
      if (evitacion >= 2) cognitiveSymptoms.push('evitación');
      if (regulacion >= 2) cognitiveSymptoms.push('dificultad para regular emociones');

      if (cognitiveSymptoms.length > 0) {
        specificInsights.push(`Experimentas ${cognitiveSymptoms.join(', ')}, patrones que aumentan tu malestar`);
      }

      focusAreas.push('Técnicas de defusión cognitiva y regulación emocional');
      if (autocritica >= 2) {
        focusAreas.push('Trabajo en autocompasión');
      }
    } else if (controlLevel === 'warning') {
      interpretation += 'Tu control sobre pensamientos y emociones muestra desafíos significativos que impactan tu bienestar diario. ';

      const cognitiveSymptoms = [];
      if (rumiacion >= 2) cognitiveSymptoms.push('rumiación frecuente (dar vueltas a los mismos pensamientos sin resolución)');
      if (rumiacion >= 1 && rumiacion < 2) cognitiveSymptoms.push('tendencia ocasional a rumiar pensamientos');
      if (autocritica >= 2) cognitiveSymptoms.push('autocrítica severa y pensamientos de inadecuación');
      if (autocritica >= 1 && autocritica < 2) cognitiveSymptoms.push('pensamientos autocríticos');
      if (evitacion >= 2) cognitiveSymptoms.push('evitación marcada de situaciones o actividades importantes');
      if (evitacion >= 1 && evitacion < 2) cognitiveSymptoms.push('cierta tendencia a evitar situaciones desafiantes');
      if (regulacion >= 2) cognitiveSymptoms.push('dificultad significativa para regular emociones intensas');
      if (regulacion >= 1 && regulacion < 2) cognitiveSymptoms.push('desafíos en el manejo de emociones difíciles');

      if (cognitiveSymptoms.length > 0) {
        specificInsights.push(`Identifico ${cognitiveSymptoms.join(', ')}. Estos patrones cognitivos no solo generan malestar, sino que pueden perpetuar ciclos de ansiedad y bajo ánimo al limitar tu capacidad de respuesta efectiva`);
      }

      focusAreas.push('Técnicas de defusión cognitiva y mindfulness para desengancharse de pensamientos negativos');
      focusAreas.push('Desarrollo de flexibilidad cognitiva y reestructuración de pensamientos disfuncionales');
      if (autocritica >= 1) {
        focusAreas.push('Cultivo de autocompasión y diálogo interno más constructivo');
      }
      if (evitacion >= 1) {
        focusAreas.push('Exposición gradual y tolerancia al malestar emocional');
      }
    } else if (controlLevel === 'good') {
      strengths.push('Tienes buen control sobre tus pensamientos y manejas bien tus preocupaciones');
      if (rumiacion === 0 && autocritica === 0) {
        specificInsights.push('Tu claridad mental y autoconfianza son recursos valiosos para tu bienestar');
      }
    }

    // === CONSTRUIR MENSAJE FINAL ===
    let finalMessage = '';
    const userName = firstName ? `${firstName}, ` : '';

    if (mostCritical.level === 'critical') {
      finalMessage = `${userName}basándome en tus respuestas, tu área de mayor preocupación es ${mostCritical.name} (puntaje: ${mostCritical.score}/${mostCritical.max}). `;
      finalMessage += interpretation;

      // Limitar a máximo 3 insights específicos para evitar texto excesivo
      if (specificInsights.length > 0) {
        const topInsights = specificInsights.slice(0, 3);
        finalMessage += '\n\nObservo en tus respuestas: ' + topInsights.join('; ') + '.';
      }

      if (secondMostCritical.level === 'critical' || secondMostCritical.level === 'warning') {
        finalMessage += ` También tu ${secondMostCritical.name} requiere atención (${secondMostCritical.score}/${secondMostCritical.max}).`;
      }

      if (strengths.length > 0) {
        finalMessage += `\n\nComo aspectos positivos, ${strengths.join(' y ')}, lo cual es una base sólida para tu recuperación.`;
      }
    } else if (mostCritical.level === 'warning') {
      // Para nivel amarillo, mantener análisis conciso (máximo 150 palabras)
      finalMessage = `${userName}tus resultados indican que te encuentras en una fase de alerta temprana - un momento crítico donde la intervención preventiva es más efectiva.\n\n`;

      finalMessage += `Tu área principal de preocupación es ${mostCritical.name} (puntaje: ${mostCritical.score}/${mostCritical.max}). `;
      finalMessage += interpretation;

      if (specificInsights.length > 0) {
        const topInsight = specificInsights[0];
        finalMessage += '\n\nLo que observo específicamente: ' + topInsight;
      }

      // Mensaje educativo breve sobre importancia de actuar
      finalMessage += '\n\n¿Por qué es importante actuar ahora? Estás en la "ventana óptima de intervención". Tus síntomas aún no se han cronificado, lo que significa que responderás más rápidamente a estrategias terapéuticas.';

      if (secondMostCritical.level === 'warning') {
        finalMessage += ` También identifico desafíos en ${secondMostCritical.name} (${secondMostCritical.score}/${secondMostCritical.max}).`;
      }

      finalMessage += '\n\nEl momento de actuar es ahora. Los síntomas que experimentas son reversibles, pero requieren atención consciente y estrategias específicas.';
    } else {
      finalMessage = `${userName}tus respuestas muestran un buen equilibrio emocional general. `;

      if (strengths.length > 0) {
        finalMessage += strengths.join(', ') + '. ';
      }

      if (specificInsights.length > 0) {
        finalMessage += 'Además, ' + specificInsights.join(', ') + '. ';
      }

      finalMessage += '\n\nMantener y fortalecer tu bienestar actual te ayudará a desarrollar resiliencia y enfrentar desafíos futuros con mayor confianza. Considera este programa como una oportunidad para potenciar tus capacidades y prevenir futuros problemas.';
    }

    // === GENERAR CONSECUENCIAS DE NO ACTUAR ===
    const consequences: string[] = [];

    // Identificar áreas problemáticas para agrupar consecuencias
    const hasStressIssues = estresLevel === 'critical' || estresLevel === 'warning';
    const hasMoodIssues = animoLevel === 'critical' || animoLevel === 'warning';

    // Contar síntomas activos para determinar la severidad
    const activeSymptoms = [
      preocupacion >= 2, relajacion >= 2, irritabilidad >= 2,
      interes >= 2, tristeza >= 2, sueno >= 2,
      rumiacion >= 2, autocritica >= 2, evitacion >= 2, regulacion >= 2
    ].filter(Boolean).length;

    // Agrupar consecuencias de manera más concisa - máximo 3 items para todos los niveles
    if (mostCritical.level === 'critical') {
      // Consolidar consecuencias de salud mental y física
      const healthImpacts = [];
      if (hasStressIssues) healthImpacts.push('ansiedad severa o burnout');
      if (hasMoodIssues) healthImpacts.push('depresión clínica');
      if (healthImpacts.length > 0) {
        consequences.push(`Los síntomas pueden evolucionar a ${healthImpacts.join(' y ')}, afectando tu salud física y mental`);
      }

      // Impacto en relaciones y funcionalidad
      if (activeSymptoms >= 3) {
        consequences.push('Deterioro en relaciones personales, rendimiento laboral y capacidad para funcionar en la vida diaria');
      }

      // Mensaje de cierre
      consequences.push('Sin intervención, la recuperación será más larga y difícil. Actuar ahora es fundamental');
    } else if (mostCritical.level === 'warning') {
      // Para nivel de advertencia, 3-4 consecuencias detalladas
      if (hasStressIssues) {
        consequences.push('El estrés sostenido puede evolucionar hacia trastornos de ansiedad, ataques de pánico, o agotamiento crónico. Además, aumenta el riesgo de problemas cardiovasculares y debilita tu sistema inmunológico');
      }

      if (hasMoodIssues) {
        consequences.push('La anhedonia y el bajo ánimo persistentes son precursores de depresión clínica. Sin intervención, estos síntomas tienden a profundizarse, afectando gravemente tu calidad de vida y funcionamiento');
      }

      if ((irritabilidad >= 2 || evitacion >= 2 || regulacion >= 2)) {
        consequences.push('Los patrones de evitación, irritabilidad y dificultad para regular emociones deterioran progresivamente tus relaciones personales, rendimiento laboral y autoestima. Esto crea un ciclo de aislamiento y mayor malestar');
      }

      consequences.push('Actuar en esta fase temprana es 3-4 veces más efectivo que esperar. La neuroplasticidad cerebral favorece cambios rápidos cuando los patrones aún no están fuertemente consolidados. Posponer la intervención significa mayor sufrimiento y recuperación más larga');
    } else {
      // Nivel moderado o bueno - 2 consecuencias preventivas
      consequences.push('Sin atención preventiva, pequeños síntomas pueden evolucionar y afectar tu bienestar futuro');
      consequences.push('Invertir en tu salud mental ahora te ayudará a desarrollar resiliencia ante futuros desafíos');
    }

    return {
      interpretation: finalMessage,
      actionPlan: [...new Set(focusAreas)].slice(0, 3), // Eliminar duplicados y limitar a 3
      consequences: [...new Set(consequences)] // Eliminar duplicados
    };
  };

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
            {firstName && <span className="block mb-2 text-2xl md:text-3xl text-gray-700">Hola {firstName},</span>}
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
              {isLoadingAI ? (
                <Loader2 className={`w-8 h-8 ${config.accentColor} animate-spin`} />
              ) : (
                <Sparkles className={`w-8 h-8 ${config.accentColor}`} />
              )}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                ¿Qué significan tus resultados?
              </h2>
              <p className="text-gray-600">
                {isLoadingAI ? 'Generando análisis personalizado con IA...' : 'Análisis personalizado generado con inteligencia artificial'}
              </p>
            </div>
          </div>

          {isLoadingAI ? (
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 text-center">
                Analizando tus respuestas con inteligencia artificial para ofrecerte un diagnóstico personalizado...
              </p>
            </div>
          ) : aiAnalysis ? (
            <>
              <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
                <div className="prose prose-lg max-w-none">
                  {aiAnalysis.interpretation.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0 text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {aiAnalysis.actionPlan.length > 0 && (
                <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Target className={`w-6 h-6 mr-2 ${config.accentColor}`} />
                    Tu plan de acción personalizado
                  </h3>
                  <ul className="space-y-3">
                    {aiAnalysis.actionPlan.slice(0, 3).map((area, index) => (
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

              {result !== 'green' && aiAnalysis.consequences.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 md:p-8 border-2 border-red-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
                    ¿Qué puede pasar si no tomas acción?
                  </h3>
                  <p className="text-gray-700 mb-4 font-medium text-justify">
                    Basándome en tus respuestas específicas, estas son las posibles consecuencias de no abordar tu situación actual:
                  </p>
                  <ul className="space-y-3">
                    {aiAnalysis.consequences.map((consequence, index) => (
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

              {aiError && aiErrorType !== AIAnalysisError.MISSING_API_KEY && (
                <div className="rounded-2xl p-4 border mb-6 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1 text-yellow-800">
                        Análisis de respaldo utilizado
                      </p>
                      <p className="text-sm mb-2 text-yellow-700">
                        {aiErrorMessage} Se utilizó nuestro sistema de análisis de respaldo, igualmente preciso y personalizado.
                      </p>
                      {canRetryAI && (
                        <button
                          onClick={fetchAIAnalysis}
                          className="text-sm font-medium underline text-yellow-700 hover:text-yellow-800"
                        >
                          Intentar nuevamente con IA
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* 3 Pasos Concretos para Mejorar tu Día */}
        <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 rounded-3xl shadow-xl p-8 md:p-12 mb-12 border-2 border-teal-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              3 Pasos Concretos para Mejorar tu Día
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Basándonos en tus respuestas, estos son los pasos más relevantes que puedes implementar hoy mismo
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {getDailyTips().map((tip, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed text-lg text-justify">
                      {tip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-white rounded-xl px-6 py-3 shadow-md">
              <CheckCircle className="w-5 h-5 text-teal-600 mr-2" />
              <span className="text-gray-700 font-medium">
                Pequeños cambios diarios generan grandes transformaciones
              </span>
            </div>
          </div>
        </div>

        {/* Transición Compasiva - Consejos a Programa */}
        <div className={`rounded-3xl shadow-xl p-8 md:p-12 mb-12 ${
          result === 'green' ? 'bg-gradient-to-br from-emerald-50 to-teal-50' :
          result === 'yellow' ? 'bg-gradient-to-br from-yellow-50 to-amber-50' :
          result === 'orange' ? 'bg-gradient-to-br from-orange-50 to-red-50' :
          'bg-gradient-to-br from-red-50 to-pink-50'
        }`}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              <Heart className={`w-16 h-16 mx-auto mb-4 ${
                result === 'green' ? 'text-emerald-600' :
                result === 'yellow' ? 'text-yellow-600' :
                result === 'orange' ? 'text-orange-600' :
                'text-red-600'
              }`} />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {result === 'green' && 'Sabemos que puedes hacer estos cambios por tu cuenta'}
              {result === 'yellow' && 'Entendemos que implementar estos cambios puede ser desafiante'}
              {result === 'orange' && 'Sabemos que en este momento todo puede sentirse abrumador'}
              {result === 'red' && 'Entendemos que ahora mismo implementar cambios se siente imposible'}
            </h3>

            <p className="text-lg text-gray-700 leading-relaxed mb-6 text-justify">
              {result === 'green' && 'Los tres consejos que te compartimos son herramientas valiosas que puedes comenzar a aplicar desde hoy. Sin embargo, sabemos que mantener el bienestar de forma sostenible en un ambiente laboral demandante requiere más que buenas intenciones: necesitas un sistema estructurado y acompañamiento profesional que te ayude a consolidar estos hábitos a largo plazo.'}

              {result === 'yellow' && 'Los tres consejos que te compartimos son un excelente punto de partida, y es completamente válido si decides comenzar por tu cuenta. Sin embargo, la realidad es que cuando estamos en fase de alerta temprana, nuestro sistema nervioso ya está comprometido, lo que hace más difícil mantener la constancia y la motivación. El acompañamiento profesional multiplica significativamente tus probabilidades de éxito.'}

              {result === 'orange' && 'Los consejos que te compartimos pueden ayudarte a dar pequeños pasos, pero reconocemos que cuando estás al límite, implementar cambios por tu cuenta requiere una energía y claridad mental que en este momento puede no estar disponible. No es falta de voluntad, es que tu sistema nervioso está sobrecargado y necesita apoyo especializado para recuperarse.'}

              {result === 'red' && 'Los consejos que te compartimos son un primer paso de contención, pero queremos ser honestos contigo: cuando estás en sobrecarga emocional crítica, implementar cambios profundos por tu cuenta es extremadamente difícil y poco realista. No es culpa tuya, tu cerebro está en modo de supervivencia y necesitas apoyo profesional inmediato para salir de esta situación.'}
            </p>

            <div className={`rounded-2xl p-6 border-2 ${
              result === 'green' ? 'bg-white border-emerald-300' :
              result === 'yellow' ? 'bg-white border-yellow-300' :
              result === 'orange' ? 'bg-white border-orange-300' :
              'bg-white border-red-300'
            }`}>
              <p className="text-gray-800 leading-relaxed text-justify">
                {result === 'green' && (
                  <>
                    <strong>Por eso diseñamos nuestro programa:</strong> No para decirte lo que ya sabes, sino para ayudarte a <strong>fortalecer lo que tienes</strong>, identificar vulnerabilidades antes de que se conviertan en problemas, y construir resiliencia sostenible con estrategias personalizadas y basadas en evidencia.
                  </>
                )}

                {result === 'yellow' && (
                  <>
                    <strong>Por eso nuestro programa es diferente:</strong> No es solo información, es <strong>intervención temprana estructurada</strong>. Te ayudamos a detectar exactamente qué está fallando, comprender por qué está pasando, y revertirlo con acompañamiento profesional antes de que estos síntomas se vuelvan crónicos.
                  </>
                )}

                {result === 'orange' && (
                  <>
                    <strong>Por eso nuestro programa prioriza el acompañamiento:</strong> Necesitas un espacio seguro donde <strong>un profesional especializado te ayude</strong> a regular tu sistema nervioso, recuperar el control emocional y desarrollar un plan de acción realista. No tienes que hacerlo solo/a, y no deberías.
                  </>
                )}

                {result === 'red' && (
                  <>
                    <strong>Por eso te ofrecemos contención profesional inmediata:</strong> Necesitas que alguien con experiencia en crisis emocionales te ayude a <strong>estabilizar tu estado</strong>, comprender qué está pasando, y diseñar un camino de salida paso a paso. Este es el momento de pedir ayuda, no de intentar salir solo/a.
                  </>
                )}
              </p>
            </div>

            <p className="text-gray-600 mt-6 italic">
              {result === 'green' && 'Si decides que este es el momento de invertir en tu bienestar de forma profesional, estamos aquí para acompañarte.'}
              {result === 'yellow' && 'Si sientes que necesitas más que consejos y quieres apoyo profesional estructurado, estamos aquí para ti.'}
              {result === 'orange' && 'Si reconoces que necesitas apoyo especializado para recuperar el control, no estás solo/a. Estamos aquí.'}
              {result === 'red' && 'No tienes que enfrentar esto solo/a. Estamos aquí para brindarte la contención y el apoyo que necesitas ahora mismo.'}
            </p>
          </div>
        </div>

        {/* Value Proposition Section - Personalizado por resultado */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          <div className="text-center mb-12">
            {/* Título personalizado según resultado */}
            {result === 'green' && (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {firstName ? `${firstName}, m` : 'M'}antén y Potencia tu Bienestar con Origamis
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
                  Sabemos que tienes un buen nivel de bienestar emocional, pero entendemos que <strong>mantener este estado</strong> requiere atención consciente. El estrés laboral y las demandas diarias pueden erosionar silenciosamente tu equilibrio actual.
                </p>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Nuestro programa diagnóstico de 4 sesiones está diseñado para <strong>fortalecer tus recursos actuales</strong> y prevenir el deterioro futuro, asegurando que tu bienestar sea sostenible a largo plazo.
                </p>
              </>
            )}

            {result === 'yellow' && (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {firstName ? `${firstName}, e` : 'E'}stás en el Momento Ideal para Actuar
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
                  Tus resultados muestran <strong>señales tempranas de alerta</strong>. El estrés sostenido, la sobrecarga o la falta de descanso mental que estás experimentando <strong>aún no se han consolidado</strong> en un cuadro clínico, lo que significa que tienes una ventana de oportunidad única.
                </p>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Nuestro programa diagnóstico de 4 sesiones está específicamente diseñado para <strong>detectar, comprender y revertir</strong> estos primeros signos antes de que se transformen en crisis. Intervenir ahora es 3-4 veces más efectivo que esperar.
                </p>
              </>
            )}

            {result === 'orange' && (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {firstName ? `${firstName}, a` : 'A'}ún Estás a Tiempo de Recuperar el Control
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
                  Tus resultados indican <strong>alta tensión emocional que requiere atención inmediata</strong>. Los síntomas que experimentas están cerca de consolidarse, pero <strong>aún son reversibles</strong> con la intervención correcta.
                </p>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Nuestro programa diagnóstico de 4 sesiones te ofrece la <strong>intervención especializada urgente</strong> que necesitas ahora para <strong>detectar, comprender y revertir</strong> el deterioro emocional antes de que se convierta en un cuadro clínico severo.
                </p>
              </>
            )}

            {result === 'red' && (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {firstName ? `${firstName}, n` : 'N'}ecesitas Contención Inmediata
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
                  Tus resultados muestran <strong>sobrecarga emocional crítica</strong>. Sabemos que te sientes abrumado/a y que necesitas apoyo profesional urgente. No tienes que enfrentar esto solo/a.
                </p>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Nuestro programa diagnóstico de 4 sesiones ofrece <strong>respuesta especializada a crisis emocionales</strong>, diseñado para brindarte contención inmediata, <strong>detectar con precisión</strong> tu estado actual y <strong>revertir el deterioro</strong> antes de que se consolide permanentemente.
                </p>
              </>
            )}
          </div>

          {/* Propósito personalizado según resultado */}
          <div className={`rounded-2xl p-8 mb-8 border-2 max-w-3xl mx-auto ${
            result === 'green' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' :
            result === 'yellow' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' :
            result === 'orange' ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300' :
            'bg-gradient-to-r from-red-50 to-pink-50 border-red-300'
          }`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {result === 'green' && 'Programa de Fortalecimiento Preventivo'}
              {result === 'yellow' && 'Programa de Intervención Temprana'}
              {result === 'orange' && 'Programa de Reversión Urgente'}
              {result === 'red' && 'Programa de Contención y Recuperación'}
            </h3>
            <p className="text-gray-700 leading-relaxed text-justify">
              {result === 'green' && 'Tu programa está diseñado para fortalecer tus recursos actuales, prevenir el deterioro futuro y desarrollar resiliencia sostenible. Evaluaremos tu perfil de estrés, ánimo, autocontrol y rumiación para potenciar lo que ya funciona bien y anticipar posibles vulnerabilidades.'}

              {result === 'yellow' && 'Tu programa está específicamente diseñado para detectar y revertir las señales tempranas que identificamos en tu evaluación. Trabajaremos en regular tu estrés, restaurar tu ánimo, fortalecer tu autocontrol y reducir la rumiación, con estrategias prácticas adaptadas a tu perfil específico.'}

              {result === 'orange' && 'Tu programa ofrece intervención especializada urgente para revertir los signos críticos detectados en tu evaluación. Nos enfocaremos en regular tu sistema nervioso, recuperar tu capacidad de control emocional, restaurar tu ánimo y frenar los patrones de rumiación, antes de que se consoliden.'}

              {result === 'red' && 'Tu programa prioriza la contención inmediata y la reversión del deterioro crítico. Trabajaremos urgentemente en regular tu sobrecarga emocional, restaurar tu estabilidad, recuperar tu capacidad de funcionar y diseñar un plan de acción para salir de la crisis que estás experimentando.'}
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

        {/* Urgency Message - Personalizado */}
        {(result === 'yellow' || result === 'orange' || result === 'red') && (
          <div className={`rounded-2xl p-6 mb-8 border-l-4 max-w-3xl mx-auto ${
            result === 'yellow' ? 'bg-yellow-50 border-yellow-500' :
            result === 'orange' ? 'bg-orange-50 border-orange-500' :
            'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {result === 'yellow' && <Clock className="w-8 h-8 text-yellow-600" />}
                {result === 'orange' && <AlertTriangle className="w-8 h-8 text-orange-600" />}
                {result === 'red' && <AlertCircle className="w-8 h-8 text-red-600" />}
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-2 ${
                  result === 'yellow' ? 'text-yellow-900' :
                  result === 'orange' ? 'text-orange-900' :
                  'text-red-900'
                }`}>
                  {result === 'yellow' && 'Cada día que esperas, tus síntomas se consolidan más'}
                  {result === 'orange' && 'Estás a un paso de una crisis: actúa ahora'}
                  {result === 'red' && 'Necesitas ayuda profesional urgente hoy'}
                </h3>
                <p className={`${
                  result === 'yellow' ? 'text-yellow-800' :
                  result === 'orange' ? 'text-orange-800' :
                  'text-red-800'
                } leading-relaxed`}>
                  {result === 'yellow' && 'Las investigaciones demuestran que intervenir en la fase de alerta temprana es 3-4 veces más efectivo que esperar. Tu ventana de oportunidad es ahora, antes de que estos síntomas se vuelvan crónicos.'}
                  {result === 'orange' && 'Tus síntomas están en el punto crítico donde pueden volverse irreversibles si no actúas de inmediato. La diferencia entre recuperación rápida y sufrimiento prolongado se mide en días, no en meses.'}
                  {result === 'red' && 'Tu sobrecarga emocional requiere atención especializada inmediata. Cada día en crisis aumenta el riesgo de consecuencias graves. No esperes más: tu bienestar no puede seguir esperando.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <div className={`${config.cardBg} rounded-3xl shadow-xl p-8 md:p-12 mb-12 border-2 border-gray-200`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Inversión en tu Recuperación
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
                {result === 'green' && 'Tu Programa de Fortalecimiento Preventivo de 4 sesiones: mantén tu bienestar alto y sostenible'}
                {result === 'yellow' && 'Tu Programa de Intervención Temprana de 4 sesiones: detecta y revierte ahora antes de la crisis'}
                {result === 'orange' && 'Tu Programa de Reversión Urgente de 4 sesiones: recupera el control antes de que sea tarde'}
                {result === 'red' && 'Tu Programa de Contención y Recuperación de 4 sesiones: respuesta especializada a tu crisis'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl p-6 text-white text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 mr-3" />
                <h3 className="text-2xl font-bold">Beneficio seguro complementario ENAP</h3>
              </div>
              <p className="text-xl">Si eres trabajador de ENAP, consulta por los beneficios de tu seguro complementario</p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Compatible con ISAPREs y Seguros Complementarios</h3>
              </div>
              <p className="text-gray-700 text-center text-sm md:text-base text-justify">
                Este diagnóstico es compatible con reembolsos de ISAPREs y seguros complementarios de salud. Consulta con tu aseguradora sobre los beneficios de salud mental disponibles para maximizar tu cobertura.
              </p>
            </div>
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
                  <h3 className="font-bold text-gray-900 mb-2">Diagnóstico Preciso</h3>
                  <p className="text-gray-600 text-sm text-justify">Evaluación completa de niveles de estrés, ánimo, autocontrol y rumiación</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Detección Temprana</h3>
                  <p className="text-gray-600 text-sm text-justify">Identificación de primeros signos de deterioro antes de la crisis</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Plan de Acción Personalizado</h3>
                  <p className="text-gray-600 text-sm text-justify">Estrategias prácticas de regulación, autocuidado y prevención</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Reversión del Deterioro</h3>
                  <p className="text-gray-600 text-sm text-justify">Programa para comprender y revertir el deterioro emocional</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Personalizado */}
        <div className={`rounded-2xl p-6 mb-8 max-w-3xl mx-auto ${
          result === 'green' ? 'bg-emerald-50 border-2 border-emerald-200' :
          result === 'yellow' ? 'bg-yellow-50 border-2 border-yellow-200' :
          result === 'orange' ? 'bg-orange-50 border-2 border-orange-200' :
          'bg-red-50 border-2 border-red-200'
        }`}>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {result === 'green' && 'Cientos de personas han fortalecido su bienestar con Origamis'}
              {result === 'yellow' && 'El 87% de quienes intervienen en fase temprana evitan crisis futuras'}
              {result === 'orange' && 'El 92% de nuestros participantes recuperan el control en 4 sesiones'}
              {result === 'red' && 'Cientos de personas han salido de crisis emocionales con Origamis'}
            </p>
            <p className={`text-lg ${
              result === 'green' ? 'text-emerald-800' :
              result === 'yellow' ? 'text-yellow-800' :
              result === 'orange' ? 'text-orange-800' :
              'text-red-800'
            }`}>
              {result === 'green' && 'Únete a profesionales que invierten en mantener su bienestar alto'}
              {result === 'yellow' && 'Únete a quienes actuaron a tiempo y evitaron el burnout'}
              {result === 'orange' && 'Únete a quienes recuperaron el control antes de la crisis total'}
              {result === 'red' && 'No estás solo/a: otros han salido de donde estás ahora'}
            </p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          <div className="flex items-center justify-center mb-8">
            <Users className="w-8 h-8 text-gray-400 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">
              {result === 'green' && 'Personas como tú que fortalecieron su bienestar'}
              {result === 'yellow' && 'Personas que actuaron en fase temprana'}
              {result === 'orange' && 'Personas que recuperaron el control a tiempo'}
              {result === 'red' && 'Personas que salieron de la crisis con Origamis'}
            </h2>
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
              Cientos de <span className="font-bold text-gray-900">personas</span> ya transformaron su bienestar con nuestro programa
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
