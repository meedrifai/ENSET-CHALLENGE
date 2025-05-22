// pages/student/test.js
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with camera
const WebcamSurveillance = dynamic(
  () => import("@/components/WebcamSurveillance"),
  {
    ssr: false,
  }
);

export default function StudentTest() {
  const [student, setStudent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [testStartTime, setTestStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [cognitiveData, setCognitiveData] = useState({
    responsePatterns: [],
    hesitationTimes: [],
    consistencyScores: [],
    focusMetrics: [],
  });
  const [surveillanceMetrics, setSurveillanceMetrics] = useState({
    faceDetections: 0,
    positionViolations: 0,
    speechDetections: 0,
    multiplePersonsDetected: 0,
    totalChecks: 0,
  });
  const [alertsHistory, setAlertsHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const router = useRouter();
  const timerRef = useRef(null);

  useEffect(() => {
    initializeTest();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (testStartTime) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStartTime]);

  const initializeTest = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      const studentData = localStorage.getItem("studentData");

      if (!token || !studentData) {
        router.push("/student/login");
        return;
      }

      const student = JSON.parse(studentData);
      setStudent(student);

      // Fetch questions
      const response = await fetch(
        `http://localhost:8000/questions/${student.field}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.log("Error fetching questions:", response.statusText);
        throw new Error("Erreur lors du chargement des questions");
      }

      const data = await response.json();
      setQuestions(data.questions);
      setTestStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setLoading(false);
    } catch (error) {
      console.error("Error initializing test:", error);
      router.push("/student/login");
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const analyzeCognitivePattern = (answer, responseTime, isCorrect) => {
    setCognitiveData((prev) => {
      const newPatterns = [...prev.responsePatterns, answer];
      const newHesitationTimes = [...prev.hesitationTimes, responseTime];

      let newConsistencyScores = [...prev.consistencyScores];
      if (newHesitationTimes.length > 1) {
        const avgTime =
          newHesitationTimes.reduce((a, b) => a + b) /
          newHesitationTimes.length;
        const deviation = Math.abs(responseTime - avgTime);
        newConsistencyScores.push(deviation);
      }

      const focusScore = isCorrect
        ? Math.max(0, 100 - responseTime / 100)
        : Math.max(0, 50 - responseTime / 200);
      const newFocusMetrics = [...prev.focusMetrics, focusScore];

      return {
        responsePatterns: newPatterns,
        hesitationTimes: newHesitationTimes,
        consistencyScores: newConsistencyScores,
        focusMetrics: newFocusMetrics,
      };
    });
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const responseTime = Date.now() - questionStartTime;
    const isCorrect =
      selectedAnswer === questions[currentQuestionIndex].correct;

    const newAnswer = {
      questionIndex: currentQuestionIndex,
      answer: selectedAnswer,
      responseTime,
      isCorrect,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    analyzeCognitivePattern(selectedAnswer, responseTime, isCorrect);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      const totalTime = Date.now() - testStartTime;

      // Ensure we have the current answer before submitting
      let finalAnswers = [...answers];
      if (selectedAnswer !== null && currentQuestionIndex < questions.length) {
        const responseTime = Date.now() - questionStartTime;
        const isCorrect = selectedAnswer === questions[currentQuestionIndex].correct;
        
        finalAnswers.push({
          questionIndex: currentQuestionIndex,
          answer: selectedAnswer,
          responseTime,
          isCorrect,
        });
      }

      const submission = {
        student_id: student.id,
        field: student.field,
        answers: finalAnswers,
        total_time: totalTime,
        cognitive_data: cognitiveData,
        surveillance_metrics: surveillanceMetrics,
        alerts_history: alertsHistory,
      };

      console.log("Submission data:", submission); // Debug log

      const response = await fetch(`http://localhost:8000/test/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Erreur lors de la soumission");
      }

      const results = await response.json();
      console.log("Test results received:", results); // Debug log
      setTestResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Erreur lors de la soumission du test: " + error.message);
    }
  };

  const handleTimeUp = () => {
    alert("Temps écoulé! Le test sera automatiquement soumis.");
    finishTest();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSurveillanceAlert = (alertData) => {
    setAlertsHistory((prev) => [
      ...prev,
      { ...alertData, timestamp: Date.now() },
    ]);

    // Update surveillance metrics based on alert type
    setSurveillanceMetrics((prev) => ({
      ...prev,
      ...(alertData.type === "position" && {
        positionViolations: prev.positionViolations + 1,
      }),
      ...(alertData.type === "speech" && {
        speechDetections: prev.speechDetections + 1,
      }),
      ...(alertData.type === "multiple_persons" && {
        multiplePersonsDetected: prev.multiplePersonsDetected + 1,
      }),
      totalChecks: prev.totalChecks + 1,
    }));
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("studentToken");
      localStorage.removeItem("studentData");
      router.push("/");
    }
  };

  // Helper function to safely get nested values
  const getNestedValue = (obj, path, defaultValue = "N/A") => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Préparation de votre test...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    // Extract values with fallbacks
    const twinData = testResults?.cognitive_twin || {};
    const performanceSummary = twinData?.performance_summary || {};
    const surveillanceSummary = twinData?.surveillance_summary || {};
    
    // Debug log to see the actual structure
    console.log("Twin data structure:", twinData);
    console.log("Performance summary:", performanceSummary);
    console.log("Surveillance summary:", surveillanceSummary);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ✅ Test Terminé
              </h1>
              <p className="text-gray-600">
                Votre signature cognitive a été générée
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">
                🧠 Votre Signature Cognitive TWIN
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">ID TWIN Unique:</span>
                    <span className="font-bold text-blue-600">
                      {twinData.twin_id || testResults?.twin_id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Type Cognitif:</span>
                    <span className="font-bold text-green-600">
                      {twinData.cognitive_type || 
                       performanceSummary.cognitive_type || 
                       getNestedValue(testResults, 'cognitive_twin.metrics.cognitive_type', 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Précision:</span>
                    <span className="font-bold text-purple-600">
                      {performanceSummary.accuracy || testResults?.accuracy || "N/A"}% 
                      ({performanceSummary.correct_answers || testResults?.correct_answers || "0"}/
                      {performanceSummary.total_questions || testResults?.total_questions || "0"})
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Temps moyen/question:</span>
                    <span className="font-bold text-orange-600">
                      {performanceSummary.avg_response_time || 
                       getNestedValue(testResults, 'cognitive_twin.metrics.avg_response_time', 'N/A')}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Niveau de Focus:</span>
                    <span className="font-bold text-red-600">
                      {performanceSummary.focus_level || 
                       getNestedValue(testResults, 'cognitive_twin.metrics.focus_level', 'N/A')}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Violations:</span>
                    <span className="font-bold text-gray-600">
                      {surveillanceSummary.total_violations || 
                       testResults?.violations_count || 
                       "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional metrics display */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-600">Score de Consistance</div>
                  <div className="font-bold text-blue-600">
                    {performanceSummary.consistency_score || 
                     getNestedValue(testResults, 'cognitive_twin.metrics.consistency', 'N/A')}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-600">Pattern Dominant</div>
                  <div className="font-bold text-purple-600">
                    {getNestedValue(testResults, 'cognitive_twin.metrics.dominant_pattern', 'N/A')}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-600">Score d'Intégrité</div>
                  <div className="font-bold text-green-600">
                    {surveillanceSummary.integrity_score || "N/A"}%
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>📊 Signature stockée:</strong> Votre TWIN cognitif est
                  maintenant enregistré et peut être utilisé pour de futures
                  authentifications ou analyses comparatives.
                </p>
              </div>

              {/* Debug information (remove in production) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                  <details>
                    <summary className="cursor-pointer text-sm font-bold text-gray-700">
                      Debug: Données reçues (cliquer pour voir)
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                🏠 Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                📝 Test Cognitif - {student?.field?.toUpperCase()}
              </h1>
              <p className="text-gray-600">Étudiant: {student?.name}</p>
            </div>
            <div className="text-right">
              <div
                className={`text-lg font-bold ${
                  timeLeft < 300 ? "text-red-600" : "text-blue-600"
                }`}
              >
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Cognitive Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>ℹ️ Information:</strong> Ce test mesure votre signature
              cognitive unique (TWIN). Répondez naturellement, nous analysons
              vos patterns de réponse.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Surveillance Panel */}
            <div className="lg:col-span-1">
              <WebcamSurveillance
                onAlert={handleSurveillanceAlert}
                onMetricsUpdate={setSurveillanceMetrics}
              />
            </div>

            {/* Test Content */}
            <div className="lg:col-span-2">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Question {currentQuestionIndex + 1} sur {questions.length}
                  </span>
                  <span>{Math.round(progress)}% complété</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {currentQuestion?.question}
                </h3>

                <div className="space-y-3">
                  {currentQuestion?.options?.map((option, index) => (
                    <label
                      key={index}
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedAnswer === index
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={selectedAnswer === index}
                        onChange={() => handleAnswerSelect(index)}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            selectedAnswer === index
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-400"
                          }`}
                        >
                          {selectedAnswer === index && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                    selectedAnswer === null
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
                >
                  {currentQuestionIndex === questions.length - 1
                    ? "🏁 Terminer le test"
                    : "➡️ Question suivante"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}