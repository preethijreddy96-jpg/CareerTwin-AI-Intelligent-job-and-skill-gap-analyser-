import os
import fitz  # PyMuPDF

SCREENSHOTS_DIR = "/Users/premkumar/.gemini/antigravity/scratch/careertwin-ai/docs/screenshots"
OUTPUT_PDF = "/Users/premkumar/.gemini/antigravity/scratch/careertwin-ai/docs/CareerTwin_AI_Website_Feature_Exploration_Guide.pdf"
ARTIFACT_PDF = "/Users/premkumar/.gemini/antigravity/brain/04a538e2-441a-419b-adb4-38e5be4f45b1/CareerTwin_AI_Website_Feature_Exploration_Guide.pdf"

# Color Palette
COLOR_NAVY_DARK = (15/255, 23/255, 42/255)       # #0F172A
COLOR_INDIGO_PRIMARY = (79/255, 70/255, 229/255) # #4F46E5
COLOR_INDIGO_LIGHT = (238/255, 242/255, 255/255) # #EEF2FF
COLOR_SLATE_DARK = (30/255, 41/255, 59/255)      # #1E293B
COLOR_SLATE_MUTED = (100/255, 116/255, 139/255)  # #64748B
COLOR_BORDER = (226/255, 232/255, 240/255)       # #E2E8F0
COLOR_CARD_BG = (248/255, 250/255, 252/255)      # #F8FAFC
COLOR_EMERALD = (16/255, 185/255, 129/255)       # #10B981
COLOR_EMERALD_BG = (236/255, 253/255, 245/255)   # #ECFDF5
COLOR_AMBER = (217/255, 119/255, 6/255)          # #D97706
COLOR_AMBER_BG = (254/255, 243/255, 199/255)     # #FEF3C7
COLOR_WHITE = (1.0, 1.0, 1.0)

PAGE_WIDTH = 595.0
PAGE_HEIGHT = 842.0

