from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore
import hashlib
import time
from datetime import datetime, timedelta, timezone
import json
import random
import string
from pydantic import BaseModel
from typing import Literal


# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate("./serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()
app = FastAPI(title="EDGUARD API", version="2.0.0")
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class StudentLogin(BaseModel):
    student_id: str
    password: str

class TeacherLogin(BaseModel):
    email: str
    password: str

class AdminLogin(BaseModel):
    email: str
    password: str

class StudentCreate(BaseModel):
    name: str
    email: str
    field: str
    password: str

class TeacherCreate(BaseModel):
    name: str
    email: str
    password: str

class AdminCreate(BaseModel):
    nom: str
    email: str
    password: str

class ModuleCreate(BaseModel):
    name: str

class ExamCreate(BaseModel):
    id_teacher: str
    date_debut_exame: datetime
    date_fin_exame: datetime

class QuizCreate(BaseModel):
    id_teacher: str
    date_debut_quiz: datetime
    date_fin_quiz: datetime

class FraudeReport(BaseModel):
    id_ref: str
    ref_type: str  # "exam" or "quiz"
    nombre_fraude: int
    type_fraude: str
    date_fraude: Optional[datetime] = None

class ProofIdentityData(BaseModel):
    id_student: str
    accuracy: float
    precision: float
    type_cognitive: str
    temp_moyen_question: float
    niveau_focus: float
    violation: int
    score_consistante: float
    patern_dominante: str
    score_integrité: float

# Cognitive Test Models
class QuestionAnswer(BaseModel):
    question_index: int
    answer: int
    response_time: int
    is_correct: bool

class CognitiveData(BaseModel):
    response_patterns: List[int]
    hesitation_times: List[int]
    consistency_scores: List[float]
    focus_metrics: List[float]

class SurveillanceMetrics(BaseModel):
    face_detections: int
    position_violations: int
    speech_detections: int
    multiple_persons_detected: int
    total_checks: int

class AlertHistory(BaseModel):
    message: str
    type: str
    timestamp: int

class TestSubmission(BaseModel):
    student_id: str
    field: str
    answers: List[QuestionAnswer]
    total_time: int
    cognitive_data: CognitiveData
    surveillance_metrics: SurveillanceMetrics
    alerts_history: List[AlertHistory]

# =============================================================================
# MODELS PYDANTIC COMPLÉMENTAIRES
# =============================================================================

class Question(BaseModel):
    id: int
    question: str
    type: Literal["multiple_choice", "true_false", "short_answer"]
    options: List[str]
    correctAnswer: int
    points: int

class ExamCreateComplete(BaseModel):
    id_teacher: str
    module_name: str
    title: str
    description: str
    students: List[str]
    questions: List[Question]
    date_debut_exame: datetime
    date_fin_exame: datetime

class QuizResponse(BaseModel):
    success: bool
    quiz_id: str
    message: str
    questions_count: int

class ExamResponse(BaseModel):
    success: bool
    exam_id: str
    message: str
    questions_count: int

class QuizCreateComplete(BaseModel):
    id_teacher: str
    module_name: str
    title: str
    description: str
    students: List[str]
    questions: List[Question]
    date_debut_quiz: datetime
    date_fin_quiz: datetime

class StudentInfo(BaseModel):
    id: str
    name: str
    email: str
    field: str
    
# Modèles Pydantic
class FraudDetectionResult(BaseModel):
    status: str
    overall_risk: str
    total_detections: int
    message: Optional[str] = None

class ExamAttempt(BaseModel):
    exam_id: str
    student_id: str
    answers: Dict[str, Any]
    fraud_attempts: int = 0
    status: str  # "in_progress", "completed", "terminated"

# =============================================================================
# ENDPOINTS POUR EXAMENS
# =============================================================================
# 1. Récupérer les quizzes d'un étudiant
@app.get("/student/{student_id}/quizzes")
async def get_student_quizzes(student_id: str):
    """Récupérer tous les quizzes assignés à un étudiant"""
    try:
        # Chercher les quizzes où l'étudiant est dans la liste des étudiants
        quizzes_query = db.collection('quizzes').where('students', 'array_contains', student_id)
        quizzes_docs = quizzes_query.stream()
        
        quizzes = []
        for doc in quizzes_docs:
            quiz = doc.to_dict()
            quiz['id'] = doc.id
            quizzes.append(quiz)
        
        return {
            "student_id": student_id,
            "quizzes": quizzes,
            "count": len(quizzes)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des quizzes: {str(e)}"
        )

# 2. Récupérer les examens d'un étudiant
@app.get("/student/{student_id}/exams")
async def get_student_exams(student_id: str):
    """Récupérer tous les examens assignés à un étudiant"""
    try:
        exams_query = db.collection('exams').where('students', 'array_contains', student_id)
        exams_docs = exams_query.stream()
        
        exams = []
        for doc in exams_docs:
            exam = doc.to_dict()
            exam['id'] = doc.id
            exams.append(exam)
        
        return {
            "student_id": student_id,
            "exams": exams,
            "count": len(exams)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des examens: {str(e)}"
        )

# 3. Récupérer les questions d'un quiz
@app.get("/quiz/{quiz_id}/questions")
async def get_quiz_questions(quiz_id: str):
    """Récupérer toutes les questions d'un quiz"""
    try:
        questions_query = db.collection('quiz_questions').where('quiz_id', '==', quiz_id)
        questions_docs = questions_query.stream()
        
        questions = []
        for doc in questions_docs:
            question = doc.to_dict()
            question['id'] = doc.id
            # Ne pas envoyer la bonne réponse au frontend
            if 'correct_answer' in question:
                del question['correct_answer']
            questions.append(question)
        
        # Trier par numéro de question
        questions.sort(key=lambda x: x.get('question_number', 0))
        
        return {
            "quiz_id": quiz_id,
            "questions": questions,
            "count": len(questions)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des questions: {str(e)}"
        )

# 4. Récupérer les questions d'un examen
@app.get("/exam/{exam_id}/questions")
async def get_exam_questions(exam_id: str):
    """Récupérer toutes les questions d'un examen"""
    try:
        questions_query = db.collection('exam_questions').where('exam_id', '==', exam_id)
        questions_docs = questions_query.stream()
        
        questions = []
        for doc in questions_docs:
            question = doc.to_dict()
            question['id'] = doc.id
            # Ne pas envoyer la bonne réponse au frontend
            if 'correct_answer' in question:
                del question['correct_answer']
            questions.append(question)
        
        questions.sort(key=lambda x: x.get('question_number', 0))
        
        return {
            "exam_id": exam_id,
            "questions": questions,
            "count": len(questions)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des questions: {str(e)}"
        )

