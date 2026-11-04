import sqlite3
import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any

DB_PATH = os.environ.get("SQLITE_DB_PATH", "scopeshield.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Projects Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        client_name TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT '₹',
        budget REAL NOT NULL,
        hourly_rate REAL NOT NULL,
        deadline TEXT NOT NULL,
        included_deliverables TEXT NOT NULL,
        excluded_deliverables TEXT NOT NULL,
        revision_limit INTEGER NOT NULL DEFAULT 2,
        revisions_used INTEGER NOT NULL DEFAULT 0,
        payment_milestones TEXT NOT NULL,
        notes TEXT,
        is_demo INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Analyses Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_message TEXT NOT NULL,
        model_used TEXT NOT NULL,
        is_demo_mode INTEGER NOT NULL,
        changes TEXT NOT NULL,
        total_suggested_hours REAL NOT NULL,
        total_adjusted_hours REAL NOT NULL,
        total_cost REAL NOT NULL,
        currency TEXT NOT NULL,
        suggested_timeline_extension_days INTEGER NOT NULL,
        generated_response_text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
    """)

    # Check if demo project exists
    cursor.execute("SELECT id FROM projects WHERE id = 'demo-ecommerce-redesign'")
    if not cursor.fetchone():
        now = datetime.utcnow().isoformat()
        cursor.execute("""
        INSERT INTO projects (
            id, name, client_name, currency, budget, hourly_rate, deadline,
            included_deliverables, excluded_deliverables, revision_limit, revisions_used,
            payment_milestones, notes, is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'demo-ecommerce-redesign',
            'E-commerce Website Redesign',
            'Modern Goods Ltd.',
            '₹',
            30000.0,
            1000.0,
            '2026-11-20',
            json.dumps([
                'Up to five (5) custom responsive website pages (Home, Shop, Product Detail, About Us, Contact)',
                'Responsive design optimized for desktop, tablet, and mobile browsers',
                'Product listing catalog with category filtering and search preview',
                'Contact form with email dispatch and inquiry validation',
                'Two (2) formal rounds of revisions included during design & staging'
            ]),
            json.dumps([
                'Payment gateway integration (e.g., Razorpay, Stripe, PayU, bank transfers)',
                'Additional pages beyond the agreed initial 5 pages',
                'Ongoing server maintenance, hosting management, and DNS configuration',
                'Product photography, custom copywriting, and digital marketing setup'
            ]),
            2,
            2,
            json.dumps([
                '50% upfront project deposit (₹15,000) [Paid]',
                '50% upon final delivery, QA verification, and site signoff (₹15,000)'
            ]),
            'Signed scope agreement on 2026-10-01.',
            1,
            now,
            now
        ))

    conn.commit()
    conn.close()
