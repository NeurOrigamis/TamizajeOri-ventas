import { useState, useCallback } from 'react';
import { questions, Question } from '../data/questions';

export type AnswerValue = 0 | 1 | 2 | 3; // 0=Nunca o 1 día, 1=Varios días (2-6), 2=Más de la mitad (7-11), 3=Casi todos los días (12-14)
export type ResultType = 'green' | 'yellow' | 'orange' | 'red';

export interface Answer {
  questionId: number;
  value: AnswerValue;
}

export const useQuestionnaireLogic = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id)?.value ?? null;

  const answerQuestion = useCallback((value: AnswerValue) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === currentQuestion.id);
      const newAnswer: Answer = { questionId: currentQuestion.id, value };
      
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = newAnswer;
        return updated;
      } else {
        return [...prev, newAnswer];
      }
    });
  }, [currentQuestion]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const calculateResult = useCallback((): { result: ResultType; score: number } => {
    // Calculamos el puntaje considerando ítems invertidos
    const totalScore = answers.reduce((sum, answer) => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question?.isReversed) {
        // Para ítems invertidos, invertimos la puntuación: 0->3, 1->2, 2->1, 3->0
        return sum + (3 - answer.value);
      }
      return sum + answer.value;
    }, 0);
    
    const adjustedScore = totalScore;
    
    // Puntos de corte distribuidos equitativamente:
    // 0-7: Verde (Bienestar Estable)
    // 8-15: Amarillo (Desgaste en Proceso)
    // 16-22: Naranjo (Alerta Moderada)
    // 23-30: Rojo (Alerta Emocional)
    let result: ResultType;
    
    if (adjustedScore <= 7) {
      result = 'green';
    } else if (adjustedScore <= 15) {
      result = 'yellow';
    } else if (adjustedScore <= 22) {
      result = 'orange';
    } else {
      result = 'red';
    }

    return { result, score: Math.round(adjustedScore) };
  }, [answers]);

  const calculateCategoryScores = useCallback(() => {
    const stressQuestions = [1, 2, 3]; // E1-E3
    const moodQuestions = [4, 5, 6]; // A1-A3
    const cognitiveQuestions = [7, 8, 9, 10]; // C1-C4

    const scoreEstres = answers
      .filter(answer => stressQuestions.includes(answer.questionId))
      .reduce((sum, answer) => sum + answer.value, 0);

    const scoreAnimo = answers
      .filter(answer => moodQuestions.includes(answer.questionId))
      .reduce((sum, answer) => {
        const question = questions.find(q => q.id === answer.questionId);
        if (question?.isReversed) {
          return sum + (3 - answer.value);
        }
        return sum + answer.value;
      }, 0);

    const scoreControl = answers
      .filter(answer => cognitiveQuestions.includes(answer.questionId))
      .reduce((sum, answer) => {
        const question = questions.find(q => q.id === answer.questionId);
        if (question?.isReversed) {
          return sum + (3 - answer.value);
        }
        return sum + answer.value;
      }, 0);

    return { scoreEstres, scoreAnimo, scoreControl };
  }, [answers]);

  const getTriageRecommendation = useCallback(() => {
    const { result, score } = calculateResult();
    const { scoreEstres, scoreAnimo, scoreControl } = calculateCategoryScores();
    
    // Determinar estado de subescalas
    const estresStatus = scoreEstres >= 4 ? 'red' : scoreEstres >= 3 ? 'yellow' : 'green';
    const animoStatus = scoreAnimo >= 4 ? 'red' : scoreAnimo >= 3 ? 'yellow' : 'green';
    const controlStatus = scoreControl >= 5 ? 'red' : scoreControl >= 4 ? 'yellow' : 'green';
    
    const redSubescales = [estresStatus, animoStatus, controlStatus].filter(s => s === 'red').length;
    const yellowSubescales = [estresStatus, animoStatus, controlStatus].filter(s => s === 'yellow').length;
    
    // Reglas de triage basadas en el resultado
    if (result === 'red') {
      return {
        priority: 'high',
        recommendation: 'evaluación clínica prioritaria',
        type: 'clinical'
      };
    } else if (result === 'orange') {
      return {
        priority: 'medium-high',
        recommendation: 'evaluación clínica recomendada',
        type: 'clinical-recommended'
      };
    } else if (result === 'yellow') {
      return {
        priority: 'medium',
        recommendation: 'intervención breve estructurada',
        type: 'structured'
      };
    } else {
      return {
        priority: 'low',
        recommendation: 'recomendaciones específicas de autocuidado',
        type: 'selfcare'
      };
    }
  }, [calculateResult, calculateCategoryScores]);

  const resetQuestionnaire = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsCompleted(false);
  }, []);

  const canGoNext = currentAnswer !== null;
  const canGoPrevious = currentQuestionIndex > 0;

  const getDetailedAnswers = useCallback(() => {
    return answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return {
        questionId: answer.questionId,
        questionText: question?.text || '',
        category: question?.category || '',
        value: answer.value,
        isReversed: question?.isReversed || false
      };
    });
  }, [answers]);

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    currentAnswer,
    answers,
    isCompleted,
    sessionId,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    calculateResult,
    calculateCategoryScores,
    getTriageRecommendation,
    getDetailedAnswers,
    resetQuestionnaire,
    canGoNext,
    canGoPrevious
  };
};