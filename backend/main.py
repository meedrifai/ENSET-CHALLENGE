from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore, auth
import hashlib
import time
from datetime import datetime, timedelta, timezone
import json
import os

# Initialize Firebase
if not firebase_admin._apps:
    # Use your Firebase service account key
    cred = credentials.Certificate("./serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()
app = FastAPI(title="EDGUARD Cognitive Testing API", version="1.0.0")
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class StudentLogin(BaseModel):
    student_id: str
    password: str

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

class TestSubmission(BaseModel):
    student_id: str
    field: str
    answers: List[QuestionAnswer]
    total_time: int
    cognitive_data: CognitiveData
    surveillance_metrics: SurveillanceMetrics
    alerts_history: List[Dict[str, Any]]

class StudentProfile(BaseModel):
    id: str
    name: str
    field: str
    email: str
    
# Pydantic Models
class Answer(BaseModel):
    questionIndex: int
    answer: int
    responseTime: int
    isCorrect: bool

class CognitiveData(BaseModel):
    responsePatterns: List[int]
    hesitationTimes: List[int]
    consistencyScores: List[float]
    focusMetrics: List[float]

class SurveillanceMetrics(BaseModel):
    faceDetections: int
    positionViolations: int
    speechDetections: int
    multiplePersonsDetected: int
    totalChecks: int

class AlertHistory(BaseModel):
    message: str
    type: str
    timestamp: int

class TestSubmission(BaseModel):
    student_id: str
    field: str
    answers: List[Answer]
    total_time: int
    cognitive_data: CognitiveData
    surveillance_metrics: SurveillanceMetrics
    alerts_history: List[AlertHistory]

# Sample questions data (you can move this to Firebase)
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
    "mathematiques": [
        {
            "question": "Quelle est la dérivée de x² ?",
            "options": ["x", "2x", "x²", "2"],
            "correct": 1
        },
        {
            "question": "Combien fait √16 ?",
            "options": ["2", "4", "8", "16"],
            "correct": 1
        },
        {
            "question": "Quelle est la valeur de π approximativement ?",
            "options": ["3.14", "2.71", "1.41", "0.57"],
            "correct": 0
        },
        {
            "question": "Que vaut sin(90°) ?",
            "options": ["0", "1", "-1", "0.5"],
            "correct": 1
        },
        {
            "question": "Quelle est la formule de l'aire d'un cercle ?",
            "options": ["2πr", "πr²", "πd", "r²"],
            "correct": 1
        }
    ],
    "sciences": [
        {
            "question": "Quel est le symbole chimique de l'or ?",
            "options": ["Au", "Ag", "Al", "Ar"],
            "correct": 0
        },
        {
            "question": "Combien de chromosomes a l'être humain ?",
            "options": ["44", "46", "48", "50"],
            "correct": 1
        },
        {
            "question": "Quelle est la vitesse de la lumière ?",
            "options": ["300 000 km/s", "150 000 km/s", "450 000 km/s", "600 000 km/s"],
            "correct": 0
        },
        {
            "question": "Quel gaz compose principalement l'atmosphère ?",
            "options": ["Oxygène", "Azote", "Dioxyde de carbone", "Hydrogène"],
            "correct": 1
        },
        {
            "question": "Qui a développé la théorie de la relativité ?",
            "options": ["Newton", "Einstein", "Galilée", "Darwin"],
            "correct": 1
        }
    ]
}

# Utility functions
def generate_twin_id(response_time: float, consistency: float, focus: float, accuracy: float, patterns: str) -> str:
    """Generate unique TWIN ID based on cognitive metrics"""
    data = f"{round(response_time)}-{round(consistency)}-{round(focus)}-{round(accuracy)}-{patterns}"
    hash_object = hashlib.md5(data.encode())
    return f"TWIN-{hash_object.hexdigest()[:8].upper()}"

def determine_cognitive_type(response_time: float, accuracy: float, focus: float) -> str:
    """Determine cognitive type based on metrics"""
    if response_time < 3000 and accuracy > 80:
        return "Analytique Rapide"
    elif response_time > 8000 and accuracy > 90:
        return "Réflexif Précis"
    elif focus > 70 and accuracy > 75:
        return "Concentré Équilibré"
    elif response_time < 2000:
        return "Intuitif Spontané"
    elif accuracy < 60:
        return "Exploratoire Créatif"
    else:
        return "Méthodique Standard"

def verify_password(hashed: str, plain: str) -> bool:
    return hashed == hash_password(plain)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# API Endpoints
@app.get("/")
async def root():
    return {"message": "EDGUARD Cognitive Testing API", "status": "active"}