FEATURES = [
    {
        "id": "01",
        "badge": "PUBLIC SHOWCASE",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Landing Page & Product Overview",
        "subtitle": "Discover the core value proposition, AI pipeline architecture, and instant entry points.",
        "image": "01_landing_page.png",
        "description": "The Landing Page introduces candidates and recruiters to CareerTwin AI. It showcases explainable compatibility scoring, automated skill extraction using ESCO and O*NET taxonomies, and provides seamless one-click links to sign in, register, and explore the app.",
        "steps": [
            ("Step 1: Explore the Hero Headline", "Read the core mission: 'Understand Your Skills. Discover Your Career Fit. Become Job-Ready.' The hero provides a rapid overview of what the platform delivers."),
            ("Step 2: Understand the Value Proposition", "Browse through the visual highlights: AI skill parsing, explainable matching formulas, customized learning curricula, and truthful resume improvements."),
            ("Step 3: Access Candidate Portal", "Click either 'Get Started Free' or 'Sign In' in the navigation header to enter the authentication portal.")
        ],
        "tip": "Tip: Even before creating an account, candidates can review the full platform architecture, skill taxonomy standards, and algorithmic scoring methodology."
    },
    {
        "id": "02",
        "badge": "AUTHENTICATION",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Candidate Sign-In & Verified Access",
        "subtitle": "Secure authentication with password encryption, 2-step verification, and instant demo fill.",
        "image": "02_login_page.png",
        "description": "The Login Page allows candidates to securely log into their personal workspaces. It incorporates bcrypt password verification, disposable email blocking, and an optional 2-step email security code check for suspicious or sensitive sessions.",
        "steps": [
            ("Step 1: Enter Verified Credentials", "Type your registered email address and password into the respective fields. The email field validates domain deliverability automatically."),
            ("Step 2: Use Quick Demo Auto-Fill (Optional)", "For immediate hands-on exploration, click the 'Quick Demo Auto-Fill' button to load pre-verified demo candidate credentials."),
            ("Step 3: 2-Step Email Verification", "If security verification is active, enter the 6-digit confirmation code displayed on your screen to complete instant verification.")
        ],
        "tip": "Tip: Demo credentials (demo.developer@careertwin.ai) come pre-loaded with an active profile, skills, and sample roadmaps for quick testing."
    },
    {
        "id": "03",
        "badge": "ENHANCED SECURITY",
        "badge_color": COLOR_EMERALD,
        "title": "Google Sign-In & Password Complexity Rules",
        "subtitle": "Real-time password requirement checklist: words, numbers, and symbols strictly enforced.",
        "image": "03_google_login_modal.png",
        "description": "To prevent weak account creation and ensure bank-grade security, the Google Sign-In flow enforces strict password complexity. Weak passwords like '123' are rejected on both frontend and backend.",
        "steps": [
            ("Step 1: Click 'Continue with Google'", "Open the Google Sign-In modal by clicking the Google logo button on the login screen."),
            ("Step 2: Enter Google Email Address", "Input your active Google email (e.g., yourname@gmail.com)."),
            ("Step 3: Satisfy the 4-Point Password Checklist", "Type a password meeting all 4 rules: 8+ characters, words/letters (A-Z), numbers (0-9), and special symbols (!@#$%^&*). Watch the badges turn green in real-time."),
            ("Step 4: Complete Verified Sign-In", "Once all requirements are satisfied, the 'Sign In with Google' button becomes active to establish your authenticated session.")
        ],
        "tip": "Security Note: The backend API rejects weak passwords with a 422 error, ensuring no weak credentials can ever compromise user accounts."
    },
    {
        "id": "04",
        "badge": "ONBOARDING",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Candidate Registration & Email Verification",
        "subtitle": "Register a new candidate profile with active email deliverability verification.",
        "image": "04_register_page.png",
        "description": "The Registration Page allows new candidates to create an isolated CareerTwin profile. It filters out spam and temporary/disposable domains, and verifies password strength before sending a 6-digit confirmation code.",
        "steps": [
            ("Step 1: Fill in Candidate Information", "Provide your full legal name, permanent email address, and desired secure password."),
            ("Step 2: Verify Real-Time Password Strength", "Review the four complexity indicators (Length, Letters, Numbers, Special Symbols) to ensure high entropy."),
            ("Step 3: Submit and Receive 6-Digit Code", "Click 'Continue to Verification' to receive your automated security confirmation code."),
            ("Step 4: Confirm Code & Enter Workspace", "Type the 6-digit code to immediately unlock your personal CareerTwin AI dashboard.")
        ],
        "tip": "Tip: CareerTwin AI uses strict multi-tenant data isolation; all your uploaded resumes, analyses, and roadmaps remain private to your user ID."
    },
    {
        "id": "05",
        "badge": "CORE WORKSPACE",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Career Intelligence Dashboard",
        "subtitle": "Real-time overview of candidate compatibility, identified skills, active roadmaps, and analytics.",
        "image": "05_dashboard_page.png",
        "description": "The Dashboard serves as the central command center for candidates. It synthesizes resume evaluations, overall career readiness percentages, active learning curricula, and provides quick jump links to all major tools.",
        "steps": [
            ("Step 1: Review the 4 Key KPI Metrics", "Check your Overall Compatibility Score (e.g. 88%), Verified Skills Count, Active Roadmaps in Progress, and Uploaded Resumes."),
            ("Step 2: Interpret the Radial Compatibility Gauge", "Examine the color-coded circular gauge showing your current readiness tier (Job Ready, Strong Match, or Developing)."),
            ("Step 3: Analyze Category Breakdowns", "Review the interactive charts dividing skills into Technical, Frontend, Backend, Database, and Soft competencies."),
            ("Step 4: Use Quick Action Cards", "Click 'Analyze Resume', 'Explore Career Paths', or 'View Roadmaps' to execute common tasks in one click.")
        ],
        "tip": "Tip: As you check off completed items in your learning roadmaps, your overall readiness score and skill count dynamically update on this dashboard."
    },
    {
        "id": "06",
        "badge": "DOCUMENT INTELLIGENCE",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Resume Intelligence & Document Manager",
        "subtitle": "Upload and manage multi-page PDF and DOCX resumes with automatic text segmentation.",
        "image": "06_resume_manager.png",
        "description": "The Resume Manager allows candidates to upload and store multiple resumes (e.g. for different roles). The backend uses PyMuPDF and python-docx to extract structured sections: contact info, work history, education, and projects.",
        "steps": [
            ("Step 1: Upload a Resume File", "Drag and drop your PDF or DOCX file into the upload zone or click 'Browse files'. Maximum file size is 10 MB."),
            ("Step 2: Automated Parsing & Validation", "The engine automatically checks readability, verifies that the file is not an empty image scan, and segments text into logical sections."),
            ("Step 3: Manage Document Library", "View previously uploaded resumes, inspect their extraction timestamps, set your primary resume, or delete old versions.")
        ],
        "tip": "Tip: Always upload text-based PDF or DOCX files for highest skill extraction accuracy. Scanned image PDFs should be converted to searchable text first."
    },
    {
        "id": "07",
        "badge": "AI EXTRACTION ENGINE",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Deep Resume & Skill Extraction Analysis",
        "subtitle": "Inspect spaCy phrase-matched skills mapped to international ESCO and O*NET taxonomies.",
        "image": "07_resume_analysis.png",
        "description": "This feature provides an in-depth x-ray of your resume. The AI engine applies phrase matchers, regex word boundary lookups, and conservative RapidFuzz matching to normalize aliases (e.g. 'JS' -> 'JavaScript', 'Postgres' -> 'PostgreSQL').",
        "steps": [
            ("Step 1: Select Active Resume", "Choose which resume to analyze from your library to initiate the deep extraction pipeline."),
            ("Step 2: Review Extracted Skills Cloud", "Explore the verified skills identified in your resume, color-coded by domain (Frontend, Backend, Database, DevOps, etc.)."),
            ("Step 3: Inspect Demonstrated Evidence", "Click on any skill to see the exact sentence and section where the skill was evidenced in your experience bullets."),
            ("Step 4: Export or Re-Analyze", "Verify all detected competencies and trigger comparative matching against desired job openings.")
        ],
        "tip": "Tip: If a skill is missing from your list, make sure it is mentioned in context with action verbs and outcomes in your experience bullet points."
    },
    {
        "id": "08",
        "badge": "HYBRID MATCHING",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Intelligent Job Matcher & Scoring",
        "subtitle": "Hybrid matching combining TF-IDF cosine similarity, Sentence Transformers, and taxonomy overlap.",
        "image": "08_job_matcher.png",
        "description": "The Job Matcher compares your resume against target roles or custom job descriptions. It uses Sentence Transformers (all-MiniLM-L6-v2) and an explainable weighted formula: 65% required skills, 15% preferred, 15% experience, and 5% role similarity.",
        "steps": [
            ("Step 1: Select or Paste a Job Description", "Choose from curated industry roles (e.g. Full-Stack Developer, Python Backend Engineer) or paste any real-world job posting."),
            ("Step 2: Adjust Factor Weights (Optional)", "Fine-tune scoring weights for required skills, experience, or preferred competencies based on role priority."),
            ("Step 3: Run the Match Analysis", "Click 'Run Compatibility Analysis' to compute dense vector embeddings and semantic cosine similarity."),
            ("Step 4: Read Plain-English Scoring Breakdown", "Review the exact percentage score alongside an explainable paragraph detailing why you scored that match.")
        ],
        "tip": "Formula: Overall Score = (0.65 × Required) + (0.15 × Preferred) + (0.15 × Experience) + (0.05 × Role Similarity)."
    },
    {
        "id": "09",
        "badge": "DIAGNOSTICS",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Skill Gap Analyser & Prioritization",
        "subtitle": "Tri-state classification: Matched (1.0), Partial (0.5), or Missing (0.0) with prioritized gap weights.",
        "image": "09_skill_gaps.png",
        "description": "The Skill Gap Analyser takes the guesswork out of job hunting by telling you exactly what skills you lack for a specific target job. It categorizes every required and preferred skill and calculates prioritized gap impact.",
        "steps": [
            ("Step 1: Inspect Matched Skills (Green / 1.0)", "Review skills you already demonstrate in your resume with full evidence."),
            ("Step 2: Inspect Partial Skills (Amber / 0.5)", "Identify related skills where you have adjacent knowledge (e.g. JavaScript knowledge when TypeScript is required)."),
            ("Step 3: Review Missing Skills (Rose / 0.0)", "Check critical missing skills prioritized by their weight in the job description."),
            ("Step 4: Bridge Gaps via Roadmap", "Click 'Generate Learning Roadmap' to create a targeted curriculum specifically designed to conquer your missing skills.")
        ],
        "tip": "Tip: Focusing on High-Priority Missing Skills first gives you the fastest boost in your job compatibility score."
    },
    {
        "id": "10",
        "badge": "CAREER DISCOVERY",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Top Career Opportunities & Role Recommendations",
        "subtitle": "Ranked career pathways matching candidate profile, market demand, and expected salary ranges.",
        "image": "10_career_recommendations.png",
        "description": "The Recommendations Engine scans the entire market database to surface the top job roles that best fit your current skill set. Each card displays salary expectations, market demand levels, and categorized skill badges.",
        "steps": [
            ("Step 1: Browse Ranked Recommendations", "View roles ranked by highest compatibility (e.g., Full-Stack Developer 88%, Python Developer 84%, Frontend React Developer 80%)."),
            ("Step 2: Evaluate Compensation & Demand", "Compare salary ranges (e.g. ₹9 - ₹22 LPA / $90,000 - $140,000) and hiring demand indicators (Very High / High)."),
            ("Step 3: Inspect Required vs Preferred Badges", "Hover over skill badges on any card to see which you already possess and which are preferred."),
            ("Step 4: Launch Role-Specific Roadmap", "Click 'View Roadmap' on any card to immediately start preparing for that specific target career.")
        ],
        "tip": "Tip: Compare multiple role cards to discover high-paying adjacent careers you may already be 80%+ qualified for without realizing it."
    },
    {
        "id": "11",
        "badge": "CURRICULUM ENGINE",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Personalized Learning Roadmaps & Progress Checklists",
        "subtitle": "Interactive, ordered curricula with practical exercises, portfolio mini-projects, and live progress tracking.",
        "image": "11_learning_roadmaps.png",
        "description": "Learning Roadmaps turn your skill gaps into an actionable, step-by-step syllabus. Curricula are broken into sequential phases: Foundations, Framework Specialization, Cloud & DevOps, and capstone Portfolio Projects.",
        "steps": [
            ("Step 1: View Curriculum Milestones", "Navigate through structured learning stages organized logically from easiest to advanced."),
            ("Step 2: Review Learning Objectives", "Read clear explanations of what to learn, curated documentation links, and suggested mini-project exercises."),
            ("Step 3: Check Off Completed Tasks", "Click the interactive checkbox next to any task when you finish it. Your progress percentage updates automatically."),
            ("Step 4: Build Capstone Portfolio Items", "Follow portfolio suggestions to build verifiable GitHub projects that prove your new competencies to hiring managers.")
        ],
        "tip": "Tip: Interactive checkbox states persist securely in your database account so you can track your study journey across days and weeks."
    },
    {
        "id": "12",
        "badge": "AI WRITING COACH",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "AI Resume Improvement Assistant",
        "subtitle": "Bullet-point rewrite suggestions, strong action verbs, and quantifiable impact formulas (X-Y-Z).",
        "image": "12_resume_improvement.png",
        "description": "The Resume Improvement Assistant coaches candidates on transforming weak experience bullets into high-impact accomplishments. Under a strict truthfulness policy, it never invents false experience, but shows how to quantify real outcomes.",
        "steps": [
            ("Step 1: Paste or Select a Resume Bullet", "Input a current resume bullet point you want to polish (e.g. 'Responsible for building APIs and fixing bugs')."),
            ("Step 2: Review Diagnostic Feedback", "The AI identifies passive phrasing, missing metrics, and weak verbs."),
            ("Step 3: Apply the Google X-Y-Z Formula", "Review suggested rewrites formatted as: 'Accomplished [X], as measured by [Y], by doing [Z]' with active verbs like 'Architected', 'Spearheaded', or 'Optimized'."),
            ("Step 4: Copy Polished Bullet Points", "Copy the improved, ATS-optimized bullet points directly into your resume document.")
        ],
        "tip": "Truthfulness Guarantee: The AI strictly prompts for your real figures (percentages, latency cuts, throughput numbers) rather than fabricating fake claims."
    },
    {
        "id": "13",
        "badge": "PROFILE SETTINGS",
        "badge_color": COLOR_INDIGO_PRIMARY,
        "title": "Candidate Profile & Career Baseline Settings",
        "subtitle": "Customize your current title, target dream job, experience years, education, and career interests.",
        "image": "13_candidate_profile.png",
        "description": "The Profile Settings page anchors your career baseline. The data entered here feeds directly into the recommendation engine, ensuring that job opportunities, salary estimates, and roadmap milestones match your background.",
        "steps": [
            ("Step 1: Set Target Career Role", "Define the exact role you are aiming for (e.g. 'Full-Stack Developer', 'AI/ML Engineer', 'Backend Specialist')."),
            ("Step 2: Update Experience & Education", "Record your years of active experience, degree level, institution name, and graduation year."),
            ("Step 3: Define Career Interest Tags", "Add specialized interest tags (e.g., 'Cloud Microservices', 'NLP', 'System Design') for tailored discovery."),
            ("Step 4: Save & Sync Across AI Engine", "Click 'Save Changes' to instantly update your global candidate twin profile across all dashboard views.")
        ],
        "tip": "Tip: Keeping your target role and interests updated ensures your job recommendations and roadmap topics always align with your latest career goals."
    }
]

