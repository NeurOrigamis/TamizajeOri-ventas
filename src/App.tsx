import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegistrationForm } from './components/RegistrationForm';
import { QuestionCard } from './components/QuestionCard';
import { ResultsScreen } from './components/ResultsScreen';
import { useQuestionnaireLogic } from './hooks/useQuestionnaireLogic';
import { sendToSheetForm } from './lib/sheets';

type AppState = 'welcome' | 'registration' | 'questionnaire' | 'results';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx89bHiRuSKO8N2yhHRZIvG_OGFNTwMLJIXYsGeCtvZaxFcLGRxeZCFJrMmZzRUV7lrlQ/exec';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    currentAnswer,
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
  } = useQuestionnaireLogic();

  const handleStart = () => {
    setAppState('registration');
  };

  const handleRegister = (name: string, email: string) => {
    setUserData({ name, email });
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
    setUserData(null);
    setAppState('welcome');
  };

  if (appState === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (appState === 'registration') {
    return <RegistrationForm onRegister={handleRegister} />;
  }

  if (appState === 'results') {
    const { result, score } = calculateResult();
    const categoryScores = calculateCategoryScores();
    const triageRecommendation = getTriageRecommendation();
    const detailedAnswers = getDetailedAnswers();
    return (
      <ResultsScreen
        result={result}
        score={score}
        categoryScores={categoryScores}
        triageRecommendation={triageRecommendation}
        detailedAnswers={detailedAnswers}
        sessionId={sessionId}
        userData={userData}
        webAppUrl={WEB_APP_URL}
        onRestart={handleRestart}
      />
    );
  }

  // Questionnaire state
  return (
    <QuestionCard
      question={currentQuestion}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={totalQuestions}
      category={currentQuestion?.category}
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