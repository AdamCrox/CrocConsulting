from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone
import shutil
from openai import AsyncOpenAI

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# File upload directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class LoginRequest(BaseModel):
    clientId: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    clientName: Optional[str] = None
    message: Optional[str] = None

class ContactForm(BaseModel):
    name: str
    email: str
    company: str
    phone: str
    message: str

class LineItem(BaseModel):
    desc: str
    qty: int
    unit: float
    supplier: str

class RFI(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fromSender: str
    date: str
    message: str
    response: Optional[str] = None
    responseDate: Optional[str] = None

class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project: str
    client: str
    type: str
    dateRaised: str
    expiryDate: Optional[str] = None
    currentStep: int
    items: List[dict]
    rfi: List[dict]
    approved: bool = False
    clientId: str = ""

class SubmissionItem(BaseModel):
    desc: str
    qty: int
    unit: str
    specs: str

class SubmissionContact(BaseModel):
    name: str
    email: str
    company: str
    phone: str
    project: str
    timeframe: str
    quoteType: str
    urgency: str
    notes: str
    siteLocation: Optional[str] = ""
    standards: Optional[str] = ""

class Submission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    date: str
    tab: str
    contact: dict
    files: List[str]
    items: List[dict]
    status: str
    aiOutput: Optional[str] = None
    clientId: str = ""

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    clientId: str
    password: str
    clientName: str

class RFIResponse(BaseModel):
    response: str

class AIGenerateRequest(BaseModel):
    submissionId: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Croc Consulting API"}

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await db.clients.find_one({"clientId": request.clientId}, {"_id": 0})
    if not user:
        return LoginResponse(success=False, message="Invalid client number")
    if user["password"] != request.password:
        return LoginResponse(success=False, message="Invalid password")
    return LoginResponse(success=True, clientName=user["clientName"])

@api_router.get("/quotes/{client_id}")
async def get_quotes(client_id: str):
    quotes = await db.quotes.find({"clientId": client_id}, {"_id": 0}).to_list(100)
    return quotes

@api_router.get("/quote/{quote_id}")
async def get_quote(quote_id: str):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote

@api_router.post("/quote/{quote_id}/approve")
async def approve_quote(quote_id: str):
    result = await db.quotes.update_one(
        {"id": quote_id},
        {"$set": {"approved": True, "currentStep": 6}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"success": True}

@api_router.post("/quote/{quote_id}/rfi/{rfi_index}/respond")
async def respond_to_rfi(quote_id: str, rfi_index: int, response: RFIResponse):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    if rfi_index >= len(quote.get("rfi", [])):
        raise HTTPException(status_code=404, detail="RFI not found")
    
    today = datetime.now().strftime("%d %B %Y")
    update_field = f"rfi.{rfi_index}"
    await db.quotes.update_one(
        {"id": quote_id},
        {"$set": {
            f"{update_field}.response": response.response,
            f"{update_field}.responseDate": today
        }}
    )
    return {"success": True}

@api_router.get("/submissions/{client_id}")
async def get_submissions(client_id: str):
    submissions = await db.submissions.find({"clientId": client_id}, {"_id": 0}).to_list(100)
    return submissions

@api_router.post("/submissions")
async def create_submission(submission: Submission):
    doc = submission.model_dump()
    await db.submissions.insert_one(doc)
    return {"success": True, "id": submission.id}

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "size": os.path.getsize(file_path)}

@api_router.post("/contact")
async def submit_contact(form: ContactForm):
    doc = form.model_dump()
    doc["timestamp"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    return {"success": True}

@api_router.post("/ai/generate")
async def generate_ai_quote(request: AIGenerateRequest):
    submission = await db.submissions.find_one({"id": request.submissionId}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    contact = submission.get("contact", {})
    items = submission.get("items", [])
    
    # Build the prompt
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
   - Quote Type: {contact.get('quoteType', 'Binding')}
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
        api_key = os.environ.get('OPENAI_API_KEY')
        client = AsyncOpenAI(api_key=api_key)
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            max_tokens=1000,
            messages=[
                {"role": "system", "content": "You are a professional procurement document generator for Croc Consulting, an MV/HV equipment procurement consultancy."},
                {"role": "user", "content": prompt}
            ]
        )
        
        ai_output = response.choices[0].message.content
        
        # Update the submission with AI output
        await db.submissions.update_one(
            {"id": request.submissionId},
            {"$set": {"aiOutput": ai_output}}
        )
        
        return {"success": True, "output": ai_output}
    except Exception as e:
        logging.error(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/regenerate")
async def regenerate_ai_quote(request: AIGenerateRequest):
    return await generate_ai_quote(request)

# Seed data function
async def seed_database():
    # Check if data already exists
    existing_client = await db.clients.find_one({"clientId": "ERG-2025"})
    if existing_client:
        logging.info("Database already seeded")
        return
    
    logging.info("Seeding database...")
    
    # Seed client
    await db.clients.insert_one({
        "clientId": "ERG-2025",
        "password": "demo1234",
        "clientName": "Ergon Energy"
    })
    
    # Seed quotes
    demo_quotes = [
        {
            "id": "CRC-2025-0041",
            "project": "Blackwater Substation 33kV Switchgear Upgrade",
            "client": "Ergon Energy",
            "clientId": "ERG-2025",
            "type": "Binding",
            "dateRaised": "14 March 2025",
            "expiryDate": "30 April 2025",
            "currentStep": 5,
            "approved": False,
            "items": [
                {"desc": "33kV vacuum circuit breaker panel (3 off)", "qty": 3, "unit": 87500, "supplier": "Siemens"},
                {"desc": "33kV bus section panel", "qty": 1, "unit": 62000, "supplier": "Siemens"},
                {"desc": "33/11kV power transformer 20MVA", "qty": 1, "unit": 485000, "supplier": "ABB"},
                {"desc": "11kV RMU (4-way)", "qty": 2, "unit": 34500, "supplier": "Lucy Electric"},
                {"desc": "Protection relay panels (SEL-751)", "qty": 3, "unit": 18200, "supplier": "Schneider Electric"},
                {"desc": "DC supply and battery charger system", "qty": 1, "unit": 28000, "supplier": "Eaton"}
            ],
            "rfi": [
                {
                    "id": "rfi-1",
                    "fromSender": "Croc Consulting",
                    "date": "18 March 2025",
                    "message": "Can you confirm the fault level at the 33kV bus? Existing documentation shows 25kA but the network study may have updated this.",
                    "response": "Confirmed 31.5kA per the 2024 network study.",
                    "responseDate": "20 March 2025"
                },
                {
                    "id": "rfi-2",
                    "fromSender": "Croc Consulting",
                    "date": "22 March 2025",
                    "message": "Do you have a preference on transformer cooling type? ONAN will be standard but ONAF is available for higher continuous rating.",
                    "response": None,
                    "responseDate": None
                }
            ]
        },
        {
            "id": "CRC-2025-0042",
            "project": "Moranbah North - Protection Relay Replacement",
            "client": "Ergon Energy",
            "clientId": "ERG-2025",
            "type": "Non-binding",
            "dateRaised": "22 March 2025",
            "expiryDate": None,
            "currentStep": 3,
            "approved": False,
            "items": [
                {"desc": "Feeder protection relay (SEL-751A)", "qty": 12, "unit": 4800, "supplier": "Schneider Electric"},
                {"desc": "Transformer differential relay (SEL-787)", "qty": 4, "unit": 8200, "supplier": "Schneider Electric"},
                {"desc": "Bus differential relay (SEL-487B)", "qty": 2, "unit": 12500, "supplier": "GE Vernova"},
                {"desc": "Relay testing and commissioning (per panel)", "qty": 18, "unit": 2200, "supplier": "Croc Consulting"}
            ],
            "rfi": [
                {
                    "id": "rfi-3",
                    "fromSender": "Croc Consulting",
                    "date": "25 March 2025",
                    "message": "Please confirm existing CT ratios on feeders 1 through 6.",
                    "response": "CT ratios are 600/1 on feeders 1-4 and 400/1 on feeders 5-6.",
                    "responseDate": "27 March 2025"
                }
            ]
        },
        {
            "id": "CRC-2025-0047",
            "project": "Gladstone Solar Farm - 132kV GIS Procurement",
            "client": "Ergon Energy",
            "clientId": "ERG-2025",
            "type": "Binding",
            "dateRaised": "28 March 2025",
            "expiryDate": "15 May 2025",
            "currentStep": 1,
            "approved": False,
            "items": [
                {"desc": "132kV GIS switchgear (3-bay)", "qty": 1, "unit": 1850000, "supplier": "TBC"},
                {"desc": "132/33kV power transformer 60MVA", "qty": 2, "unit": 920000, "supplier": "TBC"},
                {"desc": "33kV AIS switchgear (8-panel)", "qty": 1, "unit": 380000, "supplier": "TBC"},
                {"desc": "Control building (prefab)", "qty": 1, "unit": 145000, "supplier": "TBC"},
                {"desc": "SCADA RTU and communications", "qty": 1, "unit": 68000, "supplier": "TBC"}
            ],
            "rfi": []
        }
    ]
    
    for quote in demo_quotes:
        await db.quotes.insert_one(quote)
    
    logging.info("Database seeded successfully")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await seed_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