# 5. Soumettre un quiz (pas de surveillance)
@app.post("/quiz/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, submission: Dict[str, Any]):
    """Soumettre les réponses d'un quiz"""
    try:
        student_id = submission.get('student_id')
        answers = submission.get('answers', {})
        
        # Créer la soumission
        submission_doc = {
            "quiz_id": quiz_id,
            "student_id": student_id,
            "answers": answers,
            "submitted_at": datetime.now(),
            "status": "completed"
        }
        
        # Sauvegarder la soumission
        db.collection('quiz_submissions').add(submission_doc)
        
        return {
            "success": True,
            "message": "Quiz soumis avec succès"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la soumission: {str(e)}"
        )

# 6. Démarrer un examen (avec surveillance)
@app.post("/exam/{exam_id}/start")
async def start_exam(exam_id: str, student_data: Dict[str, str]):
    """Démarrer un examen avec surveillance"""
    try:
        student_id = student_data.get('student_id')
        
        # Vérifier si l'étudiant a déjà commencé cet examen
        existing_query = db.collection('exam_attempts').where('exam_id', '==', exam_id).where('student_id', '==', student_id)
        existing_docs = list(existing_query.stream())
        
        if existing_docs:
            attempt = existing_docs[0].to_dict()
            if attempt.get('status') == 'terminated':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Examen terminé pour cause de fraude"
                )
            return {
                "attempt_id": existing_docs[0].id,
                "status": "resumed"
            }
        
        # Créer une nouvelle tentative
        attempt_doc = {
            "exam_id": exam_id,
            "student_id": student_id,
            "started_at": datetime.now(),
            "fraud_attempts": 0,
            "status": "in_progress",
            "answers": {}
        }
        
        attempt_ref = db.collection('exam_attempts').add(attempt_doc)
        
        return {
            "attempt_id": attempt_ref[1].id,
            "status": "started"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du démarrage: {str(e)}"
        )

# 7. Signaler une fraude détectée
@app.post("/exam/fraud-detection")
async def report_fraud(fraud_data: Dict[str, Any]):
    """Signaler une détection de fraude"""
    try:
        attempt_id = fraud_data.get('attempt_id')
        detection_result = fraud_data.get('detection_result')
        
        # Récupérer la tentative d'examen
        attempt_ref = db.collection('exam_attempts').document(attempt_id)
        attempt_doc = attempt_ref.get()
        
        if not attempt_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tentative d'examen non trouvée"
            )
        
        attempt_data = attempt_doc.to_dict()
        fraud_attempts = attempt_data.get('fraud_attempts', 0) + 1
        
        # Mettre à jour le nombre de tentatives de fraude
        update_data = {
            "fraud_attempts": fraud_attempts,
            "last_fraud_detection": datetime.now()
        }
        
        # Si 2 tentatives de fraude, terminer l'examen
        if fraud_attempts >= 2:
            update_data["status"] = "terminated"
            update_data["terminated_at"] = datetime.now()
            update_data["termination_reason"] = "fraud_detected"
            
            # Notifier l'enseignant
            exam_ref = db.collection('exams').document(attempt_data['exam_id'])
            exam_doc = exam_ref.get()
            if exam_doc.exists:
                exam_data = exam_doc.to_dict()
                notification_doc = {
                    "type": "fraud_alert",
                    "teacher_id": exam_data['id_teacher'],
                    "student_id": attempt_data['student_id'],
                    "exam_id": attempt_data['exam_id'],
                    "message": f"Fraude détectée - Examen terminé pour l'étudiant {attempt_data['student_id']}",
                    "created_at": datetime.now(),
                    "read": False
                }
                db.collection('notifications').add(notification_doc)
        
        attempt_ref.update(update_data)
        
        return {
            "fraud_attempts": fraud_attempts,
            "status": "terminated" if fraud_attempts >= 2 else "warning",
            "message": "Examen terminé pour fraude" if fraud_attempts >= 2 else "Avertissement de fraude"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du signalement: {str(e)}"
        )

# 8. Soumettre un examen
@app.post("/exam/{exam_id}/submit")
async def submit_exam(exam_id: str, submission: Dict[str, Any]):
    """Soumettre les réponses d'un examen"""
    try:
        attempt_id = submission.get('attempt_id')
        answers = submission.get('answers', {})
        
        # Mettre à jour la tentative
        attempt_ref = db.collection('exam_attempts').document(attempt_id)
        attempt_ref.update({
            "answers": answers,
            "completed_at": datetime.now(),
            "status": "completed"
        })
        
        return {
            "success": True,
            "message": "Examen soumis avec succès"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la soumission: {str(e)}"
        )
        
@app.post("/exams")
async def create_exam(exam_data: ExamCreateComplete):
    """Créer un nouvel examen"""
    try:
        # Générer un ID unique pour l'examen
        exam_id = generate_id("exam")
        
        # Vérifier que le professeur existe
        teacher_ref = db.collection('teachers').document(exam_data.id_teacher)
        teacher_doc = teacher_ref.get()
        
        if not teacher_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professeur non trouvé"
            )
        
        # Vérifier que tous les étudiants existent
        for student_id in exam_data.students:
            student_ref = db.collection('students').document(student_id)
            student_doc = student_ref.get()
            if not student_doc.exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Étudiant {student_id} non trouvé"
                )
        
        # Créer l'examen
        exam_doc = {
            "id": exam_id,
            "id_teacher": exam_data.id_teacher,
            "module_name": exam_data.module_name,
            "title": exam_data.title,
            "description": exam_data.description,
            "date_debut_exame": exam_data.date_debut_exame,
            "date_fin_exame": exam_data.date_fin_exame,
            "students": exam_data.students,
            "status": "active",
            "created_at": datetime.now()
        }
        
        # Sauvegarder l'examen
        db.collection('exams').document(exam_id).set(exam_doc)
        
        # Sauvegarder les questions
        questions_data = []
        for i, question in enumerate(exam_data.questions):
            question_doc = {
                "exam_id": exam_id,
                "question_number": i + 1,
                "question": question.question,
                "type": question.type,
                "options": question.options,
                "correct_answer": question.correctAnswer,
                "correct_answer": question.correctAnswer,
                "points": question.points
            }
            questions_data.append(question_doc)
            db.collection('exam_questions').add(question_doc)
        
        return {
            "success": True,
            "exam_id": exam_id,
            "message": "Examen créé avec succès",
            "questions_count": len(exam_data.questions)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'examen: {str(e)}"
        )

@app.get("/exams/{exam_id}")
async def get_exam(exam_id: str):
    """Récupérer un examen par ID"""
    try:
        exam_ref = db.collection('exams').document(exam_id)
        exam_doc = exam_ref.get()
        
        if not exam_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Examen non trouvé"
            )
        
        exam_data = exam_doc.to_dict()
        
        # Récupérer les questions
        questions_query = db.collection('exam_questions').where('exam_id', '==', exam_id)
        questions_docs = questions_query.stream()
        
        questions = []
        for doc in questions_docs:
            question_data = doc.to_dict()
            questions.append({
                "id": question_data.get("question_number"),
                "question": question_data.get("question"),
                "type": question_data.get("type"),
                "options": question_data.get("options"),
                "correct_answer": question_data.get("correct_answer"),
                "points": question_data.get("points")
            })
        
        # Trier les questions par numéro
        questions.sort(key=lambda x: x["id"])
        
        exam_data["questions"] = questions
        return exam_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de l'examen: {str(e)}"
        )

@app.get("/teacher/{teacher_id}/exams")
async def get_teacher_exams(teacher_id: str):
    """Récupérer tous les examens d'un professeur"""
    try:
        exams_query = db.collection('exams').where('id_teacher', '==', teacher_id)
        exams_docs = exams_query.stream()
        
        exams = []
        for doc in exams_docs:
            exam_data = doc.to_dict()
            exams.append(exam_data)
        
        # Trier par date de création (plus récent d'abord)
        exams.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
        
        return {"exams": exams}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des examens: {str(e)}"
        )

# =============================================================================
# ENDPOINTS POUR QUIZ
# =============================================================================