def draw_header(page, title, subtitle, page_num, total_pages, badge="FEATURE WALKTHROUGH", badge_color=COLOR_INDIGO_PRIMARY):
    # Top decorative bar
    page.draw_rect(fitz.Rect(0, 0, PAGE_WIDTH, 4), color=badge_color, fill=badge_color)

    # Header container
    header_rect = fitz.Rect(35, 14, PAGE_WIDTH - 35, 62)
    
    # Badge
    badge_rect = fitz.Rect(35, 16, 35 + len(badge) * 6.2 + 14, 30)
    page.draw_rect(badge_rect, color=badge_color, fill=COLOR_INDIGO_LIGHT, radius=0.03)
    page.insert_text(fitz.Point(badge_rect.x0 + 7, badge_rect.y0 + 10), badge, fontsize=8, fontname="hebo", color=badge_color)

    # Title
    page.insert_text(fitz.Point(35, 46), title, fontsize=15, fontname="hebo", color=COLOR_NAVY_DARK)
    
    # Subtitle
    page.insert_text(fitz.Point(35, 58), subtitle, fontsize=8.5, fontname="helv", color=COLOR_SLATE_MUTED)

    # Divider line
    page.draw_line(fitz.Point(35, 68), fitz.Point(PAGE_WIDTH - 35, 68), color=COLOR_BORDER, width=0.8)

    # Footer
    page.draw_line(fitz.Point(35, PAGE_HEIGHT - 32), fitz.Point(PAGE_WIDTH - 35, PAGE_HEIGHT - 32), color=COLOR_BORDER, width=0.8)
    footer_text = "CareerTwin AI — Comprehensive Website & Feature Exploration Guide"
    page.insert_text(fitz.Point(35, PAGE_HEIGHT - 20), footer_text, fontsize=8, fontname="helv", color=COLOR_SLATE_MUTED)
    
    page_str = f"Page {page_num} of {total_pages}"
    page.insert_text(fitz.Point(PAGE_WIDTH - 35 - len(page_str) * 5, PAGE_HEIGHT - 20), page_str, fontsize=8, fontname="hebo", color=COLOR_NAVY_DARK)

