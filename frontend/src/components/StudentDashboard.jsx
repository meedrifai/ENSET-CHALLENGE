"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  XCircle,
  Info,
  Calendar,
  User,
  BookOpen,
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
  const [loading, setLoading] = useState(false);

  // Load quizzes and exams on component mount
  useEffect(() => {
    loadQuizzes();
    loadExams();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const savedData = localStorage.getItem("studentData");
      if (!savedData) {
        console.error("studentData not found in localStorage");
        return;
      }

      const parsedStudent = JSON.parse(savedData);
      const response = await fetch(
        `http://localhost:8000/student/${parsedStudent.id}/quizzes`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setQuizzes(data.quizzes || []);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async () => {
    setLoading(true);
    try {
      const savedData = localStorage.getItem("studentData");
      if (!savedData) {
        console.error("studentData not found in localStorage");
        return;
      }

      const parsedStudent = JSON.parse(savedData);
      const response = await fetch(
        `http://localhost:8000/student/${parsedStudent.id}/exams`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setExams(data.exams || []);
    } catch (error) {
      console.error("Error loading exams:", error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  // Start a quiz
  const startQuiz = async (quiz) => {
    if (!quiz.can_take) {
      alert(quiz.message || "Ce quiz n'est pas disponible");
      return;
    }

    try {
      const savedData = localStorage.getItem("studentData");
      const parsedStudent = JSON.parse(savedData);
      
      // Start the quiz
      const startResponse = await fetch(
        `http://localhost:8000/quiz/${quiz.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ student_id: parsedStudent.id }),
        }
      );
      
      const startResult = await startResponse.json();
      
      if (!startResponse.ok) {
        alert(startResult.detail || "Erreur lors du démarrage du quiz");
        return;
      }

      // Get quiz questions
      const questionsResponse = await fetch(
        `http://localhost:8000/quiz/${quiz.id}/questions`
      );
      const questionsData = await questionsResponse.json();
      
      setActiveQuiz({
        ...quiz,
        questions: questionsData.questions,
        attemptId: startResult.attempt_id,
      });
      setCurrentQuestion(0);
      setAnswers({});
      setFraudAttempts(startResult.fraud_attempts || 0);
      setExamTerminated(false);
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("Erreur lors du démarrage du quiz");
    }
  };

  // Start an exam
  const startExam = async (exam) => {
    if (!exam.can_take) {
      alert(exam.message || "Cet examen n'est pas disponible");
      return;
    }

    try {
      const savedData = localStorage.getItem("studentData");
      const parsedStudent = JSON.parse(savedData);
      
      // Start the exam
      const startResponse = await fetch(
        `http://localhost:8000/exam/${exam.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ student_id: parsedStudent.id }),
        }
      );
      
      const startResult = await startResponse.json();

      if (startResult.status === "terminated") {
        alert("Cet examen a été terminé pour cause de fraude");
        return;
      }

      // Get exam questions
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
      setFraudAttempts(startResult.fraud_attempts || 0);
      setExamTerminated(false);
    } catch (error) {
      console.error("Error starting exam:", error);
      alert("Erreur lors du démarrage de l'examen");
    }
  };

  // Submit answers
  const submitAnswers = async () => {
    const savedData = localStorage.getItem("studentData");
    if (!savedData) {
      console.error("studentData not found in localStorage");
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
            attempt_id: activeQuiz.attemptId,
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

      // Clean up
      setActiveQuiz(null);
      setActiveExam(null);
      
      // Reload the lists to update statuses
      loadQuizzes();
      loadExams();
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("Erreur lors de la soumission");
    }
  };

  // Get status badge component
  const StatusBadge = ({ status, message }) => {
    const getStatusConfig = () => {
      switch (status) {
        case "completed":
          return {
            icon: CheckCircle,
            color: "bg-green-100 text-green-800",
            text: "Complété"
          };
        case "terminated":
          return {
            icon: XCircle,
            color: "bg-red-100 text-red-800",
            text: "Terminé"
          };
        case "in_progress":
          return {
            icon: Clock,
            color: "bg-yellow-100 text-yellow-800",
            text: "En cours"
          };
        case "available":
          return {
            icon: Play,
            color: "bg-blue-100 text-blue-800",
            text: "Disponible"
          };
        default:
          return {
            icon: Info,
            color: "bg-gray-100 text-gray-800",
            text: "Indisponible"
          };
      }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </div>
    );
  };

  // Monitoring overlay component
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
                loadExams(); // Reload to update status
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

  // Test interface component
  const TestInterface = () => {
    const currentTest = activeQuiz || activeExam;
    if (!currentTest || !currentTest.questions) return null;
    
    const question = currentTest.questions[currentQuestion];
    if (!question) return null;

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
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Question {currentQuestion + 1} sur {currentTest.questions.length}
                </span>
                <div className="text-sm text-gray-500">
                  Tentatives de fraude: {fraudAttempts}/2
                </div>
              </div>
              <h2 className="text-lg font-semibold mb-4">{question.question}</h2>
              
              {question.type === "multiple_choice" && question.options && (
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

  // Main dashboard interface
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
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "quizzes"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Mes Quizzes
          </button>
          <button
            onClick={() => setActiveTab("exams")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "exams"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Mes Examens
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Chargement...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "quizzes" &&
              quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <StatusBadge status={quiz.status} message={quiz.message} />
                  </div>
                  
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Module: {quiz.module_name}
                    </div>
                    {quiz.date_debut_quiz && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Début: {new Date(quiz.date_debut_quiz).toLocaleString()}
                      </div>
                    )}
                    {quiz.date_fin_quiz && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Fin: {new Date(quiz.date_fin_quiz).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  {quiz.message && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{quiz.message}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {quiz.fraud_attempts > 0 && (
                        <span className="text-red-500">
                          Fraudes: {quiz.fraud_attempts}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => startQuiz(quiz)}
                      disabled={!quiz.can_take}
                      className={`px-4 py-2 rounded flex items-center space-x-2 transition-colors ${
                        quiz.can_take
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      <span>
                        {quiz.status === "in_progress" ? "Reprendre" : "Commencer"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "exams" &&
              exams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{exam.title}</h3>
                    <StatusBadge status={exam.status} message={exam.message} />
                  </div>
                  
                  <p className="text-gray-600 mb-4">{exam.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Module: {exam.module_name}
                    </div>
                    {exam.date_debut_exame && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Début: {new Date(exam.date_debut_exame).toLocaleString()}
                      </div>
                    )}
                    {exam.date_fin_exame && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Fin: {new Date(exam.date_fin_exame).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  {exam.message && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{exam.message}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">
                        Surveillance active
                      </span>
                      {exam.fraud_attempts > 0 && (
                        <span className="text-sm text-red-500">
                          ({exam.fraud_attempts} fraudes)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => startExam(exam)}
                      disabled={!exam.can_take}
                      className={`px-4 py-2 rounded flex items-center space-x-2 transition-colors ${
                        exam.can_take
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      <span>
                        {exam.status === "in_progress" ? "Reprendre" : "Commencer"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Empty states */}
        {!loading && activeTab === "quizzes" && quizzes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun quiz disponible
            </h3>
            <p className="text-gray-500">
              Vos quizzes apparaîtront ici une fois qu'ils seront assignés.
            </p>
          </div>
        )}

        {!loading && activeTab === "exams" && exams.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun examen disponible
            </h3>
            <p className="text-gray-500">
              Vos examens apparaîtront ici une fois qu'ils seront programmés.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;