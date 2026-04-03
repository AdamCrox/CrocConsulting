from datetime import datetime, timezone

DEMO_CLIENT = {
    "client_id": "ERG-2025",
    "password": "demo1234",
    "company": "Ergon Energy",
    "created_at": datetime.now(timezone.utc).isoformat()
}

DEMO_QUOTES = [
    {
        "id": "CRC-2025-0041",
        "client_id": "ERG-2025",
        "project": "Blackwater Substation 33kV Switchgear Upgrade",
        "type": "Binding",
        "date_raised": "14 March 2025",
        "expiry_date": "30 April 2025",
        "current_step": 5,
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
                "from": "Croc Consulting",
                "date": "18 March 2025",
                "message": "Can you confirm the fault level at the 33kV bus? Existing documentation shows 25kA but the network study may have updated this.",
                "response": "Confirmed 31.5kA per the 2024 network study.",
                "response_date": "20 March 2025"
            },
            {
                "from": "Croc Consulting",
                "date": "22 March 2025",
                "message": "Do you have a preference on transformer cooling type? ONAN will be standard but ONAF is available for higher continuous rating.",
                "response": None,
                "response_date": None
            }
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "CRC-2025-0042",
        "client_id": "ERG-2025",
        "project": "Moranbah North - Protection Relay Replacement",
        "type": "Non-binding",
        "date_raised": "22 March 2025",
        "expiry_date": None,
        "current_step": 3,
        "approved": False,
        "items": [
            {"desc": "Feeder protection relay (SEL-751A)", "qty": 12, "unit": 4800, "supplier": "Schneider Electric"},
            {"desc": "Transformer differential relay (SEL-787)", "qty": 4, "unit": 8200, "supplier": "Schneider Electric"},
            {"desc": "Bus differential relay (SEL-487B)", "qty": 2, "unit": 12500, "supplier": "GE Vernova"},
            {"desc": "Relay testing and commissioning (per panel)", "qty": 18, "unit": 2200, "supplier": "Croc Consulting"}
        ],
        "rfi": [
            {
                "from": "Croc Consulting",
                "date": "25 March 2025",
                "message": "Please confirm existing CT ratios on feeders 1 through 6.",
                "response": "CT ratios are 600/1 on feeders 1-4 and 400/1 on feeders 5-6.",
                "response_date": "27 March 2025"
            }
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "CRC-2025-0047",
        "client_id": "ERG-2025",
        "project": "Gladstone Solar Farm - 132kV GIS Procurement",
        "type": "Binding",
        "date_raised": "28 March 2025",
        "expiry_date": "15 May 2025",
        "current_step": 1,
        "approved": False,
        "items": [
            {"desc": "132kV GIS switchgear (3-bay)", "qty": 1, "unit": 1850000, "supplier": "TBC"},
            {"desc": "132/33kV power transformer 60MVA", "qty": 2, "unit": 920000, "supplier": "TBC"},
            {"desc": "33kV AIS switchgear (8-panel)", "qty": 1, "unit": 380000, "supplier": "TBC"},
            {"desc": "Control building (prefab)", "qty": 1, "unit": 145000, "supplier": "TBC"},
            {"desc": "SCADA RTU and communications", "qty": 1, "unit": 68000, "supplier": "TBC"}
        ],
        "rfi": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]


async def seed_database(db):
    """Seed the database with demo data if empty."""
    existing_client = await db.clients.find_one({"client_id": "ERG-2025"})
    if existing_client:
        print("Database already seeded")
        return False
    
    print("Seeding database...")
    
    # Insert demo client
    await db.clients.insert_one(DEMO_CLIENT)
    print("Inserted demo client: ERG-2025")
    
    # Insert demo quotes
    for quote in DEMO_QUOTES:
        await db.quotes.insert_one(quote)
        print(f"Inserted demo quote: {quote['id']}")
    
    print("Database seeded successfully")
    return True