def build_cover_page(doc, total_pages):
    page = doc.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)

    # Top accent bar
    page.draw_rect(fitz.Rect(0, 0, PAGE_WIDTH, 8), color=COLOR_INDIGO_PRIMARY, fill=COLOR_INDIGO_PRIMARY)

    # Hero Banner Background
    hero_rect = fitz.Rect(35, 30, PAGE_WIDTH - 35, 195)
    page.draw_rect(hero_rect, color=COLOR_INDIGO_PRIMARY, fill=COLOR_NAVY_DARK, radius=0.03)

    # Hero Pill Badge
    pill = fitz.Rect(55, 48, 235, 66)
    page.draw_rect(pill, color=COLOR_INDIGO_PRIMARY, fill=COLOR_INDIGO_PRIMARY, radius=0.03)
    page.insert_text(fitz.Point(65, 60), "OFFICIAL COMPLETE FEATURE GUIDE", fontsize=8, fontname="hebo", color=COLOR_WHITE)

    # Hero Titles
    page.insert_text(fitz.Point(55, 95), "CareerTwin AI", fontsize=28, fontname="hebo", color=COLOR_WHITE)
    page.insert_text(fitz.Point(55, 120), "Full Website Feature Exploration & Visual User Guide", fontsize=14, fontname="helv", color=(224/255, 231/255, 255/255))
    
    tagline = "Understand Your Skills • Discover Your Career Fit • Become Job-Ready"
    page.insert_text(fitz.Point(55, 142), tagline, fontsize=10, fontname="hebo", color=COLOR_EMERALD)

    meta_text = "Version 1.0.0 (Production Build) • Comprehensive Step-by-Step Manual with Screen Visuals"
    page.insert_text(fitz.Point(55, 175), meta_text, fontsize=8.5, fontname="helv", color=(148/255, 163/255, 184/255))

    # Executive Summary Card
    exec_rect = fitz.Rect(35, 210, PAGE_WIDTH - 35, 315)
    page.draw_rect(exec_rect, color=COLOR_BORDER, fill=COLOR_CARD_BG, radius=0.03)
    page.insert_text(fitz.Point(50, 230), "Executive Summary & Purpose of This Guide", fontsize=12, fontname="hebo", color=COLOR_NAVY_DARK)

    summary_p1 = (
        "CareerTwin AI is an end-to-end, AI-powered career intelligence web platform. It analyzes resumes using spaCy and "
        "ESCO/O*NET skill taxonomies, compares them with real job descriptions using Sentence Transformers, calculates "
        "explainable job compatibility scores, identifies skill gaps, recommends top career paths, and generates personalized "
        "learning roadmaps."
    )
    page.insert_textbox(fitz.Rect(50, 240, PAGE_WIDTH - 50, 305), summary_p1, fontsize=9.2, fontname="helv", color=COLOR_SLATE_DARK)

    # Core Value Highlights Grid
    grid_y = 328
    boxes = [
        ("AI Resume Intelligence", "PyMuPDF & python-docx extraction with taxonomy-mapped skill detection.", COLOR_INDIGO_PRIMARY),
        ("Explainable Scoring", "Hybrid cosine similarity (65% required, 15% preferred, 15% experience, 5% role).", COLOR_EMERALD),
        ("Actionable Roadmaps", "Interactive stage-by-stage learning checklists with mini-projects.", COLOR_AMBER),
        ("Strict Security Policy", "Bcrypt hashing, password complexity enforcement, and zero data leakage.", COLOR_NAVY_DARK)
    ]

    for i, (b_title, b_desc, b_color) in enumerate(boxes):
        col = i % 2
        row = i // 2
        bx0 = 35 + col * 268
        by0 = grid_y + row * 64
        b_rect = fitz.Rect(bx0, by0, bx0 + 258, by0 + 56)
        page.draw_rect(b_rect, color=COLOR_BORDER, fill=COLOR_WHITE, radius=0.03)
        # Left color strip
        page.draw_rect(fitz.Rect(bx0, by0, bx0 + 4, by0 + 56), color=b_color, fill=b_color, radius=0.03)
        page.insert_text(fitz.Point(bx0 + 12, by0 + 18), b_title, fontsize=10, fontname="hebo", color=COLOR_NAVY_DARK)
        page.insert_textbox(fitz.Rect(bx0 + 12, by0 + 22, bx0 + 250, by0 + 52), b_desc, fontsize=8, fontname="helv", color=COLOR_SLATE_MUTED)

    # Table of Contents
    toc_rect = fitz.Rect(35, 468, PAGE_WIDTH - 35, 792)
    page.draw_rect(toc_rect, color=COLOR_BORDER, fill=COLOR_WHITE, radius=0.03)
    page.insert_text(fitz.Point(50, 490), "Table of Contents — Explored Modules (Pages 2 to 14)", fontsize=11, fontname="hebo", color=COLOR_NAVY_DARK)

    # List features
    for idx, feat in enumerate(FEATURES):
        row = idx
        col = 0 if idx < 7 else 1
        sub_row = idx if col == 0 else idx - 7
        tx = 50 + col * 260
        ty = 510 + sub_row * 36
        
        # Number badge
        num_rect = fitz.Rect(tx, ty - 9, tx + 18, ty + 9)
        page.draw_rect(num_rect, color=COLOR_BORDER, fill=COLOR_CARD_BG, radius=0.03)
        page.insert_text(fitz.Point(tx + 4, ty + 4), feat["id"], fontsize=7.5, fontname="hebo", color=COLOR_INDIGO_PRIMARY)

        # Title
        page.insert_text(fitz.Point(tx + 24, ty + 1), feat["title"][:32], fontsize=8.5, fontname="hebo", color=COLOR_NAVY_DARK)
        page.insert_text(fitz.Point(tx + 24, ty + 11), f"Page {idx + 2} • {feat['badge']}", fontsize=7.5, fontname="helv", color=COLOR_SLATE_MUTED)

    # Footer
    page.draw_line(fitz.Point(35, PAGE_HEIGHT - 32), fitz.Point(PAGE_WIDTH - 35, PAGE_HEIGHT - 32), color=COLOR_BORDER, width=0.8)
    page.insert_text(fitz.Point(35, PAGE_HEIGHT - 20), "CareerTwin AI Documentation Suite • Verified Production Manual", fontsize=8, fontname="helv", color=COLOR_SLATE_MUTED)
    page.insert_text(fitz.Point(PAGE_WIDTH - 110, PAGE_HEIGHT - 20), f"Page 1 of {total_pages}", fontsize=8, fontname="hebo", color=COLOR_NAVY_DARK)