@app.post("/auth/login")
async def login_student(login_data: StudentLogin):
    """Authenticate student and return profile"""
    try:
        # Get student from Firebase
        student_ref = db.collection('students').document(login_data.student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects"
            )
        
        student_data = student_doc.to_dict()
        
        # Verify password
        if not verify_password(student_data.get('password'), login_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects"
            )
        
        # Create session token AVANT de l'utiliser
        token_data = {
            'student_id': login_data.student_id,
            'timestamp': time.time()
        }
        token = hashlib.sha256(json.dumps(token_data).encode()).hexdigest()
        
        # Store session in Firebase
        db.collection('sessions').document(token).set({
            'student_id': login_data.student_id,
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(hours=2)
        })

        # Retour normal pour les étudiants qui n'ont pas encore complété le quiz
        return {
            "token": token,
            "student": {
                "id": student_data['id'],
                "name": student_data['name'],
                "field": student_data['field'],
                "email": student_data.get('email', ''),
                "has_completed_quiz" : student_data['has_completed_quiz']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@app.get("/student/{student_id}")
async def get_student(student_id: str):
    """Récupère les infos de l'étudiant par ID"""
    try:
        student_ref = db.collection('students').document(student_id)
        student_doc = student_ref.get()

        if not student_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Étudiant non trouvé"
            )

        student_data = student_doc.to_dict()
        return {
            "id": student_data.get('id'),
            "name": student_data.get('name'),
            "field": student_data.get('field'),
            "email": student_data.get('email', '')
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur serveur: {str(e)}"
        )
        
        
@app.get("/questions/{field}")
async def get_questions(field: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get questions for specific field"""
    # Verify token
    token = credentials.credentials
    session_ref = db.collection('sessions').document(token)
    session_doc = session_ref.get()
    
    if not session_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    session_data = session_doc.to_dict()

    # Ensure both datetimes are timezone-aware
    if datetime.now(timezone.utc) > session_data['expires_at']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired"
        )
    
    if field not in QUESTIONS_DATA:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domaine non trouvé"
        )
    
    return {"questions": QUESTIONS_DATA[field]}

def generate_twin_id(avg_response_time: float, consistency: float, focus: float, accuracy: float, patterns: str) -> str:
    """Generate unique Twin ID based on cognitive metrics"""
    combined_data = f"{avg_response_time:.2f}_{consistency:.2f}_{focus:.2f}_{accuracy:.2f}_{patterns}"
    return hashlib.sha256(combined_data.encode()).hexdigest()[:16].upper()

def determine_cognitive_type(avg_response_time: float, accuracy: float, focus: float) -> str:
    """Determine cognitive type based on performance metrics"""
    if accuracy >= 80 and avg_response_time <= 3000 and focus >= 40:
        return "RAPID_PRECISE"
    elif accuracy >= 70 and avg_response_time <= 4000:
        return "BALANCED_PERFORMER"
    elif accuracy >= 60 and avg_response_time > 4000:
        return "THOUGHTFUL_ANALYZER"
    elif avg_response_time <= 2000:
        return "IMPULSIVE_RESPONDER"
    elif focus < 30:
        return "DISTRACTED_LEARNER"
    else:
        return "DEVELOPING_LEARNER"

def calculate_cognitive_complexity(cognitive_data: CognitiveData) -> dict:
    """Calculate advanced cognitive metrics"""
    # Pattern variability
    pattern_variance = len(set(cognitive_data.responsePatterns)) / len(cognitive_data.responsePatterns) if cognitive_data.responsePatterns else 0
    
    # Response time stability
    response_times = cognitive_data.hesitationTimes
    if len(response_times) > 1:
        avg_time = sum(response_times) / len(response_times)
        time_variance = sum((t - avg_time) ** 2 for t in response_times) / len(response_times)
        time_stability = 1 / (1 + (time_variance / avg_time)) if avg_time > 0 else 0
    else:
        time_stability = 1.0
    
    # Focus progression
    focus_metrics = cognitive_data.focusMetrics
    if len(focus_metrics) > 1:
        focus_trend = (focus_metrics[-1] - focus_metrics[0]) / len(focus_metrics)
    else:
        focus_trend = 0
    
    return {
        "pattern_variability": round(pattern_variance, 3),
        "response_stability": round(time_stability, 3),
        "focus_progression": round(focus_trend, 3)
    }

@app.post("/test/submit")
async def submit_test(
    submission: TestSubmission,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Submit test results and create cognitive twin profile"""
    # Verify token
    token = credentials.credentials
    session_ref = db.collection('sessions').document(token)
    session_doc = session_ref.get()
    
    if not session_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
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
        
        student_data = student_doc.to_dict()
        
        # Calculate basic cognitive metrics
        correct_answers = sum(1 for answer in submission.answers if answer.isCorrect)
        total_questions = len(submission.answers)
        accuracy = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        
        avg_response_time = sum(answer.responseTime for answer in submission.answers) / total_questions if total_questions > 0 else 0
        
        # Calculate consistency and focus averages
        avg_consistency = sum(submission.cognitive_data.consistencyScores) / len(submission.cognitive_data.consistencyScores) if submission.cognitive_data.consistencyScores else 0
        avg_focus = sum(submission.cognitive_data.focusMetrics) / len(submission.cognitive_data.focusMetrics) if submission.cognitive_data.focusMetrics else 0
        
        # Generate TWIN ID
        patterns_str = json.dumps(submission.cognitive_data.responsePatterns)
        twin_id = generate_twin_id(avg_response_time, avg_consistency, avg_focus, accuracy, patterns_str)
        
        # Determine cognitive type
        cognitive_type = determine_cognitive_type(avg_response_time, accuracy, avg_focus)
        
        # Calculate advanced cognitive complexity
        cognitive_complexity = calculate_cognitive_complexity(submission.cognitive_data)
        
        # Calculate violation severity
        total_violations = (
            submission.surveillance_metrics.positionViolations +
            submission.surveillance_metrics.speechDetections +
            submission.surveillance_metrics.multiplePersonsDetected
        )
        
        violation_severity = "LOW"
        if total_violations > 10:
            violation_severity = "HIGH"
        elif total_violations > 5:
            violation_severity = "MEDIUM"
        
        # Prepare timestamp
        current_time = datetime.now()
        timestamp_iso = current_time.isoformat()
        
        # Create Twin record structure
        twin_data = {
            # Primary identification
            "twin_id": twin_id,
            "student_id": submission.student_id,  # Foreign key reference
            "student_name": student_data.get('name', ''),
            "field": submission.field,
            
            # Test session info
            "session_timestamp": timestamp_iso,
            "total_test_time": submission.total_time,
            "created_at": current_time,
            
            # Performance metrics
            "performance": {
                "accuracy_percentage": round(accuracy, 2),
                "correct_answers": correct_answers,
                "total_questions": total_questions,
                "avg_response_time_ms": round(avg_response_time),
                "cognitive_type": cognitive_type
            },
            
            # Cognitive profile
            "cognitive_profile": {
                "consistency_score": round(avg_consistency, 3),
                "focus_level": round(avg_focus, 2),
                "dominant_response_pattern": max(set(submission.cognitive_data.responsePatterns), 
                                                key=submission.cognitive_data.responsePatterns.count) if submission.cognitive_data.responsePatterns else 0,
                "pattern_complexity": cognitive_complexity,
                "learning_style_indicators": {
                    "rapid_decision_maker": avg_response_time < 2500,
                    "consistent_performer": avg_consistency > 0.7,
                    "focused_learner": avg_focus > 35,
                    "pattern_diverse": cognitive_complexity["pattern_variability"] > 0.6
                }
            },
            
            # Detailed cognitive data
            "raw_cognitive_data": {
                "response_patterns": submission.cognitive_data.responsePatterns,
                "hesitation_times": submission.cognitive_data.hesitationTimes,
                "consistency_scores": submission.cognitive_data.consistencyScores,
                "focus_metrics": submission.cognitive_data.focusMetrics
            },
            
            # Surveillance and integrity
            "surveillance_report": {
                "total_checks": submission.surveillance_metrics.totalChecks,
                "face_detections": submission.surveillance_metrics.faceDetections,
                "position_violations": submission.surveillance_metrics.positionViolations,
                "speech_detections": submission.surveillance_metrics.speechDetections,
                "multiple_persons_detected": submission.surveillance_metrics.multiplePersonsDetected,
                "total_violations": total_violations,
                "violation_severity": violation_severity,
                "integrity_score": max(0, 100 - (total_violations * 5))  # Penalty-based scoring
            },
            
            # Alert history
            "alerts_summary": {
                "total_alerts": len(submission.alerts_history),
                "alert_types": {
                    "speech": len([a for a in submission.alerts_history if a.type == "speech"]),
                    "position": len([a for a in submission.alerts_history if a.type == "position"]),
                    "multiple_persons": len([a for a in submission.alerts_history if a.type == "multiple_persons"])
                },
                "first_alert_time": min([a.timestamp for a in submission.alerts_history]) if submission.alerts_history else None,
                "last_alert_time": max([a.timestamp for a in submission.alerts_history]) if submission.alerts_history else None
            },
            
            # Detailed answers
            "answers_detail": [
                {
                    "question_index": answer.questionIndex,
                    "selected_answer": answer.answer,
                    "response_time_ms": answer.responseTime,
                    "is_correct": answer.isCorrect,
                    "response_speed_category": "FAST" if answer.responseTime < 2000 else "MEDIUM" if answer.responseTime < 5000 else "SLOW"
                }
                for answer in submission.answers
            ],
            
            # Complete alert history
            "alerts_history": [
                {
                    "message": alert.message,
                    "type": alert.type,
                    "timestamp": alert.timestamp,
                    "formatted_time": datetime.fromtimestamp(alert.timestamp / 1000).isoformat()
                }
                for alert in submission.alerts_history
            ]
        }
        
        # Save Twin record to Firestore
        twin_ref = db.collection('cognitive_twins').document(twin_id)
        twin_ref.set(twin_data)
        
        # Update student record
        student_ref.update({
            'has_completed_quiz': True,
            'last_test_date': current_time,
            'twin_id': twin_id, 
            'last_accuracy': accuracy,
            'last_cognitive_type': cognitive_type
        })
        
        # Create test session record for historical tracking
        session_data = {
            "student_id": submission.student_id,
            "twin_id": twin_id,
            "field": submission.field,
            "completed_at": current_time,
            "accuracy": accuracy,
            "total_violations": total_violations,
            "test_duration": submission.total_time
        }
        
        db.collection('test_sessions').document(f"{submission.student_id}_{int(time.time())}").set(session_data)
        
        # Clean up session token
        session_ref.delete()
        
        # Return comprehensive response
        return {
            "success": True,
            "twin_id": twin_id,
            "cognitive_twin": {
                "twin_id": twin_id,
                "cognitive_type": cognitive_type,
                "performance_summary": {
                    "accuracy": round(accuracy, 2),
                    "correct_answers": correct_answers,
                    "total_questions": total_questions,
                    "avg_response_time": round(avg_response_time),
                    "consistency_score": round(avg_consistency, 3),
                    "focus_level": round(avg_focus, 2)
                },
                "surveillance_summary": {
                    "total_violations": total_violations,
                    "violation_severity": violation_severity,
                    "integrity_score": max(0, 100 - (total_violations * 5))
                }
            },
            "student_profile_updated": True,
            "test_session_recorded": True
        }
        
    except Exception as e:
        # Log error for debugging
        print(f"Error in test submission: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la soumission: {str(e)}"
        )

# Additional endpoint to retrieve twin data
@app.get("/student/{student_id}/twin")
async def get_student_twin(student_id: str):
    """Get cognitive twin data for a student"""
    try:
        # Get student's twin ID
        student_ref = db.collection('students').document(student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Étudiant non trouvé"
            )
        
        student_data = student_doc.to_dict()
        twin_id = student_data.get('twin_id')
        
        if not twin_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aucun twin cognitif trouvé pour cet étudiant"
            )
        
        # Get twin data
        twin_ref = db.collection('cognitive_twins').document(twin_id)
        twin_doc = twin_ref.get()
        
        if not twin_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Données du twin cognitif non trouvées"
            )
        
        return {
            "success": True,
            "twin_data": twin_doc.to_dict()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération: {str(e)}"
        )

