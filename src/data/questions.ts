export interface Question {
  id: number;
  text: string;
  category: 'Estrés/Ansiedad' | 'Ánimo/Anhedonia' | 'Control cognitivo/Rumiación';
  isReversed?: boolean;
}

export interface SafetyQuestion {
  id: string;
  text: string;
}

export const questions: Question[] = [
  // Estrés/Ansiedad (E1-E5)
  {
    id: 1,
    text: 'Me preocupé tanto que me costó concentrarme en lo que hacía.',
    category: 'Estrés/Ansiedad'
  },
  {
    id: 2,
    text: 'Me sentí inquieto/a o "acelerado/a" la mayor parte del día.',
    category: 'Estrés/Ansiedad'
  },
  {
    id: 3,
    text: 'Noté tensión corporal (p. ej., presión en el pecho, palpitaciones, sudor).',
    category: 'Estrés/Ansiedad'
  },
  {
    id: 4,
    text: 'Me resultó difícil relajarme incluso cuando tenía tiempo libre.',
    category: 'Estrés/Ansiedad'
  },
  {
    id: 5,
    text: 'Estuve irritable o me molesté con facilidad.',
    category: 'Estrés/Ansiedad'
  },
  
  // Ánimo/Anhedonia (A1-A5)
  {
    id: 6,
    text: 'Sentí poco interés o placer al realizar actividades habituales.',
    category: 'Ánimo/Anhedonia'
  },
  {
    id: 7,
    text: 'Me sentí decaído/a, triste o con "baja de ánimo".',
    category: 'Ánimo/Anhedonia'
  },
  {
    id: 8,
    text: 'Me sentí cansado/a o con poca energía.',
    category: 'Ánimo/Anhedonia'
  },
  {
    id: 9,
    text: 'Tuve problemas de sueño (dormir poco, despertar frecuente o dormir en exceso).',
    category: 'Ánimo/Anhedonia'
  },
  {
    id: 10,
    text: 'Noté lentitud o, por el contrario, inquietud inusual en mis movimientos.',
    category: 'Ánimo/Anhedonia'
  },

  // Control cognitivo/Rumiación (C1-C5)
  {
    id: 11,
    text: 'Di muchas vueltas en la cabeza a los mismos pensamientos o problemas.',
    category: 'Control cognitivo/Rumiación'
  },
  {
    id: 12,
    text: 'Me costó decidir o mantener la atención en tareas simples.',
    category: 'Control cognitivo/Rumiación'
  },
  {
    id: 13,
    text: 'Pensé con frecuencia que "no estaba a la altura" o que fallaría.',
    category: 'Control cognitivo/Rumiación'
  },
  {
    id: 14,
    text: 'Evité actividades importantes o las postergué por malestar emocional.',
    category: 'Control cognitivo/Rumiación'
  },
  {
    id: 15,
    text: 'Me sentí incapaz de manejar mis emociones cuando aparecieron.',
    category: 'Control cognitivo/Rumiación',
    isReversed: false
  }
];

export const safetyQuestion: SafetyQuestion = {
  id: 'R1',
  text: 'En los últimos 14 días, tuve pensamientos de hacerme daño o de que sería mejor no estar.'
};

export interface AbandonmentQuestion {
  id: string;
  text: string;
  subtitle: string;
}

export const abandonmentQuestion: AbandonmentQuestion = {
  id: 'A1',
  text: 'Mientras avanzas en este cuestionario, ¿has sentido en algún momento deseos de abandonarlo? Si es así, ¿qué crees que expresa ese impulso para ti?',
  subtitle: 'Conocer tu estado de bienestar actual es fundamental para tu salud emocional'
};