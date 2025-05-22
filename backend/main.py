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

# Sample questions data (you can move this to Firebase)
QUESTIONS_DATA = {
    "informatique": [
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
                detail="Identifiants incorrects" + str(login_data.student_id)
            )
        
        student_data = student_doc.to_dict()
        
        # Verify password
        if not verify_password(student_data.get('password'), login_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects"
            )
        
        # Check if already completed
        if student_data.get('has_completed_quiz', False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous avez déjà passé le test"
            )
        
        # Create session token (simple implementation)
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
        
        return {
            "token": token,
            "student": {
                "id": student_data['id'],
                "name": student_data['name'],
                "field": student_data['field'],
                "email": student_data.get('email', '')
            },
          
            
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
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

@app.post("/test/submit")
async def submit_test(
    submission: TestSubmission,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Submit test results and calculate cognitive signature"""
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
        # Calculate cognitive metrics
        correct_answers = sum(1 for answer in submission.answers if answer.is_correct)
        accuracy = (correct_answers / len(submission.answers)) * 100
        
        avg_response_time = sum(answer.response_time for answer in submission.answers) / len(submission.answers)
        avg_consistency = sum(submission.cognitive_data.consistency_scores) / len(submission.cognitive_data.consistency_scores) if submission.cognitive_data.consistency_scores else 0
        avg_focus = sum(submission.cognitive_data.focus_metrics) / len(submission.cognitive_data.focus_metrics)
        
        # Generate TWIN ID
        patterns_str = json.dumps(submission.cognitive_data.response_patterns)
        twin_id = generate_twin_id(avg_response_time, avg_consistency, avg_focus, accuracy, patterns_str)
        
        # Determine cognitive type
        cognitive_type = determine_cognitive_type(avg_response_time, accuracy, avg_focus)
        
        # Create cognitive signature
        cognitive_twin = {
            "twin_id": twin_id,
            "metrics": {
                "avg_response_time": round(avg_response_time),
                "consistency": round(avg_consistency),
                "focus_level": round(avg_focus),
                "accuracy": round(accuracy),
                "dominant_pattern": max(set(submission.cognitive_data.response_patterns), key=submission.cognitive_data.response_patterns.count) if submission.cognitive_data.response_patterns else 0,
                "cognitive_type": cognitive_type
            },
            "timestamp": datetime.now().isoformat()
        }
        
        # Store results in Firebase
        result_data = {
            "student_id": submission.student_id,
            "field": submission.field,
            "total_time": submission.total_time,
            "cognitive_twin": cognitive_twin,
            "answers": [answer.dict() for answer in submission.answers],
            "raw_cognitive_data": submission.cognitive_data.dict(),
            "surveillance_metrics": submission.surveillance_metrics.dict(),
            "alerts_history": submission.alerts_history,
            "completed_at": datetime.now(),
            "violations_count": (
                submission.surveillance_metrics.position_violations +
                submission.surveillance_metrics.speech_detections +
                submission.surveillance_metrics.multiple_persons_detected
            )
        }
        
        # Save to Firebase
        db.collection('test_results').document(f"{submission.student_id}_{int(time.time())}").set(result_data)
        
        # Mark student as completed
        db.collection('students').document(submission.student_id).update({
            'has_completed_quiz': True,
            'last_test_date': datetime.now()
        })
        
        # Delete session
        session_ref.delete()
        
        return {
            "success": True,
            "cognitive_twin": cognitive_twin,
            "accuracy": accuracy,
            "correct_answers": correct_answers,
            "total_questions": len(submission.answers),
            "violations_count": result_data["violations_count"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la soumission: {str(e)}"
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