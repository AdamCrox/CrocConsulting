from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import os
import shutil
import uuid
from openai import AsyncOpenAI

from seed import seed_database


# Environment variables
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.environ.get("DATABASE_NAME", "croc_consulting")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Upload directory
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)
db = client[DATABASE_NAME]


# Lifespan handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed database
    await seed_database(db)
    yield
    # Shutdown: close MongoDB connection
    client.close()


# FastAPI app
app = FastAPI(title="Croc Consulting API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class LoginRequest(BaseModel):
    client_id: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    client_id: Optional[str] = None
    company: Optional[str] = None
    message: Optional[str] = None


class ContactForm(BaseModel):
    name: str
    email: str
    company: str
    phone: str
    message: str


class SubmissionContact(BaseModel):
    name: str
    email: str
    company: str
    phone: str
    project: str
    timeframe: str
    quote_type: str
    urgency: str
    notes: str
    site_location: Optional[str] = ""
    standards: Optional[str] = ""


class SubmissionItem(BaseModel):
    desc: str
    qty: int
    unit: str
    specs: str


class SubmissionCreate(BaseModel):
    client_id: str
    tab: str
    contact: dict
    items: List[dict] = []


class RFIResponse(BaseModel):
    response: str


class AIOutputUpdate(BaseModel):
    ai_output: str


# Routes
@app.get("/")
async def root():
    return {"message": "Croc Consulting API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Authentication
@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await db.clients.find_one({"client_id": request.client_id}, {"_id": 0})
    if not user:
        return LoginResponse(success=False, message="Invalid client number")
    if user["password"] != request.password:
        return LoginResponse(success=False, message="Invalid password")
    return LoginResponse(
        success=True,
        client_id=user["client_id"],
        company=user["company"]
    )


# Quotes
@app.get("/quotes/{client_id}")
async def get_quotes(client_id: str):
    quotes = await db.quotes.find({"client_id": client_id}, {"_id": 0}).to_list(100)
    return quotes


@app.get("/quotes/detail/{quote_id}")
async def get_quote_detail(quote_id: str):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote


@app.post("/quotes/{quote_id}/approve")
async def approve_quote(quote_id: str):
    result = await db.quotes.update_one(
        {"id": quote_id},
        {"$set": {
            "approved": True,
            "current_step": 6,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"success": True}


@app.post("/quotes/{quote_id}/rfi/{rfi_index}/respond")
async def respond_to_rfi(quote_id: str, rfi_index: int, response: RFIResponse):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    if rfi_index >= len(quote.get("rfi", [])):
        raise HTTPException(status_code=404, detail="RFI not found")
    
    today = datetime.now().strftime("%d %B %Y")
    await db.quotes.update_one(
        {"id": quote_id},
        {"$set": {
            f"rfi.{rfi_index}.response": response.response,
            f"rfi.{rfi_index}.response_date": today,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"success": True}


# Submissions
@app.get("/submissions/{client_id}")
async def get_submissions(client_id: str):
    submissions = await db.submissions.find({"client_id": client_id}, {"_id": 0}).to_list(100)
    return submissions


@app.post("/submissions")
async def create_submission(submission: SubmissionCreate):
    submission_id = f"CRC-2025-{str(uuid.uuid4())[:3].upper()}"
    doc = {
        "id": submission_id,
        "client_id": submission.client_id,
        "tab": submission.tab,
        "contact": submission.contact,
        "files": [],
        "items": submission.items,
        "status": "New",
        "ai_output": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.submissions.insert_one(doc)
    return {"success": True, "id": submission_id}


@app.post("/submissions/upload")
async def upload_file(
    client_id: str = Form(...),
    submission_id: str = Form(...),
    file: UploadFile = File(...)
):
    # Validate file type
    allowed_extensions = [".xlsx", ".xls", ".pdf", ".docx", ".doc"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Create upload directory
    upload_path = os.path.join(UPLOAD_DIR, client_id, submission_id)
    os.makedirs(upload_path, exist_ok=True)
    
    # Save file
    file_path = os.path.join(upload_path, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Update submission with file info
    file_info = {
        "filename": file.filename,
        "path": file_path,
        "type": file_ext[1:],
        "size": file_size
    }
    
    await db.submissions.update_one(
        {"id": submission_id},
        {
            "$push": {"files": file_info},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {"success": True, "file": file_info}


@app.post("/submissions/{submission_id}/generate-ai")
async def generate_ai_quote(submission_id: str):
    submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    contact = submission.get("contact", {})
    items = submission.get("items", [])
    
    # Build items text
    items_text = ""
    for i, item in enumerate(items, 1):
        items_text += f"{i}. {item.get('desc', 'N/A')} - Qty: {item.get('qty', 1)}, Unit: {item.get('unit', 'N/A')}, Specs: {item.get('specs', 'N/A')}\n"
    
    if not items_text:
        items_text = "No line items specified - refer to attached documentation."
    
    prompt = f"""Generate a formal supplier RFQ (Request for Quotation) document with the following structure:

1. CROC CONSULTING HEADER
   - Company: Croc Consulting
   - ABN: 00 000 000 000
   - Address: Brisbane, Australia
   - Contact: Adam Croxton

2. RFQ REFERENCE: {submission.get('id', 'N/A')}

3. PROJECT DETAILS:
   - Client: {contact.get('company', 'N/A')}
   - Project Name: {contact.get('project', 'N/A')}
   - Quote Type: {contact.get('quote_type', 'Binding')}
   - Required Timeframe: {contact.get('timeframe', 'N/A')}
   - Urgency: {contact.get('urgency', 'Standard')}

4. ITEMISED EQUIPMENT LIST:
{items_text}

5. REQUIRED DELIVERABLES:
   - Unit pricing and total pricing
   - Lead times from order to delivery
   - Warranty terms and conditions
   - Technical compliance certificates
   - Factory acceptance testing availability

6. SUBMISSION DEADLINE: [14 days from RFQ date]

7. CONTACT FOR QUERIES:
   Adam Croxton
   Croc Consulting
   Email: Adam.croxton@outlook.com
   Phone: +61 (0) 400 000 000
   Brisbane, Australia

Format this as a professional RFQ document ready to send to suppliers. Use clear sections and professional language. Do not use em dashes anywhere."""

    try:
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        
        response = await openai_client.chat.completions.create(
            model="gpt-4o",
            max_tokens=1000,
            messages=[
                {"role": "system", "content": "You are a professional procurement document generator for Croc Consulting, an MV/HV equipment procurement consultancy."},
                {"role": "user", "content": prompt}
            ]
        )
        
        ai_output = response.choices[0].message.content
        
        # Update submission with AI output
        await db.submissions.update_one(
            {"id": submission_id},
            {"$set": {
                "ai_output": ai_output,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {"success": True, "output": ai_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/submissions/{submission_id}/ai-output")
async def update_ai_output(submission_id: str, data: AIOutputUpdate):
    result = await db.submissions.update_one(
        {"id": submission_id},
        {"$set": {
            "ai_output": data.ai_output,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"success": True}


# Contact form
@app.post("/contact")
async def submit_contact(form: ContactForm):
    doc = form.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    return {"success": True}
