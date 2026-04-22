"""
CrocConsulting — Demo Data Seeder
Seeds a demo client and quote for testing the portal flow.

Usage:
  pip install supabase python-dotenv
  python tools/seed_demo.py
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

STAGE_NAMES = [
    "Quote Received",
    "Initial Review",
    "Supplier Outreach",
    "Quotes Gathered",
    "Engineering Review",
    "Quote Prepared",
    "Quote Delivered",
]

DEMO_EMAIL = "demo@crocconsulting.com.au"
DEMO_PASSWORD = "Demo1234!"
DEMO_COMPANY = "Demo Energy Ltd"


def seed():
    supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

    print("Creating demo Supabase Auth user...")
    user_response = supabase.auth.admin.create_user({
        "email": DEMO_EMAIL,
        "password": DEMO_PASSWORD,
        "email_confirm": True,
    })
    user_id = user_response.user.id
    print(f"  Auth user created: {user_id}")

    print("Inserting demo client record...")
    client_response = supabase.table("clients").insert({
        "email": DEMO_EMAIL,
        "name": "Demo User",
        "company": DEMO_COMPANY,
    }).execute()
    client_id = client_response.data[0]["id"]
    print(f"  Client record created: {client_id}")

    print("Inserting demo submission...")
    sub_response = supabase.table("submissions").insert({
        "email": DEMO_EMAIL,
        "company": DEMO_COMPANY,
        "contact_name": "Demo User",
        "phone": "+61 400 000 000",
        "equipment_type": "Switchgear",
        "voltage_level": "MV 1–36kV",
        "quantity": 2,
        "details": {"description": "33kV indoor switchgear for substation upgrade"},
        "status": "accepted",
    }).execute()
    sub_id = sub_response.data[0]["id"]
    print(f"  Submission created: {sub_id}")

    print("Inserting demo quote...")
    quote_response = supabase.table("quotes").insert({
        "client_id": client_id,
        "submission_id": sub_id,
        "current_stage": 3,
        "details": {"notes": "Demo quote for testing"},
    }).execute()
    quote_id = quote_response.data[0]["id"]
    print(f"  Quote created: {quote_id}")

    print("Inserting 7 quote stages...")
    for i, name in enumerate(STAGE_NAMES, start=1):
        completed = i < 3  # stages 1 and 2 are done
        supabase.table("quote_stages").insert({
            "quote_id": quote_id,
            "stage_number": i,
            "stage_name": name,
            "completed": completed,
            "completed_at": "2026-04-20T10:00:00Z" if completed else None,
            "notes": f"Stage {i} completed." if completed else None,
        }).execute()
    print("  All stages created.")

    print("\n✅ Demo data seeded successfully!")
    print(f"   Login: {DEMO_EMAIL} / {DEMO_PASSWORD}")


if __name__ == "__main__":
    seed()