@app.post("/surveillance/alert")
async def log_surveillance_alert(
    alert_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Log surveillance alerts in real-time"""
    # Verify token
    token = credentials.credentials
    session_ref = db.collection('sessions').document(token)
    session_doc = session_ref.get()
    
    if not session_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    # Log alert
    alert_data['timestamp'] = datetime.now()
    db.collection('surveillance_alerts').add(alert_data)
    
    return {"success": True, "message": "Alerte enregistrée"}

@app.get("/student/profile")
async def get_student_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get student profile from token"""
    token = credentials.credentials
    session_ref = db.collection('sessions').document(token)
    session_doc = session_ref.get()
    
    if not session_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    session_data = session_doc.to_dict()
    student_id = session_data['student_id']
    
    student_ref = db.collection('students').document(student_id)
    student_doc = student_ref.get()
    
    if not student_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Étudiant non trouvé"
        )
    
    student_data = student_doc.to_dict()
    return {
        "id": student_data['id'],
        "name": student_data['name'],
        "field": student_data['field'],
        "email": student_data.get('email', '')
    }

@app.post("/auth/logout")
async def logout_student(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout student and invalidate session"""
    token = credentials.credentials
    session_ref = db.collection('sessions').document(token)
    session_ref.delete()
    
    return {"success": True, "message": "Déconnexion réussie"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)