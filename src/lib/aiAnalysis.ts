interface DetailedAnswer {
  questionId: number;
  questionText: string;
  category: string;
  value: number;
  isReversed: boolean;
}

interface CategoryScores {
  scoreEstres: number;
  scoreAnimo: number;
  scoreControl: number;
}

interface AIAnalysisResult {
  interpretation: string;
  actionPlan: string[];
  consequences: string[];
}

export enum AIAnalysisError {
  MISSING_API_KEY = 'missing_api_key',
  API_ERROR = 'api_error',
  NETWORK_ERROR = 'network_error',
  PARSE_ERROR = 'parse_error',
  RATE_LIMIT = 'rate_limit'
}

export class AIServiceError extends Error {
  constructor(public type: AIAnalysisError, message: string) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export async function generateAIAnalysis(
  detailedAnswers: DetailedAnswer[],
  categoryScores: CategoryScores,
  result: 'green' | 'yellow' | 'orange' | 'red',
  userName?: string
): Promise<AIAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new AIServiceError(
      AIAnalysisError.MISSING_API_KEY,
      'La clave API de Gemini no está configurada. Por favor, añade VITE_GEMINI_API_KEY al archivo .env'
    );
  }

  const prompt = buildPrompt(detailedAnswers, categoryScores, result, userName);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429) {
        throw new AIServiceError(
          AIAnalysisError.RATE_LIMIT,
          'Se ha excedido el límite de solicitudes a la API de Gemini. Intenta nuevamente en unos minutos.'
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new AIServiceError(
          AIAnalysisError.API_ERROR,
          'La clave API de Gemini es inválida o no tiene los permisos necesarios.'
        );
      }

      throw new AIServiceError(
        AIAnalysisError.API_ERROR,
        `Error de la API de Gemini (${response.status}): ${errorData.error?.message || 'Error desconocido'}`
      );
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';

    if (!generatedText) {
      throw new AIServiceError(
        AIAnalysisError.PARSE_ERROR,
        'La API de Gemini no devolvió ningún contenido.'
      );
    }

    return parseAIResponse(generatedText);
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIServiceError(
        AIAnalysisError.NETWORK_ERROR,
        'La solicitud a la API de Gemini tardó demasiado tiempo y fue cancelada.'
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AIServiceError(
        AIAnalysisError.NETWORK_ERROR,
        'No se pudo conectar con la API de Gemini. Verifica tu conexión a internet.'
      );
    }

    console.error('Error inesperado al generar análisis con IA:', error);
    throw new AIServiceError(
      AIAnalysisError.API_ERROR,
      `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

function buildPrompt(
  detailedAnswers: DetailedAnswer[],
  categoryScores: CategoryScores,
  result: string,
  userName?: string
): string {
  const name = userName || 'el participante';

  const answersText = detailedAnswers
    .map(a => `- ${a.questionText}: ${getAnswerLabel(a.value)}`)
    .join('\n');

  const resultLabels = {
    green: 'Bienestar Alto (Verde)',
    yellow: 'Alerta Temprana (Amarillo)',
    orange: 'Al Límite (Naranjo)',
    red: 'Sobrecarga Emocional (Rojo)'
  };

  const lengthGuidelines = {
    green: 'El análisis debe ser motivador y sustancial (200-250 palabras), enfocándose en fortalecer capacidades existentes',
    yellow: 'El análisis debe ser preventivo, detallado y educativo (250-300 palabras). Es CRÍTICO proporcionar retroalimentación completa que ayude al participante a entender la importancia de actuar ahora. Explica qué significan sus síntomas, cómo pueden progresar, y por qué este es el momento ideal para intervenir',
    orange: 'El análisis debe ser conciso pero completo (200-250 palabras), enfocándose en urgencia sin alarmar',
    red: 'El análisis debe ser breve y directo (150-200 palabras máximo), priorizando lo esencial sin abrumar'
  };

  return `Eres un psicólogo clínico experto en bienestar emocional. Analiza los siguientes resultados de un cuestionario de salud mental y genera un análisis personalizado, empático y profesional.

DATOS DEL PARTICIPANTE:
- Nombre: ${name}
- Resultado General: ${resultLabels[result as keyof typeof resultLabels]}
- Puntaje Estrés/Ansiedad: ${categoryScores.scoreEstres}/9
- Puntaje Ánimo/Anhedonia: ${categoryScores.scoreAnimo}/9
- Puntaje Control Cognitivo: ${categoryScores.scoreControl}/12

RESPUESTAS DETALLADAS:
${answersText}

ESCALA DE RESPUESTAS:
0 = Nunca o 1 día
1 = Varios días (2-6)
2 = Más de la mitad (7-11)
3 = Casi todos los días (12-14)

GUÍA DE EXTENSIÓN: ${lengthGuidelines[result as keyof typeof lengthGuidelines]}

INSTRUCCIONES:
1. Genera un análisis personalizado en primera persona (dirigiéndote a ${name}) que:
   - Identifique los patrones específicos más importantes en sus respuestas
   - Mencione las áreas de mayor preocupación de forma concisa
   - Reconozca cualquier fortaleza identificable
   - Use un tono empático, profesional y NO alarmista
   - Sea específico pero breve - agrupa observaciones similares
   - CRÍTICO: Para niveles críticos (rojo/naranja), sé más conciso y directo

   **ESPECIAL PARA NIVEL AMARILLO:**
   - Proporciona un análisis MÁS DETALLADO Y EDUCATIVO que otros niveles
   - Explica qué significan específicamente los síntomas identificados
   - Describe cómo estos síntomas pueden impactar la vida diaria (trabajo, relaciones, salud)
   - Enfatiza que este es el momento ÓPTIMO para intervención preventiva
   - Incluye contexto sobre cómo síntomas moderados pueden progresar si no se atienden
   - Valida la experiencia del participante y normaliza buscar ayuda en esta fase
   - Usa ejemplos concretos y relatable de cómo se manifiestan estos síntomas
   - Conecta los síntomas con su impacto en bienestar físico, emocional y social

2. Crea un plan de acción personalizado con 3-5 puntos concretos y breves:
   - Cada punto debe tener máximo 15 palabras
   - Enfócate en las áreas más críticas identificadas
   - Intervenciones apropiadas para su nivel de alerta
   - Agrupa áreas relacionadas en un solo punto cuando sea posible

   **ESPECIAL PARA NIVEL AMARILLO:**
   - Proporciona 4-5 puntos de acción (no 3)
   - Hazlos MÁS ESPECÍFICOS y orientados a prevención
   - Incluye técnicas concretas con nombres (ej: "Práctica de respiración diafragmática")
   - Ordena por prioridad según los síntomas más prominentes
   - Asegúrate de que sean realizables y motivadores

3. Describe 2-3 consecuencias específicas de no tomar acción:
   - Cada consecuencia debe ser concisa (máximo 20 palabras)
   - Para nivel rojo: máximo 3 consecuencias agrupadas
   - Para nivel verde/amarillo: 2-3 consecuencias preventivas
   - Evita listas exhaustivas - prioriza lo más importante

   **ESPECIAL PARA NIVEL AMARILLO:**
   - Proporciona 3 consecuencias DETALLADAS (pueden usar hasta 30 palabras cada una)
   - Enfoca en la progresión: cómo síntomas leves se vuelven severos
   - Incluye impactos específicos en diferentes áreas de vida (salud, trabajo, relaciones)
   - Usa un tono de advertencia constructiva, no alarmista
   - Balancea con mensaje de que TODO es reversible en esta etapa

FORMATO DE RESPUESTA (CRÍTICO - SIGUE EXACTAMENTE ESTE FORMATO):
[INTERPRETACION]
(Texto del análisis personalizado, 2-3 párrafos concisos)
[/INTERPRETACION]

[PLAN]
- Punto 1 del plan de acción
- Punto 2 del plan de acción
- Punto 3 del plan de acción
[/PLAN]

[CONSECUENCIAS]
- Consecuencia 1 de no actuar
- Consecuencia 2 de no actuar
- Consecuencia 3 de no actuar (opcional)
[/CONSECUENCIAS]

IMPORTANTE:
- Usa lenguaje claro, empático y profesional
- Sé específico pero CONCISO - agrupa información relacionada
- NO uses jerga técnica excesiva
- Mantén un balance entre honestidad y esperanza
- EVITA texto excesivo: prioriza calidad sobre cantidad
- Para niveles críticos, menos es más - ve directo al punto`;
}

function getAnswerLabel(value: number): string {
  const labels = [
    'Nunca o 1 día',
    'Varios días (2-6)',
    'Más de la mitad (7-11)',
    'Casi todos los días (12-14)'
  ];
  return labels[value] || 'No respondido';
}

function parseAIResponse(text: string): AIAnalysisResult {
  const interpretationMatch = text.match(/\[INTERPRETACION\]([\s\S]*?)\[\/INTERPRETACION\]/);
  const planMatch = text.match(/\[PLAN\]([\s\S]*?)\[\/PLAN\]/);
  const consequencesMatch = text.match(/\[CONSECUENCIAS\]([\s\S]*?)\[\/CONSECUENCIAS\]/);

  const interpretation = interpretationMatch
    ? interpretationMatch[1].trim()
    : 'No se pudo generar el análisis. Por favor, intenta nuevamente.';

  const actionPlan = planMatch
    ? planMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim())
    : [];

  const consequences = consequencesMatch
    ? consequencesMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim())
    : [];

  return {
    interpretation,
    actionPlan,
    consequences
  };
}
