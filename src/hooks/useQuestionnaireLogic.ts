import { useState, useCallback } from 'react';
import { questions, Question } from '../data/questions';

export type AnswerValue = 0 | 1 | 2 | 3; // Nunca, A veces, Casi siempre, Siempre
export type ResultType = 'green' | 'yellow' | 'red';

export interface Answer {
  questionId: number;
  value: AnswerValue;
}

export const useQuestionnaireLogic = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

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
    const totalScore = answers.reduce((sum, answer) => sum + answer.value, 0);
    
    // Scoring logic:
    // 0-15: Green (Bienestar Estable)
    // 16-30: Yellow (Desgaste en Proceso)  
    // 31-45: Red (Alerta Emocional)
    let result: ResultType;
    
    if (totalScore <= 15) {
      result = 'green';
    } else if (totalScore <= 30) {
      result = 'yellow';
    } else {
      result = 'red';
    }

    return { result, score: totalScore };
  }, [answers]);

  const resetQuestionnaire = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsCompleted(false);
  }, []);

  const canGoNext = currentAnswer !== null;
  const canGoPrevious = currentQuestionIndex > 0;

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    currentAnswer,
    answers,
    isCompleted,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    calculateResult,
    resetQuestionnaire,
    canGoNext,
    canGoPrevious
  };
};