def build_feature_page(doc, feat, page_num, total_pages):
    page = doc.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)

    # Draw standard Header and Footer
    draw_header(page, f"Module {feat['id']}: {feat['title']}", feat["subtitle"], page_num, total_pages, badge=feat["badge"], badge_color=feat["badge_color"])

    # 1. SCREENSHOT CONTAINER
    # Aspect ratio of 1440x900 is 1.6:1
    # Width: 525 pt, Height: 260 pt
    img_x0 = 35
    img_y0 = 76
    img_w = PAGE_WIDTH - 70  # 525 pt
    img_h = 240              # 240 pt
    img_rect = fitz.Rect(img_x0, img_y0, img_x0 + img_w, img_y0 + img_h)

    # Subtle shadow / outline border
    page.draw_rect(img_rect + (-1, -1, 1, 1), color=COLOR_BORDER, fill=COLOR_CARD_BG, radius=0.03)

    image_path = os.path.join(SCREENSHOTS_DIR, feat["image"])
    if os.path.exists(image_path):
        page.insert_image(img_rect, filename=image_path)
    else:
        page.insert_textbox(img_rect, f"[Screenshot: {feat['image']}]", fontsize=12, fontname="helv", color=COLOR_SLATE_MUTED)

    # 2. FEATURE OVERVIEW CARD
    desc_y0 = img_y0 + img_h + 10
    desc_h = 48
    desc_rect = fitz.Rect(35, desc_y0, PAGE_WIDTH - 35, desc_y0 + desc_h)
    page.draw_rect(desc_rect, color=COLOR_BORDER, fill=COLOR_CARD_BG, radius=0.03)
    
    page.insert_text(fitz.Point(45, desc_y0 + 15), "Feature Purpose & Overview:", fontsize=9, fontname="hebo", color=COLOR_INDIGO_PRIMARY)
    page.insert_textbox(fitz.Rect(45, desc_y0 + 18, PAGE_WIDTH - 45, desc_y0 + desc_h - 4), feat["description"], fontsize=8.2, fontname="helv", color=COLOR_SLATE_DARK)

    # 3. STEP-BY-STEP WALKTHROUGH SECTION
    steps_y0 = desc_y0 + desc_h + 8
    page.insert_text(fitz.Point(35, steps_y0 + 12), "How It Works (Step-by-Step Walkthrough in Simple English):", fontsize=10.5, fontname="hebo", color=COLOR_NAVY_DARK)

    curr_y = steps_y0 + 20
    for idx, (st_title, st_body) in enumerate(feat["steps"]):
        step_box_h = 36
        step_rect = fitz.Rect(35, curr_y, PAGE_WIDTH - 35, curr_y + step_box_h)
        page.draw_rect(step_rect, color=COLOR_BORDER, fill=COLOR_WHITE, radius=0.03)

        # Step badge
        badge_box = fitz.Rect(40, curr_y + 6, 76, curr_y + 20)
        page.draw_rect(badge_box, color=COLOR_INDIGO_PRIMARY, fill=COLOR_INDIGO_LIGHT, radius=0.03)
        page.insert_text(fitz.Point(44, curr_y + 16), f"STEP {idx + 1}", fontsize=7.5, fontname="hebo", color=COLOR_INDIGO_PRIMARY)

        # Step title
        page.insert_text(fitz.Point(82, curr_y + 16), st_title.replace(f"Step {idx+1}: ", ""), fontsize=8.5, fontname="hebo", color=COLOR_NAVY_DARK)

        # Step explanation text
        page.insert_textbox(fitz.Rect(42, curr_y + 22, PAGE_WIDTH - 42, curr_y + step_box_h - 2), st_body, fontsize=7.8, fontname="helv", color=COLOR_SLATE_MUTED)

        curr_y += step_box_h + 5

    # 4. USER PRO TIP / HIGHLIGHT CARD
    tip_y0 = curr_y + 4
    tip_h = 42
    tip_rect = fitz.Rect(35, tip_y0, PAGE_WIDTH - 35, tip_y0 + tip_h)
    page.draw_rect(tip_rect, color=(253/255, 230/255, 138/255), fill=COLOR_AMBER_BG, radius=0.03)
    
    page.draw_rect(fitz.Rect(35, tip_y0, 39, tip_y0 + tip_h), color=COLOR_AMBER, fill=COLOR_AMBER, radius=0.03)
    page.insert_text(fitz.Point(47, tip_y0 + 15), "Expert User Tip & Best Practice:", fontsize=8.5, fontname="hebo", color=COLOR_AMBER)
    page.insert_textbox(fitz.Rect(47, tip_y0 + 18, PAGE_WIDTH - 45, tip_y0 + tip_h - 4), feat["tip"], fontsize=8, fontname="helv", color=(120/255, 53/255, 15/255))

def generate_pdf():
    doc = fitz.open()
    total_pages = len(FEATURES) + 1  # 1 cover + 13 feature pages = 14 pages

    print(f"Building Cover Page (1/{total_pages})...")
    build_cover_page(doc, total_pages)

    for i, feat in enumerate(FEATURES):
        page_num = i + 2
        print(f"Building Page {page_num}/{total_pages}: {feat['title']}...")
        build_feature_page(doc, feat, page_num, total_pages)

    os.makedirs(os.path.dirname(OUTPUT_PDF), exist_ok=True)
    doc.save(OUTPUT_PDF, deflate=True, garbage=4, clean=True)
    print(f"Main PDF successfully generated at: {OUTPUT_PDF}")

    # Copy to artifacts directory
    os.makedirs(os.path.dirname(ARTIFACT_PDF), exist_ok=True)
    doc.save(ARTIFACT_PDF, deflate=True, garbage=4, clean=True)
    print(f"Artifact PDF successfully saved at: {ARTIFACT_PDF}")

    file_size_mb = os.path.getsize(OUTPUT_PDF) / (1024 * 1024)
    print(f"Final Document Pages: {len(doc)} | File Size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    generate_pdf()