@app.post("/quizzes", response_model=QuizResponse)
async def create_quiz(quiz_data: QuizCreateComplete):
    """Créer un nouveau quiz"""
    try:
        # Générer un ID unique pour le quiz
        quiz_id = generate_id("quiz")
        
        # Vérifier que le professeur existe
        teacher_ref = db.collection('teachers').document(quiz_data.id_teacher)
        teacher_doc = teacher_ref.get()
        
        if not teacher_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professeur non trouvé"
            )
        
        # Vérifier que tous les étudiants existent
        for student_id in quiz_data.students:
            student_ref = db.collection('students').document(student_id)
            student_doc = student_ref.get()
            if not student_doc.exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Étudiant {student_id} non trouvé"
                )
        
        # Créer le quiz
        quiz_doc = {
            "id": quiz_id,
            "id_teacher": quiz_data.id_teacher,
            "module_name": quiz_data.module_name,
            "title": quiz_data.title,
            "description": quiz_data.description,
            "date_debut_quiz": quiz_data.date_debut_quiz,
            "date_fin_quiz": quiz_data.date_fin_quiz,
            "students": quiz_data.students,
            "status": "active",
            "created_at": datetime.now().isoformat()
        }
        
        # Sauvegarder le quiz
        db.collection('quizzes').document(quiz_id).set(quiz_doc)
        
        # Sauvegarder les questions
        for i, question in enumerate(quiz_data.questions):
            question_doc = {
                "quiz_id": quiz_id,
                "question_number": i + 1,
                "question": question.question,
                "type": question.type,
                "options": question.options,
                "correct_answer": question.correctAnswer,
                "points": question.points
            }
            db.collection('quiz_questions').add(question_doc)
        
        return QuizResponse(
            success=True,
            quiz_id=quiz_id,
            message="Quiz créé avec succès",
            questions_count=len(quiz_data.questions)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création du quiz: {str(e)}"
        )

@app.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    """Récupérer un quiz par ID"""
    try:
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()
        
        if not quiz_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz non trouvé"
            )
        
        quiz_data = quiz_doc.to_dict()
        
        # Récupérer les questions
        questions_query = db.collection('quiz_questions').where('quiz_id', '==', quiz_id)
        questions_docs = questions_query.stream()
        
        questions = []
        for doc in questions_docs:
            question_data = doc.to_dict()
            questions.append({
                "id": question_data.get("question_number"),
                "question": question_data.get("question"),
                "type": question_data.get("type"),
                "options": question_data.get("options"),
                "correct_answer": question_data.get("correct_answer"),
                "points": question_data.get("points")
            })
        
        # Trier les questions par numéro
        questions.sort(key=lambda x: x["id"])
        
        quiz_data["questions"] = questions
        return quiz_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération du quiz: {str(e)}"
        )

@app.get("/teacher/{teacher_id}/quizzes")
async def get_teacher_quizzes(teacher_id: str):
    """Récupérer tous les quiz d'un professeur"""
    try:
        quizzes_query = db.collection('quizzes').where('id_teacher', '==', teacher_id)
        quizzes_docs = quizzes_query.stream()
        
        quizzes = []
        for doc in quizzes_docs:
            quiz_data = doc.to_dict()
            quizzes.append(quiz_data)
        
        # Trier par date de création (plus récent d'abord)
        quizzes.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {"quizzes": quizzes}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des quiz: {str(e)}"
        )

# =============================================================================
# ENDPOINTS POUR EXAMENS
# =============================================================================

@app.post("/exams", response_model=ExamResponse)
async def create_exam(exam_data: ExamCreateComplete):
    """Créer un nouvel examen"""
    try:
        # Générer un ID unique pour l'examen
        exam_id = generate_id("exam")
        
        # Vérifier que le professeur existe
        teacher_ref = db.collection('teachers').document(exam_data.id_teacher)
        teacher_doc = teacher_ref.get()
        
        if not teacher_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professeur non trouvé"
            )
        
        # Vérifier que tous les étudiants existent
        for student_id in exam_data.students:
            student_ref = db.collection('students').document(student_id)
            student_doc = student_ref.get()
            if not student_doc.exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Étudiant {student_id} non trouvé"
                )
        
        # Créer l'examen
        exam_doc = {
            "id": exam_id,
            "id_teacher": exam_data.id_teacher,
            "module_name": exam_data.module_name,
            "title": exam_data.title,
            "description": exam_data.description,
            "date_debut_exame": exam_data.date_debut_exame,
            "date_fin_exame": exam_data.date_fin_exame,
            "students": exam_data.students,
            "status": "active",
            "created_at": datetime.now().isoformat()
        }
        
        # Sauvegarder l'examen
        db.collection('exams').document(exam_id).set(exam_doc)
        
        # Sauvegarder les questions
        for i, question in enumerate(exam_data.questions):
            question_doc = {
                "exam_id": exam_id,
                "question_number": i + 1,
                "question": question.question,
                "type": question.type,
                "options": question.options,
                "correct_answer": question.correctAnswer,
                "points": question.points
            }
            db.collection('exam_questions').add(question_doc)
        
        return ExamResponse(
            success=True,
            exam_id=exam_id,
            message="Examen créé avec succès",
            questions_count=len(exam_data.questions)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'examen: {str(e)}"
        )

@app.get("/exams/{exam_id}")
async def get_exam(exam_id: str):
    """Récupérer un examen par ID"""
    try:
        exam_ref = db.collection('exams').document(exam_id)
        exam_doc = exam_ref.get()
        
        if not exam_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Examen non trouvé"
            )
        
        exam_data = exam_doc.to_dict()
        
        # Récupérer les questions
        questions_query = db.collection('exam_questions').where('exam_id', '==', exam_id)
        questions_docs = questions_query.stream()
        
        questions = []
        for doc in questions_docs:
            question_data = doc.to_dict()
            questions.append({
                "id": question_data.get("question_number"),
                "question": question_data.get("question"),
                "type": question_data.get("type"),
                "options": question_data.get("options"),
                "correctAnswer": question_data.get("correct_answer"),
                "correct_answer": question_data.get("correct_answer"),
                "points": question_data.get("points")
            })
        
        # Trier les questions par numéro
        questions.sort(key=lambda x: x["id"])
        
        exam_data["questions"] = questions
        return exam_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de l'examen: {str(e)}"
        )

@app.get("/teacher/{teacher_id}/exams")
async def get_teacher_exams(teacher_id: str):
    """Récupérer tous les examens d'un professeur"""
    try:
        exams_query = db.collection('exams').where('id_teacher', '==', teacher_id)
        exams_docs = exams_query.stream()
        
        exams = []
        for doc in exams_docs:
            exam_data = doc.to_dict()
            exams.append(exam_data)
        
        # Trier par date de création (plus récent d'abord)
        exams.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {"exams": exams}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des examens: {str(e)}"
        )

@app.get("/modules")
async def get_modules():
    """Récupérer tous les modules disponibles"""
    try:
        modules_query = db.collection('modules')
        modules_docs = modules_query.stream()
        
        modules = []
        for doc in modules_docs:
            module_data = doc.to_dict()
            modules.append(module_data.get("name", ""))
        
        # Si aucun module n'existe, retourner une liste par défaut
        if not modules:
            modules = [
                "Mathématiques",
                "Physique", 
                "Informatique",
                "Chimie",
                "Biologie",
                "Histoire",
                "Géographie",
                "Français",
                "Anglais"
            ]
        
        return {"modules": modules}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des modules: {str(e)}"
        )

