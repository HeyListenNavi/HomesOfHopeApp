from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime, timedelta
import random
import uuid

app = FastAPI(title="Casas Esperanza Mock API")

# --- Configuración CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SEGURIDAD Y AUTH ---
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Simula la validación de Sanctum.
    """
    token = credentials.credentials
    if not token or len(token) < 5:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthenticated.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token

# --- MODELOS AUTH ---
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: Dict[str, Any]

# --- HELPERS (Movidos arriba para usarlos en la DB) ---
def paginate_response(data: list, page: int = 1, per_page: int = 15):
    total = len(data)
    start = (page - 1) * per_page
    end = start + per_page
    return {
        "current_page": page,
        "data": data[start:end],
        "first_page_url": "http://localhost:8000/api?page=1",
        "last_page": (total // per_page) + 1 if total > 0 else 1,
        "per_page": per_page,
        "total": total
    }

def generate_id(): return random.randint(100, 9999)
def get_timestamp(): return datetime.now().isoformat()
def get_past_date(days=0): return (datetime.now() - timedelta(days=days)).isoformat()
def get_future_date(days=0): return (datetime.now() + timedelta(days=days)).isoformat()

# --- BASE DE DATOS EN MEMORIA (Mock Data Poblada) ---
db = {
    "families": [
        {
            "id": 10,
            "family_name": "Familia Hernández Pérez",
            "slug": "familia-hernandez-perez-10",
            "status": "active",
            "opened_at": "2023-11-15",
            "current_address": {
                "street": "Calle Olivos",
                "number": "450",
                "city": "Tijuana",
                "colonia": "El Florido"
            },
            "created_at": get_past_date(60),
            "members": [] # Se llena dinámicamente en el endpoint GET
        },
        {
            "id": 20,
            "family_name": "Familia García López",
            "slug": "familia-garcia-lopez-20",
            "status": "prospect",
            "opened_at": "2024-01-10",
            "current_address": {
                "street": "Av. Revolución",
                "number": "1200",
                "city": "Tijuana",
                "colonia": "Centro"
            },
            "created_at": get_past_date(10),
            "members": []
        },
        {
            "id": 30,
            "family_name": "Familia Ramírez",
            "slug": "familia-ramirez-30",
            "status": "in_follow_up",
            "opened_at": "2023-08-05",
            "current_address": {
                "street": "Camino Verde",
                "number": "SN",
                "city": "Tijuana",
                "colonia": "Sánchez Taboada"
            },
            "created_at": get_past_date(120),
            "members": []
        }
    ],
    "members": [
        # Miembros Familia 10
        {
            "id": 101,
            "family_profile_id": 10,
            "name": "Juan",
            "paternal_surname": "Hernández",
            "maternal_surname": "Ruiz",
            "relationship": "Padre",
            "birth_date": "1985-05-20",
            "is_responsible": True,
            "occupation": "Albañil",
            "created_at": get_past_date(60)
        },
        {
            "id": 102,
            "family_profile_id": 10,
            "name": "María",
            "paternal_surname": "Pérez",
            "relationship": "Madre",
            "birth_date": "1988-02-14",
            "is_responsible": False,
            "occupation": "Ama de casa",
            "created_at": get_past_date(60)
        },
        {
            "id": 103,
            "family_profile_id": 10,
            "name": "Pedrito",
            "paternal_surname": "Hernández",
            "relationship": "Hijo",
            "birth_date": "2015-08-10",
            "is_responsible": False,
            "created_at": get_past_date(60)
        },
        # Miembros Familia 20
        {
            "id": 201,
            "family_profile_id": 20,
            "name": "Luisa",
            "paternal_surname": "García",
            "relationship": "Madre Soltera",
            "birth_date": "1995-11-30",
            "is_responsible": True,
            "occupation": "Costurera",
            "created_at": get_past_date(10)
        }
    ],
    "documents": [
        {
            "id": 501,
            "documentable_id": 10,
            "documentable_type": "family_profile",
            "document_type": "Comprobante Domicilio",
            "original_name": "recibo_luz.pdf",
            "file_path": "documents/recibo_luz.pdf",
            "url": "http://localhost:8000/storage/recibo_luz.pdf",
            "created_at": get_past_date(55)
        }
    ],
    "notes": [
        {
            "id": 601,
            "noteable_id": 10,
            "noteable_type": "family_profile",
            "content": "La familia requiere apoyo urgente con materiales de techo.",
            "author": {"id": 1, "name": "Admin Usuario"},
            "is_private": False,
            "created_at": get_past_date(50)
        },
        {
            "id": 602,
            "noteable_id": 20,
            "noteable_type": "family_profile",
            "content": "Nota interna: Verificar ingresos reportados.",
            "author": {"id": 1, "name": "Admin Usuario"},
            "is_private": True,
            "created_at": get_past_date(5)
        }
    ],
    "visits": [
        {
            "id": 701,
            "family_profile_id": 10,
            "scheduled_at": get_future_date(2), # En 2 días
            "status": "scheduled",
            "location_type": "Domicilio",
            "attended_by": 1,
            "created_at": get_timestamp()
        },
        {
            "id": 702,
            "family_profile_id": 20,
            "scheduled_at": get_past_date(1), # Ayer
            "status": "completed",
            "location_type": "Oficina",
            "attended_by": 1,
            "created_at": get_past_date(5)
        }
    ],
    "tasks": [
        {
            "id": 801,
            "visit_id": 701,
            "title": "Llevar despensa básica",
            "description": "Incluir leche y pañales.",
            "priority": "high",
            "due_date": get_future_date(2),
            "assigned_to": 1,
            "status": "pending",
            "created_at": get_timestamp()
        },
        {
            "id": 802,
            "visit_id": 702,
            "title": "Escanear identificación oficial",
            "priority": "medium",
            "status": "completed",
            "assigned_to": 1,
            "created_at": get_past_date(5)
        }
    ]
}

# --- SCHEMAS DE DATOS ---
class FamilyProfileBase(BaseModel):
    family_name: str
    status: str
    opened_at: str
    current_address: Dict[str, Any]
    construction_address: Optional[Dict[str, Any]] = None
    general_observations: Optional[str] = None

class FamilyMemberBase(BaseModel):
    family_profile_id: int
    name: str
    paternal_surname: str
    maternal_surname: Optional[str] = None
    birth_date: str
    relationship: str
    is_responsible: bool = False
    curp: Optional[str] = None
    occupation: Optional[str] = None

class NoteBase(BaseModel):
    noteable_id: int
    noteable_type: str
    content: str
    is_private: bool = False

class VisitBase(BaseModel):
    family_profile_id: int
    scheduled_at: str
    status: str
    location_type: Optional[str] = "Domicilio"
    attended_by: Optional[int] = 1

class TaskBase(BaseModel):
    visit_id: int
    title: str
    description: Optional[str] = None
    priority: str
    due_date: Optional[str] = None
    assigned_to: Optional[int] = None
    status: str = "pending"

# ==========================================
# RUTAS PÚBLICAS
# ==========================================

@app.get("/")
def root():
    return {"message": "Mockup API Auth Ready. Ve a /docs para probar el Login."}

@app.post("/api/login", response_model=LoginResponse)
def login(creds: LoginRequest):
    # Usuario por defecto hardcodeado
    if creds.email == "admin@admin.com" and creds.password == "password":
        token = f"1|{uuid.uuid4().hex}MockTokenSanctum"
        return {
            "token": token,
            "user": {
                "id": 1,
                "name": "Admin Usuario",
                "email": "admin@admin.com",
                "role": "admin"
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

# ==========================================
# RUTAS PROTEGIDAS (Requieren Token)
# ==========================================

# 1. FAMILY PROFILES
@app.get("/api/family-profiles", dependencies=[Depends(verify_token)])
def list_families(page: int = 1):
    return paginate_response(db["families"], page=page)

@app.post("/api/family-profiles", status_code=201, dependencies=[Depends(verify_token)])
def create_family(profile: FamilyProfileBase):
    new_fam = profile.dict()
    new_fam["id"] = generate_id()
    new_fam["slug"] = f"{profile.family_name.lower().replace(' ', '-')}-{new_fam['id']}"
    new_fam["created_at"] = get_timestamp()
    new_fam["members"] = []
    db["families"].append(new_fam)
    return {"message": "Family Profile created", "data": new_fam}

@app.get("/api/family-profiles/{id}", dependencies=[Depends(verify_token)])
def show_family(id: int):
    fam = next((f for f in db["families"] if f["id"] == id), None)
    if not fam: raise HTTPException(404, "Family not found")
    # Relacionar miembros dinámicamente
    fam["members"] = [m for m in db["members"] if m["family_profile_id"] == id]
    return fam

@app.delete("/api/family-profiles/{id}", dependencies=[Depends(verify_token)])
def delete_family(id: int):
    initial = len(db["families"])
    db["families"] = [f for f in db["families"] if f["id"] != id]
    if len(db["families"]) == initial: raise HTTPException(404, "Not found")
    return {"message": "Deleted successfully"}

# 2. MEMBERS
@app.get("/api/family-members", dependencies=[Depends(verify_token)])
def list_members(family_profile_id: Optional[int] = None, page: int = 1):
    data = db["members"]
    if family_profile_id:
        data = [m for m in data if m["family_profile_id"] == family_profile_id]
    return paginate_response(data, page=page)

@app.post("/api/family-members", status_code=201, dependencies=[Depends(verify_token)])
def create_member(member: FamilyMemberBase):
    new = member.dict()
    new["id"] = generate_id()
    new["created_at"] = get_timestamp()
    db["members"].append(new)
    return {"message": "Member created", "data": new}

# 3. DOCUMENTS
@app.post("/api/documents", status_code=201, dependencies=[Depends(verify_token)])
async def upload_document(
    file: UploadFile = File(...),
    documentable_id: int = Form(...),
    documentable_type: str = Form(...),
    document_type: str = Form(...)
):
    new_doc = {
        "id": generate_id(),
        "documentable_id": documentable_id,
        "documentable_type": documentable_type,
        "document_type": document_type,
        "original_name": file.filename,
        "file_path": f"documents/{file.filename}",
        "url": f"http://localhost:8000/storage/{file.filename}",
        "created_at": get_timestamp()
    }
    db["documents"].append(new_doc)
    return {"message": "Document uploaded", "data": new_doc}

# 4. NOTES
@app.get("/api/notes", dependencies=[Depends(verify_token)])
def list_notes(noteable_type: Optional[str] = None, noteable_id: Optional[int] = None, page: int = 1):
    data = db["notes"]
    if noteable_type and noteable_id:
        data = [n for n in data if n["noteable_type"] == noteable_type and n["noteable_id"] == noteable_id]
    for n in data: n["author"] = {"id": 1, "name": "Admin Usuario"}
    return paginate_response(data, page=page)

@app.post("/api/notes", status_code=201, dependencies=[Depends(verify_token)])
def create_note(note: NoteBase):
    new = note.dict()
    new["id"] = generate_id()
    new["created_at"] = get_timestamp()
    new["author"] = {"id": 1, "name": "Admin Usuario"}
    db["notes"].append(new)
    return {"message": "Note created", "data": new}

# 5. VISITS
@app.get("/api/visits", dependencies=[Depends(verify_token)])
def list_visits(page: int = 1):
    return paginate_response(db["visits"], page=page)

@app.post("/api/visits", status_code=201, dependencies=[Depends(verify_token)])
def create_visit(visit: VisitBase):
    new = visit.dict()
    new["id"] = generate_id()
    new["created_at"] = get_timestamp()
    db["visits"].append(new)
    return {"message": "Visit created", "data": new}

# 6. TASKS
@app.get("/api/tasks", dependencies=[Depends(verify_token)])
def list_tasks(visit_id: Optional[int] = None, page: int = 1):
    data = db["tasks"]
    if visit_id: data = [t for t in data if t["visit_id"] == visit_id]
    return paginate_response(data, page=page)

@app.post("/api/tasks", status_code=201, dependencies=[Depends(verify_token)])
def create_task(task: TaskBase):
    new = task.dict()
    new["id"] = generate_id()
    new["created_at"] = get_timestamp()
    db["tasks"].append(new)
    return {"message": "Task created", "data": new}