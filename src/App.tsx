import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuestionCard } from './components/QuestionCard';
import { ResultsScreen } from './components/ResultsScreen';
import { useQuestionnaireLogic } from './hooks/useQuestionnaireLogic';

type AppState = 'welcome' | 'questionnaire' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    currentAnswer,
    isCompleted,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    calculateResult,
    resetQuestionnaire,
    canGoNext,
    canGoPrevious
  } = useQuestionnaireLogic();

  const handleStart = () => {
    setAppState('questionnaire');
  };

  const handleNext = () => {
    goToNextQuestion();
    if (isCompleted) {
      setAppState('results');
    }
  };

  const handleRestart = () => {
    resetQuestionnaire();
    setAppState('welcome');
  };

  if (appState === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (appState === 'results') {
    const { result, score } = calculateResult();
    return <ResultsScreen result={result} score={score} onRestart={handleRestart} />;
  }

  // Questionnaire state
  return (
    <QuestionCard
      question={currentQuestion.text}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={totalQuestions}
      category={currentQuestion.category}
      selectedAnswer={currentAnswer}
      onAnswerSelect={answerQuestion}
      onNext={handleNext}
      onPrevious={goToPreviousQuestion}
      canGoNext={canGoNext}
      canGoPrevious={canGoPrevious}
    />
  );
}

export default App;