@app.post("/modules")
async def create_module(module_data: ModuleCreate):
    """Créer un nouveau module"""
    try:
        module_id = generate_id("mod")
        
        module_doc = {
            "id": module_id,
            "name": module_data.name,
            "created_at": datetime.now()
        }
        
        db.collection('modules').document(module_id).set(module_doc)
        
        return {
            "success": True,
            "module_id": module_id,
            "message": "Module créé avec succès"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création du module: {str(e)}"
        )

# =============================================================================
# ENDPOINTS DE SUPPRESSION ET MODIFICATION
# =============================================================================

@app.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str):
    """Supprimer un examen"""
    try:
        # Supprimer l'examen
        exam_ref = db.collection('exams').document(exam_id)
        exam_doc = exam_ref.get()
        
        if not exam_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Examen non trouvé"
            )
        
        exam_ref.delete()
        
        # Supprimer les questions associées
        questions_query = db.collection('exam_questions').where('exam_id', '==', exam_id)
        questions_docs = questions_query.stream()
        
        for doc in questions_docs:
            doc.reference.delete()
        
        return {"success": True, "message": "Examen supprimé avec succès"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de l'examen: {str(e)}"
        )

@app.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str):
    """Supprimer un quiz"""
    try:
        # Supprimer le quiz
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()
        
        if not quiz_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz non trouvé"
            )
        
        quiz_ref.delete()
        
        # Supprimer les questions associées
        questions_query = db.collection('quiz_questions').where('quiz_id', '==', quiz_id)
        questions_docs = questions_query.stream()
        
        for doc in questions_docs:
            doc.reference.delete()
        
        return {"success": True, "message": "Quiz supprimé avec succès"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression du quiz: {str(e)}"
        )

# =============================================================================
# ENDPOINTS POUR STATISTIQUES
# =============================================================================

@app.get("/teacher/{teacher_id}/dashboard")
async def get_teacher_dashboard(teacher_id: str):
    """Récupérer les statistiques du tableau de bord professeur"""
    try:
        # Compter les examens
        exams_query = db.collection('exams').where('id_teacher', '==', teacher_id)
        exams_count = len(list(exams_query.stream()))
        
        # Compter les quiz
        quizzes_query = db.collection('quizzes').where('id_teacher', '==', teacher_id)
        quizzes_count = len(list(quizzes_query.stream()))
        
        # Récupérer les examens et quiz récents
        recent_exams = []
        recent_quizzes = []
        
        for doc in db.collection('exams').where('id_teacher', '==', teacher_id).limit(5).stream():
            exam_data = doc.to_dict()
            recent_exams.append({
                "id": exam_data.get("id"),
                "title": exam_data.get("title"),
                "module": exam_data.get("module_name"),
                "date_debut": exam_data.get("date_debut_exame"),
                "students_count": len(exam_data.get("students", []))
            })
        
        for doc in db.collection('quizzes').where('id_teacher', '==', teacher_id).limit(5).stream():
            quiz_data = doc.to_dict()
            recent_quizzes.append({
                "id": quiz_data.get("id"),
                "title": quiz_data.get("title"),
                "module": quiz_data.get("module_name"),
                "date_debut": quiz_data.get("date_debut_quiz"),
                "students_count": len(quiz_data.get("students", []))
            })
        
        return {
            "stats": {
                "total_exams": exams_count,
                "total_quizzes": quizzes_count,
                "total_evaluations": exams_count + quizzes_count
            },
            "recent_exams": recent_exams,
            "recent_quizzes": recent_quizzes
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération du tableau de bord: {str(e)}"
        )

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(hashed: str, plain: str) -> bool:
    return hashed == hash_password(plain)

def generate_id(prefix: str, length: int = 3) -> str:
    """Generate unique ID with prefix"""
    timestamp = str(int(time.time()))[-6:]
    random_part = ''.join(random.choices(string.digits, k=length))
    return f"{prefix}_{timestamp}_{random_part}"

def create_session_token(user_id: str, role: str) -> str:
    """Create session token"""
    token_data = {
        'user_id': user_id,
        'role': role,
        'timestamp': time.time()
    }
    return hashlib.sha256(json.dumps(token_data).encode()).hexdigest()

def verify_token(token: str, required_role: Optional[str] = None):
    """Verify session token and return user data"""
    session_ref = db.collection('sessions').document(token)
    session_doc = session_ref.get()
    
    if not session_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    session_data = session_doc.to_dict()
    
    # Check expiration
    if datetime.now(timezone.utc) > session_data.get('expires_at', datetime.now(timezone.utc)):
        session_ref.delete()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expirée"
        )
    
    # Check role if required
    if required_role and session_data.get('role') != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    return session_data

# Sample questions data
QUESTIONS_DATA = {
    "Informatique": [
        {
            "question": "Quel est le principe fondamental de la programmation orientée objet ?",
            "options": ["Encapsulation", "Compilation", "Débogage", "Documentation"],
            "correct": 0
        },
        {
            "question": "Quelle structure de données utilise le principe LIFO ?",
            "options": ["Queue", "Stack", "Array", "Tree"],
            "correct": 1
        },
        {
            "question": "Que signifie 'Big O' en algorithmique ?",
            "options": ["Taille mémoire", "Complexité temporelle", "Nombre de bugs", "Version du code"],
            "correct": 1
        },
        {
            "question": "Quel protocole est utilisé pour les pages web sécurisées ?",
            "options": ["HTTP", "HTTPS", "FTP", "SMTP"],
            "correct": 1
        },
        {
            "question": "En base de données, que signifie CRUD ?",
            "options": ["Create Read Update Delete", "Copy Run Update Deploy", "Code Review Unit Debug", "Cache Runtime User Data"],
            "correct": 0
        }
    ],
    "Génie Civil": [
        {
            "question": "Quel est le module d'élasticité de l'acier ?",
            "options": ["200 GPa", "300 GPa", "100 GPa", "150 GPa"],
            "correct": 0
        },
        {
            "question": "Quelle est l'unité de la contrainte ?",
            "options": ["N", "Pa", "m", "kg"],
            "correct": 1
        }
    ],
    "Électromécanique": [
        {
            "question": "Quelle est l'unité de la puissance électrique ?",
            "options": ["Volt", "Ampère", "Watt", "Ohm"],
            "correct": 2
        }
    ],
    "Gestion": [
        {
            "question": "Que signifie ROI en gestion ?",
            "options": ["Return on Investment", "Rate of Interest", "Risk of Investment", "Revenue of Industry"],
            "correct": 0
        }
    ],
    "Biologie": [
        {
            "question": "Combien de chromosomes a l'être humain ?",
            "options": ["44", "46", "48", "50"],
            "correct": 1
        }
    ]
}

# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@app.get("/")
async def root():
    return {"message": "EDGUARD API v2.0", "status": "active"}

