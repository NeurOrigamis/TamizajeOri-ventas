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
  // Estrés/Ansiedad (E1-E3)
  {
    id: 1,
    text: 'Me preocupé tanto que me costó concentrarme en lo que hacía.',
    category: 'Estrés/Ansiedad'
  },
  {
    id: 2,
    text: 'Me resultó difícil relajarme incluso cuando tenía tiempo libre.',
    category: 'Estrés/Ansiedad'
  },
  {
    id: 3,
    text: 'Estuve irritable o me molesté con facilidad.',
    category: 'Estrés/Ansiedad'
  },
  
  // Ánimo/Anhedonia (A1-A3)
  {
    id: 4,
    text: 'Sentí poco interés al realizar actividades habituales.',
    category: 'Ánimo/Anhedonia'
  },
  {
    id: 5,
    text: 'Me sentí decaído/a, triste o con "baja de ánimo".',
    category: 'Ánimo/Anhedonia'
  },
  {
    id: 6,
    text: 'Tuve problemas de sueño (dormir poco, despertar frecuente o dormir en exceso).',
    category: 'Ánimo/Anhedonia'
  },

  // Control cognitivo/Rumiación (C1-C4)
  {
    id: 7,
    text: 'Di muchas vueltas en la cabeza a los mismos pensamientos o problemas.',
    category: 'Control cognitivo/Rumiación'
  },
  {
    id: 8,
    text: 'Pensé con frecuencia que "no estaba a la altura" o que fallaría.',
    category: 'Control cognitivo/Rumiación'
  },
  {
    id: 9,
    text: 'Evité actividades importantes o las postergué por malestar emocional.',
    category: 'Control cognitivo/Rumiación'
  },
  {
    id: 10,
    text: 'Me sentí incapaz de manejar mis emociones cuando aparecieron.',
    category: 'Control cognitivo/Rumiación',
    isReversed: false
  }
]