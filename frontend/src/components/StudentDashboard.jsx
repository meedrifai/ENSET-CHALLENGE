"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
} from "lucide-react";
import dynamic from "next/dynamic";

const WebcamSurveillance = dynamic(
  () => import("@/components/WebcamSurveillance"),
  { ssr: false }
);

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("quizzes");
  const [quizzes, setQuizzes] = useState([]);
  const [exams, setExams] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeExam, setActiveExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [fraudDetected, setFraudDetected] = useState(false);
  const [fraudAttempts, setFraudAttempts] = useState(0);
  const [examTerminated, setExamTerminated] = useState(false);
  const [showWarningVideo, setShowWarningVideo] = useState(false);

  // Charger les quizzes et examens
  useEffect(() => {
    loadQuizzes();
    loadExams();
  }, []);

  const loadQuizzes = async () => {
    const savedData = localStorage.getItem("studentData");

    if (!savedData) {
      console.error("enseignantData not found in localStorage");
      return;
    }

    const parsedStudent = JSON.parse(savedData);

    try {
      const response = await fetch(
        `http://localhost:8000/student/${parsedStudent.id}/quizzes`
      );
      const data = await response.json();
      setQuizzes(data.quizzes || []);
    } catch (error) {
      console.error("Erreur lors du chargement des quizzes:", error);
    }
  };

  const loadExams = async () => {
    const savedData = localStorage.getItem("studentData");

    if (!savedData) {
      console.error("enseignantData not found in localStorage");
      return;
    }

    const parsedStudent = JSON.parse(savedData);
    try {
      const response = await fetch(
        `http://localhost:8000/student/${parsedStudent.id}/exams`
      );
      const data = await response.json();
      setExams(data.exams || []);
    } catch (error) {
      console.error("Erreur lors du chargement des examens:", error);
    }
  };

  // Démarrer un quiz
  const startQuiz = async (quiz) => {
    try {
      const response = await fetch(
        `http://localhost:8000/quiz/${quiz.id}/questions`
      );
      const questionsData = await response.json();
      setActiveQuiz({
        ...quiz,
        questions: questionsData.questions,
      });
      setCurrentQuestion(0);
      setAnswers({});
    } catch (error) {
      console.error("Erreur lors du démarrage du quiz:", error);
    }
  };

  // Démarrer un examen
  const startExam = async (exam) => {
    const savedData = localStorage.getItem("studentData");

    if (!savedData) {
      console.error("enseignantData not found in localStorage");
      return;
    }

    const parsedStudent = JSON.parse(savedData);
    try {
      const startResponse = await fetch(
        `http://localhost:8000/exam/${exam.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ student_id:parsedStudent.id }),
        }
      );
      const startResult = await startResponse.json();
      if (startResult.status === "terminated") {
        alert("Cet examen a été terminé pour cause de fraude");
        return;
      }
      const questionsResponse = await fetch(
        `http://localhost:8000/exam/${exam.id}/questions`
      );
      const questionsData = await questionsResponse.json();
      setActiveExam({
        ...exam,
        questions: questionsData.questions,
        attemptId: startResult.attempt_id,
      });
      setCurrentQuestion(0);
      setAnswers({});
      setFraudAttempts(0);
      setExamTerminated(false);
    } catch (error) {
      console.error("Erreur lors du démarrage de l'examen:", error);
    }
  };

  // Soumettre les réponses
  const submitAnswers = async () => {
    const savedData = localStorage.getItem("studentData");

    if (!savedData) {
      console.error("enseignantData not found in localStorage");
      return;
    }

    const parsedStudent = JSON.parse(savedData);
    try {
      if (activeQuiz) {
        await fetch(`http://localhost:8000/quiz/${activeQuiz.id}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: parsedStudent.id,
            answers: answers,
          }),
        });

        alert("Quiz soumis avec succès!");
      } else if (activeExam) {
        await fetch(`http://localhost:8000/exam/${activeExam.id}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attempt_id: activeExam.attemptId,
            answers: answers,
          }),
        });

        alert("Examen soumis avec succès!");
      }

      // Nettoyer
      setActiveQuiz(null);
      setActiveExam(null);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  // Interface de surveillance (overlay)
  const MonitoringOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {examTerminated ? (
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-600 mb-2">
              Examen Terminé
            </h3>
            <p className="text-gray-600 mb-4">
              Votre examen a été terminé en raison de détections de fraude
              répétées.
            </p>
            <button
              onClick={() => {
                setActiveExam(null);
                setExamTerminated(false);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Retour au dashboard
            </button>
          </div>
        ) : fraudDetected ? (
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-yellow-600 mb-2">
              {activeQuiz
                ? "Comportement Suspect Détecté"
                : `Avertissement ${fraudAttempts}/2`}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeQuiz
                ? "Nous avons détecté un comportement suspect. Regardez cette vidéo de sensibilisation."
                : "Attention: comportement suspect détecté. Un avertissement de plus et votre examen sera terminé."}
            </p>
            {activeQuiz && showWarningVideo && (
              <div className="mb-4">
                <video
                  className="w-full rounded"
                  controls
                  autoPlay
                  onEnded={() => {
                    setShowWarningVideo(false);
                    setFraudDetected(false);
                  }}
                >
                  <source src="/videos/fraud-warning.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la vidéo.
                </video>
              </div>
            )}
            {!showWarningVideo && (
              <button
                onClick={() => setFraudDetected(false)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Compris
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );

  // Interface de quiz/examen
  const TestInterface = () => {
    const currentTest = activeQuiz || activeExam;
    if (!currentTest) return null;
    const question = currentTest.questions[currentQuestion];
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WebcamSurveillance
              mode={activeQuiz ? "quiz" : "exam"}
              onStop={() => {
                setActiveQuiz(null);
                setActiveExam(null);
                setExamTerminated(true);
              }}
            />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-4">
                <span className="text-sm text-gray-500">
                  Question {currentQuestion + 1} sur {currentTest.questions.length}
                </span>
              </div>
              <h2 className="text-lg font-semibold mb-4">{question.question}</h2>
              {question.type === "multiple_choice" && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [currentQuestion]: e.target.value,
                          })
                        }
                        className="text-blue-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
              {question.type === "text" && (
                <textarea
                  value={answers[currentQuestion] || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQuestion]: e.target.value,
                    })
                  }
                  placeholder="Votre réponse..."
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                />
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Précédent
              </button>
              {currentQuestion < currentTest.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={submitAnswers}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Soumettre
                </button>
              )}
            </div>
          </div>
        </div>
        {(fraudDetected || examTerminated) && <MonitoringOverlay />}
      </div>
    );
  };

  // Interface principale du dashboard
  if (activeQuiz || activeExam) {
    return <TestInterface />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Mon Dashboard</h1>

        {/* Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "quizzes"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Mes Quizzes
          </button>
          <button
            onClick={() => setActiveTab("exams")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "exams"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Mes Examens
          </button>
        </div>

        {/* Contenu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "quizzes" &&
            quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {quiz.module_name}
                  </div>
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Commencer</span>
                  </button>
                </div>
              </div>
            ))}

          {activeTab === "exams" &&
            exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
                <p className="text-gray-600 mb-4">{exam.description}</p>
                <div className="mb-4 text-sm text-gray-500">
                  <div>Module: {exam.module_name}</div>
                  <div>
                    Début: {new Date(exam.date_debut_exame).toLocaleString()}
                  </div>
                  <div>
                    Fin: {new Date(exam.date_fin_exame).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">
                      Surveillance active
                    </span>
                  </div>
                  <button
                    onClick={() => startExam(exam)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Commencer</span>
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Message si pas de données */}
        {activeTab === "quizzes" && quizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <p>Aucun quiz disponible pour le moment</p>
            </div>
          </div>
        )}

        {activeTab === "exams" && exams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <p>Aucun examen disponible pour le moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