@app.post("/auth/student/login")
async def login_student(login_data: StudentLogin):
    """Authenticate student"""
    try:
        student_ref = db.collection('students').document(login_data.student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrectss"
            )
        
        student_data = student_doc.to_dict()
        
        if not verify_password(student_data.get('password'), login_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects"
            )
        
        # Create session
        token = create_session_token(login_data.student_id, 'student')
        db.collection('sessions').document(token).set({
            'user_id': login_data.student_id,
            'role': 'student',
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(hours=2)
        })

        return {
            "token": token,
            "student": {
                "id": student_data['id'],
                "name": student_data['name'],
                "field": student_data['field'],
                "email": student_data.get('email', ''),
                "has_completed_test": student_data.get('has_completed_test', False)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@app.post("/auth/teacher/login")
async def login_teacher(login_data: TeacherLogin):
    """Authenticate teacher"""
    try:
        teachers_ref = db.collection('teachers').where('email', '==', login_data.email).limit(1)
        teachers_docs = list(teachers_ref.stream())
        
        if not teachers_docs:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects"
            )
        
        teacher_doc = teachers_docs[0]
        teacher_data = teacher_doc.to_dict()
        
        if not verify_password(teacher_data.get('password'), login_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects"
            )
        
        # Create session
        token = create_session_token(teacher_doc.id, 'teacher')
        db.collection('sessions').document(token).set({
            'user_id': teacher_doc.id,
            'role': 'teacher',
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(hours=2)
        })

        return {
            "token": token,
            "teacher": {
                "id": teacher_data['id'],
                "name": teacher_data['name'],
                "email": teacher_data['email']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@app.post("/auth/admin/login")
async def login_admin(login_data: AdminLogin):
    """Authenticate admin"""
    try:
        admins_ref = db.collection('admins').where('email', '==', login_data.email).limit(1)
        admins_docs = list(admins_ref.stream())
        
        if not admins_docs:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects"
            )
        
        admin_doc = admins_docs[0]
        admin_data = admin_doc.to_dict()
        
        if not verify_password(admin_data.get('password'), login_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects"
            )
        
        # Create session
        token = create_session_token(admin_doc.id, 'admin')
        db.collection('sessions').document(token).set({
            'user_id': admin_doc.id,
            'role': 'admin',
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(hours=2)
        })

        return {
            "token": token,
            "admin": {
                "id": admin_data['id'],
                "nom": admin_data['nom'],
                "email": admin_data['email']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@app.post("/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user"""
    token = credentials.credentials
    db.collection('sessions').document(token).delete()
    return {"success": True, "message": "Déconnexion réussie"}

# =============================================================================
# STUDENT ENDPOINTS
# =============================================================================

@app.get("/students")
async def get_students(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all students (Admin/Teacher only)"""
    session_data = verify_token(credentials.credentials)
    
    if session_data['role'] not in ['admin', 'teacher']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        students = []
        students_ref = db.collection('students').stream()
        
        for doc in students_ref:
            student_data = doc.to_dict()
            student_data['document_id'] = doc.id
            
            # Get proof identity data if exists
            proof_ref = db.collection('proof_identity').where('id_student', '==', doc.id).limit(1)
            proof_docs = list(proof_ref.stream())
            
            if proof_docs:
                proof_data = proof_docs[0].to_dict()
                student_data['proof_identity'] = proof_data
            else:
                student_data['proof_identity'] = None
            
            students.append(student_data)
        
        return {"students": students}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/students")
async def create_student(student: StudentCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create new student (Admin only)"""
    verify_token(credentials.credentials, 'admin')
    
    try:
        student_id = generate_id("stu")
        student_data = {
            "id": student_id,
            "name": student.name,
            "email": student.email,
            "field": student.field,
            "has_completed_test": False,
            "password": hash_password(student.password),
            "created_at": datetime.now()
        }
        
        db.collection('students').document(student_id).set(student_data)
        
        # Remove password from response
        del student_data['password']
        return {"message": "Étudiant créé avec succès", "student": student_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/student/{student_id}")
async def get_student(student_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get student by ID"""
    session_data = verify_token(credentials.credentials)
    
    # Students can only access their own data
    if session_data['role'] == 'student' and session_data['user_id'] != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        student_ref = db.collection('students').document(student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        student_data = student_doc.to_dict()
        del student_data['password']  # Remove password from response
        
        # Get proof identity data
        proof_ref = db.collection('proof_identity').where('id_student', '==', student_id).limit(1)
        proof_docs = list(proof_ref.stream())
        
        if proof_docs:
            student_data['proof_identity'] = proof_docs[0].to_dict()
        
        return student_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/student/{student_id}")
async def update_student(student_id: str, updates: Dict[str, Any], credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Update student (Admin only)"""
    verify_token(credentials.credentials, 'admin')
    
    try:
        # Remove sensitive fields from updates
        if 'password' in updates:
            updates['password'] = hash_password(updates['password'])
        
        updates['updated_at'] = datetime.now()
        
        db.collection('students').document(student_id).update(updates)
        return {"message": "Étudiant mis à jour avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/student/{student_id}")
async def delete_student(student_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Delete student (Admin only)"""
    verify_token(credentials.credentials, 'admin')
    
    try:
        # Delete related proof identity records
        proof_ref = db.collection('proof_identity').where('id_student', '==', student_id)
        proof_docs = proof_ref.stream()
        
        for doc in proof_docs:
            doc.reference.delete()
        
        # Delete student
        db.collection('students').document(student_id).delete()
        
        return {"message": "Étudiant supprimé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# TEACHER ENDPOINTS
# =============================================================================

@app.get("/teachers")
async def get_teachers(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all teachers (Admin only)"""
    verify_token(credentials.credentials, 'admin')
    
    try:
        teachers = []
        teachers_ref = db.collection('teachers').stream()
        
        for doc in teachers_ref:
            teacher_data = doc.to_dict()
            teacher_data['document_id'] = doc.id
            del teacher_data['password']  # Remove password
            teachers.append(teacher_data)
        
        return {"teachers": teachers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/teachers")
async def create_teacher(teacher: TeacherCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create new teacher (Admin only)"""
    verify_token(credentials.credentials, 'admin')
    
    try:
        teacher_id = generate_id("tch")
        teacher_data = {
            "id": teacher_id,
            "name": teacher.name,
            "email": teacher.email,
            "password": hash_password(teacher.password),
            "created_at": datetime.now()
        }
        
        db.collection('teachers').document(teacher_id).set(teacher_data)
        
        del teacher_data['password']
        return {"message": "Enseignant créé avec succès", "teacher": teacher_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/teacher/{teacher_id}")
def get_teacher_by_id(teacher_id: str):
    teacher_ref = db.collection("teachers").document(teacher_id)
    teacher_doc = teacher_ref.get()

    if not teacher_doc.exists:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return teacher_doc.to_dict()
@app.get("/teacher/{teacher_id}/assignments")
async def get_teacher_assignments(teacher_id: str):
    """Récupérer tous les examens et quiz d'un professeur"""
    try:
        # Helper function to normalize datetime objects
        def normalize_datetime(dt_value):
            if isinstance(dt_value, str):
                try:
                    # Parse ISO format string and make it timezone-aware
                    parsed_dt = datetime.fromisoformat(dt_value.rstrip('Z'))
                    if parsed_dt.tzinfo is None:
                        return parsed_dt.replace(tzinfo=timezone.utc)
                    return parsed_dt
                except:
                    return datetime.min.replace(tzinfo=timezone.utc)
            elif isinstance(dt_value, datetime):
                # Make sure datetime is timezone-aware
                if dt_value.tzinfo is None:
                    return dt_value.replace(tzinfo=timezone.utc)
                return dt_value
            else:
                # Default fallback
                return datetime.min.replace(tzinfo=timezone.utc)
        
        # Get exams
        exams_query = db.collection('exams').where('id_teacher', '==', teacher_id)
        exams_docs = exams_query.stream()
        exams = []
        
        for doc in exams_docs:
            exam = doc.to_dict()
            exam['type'] = 'exam'
            exam['id'] = doc.id  # Add document ID
            
            # Normalize created_at datetime
            created_at = exam.get("created_at")
            exam["created_at"] = normalize_datetime(created_at)
            exams.append(exam)
        
        # Get quizzes
        quizzes_query = db.collection('quizzes').where('id_teacher', '==', teacher_id)
        quizzes_docs = quizzes_query.stream()
        quizzes = []
        
        for doc in quizzes_docs:
            quiz = doc.to_dict()
            quiz['type'] = 'quiz'
            quiz['id'] = doc.id  # Add document ID
            
            # Normalize created_at datetime
            created_at = quiz.get("created_at")
            quiz["created_at"] = normalize_datetime(created_at)
            quizzes.append(quiz)
        
        # Combine and sort assignments
        assignments = exams + quizzes
        
        # Sort by created_at (all datetime objects are now timezone-aware)
        assignments.sort(key=lambda x: x["created_at"], reverse=True)
        
        # Convert datetime objects to ISO format strings for JSON response
        for item in assignments:
            item["created_at"] = item["created_at"].isoformat()
        
        return {
            "teacher_id": teacher_id,
            "assignments": assignments,
            "count": len(assignments)
        }
        
    except Exception as e:
        print(f"Error in get_teacher_assignments: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des affectations : {str(e)}"
        )
@app.get("/teacher/{teacher_id}/students")
async def get_students_by_teacher(teacher_id: str):
    """Fetch all students assigned to a specific teacher from teacher_modules"""
    try:
        # Step 1: Get modules taught by this teacher
        modules_query = db.collection("teacher_modules").where("id_teacher", "==", teacher_id).stream()

        student_ids_set = set()
        for module_doc in modules_query:
            module_data = module_doc.to_dict()
            student_ids_set.update(module_data.get("students", []))

        if not student_ids_set:
            raise HTTPException(status_code=404, detail="Aucun étudiant trouvé pour ce professeur")

        # Step 2: Fetch each student by ID
        students = []
        for student_id in student_ids_set:
            doc = db.collection("students").document(student_id).get()
            if doc.exists:
                student = doc.to_dict()
                student["id"] = doc.id
                students.append(student)

        return {
            "teacher_id": teacher_id,
            "total_students": len(students),
            "students": students
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# =============================================================================
# ADMIN ENDPOINTS
# =============================================================================

@app.get("/admins")
async def get_admins(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all admins (Admin only)"""
    verify_token(credentials.credentials, 'admin')
    
    try:
        admins = []
        admins_ref = db.collection('admins').stream()
        
        for doc in admins_ref:
            admin_data = doc.to_dict()
            admin_data['document_id'] = doc.id
            del admin_data['password']
            admins.append(admin_data)
        
        return {"admins": admins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admins")
async def create_admin(admin: AdminCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create new admin (Admin only)"""
    verify_token(credentials.credentials, 'admin')
    
    try:
        admin_id = generate_id("adm")
        admin_data = {
            "id": admin_id,
            "nom": admin.nom,
            "email": admin.email,
            "password": hash_password(admin.password),
            "created_at": datetime.now()
        }
        
        db.collection('admins').document(admin_id).set(admin_data)
        
        del admin_data['password']
        return {"message": "Administrateur créé avec succès", "admin": admin_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# MODULE ENDPOINTS
# =============================================================================

@app.get("/modules")
async def get_modules(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all modules"""
    verify_token(credentials.credentials)
    
    try:
        modules = []
        modules_ref = db.collection('modules').stream()
        
        for doc in modules_ref:
            module_data = doc.to_dict()
            module_data['document_id'] = doc.id
            modules.append(module_data)
        
        return {"modules": modules}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/modules")
async def create_module(module: ModuleCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create new module (Admin/Teacher only)"""
    session_data = verify_token(credentials.credentials)
    
    if session_data['role'] not in ['admin', 'teacher']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        module_id = generate_id("mod")
        module_data = {
            "id": module_id,
            "name": module.name,
            "created_at": datetime.now()
        }
        
        db.collection('modules').document(module_id).set(module_data)
        return {"message": "Module créé avec succès", "module": module_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# EXAM ENDPOINTS
# =============================================================================

@app.get("/exams")
async def get_exams(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all exams"""
    verify_token(credentials.credentials)
    
    try:
        exams = []
        exams_ref = db.collection('exams').stream()
        
        for doc in exams_ref:
            exam_data = doc.to_dict()
            exam_data['document_id'] = doc.id
            
            # Get teacher info
            if 'id_teacher' in exam_data:
                teacher_ref = db.collection('teachers').document(exam_data['id_teacher'])
                teacher_doc = teacher_ref.get()
                if teacher_doc.exists:
                    teacher_data = teacher_doc.to_dict()
                    exam_data['teacher_name'] = teacher_data.get('name', 'Unknown')
            
            exams.append(exam_data)
        
        return {"exams": exams}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/exams")
async def create_exam(exam: ExamCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create new exam (Teacher only)"""
    session_data = verify_token(credentials.credentials)
    
    if session_data['role'] not in ['admin', 'teacher']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        exam_id = generate_id("exam")
        exam_data = {
            "id": exam_id,
            "id_teacher": exam.id_teacher,
            "date_debut_exame": exam.date_debut_exame,
            "date_fin_exame": exam.date_fin_exame
        }
        
        db.collection('exams').document(exam_id).set(exam_data)
        return {"message": "Examen créé avec succès", "exam": exam_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# QUIZ ENDPOINTS
# =============================================================================

@app.get("/quizzes")
async def get_quizzes(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all quizzes"""
    verify_token(credentials.credentials)
    
    try:
        quizzes = []
        quizzes_ref = db.collection('quizzes').stream()
        
        for doc in quizzes_ref:
            quiz_data = doc.to_dict()
            quiz_data['document_id'] = doc.id
            
            # Get teacher info
            if 'id_teacher' in quiz_data:
                teacher_ref = db.collection('teachers').document(quiz_data['id_teacher'])
                teacher_doc = teacher_ref.get()
                if teacher_doc.exists:
                    teacher_data = teacher_doc.to_dict()
                    quiz_data['teacher_name'] = teacher_data.get('name', 'Unknown')
            
            quizzes.append(quiz_data)
        
        return {"quizzes": quizzes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quizzes")
async def create_quiz(quiz: QuizCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create new quiz (Teacher only)"""
    session_data = verify_token(credentials.credentials)
    
    if session_data['role'] not in ['admin', 'teacher']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        quiz_id = generate_id("quiz")
        quiz_data = {
            "id": quiz_id,
            "id_teacher": quiz.id_teacher,
            "date_debut_quiz": quiz.date_debut_quiz,
            "date_fin_quiz": quiz.date_fin_quiz
        }
        
        db.collection('quizzes').document(quiz_id).set(quiz_data)
        return {"message": "Quiz créé avec succès", "quiz": quiz_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# FRAUDE ENDPOINTS
# =============================================================================

@app.get("/fraude")
async def get_fraude_reports(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all fraud reports"""
    session_data = verify_token(credentials.credentials)
    
    if session_data['role'] not in ['admin', 'teacher']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        fraudes = []
        fraudes_ref = db.collection('fraude').stream()
        
        for doc in fraudes_ref:
            fraude_data = doc.to_dict()
            fraude_data['document_id'] = doc.id
            fraudes.append(fraude_data)
        
        return {"fraudes": fraudes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fraude")
async def create_fraude_report(fraude: FraudeReport, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create fraud report"""
    verify_token(credentials.credentials)
    
    try:
        fraude_id = generate_id("fraude")
        fraude_data = {
            "id": fraude_id,
            "id_ref": fraude.id_ref,
            "ref_type": fraude.ref_type,
            "nombre_fraude": fraude.nombre_fraude,
            "type_fraude": fraude.type_fraude,
            "date_fraude": fraude.date_fraude or datetime.now()
        }
        
        db.collection('fraude').document(fraude_id).set(fraude_data)
        return {"message": "Rapport de fraude créé avec succès", "fraude": fraude_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# PROOF IDENTITY ENDPOINTS
# =============================================================================

@app.get("/proof-identity")
async def get_proof_identities(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all proof identities"""
    session_data = verify_token(credentials.credentials)
    
    if session_data['role'] not in ['admin', 'teacher']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        proofs = []
        proofs_ref = db.collection('proof_identity').stream()
        
        for doc in proofs_ref:
            proof_data = doc.to_dict()
            proof_data['document_id'] = doc.id
            
            # Get student info
            if 'id_student' in proof_data:
                student_ref = db.collection('students').document(proof_data['id_student'])
                student_doc = student_ref.get()
                if student_doc.exists:
                    student_data = student_doc.to_dict()
                    proof_data['student_name'] = student_data.get('name', 'Unknown')
                    proof_data['student_field'] = student_data.get('field', 'Unknown')
            
            proofs.append(proof_data)
        
        return {"proof_identities": proofs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/proof-identity/student/{student_id}")
async def get_student_proof_identity(student_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get proof identity for specific student"""
    session_data = verify_token(credentials.credentials)
    
    # Students can only access their own data
    if session_data['role'] == 'student' and session_data['user_id'] != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        proof_ref = db.collection('proof_identity').where('id_student', '==', student_id).limit(1)
        proof_docs = list(proof_ref.stream())
        
        if not proof_docs:
            raise HTTPException(status_code=404, detail="Preuve d'identité non trouvée")
        
        proof_data = proof_docs[0].to_dict()
        proof_data['document_id'] = proof_docs[0].id
        
        return proof_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/proof-identity")
async def create_proof_identity(proof: ProofIdentityData, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create proof identity (usually done automatically after test)"""
    verify_token(credentials.credentials)
    
    try:
        proof_id = generate_id("proof")
        proof_data = {
            "id_student": proof.id_student,
            "accuracy": proof.accuracy,
            "precision": proof.precision,
            "type_cognitive": proof.type_cognitive,
            "temp_moyen_question": proof.temp_moyen_question,
            "niveau_focus": proof.niveau_focus,
            "violation": proof.violation,
            "score_consistante": proof.score_consistante,
            "patern_dominante": proof.patern_dominante,
            "score_integrité": proof.score_integrité,
            "created_at": datetime.now()
        }
        
        db.collection('proof_identity').document(proof_id).set(proof_data)
        return {"message": "Preuve d'identité créée avec succès", "proof": proof_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# COGNITIVE TEST ENDPOINTS
# =============================================================================

@app.get("/questions/{field}")
async def get_questions(field: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get questions for specific field"""
    verify_token(credentials.credentials, 'student')
    
    if field not in QUESTIONS_DATA:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domaine non trouvé"
        )
    
    return {"questions": QUESTIONS_DATA[field]}

def determine_cognitive_type(avg_response_time: float, accuracy: float, focus: float) -> str:
    """Determine cognitive type based on performance metrics"""
    if accuracy >= 80 and avg_response_time <= 3000 and focus >= 0.7:
        return "Analytique"
    elif accuracy >= 70 and avg_response_time <= 4000:
        return "Auditif"
    elif accuracy >= 60 and avg_response_time > 4000:
        return "Kinesthésique"
    elif avg_response_time <= 2000:
        return "Visuel"
    elif focus < 0.3:
        return "Auditif"
    else:
        return "Visuel"

def determine_pattern_dominante(cognitive_data: CognitiveData) -> str:
    """Determine dominant pattern"""
    if not cognitive_data.response_patterns:
        return "aléatoire"
    
    # Calculate pattern consistency
    pattern_counts = {}
    for pattern in cognitive_data.response_patterns:
        pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1
    
    most_common = max(pattern_counts.values())
    total_patterns = len(cognitive_data.response_patterns)
    
    if most_common / total_patterns > 0.7:
        return "sérieux"
    elif most_common / total_patterns > 0.4:
        return "stratégique"
    else:
        return "aléatoire"

@app.post("/test/submit")
async def submit_test(
    submission: TestSubmission,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Submit test results and create proof of identity"""
    session_data = verify_token(credentials.credentials, 'student')
    
    if session_data['user_id'] != submission.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez soumettre que votre propre test"
        )
    
    try:
        # Verify student exists
        student_ref = db.collection('students').document(submission.student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Étudiant non trouvé"
            )
        
        # Calculate metrics
        correct_answers = sum(1 for answer in submission.answers if answer.is_correct)
        total_questions = len(submission.answers)
        accuracy = (correct_answers / total_questions) if total_questions > 0 else 0
        precision = accuracy  # For this context, precision equals accuracy
        
        avg_response_time = sum(answer.response_time for answer in submission.answers) / total_questions if total_questions > 0 else 0
        temp_moyen_question = avg_response_time / 1000  # Convert to seconds
        
        # Calculate focus level (average of focus metrics)
        niveau_focus = sum(submission.cognitive_data.focus_metrics) / len(submission.cognitive_data.focus_metrics) if submission.cognitive_data.focus_metrics else 0
        
        # Calculate consistency score
        score_consistante = sum(submission.cognitive_data.consistency_scores) / len(submission.cognitive_data.consistency_scores) if submission.cognitive_data.consistency_scores else 0
        
        # Determine cognitive type
        type_cognitive = determine_cognitive_type(avg_response_time, accuracy * 100, niveau_focus)
        
        # Determine dominant pattern
        patern_dominante = determine_pattern_dominante(submission.cognitive_data)
        
        # Calculate violations
        total_violations = (
            submission.surveillance_metrics.position_violations +
            submission.surveillance_metrics.speech_detections +
            submission.surveillance_metrics.multiple_persons_detected
        )
        
        # Calculate integrity score (1 - violation_penalty)
        violation_penalty = min(total_violations * 0.1, 1.0)  # Max penalty of 100%
        score_integrité = max(0, 1 - violation_penalty)
        
        # Create proof of identity
        proof_id = generate_id("proof")
        proof_data = {
            "id_student": submission.student_id,
            "accuracy": round(accuracy, 2),
            "precision": round(precision, 2),
            "type_cognitive": type_cognitive,
            "temp_moyen_question": round(temp_moyen_question, 2),
            "niveau_focus": round(niveau_focus, 2),
            "violation": total_violations,
            "score_consistante": round(score_consistante, 2),
            "patern_dominante": patern_dominante,
            "score_integrité": round(score_integrité, 2),
            "created_at": datetime.now(),
            "raw_data": {
                "answers": [
                    {
                        "question_index": ans.question_index,
                        "answer": ans.answer,
                        "response_time": ans.response_time,
                        "is_correct": ans.is_correct
                    }
                    for ans in submission.answers
                ],
                "cognitive_data": {
                    "response_patterns": submission.cognitive_data.response_patterns,
                    "hesitation_times": submission.cognitive_data.hesitation_times,
                    "consistency_scores": submission.cognitive_data.consistency_scores,
                    "focus_metrics": submission.cognitive_data.focus_metrics
                },
                "surveillance_metrics": {
                    "face_detections": submission.surveillance_metrics.face_detections,
                    "position_violations": submission.surveillance_metrics.position_violations,
                    "speech_detections": submission.surveillance_metrics.speech_detections,
                    "multiple_persons_detected": submission.surveillance_metrics.multiple_persons_detected,
                    "total_checks": submission.surveillance_metrics.total_checks
                },
                "alerts_history": [
                    {
                        "message": alert.message,
                        "type": alert.type,
                        "timestamp": alert.timestamp
                    }
                    for alert in submission.alerts_history
                ]
            }
        }
        
        # Save proof of identity
        db.collection('proof_identity').document(proof_id).set(proof_data)
        
        # Update student record
        student_ref.update({
            'has_completed_test': True,
            'last_test_date': datetime.now(),
            'last_accuracy': accuracy,
            'last_cognitive_type': type_cognitive
        })
        
        # Create fraud report if violations detected
        if total_violations > 0:
            fraude_id = generate_id("fraude")
            fraude_data = {
                "id": fraude_id,
                "id_ref": submission.student_id,
                "ref_type": "test_cognitif",
                "nombre_fraude": total_violations,
                "type_fraude": "violations_surveillance",
                "date_fraude": datetime.now(),
                "details": {
                    "position_violations": submission.surveillance_metrics.position_violations,
                    "speech_detections": submission.surveillance_metrics.speech_detections,
                    "multiple_persons_detected": submission.surveillance_metrics.multiple_persons_detected
                }
            }
            db.collection('fraude').document(fraude_id).set(fraude_data)
        
        # Clean up session
        db.collection('sessions').document(credentials.credentials).delete()
        
        return {
            "success": True,
            "message": "Test soumis avec succès",
            "proof_id": proof_id,
            "results": {
                "accuracy": round(accuracy * 100, 2),
                "cognitive_type": type_cognitive,
                "integrity_score": round(score_integrité * 100, 2),
                "violations": total_violations,
                "pattern": patern_dominante
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la soumission: {str(e)}"
        )

# =============================================================================
# ANALYTICS ENDPOINTS
# =============================================================================

@app.get("/analytics/dashboard")
async def get_dashboard_analytics(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get dashboard analytics (Admin/Teacher only)"""
    session_data = verify_token(credentials.credentials)
    
    if session_data['role'] not in ['admin', 'teacher']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        # Count collections
        students_count = len(list(db.collection('students').stream()))
        teachers_count = len(list(db.collection('teachers').stream()))
        modules_count = len(list(db.collection('modules').stream()))
        exams_count = len(list(db.collection('exams').stream()))
        quizzes_count = len(list(db.collection('quizzes').stream()))
        
        # Count completed tests
        completed_tests = len(list(db.collection('proof_identity').stream()))
        
        # Count frauds
        fraudes_count = len(list(db.collection('fraude').stream()))
        
        # Calculate test completion rate
        completion_rate = (completed_tests / students_count * 100) if students_count > 0 else 0
        
        # Get cognitive type distribution
        cognitive_types = {}
        proof_docs = db.collection('proof_identity').stream()
        for doc in proof_docs:
            data = doc.to_dict()
            cog_type = data.get('type_cognitive', 'Unknown')
            cognitive_types[cog_type] = cognitive_types.get(cog_type, 0) + 1
        
        return {
            "counts": {
                "students": students_count,
                "teachers": teachers_count,
                "modules": modules_count,
                "exams": exams_count,
                "quizzes": quizzes_count,
                "completed_tests": completed_tests,
                "fraudes": fraudes_count
            },
            "metrics": {
                "completion_rate": round(completion_rate, 2),
                "cognitive_type_distribution": cognitive_types
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/student/{student_id}")
async def get_student_analytics(student_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get analytics for specific student"""
    session_data = verify_token(credentials.credentials)
    
    # Students can only access their own analytics
    if session_data['role'] == 'student' and session_data['user_id'] != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        # Get student info
        student_ref = db.collection('students').document(student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        student_data = student_doc.to_dict()
        
        # Get proof identity
        proof_ref = db.collection('proof_identity').where('id_student', '==', student_id).limit(1)
        proof_docs = list(proof_ref.stream())
        
        proof_data = None
        if proof_docs:
            proof_data = proof_docs[0].to_dict()
        
        # Get fraud reports
        fraude_ref = db.collection('fraude').where('id_ref', '==', student_id)
        fraude_docs = list(fraude_ref.stream())
        fraudes = [doc.to_dict() for doc in fraude_docs]
        
        return {
            "student": {
                "id": student_data['id'],
                "name": student_data['name'],
                "field": student_data['field'],
                "has_completed_test": student_data.get('has_completed_test', False)
            },
            "proof_identity": proof_data,
            "fraudes": fraudes,
            "fraud_count": len(fraudes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/field/{field}")
async def get_field_analytics(field: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get analytics for specific field"""
    session_data = verify_token(credentials.credentials)
    
    if session_data['role'] not in ['admin', 'teacher']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        # Get students in field
        students_ref = db.collection('students').where('field', '==', field)
        students = list(students_ref.stream())
        
        total_students = len(students)
        completed_tests = 0
        total_accuracy = 0
        cognitive_types = {}
        
        for student_doc in students:
            student_id = student_doc.id
            
            # Check if completed test
            proof_ref = db.collection('proof_identity').where('id_student', '==', student_id).limit(1)
            proof_docs = list(proof_ref.stream())
            
            if proof_docs:
                completed_tests += 1
                proof_data = proof_docs[0].to_dict()
                
                # Add to accuracy total
                total_accuracy += proof_data.get('accuracy', 0)
                
                # Count cognitive types
                cog_type = proof_data.get('type_cognitive', 'Unknown')
                cognitive_types[cog_type] = cognitive_types.get(cog_type, 0) + 1
        
        avg_accuracy = (total_accuracy / completed_tests) if completed_tests > 0 else 0
        completion_rate = (completed_tests / total_students * 100) if total_students > 0 else 0
        
        return {
            "field": field,
            "total_students": total_students,
            "completed_tests": completed_tests,
            "completion_rate": round(completion_rate, 2),
            "avg_accuracy": round(avg_accuracy * 100, 2),
            "cognitive_type_distribution": cognitive_types
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

@app.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user info"""
    session_data = verify_token(credentials.credentials)
    
    user_id = session_data['user_id']
    role = session_data['role']
    
    try:
        if role == 'student':
            user_ref = db.collection('students').document(user_id)
        elif role == 'teacher':
            user_ref = db.collection('teachers').document(user_id)
        elif role == 'admin':
            user_ref = db.collection('admins').document(user_id)
        else:
            raise HTTPException(status_code=400, detail="Rôle invalide")
        
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        user_data = user_doc.to_dict()
        
        # Remove password
        if 'password' in user_data:
            del user_data['password']
        
        user_data['role'] = role
        return user_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)