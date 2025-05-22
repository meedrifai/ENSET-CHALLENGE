import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import hashlib
import random
import string

# Initialize Firebase Admin
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Helper function to hash password (same as used in your project)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Example fields to randomly assign
fields = ["Informatique", "Génie Civil", "Électromécanique", "Gestion", "Biologie"]

# Generate and add 10 students
for i in range(10):
    student_id = f"stu_{i+1:03}"
    name = f"Student {i+1}"
    email = f"student{i+1}@enset.ma"
    field = random.choice(fields)
    password = "password123"  # or any password you want
    hashed_password = hash_password(password)
    
    student_data = {
        "id": student_id,
        "name": name,
        "email": email,
        "field": field,
        "password": hashed_password,
        "has_completed_quiz": False,
        "created_at": datetime.now()
    }

    # Add to Firestore
    db.collection("students").document(student_id).set(student_data)

    print(f"✅ Added {student_id} - {name}")
