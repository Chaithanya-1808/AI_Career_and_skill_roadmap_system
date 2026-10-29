import json
from sqlalchemy.orm import Session
from app.models.models import (
    CareerProfile, Skill, CareerSkillRequirement, AssessmentQuestion,
    LearningResource, Project, User, UserRole
)
from app.core.security import get_password_hash

SKILLS_DATA = [
    {"id": "c-programming", "name": "C Programming", "category": "Programming Fundamentals", "description": "Syntax, pointers, memory allocation, and compilation in C.", "prerequisite_skill_ids": []},
    {"id": "python-programming", "name": "Python Programming", "category": "Programming Fundamentals", "description": "Python syntax, data types, OOP, modules, and standard library.", "prerequisite_skill_ids": []},
    {"id": "javascript", "name": "JavaScript (ES6+)", "category": "Web Development", "description": "Variables, arrow functions, promises, async/await, DOM, and event loop.", "prerequisite_skill_ids": []},
    {"id": "html-css", "name": "HTML5 & Modern CSS", "category": "Web Development", "description": "Semantic markup, flexbox, CSS grid, responsiveness, and accessibility.", "prerequisite_skill_ids": []},
    {"id": "react", "name": "React.js", "category": "Frontend Development", "description": "Components, JSX, props, state, hooks, lifecycle, and component composition.", "prerequisite_skill_ids": ["javascript", "html-css"]},
    {"id": "nodejs-express", "name": "Node.js & Express", "category": "Backend Development", "description": "Event-driven runtime, routing, middleware, REST APIs, and error handling.", "prerequisite_skill_ids": ["javascript"]},
    {"id": "sql-databases", "name": "Relational Databases & SQL", "category": "Databases", "description": "Table design, constraints, SELECT queries, JOINs, aggregations, indexing.", "prerequisite_skill_ids": []},
    {"id": "data-structures", "name": "Data Structures & Algorithms", "category": "Computer Science", "description": "Arrays, linked lists, stacks, queues, trees, sorting, and complexity analysis.", "prerequisite_skill_ids": ["c-programming"]},
    {"id": "git-github", "name": "Git & Version Control", "category": "Software Engineering", "description": "Repository management, branching, commits, pull requests, and merges.", "prerequisite_skill_ids": []},
    {"id": "machine-learning-basics", "name": "Machine Learning Fundamentals", "category": "AI & Data Science", "description": "Supervised learning, regression, classification, metrics, scikit-learn.", "prerequisite_skill_ids": ["python-programming"]},
    {"id": "docker-containers", "name": "Docker & Containers", "category": "DevOps & Cloud", "description": "Dockerfiles, image building, container lifecycle, and Docker Compose.", "prerequisite_skill_ids": []},
    {"id": "api-security", "name": "Web Security & Authentication", "category": "Cybersecurity", "description": "JWT, password hashing, CORS, XSS, CSRF, and input sanitization.", "prerequisite_skill_ids": ["nodejs-express"]},
    {"id": "ui-ux-design", "name": "UI/UX Design & Prototyping", "category": "Design", "description": "User personas, wireframing, typography, color theory, Figma components.", "prerequisite_skill_ids": []},
    {"id": "cloud-fundamentals", "name": "Cloud Computing Fundamentals", "category": "Cloud & Infrastructure", "description": "Compute, storage, IAM, VPC, serverless concepts on AWS/GCP.", "prerequisite_skill_ids": []},
    {"id": "embedded-c", "name": "Embedded C & Microcontrollers", "category": "Embedded Systems", "description": "Registers, GPIO, interrupts, timers, UART, I2C, SPI.", "prerequisite_skill_ids": ["c-programming"]},
]

CAREERS_DATA = [
    {
        "id": "full-stack-developer",
        "title": "Full-Stack Developer",
        "overview": "Designs, implements, and maintains both client-side user interfaces and server-side services, databases, and APIs.",
        "responsibilities": [
            "Build interactive, responsive web applications using modern frontend frameworks",
            "Develop resilient RESTful and GraphQL backend APIs",
            "Model relational and non-relational database schemas",
            "Implement secure authentication, role-based authorization, and data encryption",
            "Write automated unit and integration tests and participate in CI/CD deployment"
        ],
        "foundational_skills": ["HTML5 & Modern CSS", "JavaScript (ES6+)", "Git & Version Control"],
        "technical_skills": ["React.js", "Node.js & Express", "Relational Databases & SQL", "Web Security & Authentication", "Docker & Containers"],
        "soft_skills": ["Systematic Debugging", "Collaborative Code Review", "Clear Technical Communication"],
        "prerequisites": ["Basic programming concept understanding", "Problem-solving aptitude"],
        "recommended_projects": ["Personal Portfolio Website", "Interactive Task Tracker", "Full-Stack REST & SQL Web Application", "Secure Role-Based Student Portal"],
        "suggested_certifications": ["Meta Front-End / Back-End Professional Certificate", "freeCodeCamp Full Stack Developer"],
        "entry_level_roles": ["Junior Full-Stack Engineer", "Associate Software Engineer", "Graduate Web Developer"],
        "learning_resources": [
            {"title": "MDN Web Docs - Learn Web Development", "url": "https://developer.mozilla.org/en-US/docs/Learn"},
            {"title": "React Official Documentation", "url": "https://react.dev/"},
            {"title": "Node.js API Reference", "url": "https://nodejs.org/en/docs/"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Foundations & Responsive Frontend", "weeks": "1-3"},
            {"stage": 2, "title": "Core JavaScript & Modern React", "weeks": "4-7"},
            {"stage": 3, "title": "Server Architecture & REST APIs", "weeks": "8-11"},
            {"stage": 4, "title": "Database Design & SQL Persistence", "weeks": "12-14"},
            {"stage": 5, "title": "Full-Stack Integration, Security & Deployment", "weeks": "15-16"}
        ],
        "proficiency_expectations": {"html-css": 4.5, "javascript": 4.0, "react": 4.0, "nodejs-express": 4.0, "sql-databases": 3.5, "git-github": 4.0}
    },
    {
        "id": "software-developer",
        "title": "Software Developer",
        "overview": "Engineers scalable desktop, web, or backend software systems using object-oriented principles and rigorous data structures.",
        "responsibilities": [
            "Write clean, maintainable, modular software code",
            "Implement algorithms for high performance and minimal memory footprint",
            "Participate in design reviews and unit testing",
            "Diagnose software defects and optimize production bottlenecks"
        ],
        "foundational_skills": ["C Programming", "Data Structures & Algorithms", "Git & Version Control"],
        "technical_skills": ["Python Programming", "Relational Databases & SQL", "Docker & Containers"],
        "soft_skills": ["Algorithmic Thinking", "Code Quality Ownership", "Agile Adaptability"],
        "prerequisites": ["Procedural programming basics", "Logical deduction"],
        "recommended_projects": ["CLI File & Data Analyzer", "Memory-efficient Cache Library", "Multi-threaded Task Worker"],
        "suggested_certifications": ["Oracle Certified Professional Java / Python Institute PCAP"],
        "entry_level_roles": ["Associate Software Developer", "Junior Backend Developer", "Application Programmer"],
        "learning_resources": [
            {"title": "Python.org Official Documentation", "url": "https://docs.python.org/3/"},
            {"title": "GeeksforGeeks Data Structures", "url": "https://www.geeksforgeeks.org/data-structures/"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Language Mastery & Memory Model", "weeks": "1-4"},
            {"stage": 2, "title": "Data Structures & Algorithmic Analysis", "weeks": "5-8"},
            {"stage": 3, "title": "Object-Oriented Design & Design Patterns", "weeks": "9-12"},
            {"stage": 4, "title": "Database Persistence & Testing Rigor", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"c-programming": 4.0, "data-structures": 4.5, "python-programming": 4.0, "sql-databases": 3.5, "git-github": 4.0}
    },
    {
        "id": "ai-ml-engineer",
        "title": "AI/ML Engineer",
        "overview": "Builds and deploys machine learning models, neural networks, and generative AI pipelines into production systems.",
        "responsibilities": [
            "Curate, clean, and engineer training and validation feature sets",
            "Train and evaluate machine learning and deep learning models",
            "Integrate Large Language Model APIs with structured reasoning and embeddings",
            "Optimize model inference latency and monitor drift in production"
        ],
        "foundational_skills": ["Python Programming", "Linear Algebra & Calculus", "Data Structures & Algorithms"],
        "technical_skills": ["Machine Learning Fundamentals", "Relational Databases & SQL", "Docker & Containers"],
        "soft_skills": ["Experimental Rigor", "Data Storytelling", "Ethical AI Awareness"],
        "prerequisites": ["Python fluency", "Basic college mathematics"],
        "recommended_projects": ["Predictive Student Grade Model", "Document Q&A RAG Engine", "Computer Vision Defect Classifier"],
        "suggested_certifications": ["Google Cloud Professional Machine Learning Engineer", "DeepLearning.AI ML Specialization"],
        "entry_level_roles": ["Junior ML Engineer", "AI Associate", "Data Science Developer"],
        "learning_resources": [
            {"title": "Scikit-Learn User Guide", "url": "https://scikit-learn.org/stable/"},
            {"title": "Google Machine Learning Crash Course", "url": "https://developers.google.com/machine-learning/crash-course"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Python for Numerical Computing", "weeks": "1-4"},
            {"stage": 2, "title": "Supervised & Unsupervised Machine Learning", "weeks": "5-8"},
            {"stage": 3, "title": "Deep Learning & Transformer Architectures", "weeks": "9-12"},
            {"stage": 4, "title": "MLOps, Serving & LLM Integration", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"python-programming": 4.5, "machine-learning-basics": 4.5, "sql-databases": 3.5, "data-structures": 3.5}
    },
    {
        "id": "data-scientist",
        "title": "Data Scientist",
        "overview": "Extracts actionable insights and predictive indicators from complex structured and unstructured datasets using statistical modeling.",
        "responsibilities": [
            "Perform exploratory data analysis and hypothesis testing",
            "Build predictive statistical models and simulations",
            "Communicate data-driven recommendations to non-technical stakeholders",
            "Collaborate with data engineering teams on data quality pipelines"
        ],
        "foundational_skills": ["Python Programming", "Relational Databases & SQL"],
        "technical_skills": ["Machine Learning Fundamentals", "Data Structures & Algorithms"],
        "soft_skills": ["Statistical Literacy", "Executive Presentation", "Domain Curiosity"],
        "prerequisites": ["Python basics", "Probability and statistics fundamentals"],
        "recommended_projects": ["Customer Churn Predictor", "Market Basket Analysis Engine", "Housing Price Prediction Dashboard"],
        "suggested_certifications": ["IBM Data Science Professional Certificate", "Google Data Analytics Certificate"],
        "entry_level_roles": ["Junior Data Scientist", "Quantitative Analyst", "Associate Data Specialist"],
        "learning_resources": [
            {"title": "Pandas Documentation", "url": "https://pandas.pydata.org/docs/"},
            {"title": "Kaggle Learn Tutorials", "url": "https://www.kaggle.com/learn"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Statistical Foundations & EDA with Pandas", "weeks": "1-4"},
            {"stage": 2, "title": "SQL Querying & Data Wrangling", "weeks": "5-8"},
            {"stage": 3, "title": "Applied Statistical Modeling & Validation", "weeks": "9-12"},
            {"stage": 4, "title": "Storytelling, Dashboards & Capstone Project", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"python-programming": 4.0, "sql-databases": 4.5, "machine-learning-basics": 4.0}
    },
    {
        "id": "data-analyst",
        "title": "Data Analyst",
        "overview": "Transforms raw operational data into interactive dashboards, KPI reports, and actionable strategic insights.",
        "responsibilities": [
            "Write complex SQL queries, window functions, and aggregations",
            "Build interactive dashboards using Tableau, Power BI, or modern web charts",
            "Validate data integrity and trace source pipeline discrepancies",
            "Present weekly performance metrics to leadership"
        ],
        "foundational_skills": ["Relational Databases & SQL", "Python Programming"],
        "technical_skills": ["Git & Version Control"],
        "soft_skills": ["Analytical Reasoning", "Visual Design of Metrics", "Cross-functional Collaboration"],
        "prerequisites": ["Spreadsheet familiarity", "Curiosity about business metrics"],
        "recommended_projects": ["E-Commerce Sales Performance Dashboard", "Hospital Patient Flow Analysis", "SaaS Retention Cohort Report"],
        "suggested_certifications": ["Google Data Analytics Professional Certificate", "Microsoft Power BI Data Analyst (PL-300)"],
        "entry_level_roles": ["Junior Data Analyst", "Business Intelligence Associate", "Reporting Specialist"],
        "learning_resources": [
            {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/"},
            {"title": "Mode Analytics SQL School", "url": "https://mode.com/sql-tutorial/"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Spreadsheets & Business Metrics", "weeks": "1-3"},
            {"stage": 2, "title": "Advanced SQL & Database Extraction", "weeks": "4-8"},
            {"stage": 3, "title": "Python for Data Cleaning & Exploration", "weeks": "9-12"},
            {"stage": 4, "title": "Interactive Dashboards & Business Storytelling", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"sql-databases": 4.5, "python-programming": 3.0, "git-github": 3.0}
    },
    {
        "id": "cybersecurity-analyst",
        "title": "Cybersecurity Analyst",
        "overview": "Defends organizational networks, cloud systems, and web endpoints against security vulnerabilities, malware, and intrusions.",
        "responsibilities": [
            "Monitor security telemetry and investigate suspicious activity alerts",
            "Perform vulnerability assessments and penetration testing",
            "Enforce zero-trust access controls, TLS certificates, and secret management",
            "Develop incident response plans and security awareness documentation"
        ],
        "foundational_skills": ["C Programming", "Python Programming"],
        "technical_skills": ["Web Security & Authentication", "Cloud Computing Fundamentals", "Docker & Containers"],
        "soft_skills": ["Adversarial Thinking", "Calm Incident Management", "Ethics & Confidentiality"],
        "prerequisites": ["Networking basics (TCP/IP, HTTP/S)", "Command line familiarity"],
        "recommended_projects": ["Web Application Vulnerability Scanner", "Network Packet Sniffer & Anomaly Detector", "OAuth2/OIDC Auth Server"],
        "suggested_certifications": ["CompTIA Security+", "Certified Ethical Hacker (CEH)"],
        "entry_level_roles": ["SOC Analyst (Tier 1)", "Junior Penetration Tester", "Information Security Specialist"],
        "learning_resources": [
            {"title": "OWASP Top Ten Web Application Security", "url": "https://owasp.org/www-project-top-ten/"},
            {"title": "PortSwigger Web Security Academy", "url": "https://portswigger.net/web-security"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Networking Protocols & Linux Administration", "weeks": "1-4"},
            {"stage": 2, "title": "Web Security, OWASP Top 10 & Cryptography", "weeks": "5-8"},
            {"stage": 3, "title": "Threat Detection, SIEM & Incident Handling", "weeks": "9-12"},
            {"stage": 4, "title": "Ethical Hacking, Penetration Testing & Capstone", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"api-security": 4.5, "python-programming": 3.5, "cloud-fundamentals": 3.5}
    },
    {
        "id": "cloud-engineer",
        "title": "Cloud Engineer",
        "overview": "Architects, provisions, and automates resilient, secure cloud infrastructure across AWS, Google Cloud, or Microsoft Azure.",
        "responsibilities": [
            "Provision cloud infrastructure using Infrastructure as Code (Terraform)",
            "Configure virtual networks, subnets, gateways, and firewall rules",
            "Set up managed databases, object storage, and serverless compute",
            "Optimize cloud expenditure and implement disaster recovery plans"
        ],
        "foundational_skills": ["Git & Version Control", "Python Programming"],
        "technical_skills": ["Cloud Computing Fundamentals", "Docker & Containers", "Web Security & Authentication"],
        "soft_skills": ["Architectural Foresight", "Cost Optimization Awareness", "Incident Resilience"],
        "prerequisites": ["Operating system concepts", "Basic networking knowledge"],
        "recommended_projects": ["Terraform Multi-Tier Cloud Deployment", "Serverless Image Processing Pipeline", "Auto-Scaling Microservice Cluster"],
        "suggested_certifications": ["AWS Certified Solutions Architect Associate", "Google Cloud Associate Cloud Engineer"],
        "entry_level_roles": ["Associate Cloud Engineer", "Junior Cloud Administrator", "Site Infrastructure Specialist"],
        "learning_resources": [
            {"title": "AWS Skill Builder Free Tier", "url": "https://skillbuilder.aws/"},
            {"title": "Google Cloud Architecture Framework", "url": "https://cloud.google.com/architecture/framework"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Linux, Networking & Shell Automation", "weeks": "1-4"},
            {"stage": 2, "title": "Cloud Fundamentals (IAM, Compute, Storage, VPC)", "weeks": "5-8"},
            {"stage": 3, "title": "Containers, Docker & Infrastructure as Code", "weeks": "9-12"},
            {"stage": 4, "title": "High Availability, Monitoring & Cloud Capstone", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"cloud-fundamentals": 4.5, "docker-containers": 4.0, "python-programming": 3.5, "git-github": 4.0}
    },
    {
        "id": "devops-engineer",
        "title": "DevOps Engineer",
        "overview": "Bridges software engineering and systems operations by engineering automated CI/CD pipelines and Kubernetes clusters.",
        "responsibilities": [
            "Build automated CI/CD pipelines with GitHub Actions or GitLab CI",
            "Package applications in secure, lightweight Docker container images",
            "Manage Kubernetes deployments, ingress controllers, and secret managers",
            "Implement distributed tracing, metrics (Prometheus), and alerting (Grafana)"
        ],
        "foundational_skills": ["Git & Version Control", "Python Programming"],
        "technical_skills": ["Docker & Containers", "Cloud Computing Fundamentals", "Web Security & Authentication"],
        "soft_skills": ["Blameless Post-Mortem Culture", "Automation Mindset", "High-stress Troubleshooting"],
        "prerequisites": ["Linux CLI proficiency", "Git fundamentals"],
        "recommended_projects": ["Automated GitHub Actions CI/CD Pipeline", "Docker Compose Multi-Service Staging Environment", "Production Kubernetes Cluster with Helm"],
        "suggested_certifications": ["CKA: Certified Kubernetes Administrator", "HashiCorp Certified Terraform Associate"],
        "entry_level_roles": ["Junior DevOps Engineer", "Build & Release Engineer", "Associate Site Reliability Engineer"],
        "learning_resources": [
            {"title": "Docker Official Getting Started Guide", "url": "https://docs.docker.com/get-started/"},
            {"title": "GitHub Actions Documentation", "url": "https://docs.github.com/en/actions"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Version Control & GitHub Collaboration", "weeks": "1-3"},
            {"stage": 2, "title": "Containerization with Docker & Compose", "weeks": "4-7"},
            {"stage": 3, "title": "CI/CD Pipeline Engineering & Automated Testing", "weeks": "8-11"},
            {"stage": 4, "title": "Kubernetes Orchestration & Observability", "weeks": "12-16"}
        ],
        "proficiency_expectations": {"docker-containers": 4.5, "git-github": 4.5, "cloud-fundamentals": 4.0}
    },
    {
        "id": "ui-ux-designer",
        "title": "UI/UX Designer",
        "overview": "Researches user needs and crafts intuitive, accessible, and visually compelling product interfaces and design systems.",
        "responsibilities": [
            "Conduct qualitative user interviews and usability testing sessions",
            "Create low-fidelity wireframes, interactive prototypes, and design tokens in Figma",
            "Enforce WCAG accessibility standards across color contrast, typography, and touch targets",
            "Collaborate with frontend engineers to ensure pixel-perfect implementation"
        ],
        "foundational_skills": ["HTML5 & Modern CSS"],
        "technical_skills": ["UI/UX Design & Prototyping"],
        "soft_skills": ["Empathic Listening", "Design Critique Receptivity", "Visual Storytelling"],
        "prerequisites": ["Eye for layout aesthetics", "User empathy"],
        "recommended_projects": ["Mobile Banking Redesign & Prototype", "SaaS Dashboard Design System in Figma", "Accessible E-Learning Platform Case Study"],
        "suggested_certifications": ["Google UX Design Professional Certificate", "Interaction Design Foundation (IxDF) Certification"],
        "entry_level_roles": ["Junior UI/UX Designer", "Product Design Associate", "Interaction Designer"],
        "learning_resources": [
            {"title": "Figma Help Center & Design Tutorials", "url": "https://help.figma.com/hc/en-us"},
            {"title": "Nielsen Norman Group UX Articles", "url": "https://www.nngroup.com/articles/"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Design Principles, Typography & Color Theory", "weeks": "1-4"},
            {"stage": 2, "title": "User Research, Personas & Information Architecture", "weeks": "5-8"},
            {"stage": 3, "title": "Wireframing, High-Fidelity UI & Figma Prototyping", "weeks": "9-12"},
            {"stage": 4, "title": "Design Systems, WCAG Accessibility & Portfolio", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"ui-ux-design": 4.5, "html-css": 3.5}
    },
    {
        "id": "product-manager",
        "title": "Product Manager",
        "overview": "Directs product vision, defines feature roadmaps, balances technical feasibility with business value, and drives cross-functional team delivery.",
        "responsibilities": [
            "Synthesize customer feedback and telemetry into clear PRDs (Product Requirement Docs)",
            "Prioritize sprint backlogs using RICE or MoSCoW prioritization frameworks",
            "Run agile ceremonies (sprint planning, retrospectives, standups)",
            "Measure product adoption, retention, and churn metrics"
        ],
        "foundational_skills": ["Git & Version Control"],
        "technical_skills": ["Relational Databases & SQL"],
        "soft_skills": ["Stakeholder Alignment", "Ruthless Prioritization", "Market Intuition"],
        "prerequisites": ["Strategic problem solving", "High interpersonal communication"],
        "recommended_projects": ["Comprehensive Product Requirement Document (PRD)", "Feature Prioritization Matrix & Business Case", "User Onboarding Funnel Optimization Study"],
        "suggested_certifications": ["AIPMM Certified Product Manager", "Scrum.org Professional Scrum Product Owner (PSPO I)"],
        "entry_level_roles": ["Associate Product Manager (APM)", "Junior Product Specialist", "Technical Business Analyst"],
        "learning_resources": [
            {"title": "Mind the Product Blog & Resources", "url": "https://www.mindtheproduct.com/"},
            {"title": "Reforge Product Strategy Fundamentals", "url": "https://www.reforge.com/"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Product Discovery & Market Problem Framing", "weeks": "1-4"},
            {"stage": 2, "title": "Agile Scrum Methodologies & PRD Writing", "weeks": "5-8"},
            {"stage": 3, "title": "Data-Driven Decision Making & Product Analytics", "weeks": "9-12"},
            {"stage": 4, "title": "Go-to-Market Strategy & Capstone Product Pitch", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"sql-databases": 3.0, "git-github": 2.5}
    },
    {
        "id": "business-analyst",
        "title": "Business Analyst",
        "overview": "Analyzes business processes, discovers operational inefficiencies, and formulates technical requirement specifications.",
        "responsibilities": [
            "Map current-state vs future-state business workflows",
            "Elicit and document functional and non-functional requirements",
            "Perform cost-benefit analyses and financial feasibility modeling",
            "Facilitate user acceptance testing (UAT) with business stakeholders"
        ],
        "foundational_skills": ["Relational Databases & SQL"],
        "technical_skills": ["Python Programming"],
        "soft_skills": ["Requirements Elicitation", "Active Listening", "Negotiation"],
        "prerequisites": ["Logical structuring", "Comfort with business spreadsheets"],
        "recommended_projects": ["Enterprise Order Management Process Model (BPMN)", "ERP Migration Requirements Specification", "Customer Service SLA Analysis"],
        "suggested_certifications": ["IIBA Entry Certificate in Business Analysis (ECBA)", "PMI-PBA"],
        "entry_level_roles": ["Junior Business Analyst", "Operations Analyst", "Systems Analyst"],
        "learning_resources": [
            {"title": "IIBA Guide to the Business Analysis Body of Knowledge", "url": "https://www.iiba.org/babok-guide/"},
            {"title": "Process Modeling with BPMN 2.0", "url": "https://www.bpmn.org/"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Business Process Modeling & BPMN Diagrams", "weeks": "1-4"},
            {"stage": 2, "title": "Requirements Engineering & User Story Mapping", "weeks": "5-8"},
            {"stage": 3, "title": "SQL Querying & Financial Feasibility Modeling", "weeks": "9-12"},
            {"stage": 4, "title": "UAT Planning, Change Management & Case Study", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"sql-databases": 3.5, "python-programming": 2.5}
    },
    {
        "id": "embedded-systems-iot-engineer",
        "title": "Embedded Systems and IoT Engineer",
        "overview": "Programs low-level microcontrollers, sensor interfaces, and connected IoT hardware devices with hard real-time constraints.",
        "responsibilities": [
            "Write firmware in Embedded C/C++ targeting ARM Cortex, ESP32, or STM32 chips",
            "Implement communication protocols (I2C, SPI, UART, CAN, MQTT)",
            "Debug hardware signals using oscilloscopes and logic analyzers",
            "Optimize memory usage, power consumption, and battery life"
        ],
        "foundational_skills": ["C Programming", "Data Structures & Algorithms"],
        "technical_skills": ["Embedded C & Microcontrollers", "Python Programming"],
        "soft_skills": ["Hardware Patience", "Safety-Critical Rigor", "Schematic Literacy"],
        "prerequisites": ["C programming", "Basic circuit principles (Ohm's law, digital logic)"],
        "recommended_projects": ["Smart Weather Station with MQTT & Wi-Fi", "Autonomous Line-Following Robot with PID Control", "Real-Time FreeRTOS Sensor Logger"],
        "suggested_certifications": ["Arm System-on-Chip Architecture Certification", "Embedded Systems by edX/UT Austin"],
        "entry_level_roles": ["Junior Firmware Engineer", "Embedded Software Developer", "IoT Hardware Associate"],
        "learning_resources": [
            {"title": "ARM Developer Resources & Cortex-M Guides", "url": "https://developer.arm.com/"},
            {"title": "ESP-IDF Programming Guide", "url": "https://docs.espressif.com/projects/esp-idf/en/latest/"}
        ],
        "roadmap_outline": [
            {"stage": 1, "title": "Advanced C Pointers, Structs & Bit Manipulation", "weeks": "1-4"},
            {"stage": 2, "title": "Microcontroller Architecture & GPIO/Timers", "weeks": "5-8"},
            {"stage": 3, "title": "Serial Protocols (UART, SPI, I2C) & Sensor Interfacing", "weeks": "9-12"},
            {"stage": 4, "title": "Real-Time Operating Systems (FreeRTOS) & IoT Cloud", "weeks": "13-16"}
        ],
        "proficiency_expectations": {"c-programming": 4.5, "embedded-c": 4.5, "data-structures": 3.5}
    }
]

QUESTION_BANK = [
    # Category: Programming Fundamentals
    {
        "category": "Programming Fundamentals",
        "difficulty": "beginner",
        "question_text": "What is the primary difference between pass-by-value and pass-by-reference in function argument passing?",
        "code_snippet": None,
        "options": [
            {"id": "A", "text": "Pass-by-value creates a copy of the argument; pass-by-reference allows the function to modify the caller's variable directly."},
            {"id": "B", "text": "Pass-by-value is only used for integers; pass-by-reference is used for strings."},
            {"id": "C", "text": "Pass-by-reference makes execution slower and always causes memory leaks."},
            {"id": "D", "text": "There is no difference in compiled languages."}
        ],
        "correct_option_id": "A",
        "explanation": "Pass-by-value supplies a copy of the original data, shielding caller state from changes, while pass-by-reference provides the memory address, allowing direct mutation.",
        "relevant_skill_ids": ["c-programming", "python-programming"]
    },
    {
        "category": "Programming Fundamentals",
        "difficulty": "intermediate",
        "question_text": "What will be printed when the following C code executes?",
        "code_snippet": "#include <stdio.h>\nint main() {\n    int arr[] = {10, 20, 30};\n    int *ptr = arr;\n    *(ptr + 1) += 5;\n    printf(\"%d\", arr[1]);\n    return 0;\n}",
        "options": [
            {"id": "A", "text": "20"},
            {"id": "B", "text": "25"},
            {"id": "C", "text": "15"},
            {"id": "D", "text": "Compilation error"}
        ],
        "correct_option_id": "B",
        "explanation": "Pointer arithmetic *(ptr + 1) accesses arr[1] (which is initially 20) and adds 5, mutating arr[1] to 25.",
        "relevant_skill_ids": ["c-programming"]
    },
    # Category: Web Development
    {
        "category": "Web Development",
        "difficulty": "beginner",
        "question_text": "Which HTML5 semantic element is most appropriate for a standalone, self-contained section of content such as a blog post or news story?",
        "code_snippet": None,
        "options": [
            {"id": "A", "text": "<div>"},
            {"id": "B", "text": "<section>"},
            {"id": "C", "text": "<article>"},
            {"id": "D", "text": "<aside>"}
        ],
        "correct_option_id": "C",
        "explanation": "<article> is specifically intended for standalone, syndicated, or independently distributable compositions.",
        "relevant_skill_ids": ["html-css"]
    },
    {
        "category": "Web Development",
        "difficulty": "intermediate",
        "question_text": "What does the JavaScript event loop do when a Promise resolves?",
        "code_snippet": "console.log('1');\nPromise.resolve().then(() => console.log('2'));\nconsole.log('3');",
        "options": [
            {"id": "A", "text": "It prints 1, 2, 3 synchronously"},
            {"id": "B", "text": "It prints 1, 3, 2 because resolved Promise callbacks are queued into the microtask queue"},
            {"id": "C", "text": "It prints 2, 1, 3 because Promises take precedence over synchronous code"},
            {"id": "D", "text": "It throws an UnhandledPromiseRejection warning"}
        ],
        "correct_option_id": "B",
        "explanation": "Synchronous script runs first ('1', '3'). When the call stack clears, the microtask queue executes pending Promise callbacks ('2').",
        "relevant_skill_ids": ["javascript"]
    },
    # Category: Databases & SQL
    {
        "category": "Databases & SQL",
        "difficulty": "beginner",
        "question_text": "Which SQL clause is used to filter records aggregated by a GROUP BY clause?",
        "code_snippet": "SELECT department_id, COUNT(*) \nFROM employees \nGROUP BY department_id \n??? COUNT(*) > 5;",
        "options": [
            {"id": "A", "text": "WHERE"},
            {"id": "B", "text": "HAVING"},
            {"id": "C", "text": "FILTER"},
            {"id": "D", "text": "LIMIT"}
        ],
        "correct_option_id": "B",
        "explanation": "WHERE filters rows before aggregation, whereas HAVING filters grouped aggregates.",
        "relevant_skill_ids": ["sql-databases"]
    },
    {
        "category": "Databases & SQL",
        "difficulty": "intermediate",
        "question_text": "What is the purpose of database normalization up to Third Normal Form (3NF)?",
        "code_snippet": None,
        "options": [
            {"id": "A", "text": "To reduce data redundancy and eliminate undesirable update, insert, and delete anomalies."},
            {"id": "B", "text": "To combine all columns into a single wide table for faster query joins."},
            {"id": "C", "text": "To encrypt sensitive passwords automatically on the hard disk."},
            {"id": "D", "text": "To force all primary keys to be auto-incrementing integers."}
        ],
        "correct_option_id": "A",
        "explanation": "3NF ensures that non-key attributes depend solely on the primary key, avoiding transitive dependencies and data anomalies.",
        "relevant_skill_ids": ["sql-databases"]
    },
    # Category: Data Structures & Algorithms
    {
        "category": "Data Structures & Algorithms",
        "difficulty": "intermediate",
        "question_text": "What is the average time complexity of searching for a key in a well-balanced Binary Search Tree (BST) containing n nodes?",
        "code_snippet": None,
        "options": [
            {"id": "A", "text": "O(1)"},
            {"id": "B", "text": "O(log n)"},
            {"id": "C", "text": "O(n)"},
            {"id": "D", "text": "O(n log n)"}
        ],
        "correct_option_id": "B",
        "explanation": "In a balanced BST, each comparison halves the remaining search space, yielding O(log n) time complexity.",
        "relevant_skill_ids": ["data-structures"]
    },
    {
        "category": "Data Structures & Algorithms",
        "difficulty": "beginner",
        "question_text": "Which data structure operates on a First-In, First-Out (FIFO) principle?",
        "code_snippet": None,
        "options": [
            {"id": "A", "text": "Stack"},
            {"id": "B", "text": "Queue"},
            {"id": "C", "text": "Hash Map"},
            {"id": "D", "text": "Max Heap"}
        ],
        "correct_option_id": "B",
        "explanation": "A Queue processes elements in the exact order they arrived (FIFO). A Stack operates on LIFO.",
        "relevant_skill_ids": ["data-structures"]
    },
    # Category: Computer Science & Security
    {
        "category": "Computer Science & Security",
        "difficulty": "intermediate",
        "question_text": "Why should passwords never be stored using simple MD5 or SHA-256 without a salt and work factor?",
        "code_snippet": None,
        "options": [
            {"id": "A", "text": "Because MD5 and raw SHA-256 are vulnerable to precomputed rainbow table attacks and high-speed GPU brute force."},
            {"id": "B", "text": "Because they only support ASCII passwords up to 8 characters."},
            {"id": "C", "text": "Because SHA-256 generates variable-length output."},
            {"id": "D", "text": "Because modern databases refuse to save hex strings."}
        ],
        "correct_option_id": "A",
        "explanation": "Fast hashes like MD5/SHA256 allow billions of guesses per second on modern GPUs. Password storage requires slow, salted algorithms like bcrypt or Argon2.",
        "relevant_skill_ids": ["api-security"]
    },
    {
        "category": "Computer Science & Security",
        "difficulty": "beginner",
        "question_text": "In Git, what does the command 'git pull' do behind the scenes?",
        "code_snippet": None,
        "options": [
            {"id": "A", "text": "It executes 'git fetch' followed by 'git merge' into the current active branch."},
            {"id": "B", "text": "It deletes all untracked local files."},
            {"id": "C", "text": "It commits the staging area and pushes it to remote."},
            {"id": "D", "text": "It creates a new detached HEAD state."}
        ],
        "correct_option_id": "A",
        "explanation": "'git pull' fetches commits from the tracking remote branch and merges them into the current local branch.",
        "relevant_skill_ids": ["git-github"]
    }
]

PROJECTS_DATA = [
    {
        "id": "fsd-proj-portfolio",
        "title": "Personal Developer Portfolio Website",
        "career_id": "full-stack-developer",
        "level": "beginner",
        "problem_statement": "Students need a professional, responsive online presence showcasing their skills, projects, and contact avenues to recruiters.",
        "required_skills": ["HTML5 & Modern CSS", "JavaScript (ES6+)", "Git & Version Control"],
        "learning_objectives": ["Implement responsive layouts with CSS Grid/Flexbox", "Optimize images and typography", "Deploy to static hosting like Vercel or GitHub Pages"],
        "suggested_features": ["Hero introduction with call to action", "Interactive project showcase cards with live demo links", "Contact form with client-side validation", "Dark/light theme toggle"],
        "implementation_milestones": ["Milestone 1: Wireframe & semantic HTML structure", "Milestone 2: Mobile-first responsive styling", "Milestone 3: JavaScript interactions & form handling", "Milestone 4: Deployment & live URL verification"],
        "rubric": [{"criterion": "Responsiveness across mobile and desktop", "points": 30}, {"criterion": "Code structure & semantic markup", "points": 30}, {"criterion": "Interactivity & polish", "points": 40}],
        "submission_criteria": "Submit a public GitHub repository link containing a README.md and a live deployed URL."
    },
    {
        "id": "fsd-proj-task-tracker",
        "title": "Interactive Task & Milestone Tracker",
        "career_id": "full-stack-developer",
        "level": "intermediate",
        "problem_statement": "Students often struggle to track daily study milestones and categorize tasks by urgency and effort.",
        "required_skills": ["React.js", "JavaScript (ES6+)", "HTML5 & Modern CSS"],
        "learning_objectives": ["Master React state hooks (useState, useEffect)", "Component composition and props passing", "Local storage data persistence"],
        "suggested_features": ["Add, edit, complete, and delete tasks", "Filter by completion status and category", "Progress bar indicating percentage completed", "Persistence to browser localStorage"],
        "implementation_milestones": ["Milestone 1: React component architecture", "Milestone 2: State management & CRUD handlers", "Milestone 3: Filtering & persistence logic", "Milestone 4: Polish & automated component test"],
        "rubric": [{"criterion": "Component modularity", "points": 25}, {"criterion": "State management correctness", "points": 35}, {"criterion": "UX responsiveness", "points": 40}],
        "submission_criteria": "Submit a GitHub repository with clean commit history, unit tests, and screenshots in the README."
    },
    {
        "id": "fsd-proj-api-portal",
        "title": "Database-Backed Full-Stack Student Portal",
        "career_id": "full-stack-developer",
        "level": "advanced",
        "problem_statement": "Educational institutions require secure web portals allowing students to review enrollments, grades, and academic roadmaps.",
        "required_skills": ["React.js", "Node.js & Express", "Relational Databases & SQL", "Web Security & Authentication"],
        "learning_objectives": ["Design normalized relational schema with foreign keys", "Implement JWT authentication and bcrypt password hashing", "Secure REST API endpoints with middleware validation"],
        "suggested_features": ["JWT authentication with refresh tokens", "Protected student dashboard routes", "SQL queries with JOINs for student records", "Error handling middleware and input validation"],
        "implementation_milestones": ["Milestone 1: Database schema & migration scripts", "Milestone 2: Express auth & CRUD API routes", "Milestone 3: React client integration with Axios/Fetch", "Milestone 4: Security audit & integration tests"],
        "rubric": [{"criterion": "API security & authentication", "points": 35}, {"criterion": "Database schema normalization", "points": 35}, {"criterion": "Frontend-backend integration", "points": 30}],
        "submission_criteria": "Submit a GitHub repo containing backend tests, database setup instructions, and Postman/curl documentation."
    },
    {
        "id": "fsd-proj-capstone",
        "title": "Full-Stack Industry Ready Capstone System",
        "career_id": "full-stack-developer",
        "level": "capstone",
        "problem_statement": "Deliver an end-to-end production web application featuring role-based workflows, payment or file storage, and containerized deployment.",
        "required_skills": ["React.js", "Node.js & Express", "Relational Databases & SQL", "Docker & Containers", "Web Security & Authentication"],
        "learning_objectives": ["Architect scalable multi-tier web systems", "Containerize services using Docker Compose", "Integrate automated CI/CD and monitoring"],
        "suggested_features": ["Role-based access control (Student, Mentor, Admin)", "Automated background jobs or notification workflows", "Docker containerization for frontend and backend", "Full test coverage across unit and e2e scenarios"],
        "implementation_milestones": ["Milestone 1: System architecture blueprint", "Milestone 2: Core services & database implementation", "Milestone 3: Role-based frontend UI & API integration", "Milestone 4: Containerization & deployment pipeline"],
        "rubric": [{"criterion": "Production readiness & security", "points": 40}, {"criterion": "System architecture & tests", "points": 30}, {"criterion": "User experience & documentation", "points": 30}],
        "submission_criteria": "Submit a public repository with Docker Compose configuration, comprehensive README, test suite, and live demonstration video or link."
    }
]

def seed_database(db: Session):
    # 1. Seed Skills
    for skill_info in SKILLS_DATA:
        existing = db.query(Skill).filter(Skill.id == skill_info["id"]).first()
        if not existing:
            skill = Skill(
                id=skill_info["id"],
                name=skill_info["name"],
                category=skill_info["category"],
                description=skill_info["description"],
                prerequisite_skill_ids=skill_info["prerequisite_skill_ids"]
            )
            db.add(skill)
    db.commit()

    # 2. Seed Careers & Requirements
    for career_info in CAREERS_DATA:
        existing = db.query(CareerProfile).filter(CareerProfile.id == career_info["id"]).first()
        if not existing:
            career = CareerProfile(
                id=career_info["id"],
                title=career_info["title"],
                overview=career_info["overview"],
                responsibilities=career_info["responsibilities"],
                foundational_skills=career_info["foundational_skills"],
                technical_skills=career_info["technical_skills"],
                soft_skills=career_info["soft_skills"],
                prerequisites=career_info["prerequisites"],
                recommended_projects=career_info["recommended_projects"],
                suggested_certifications=career_info["suggested_certifications"],
                entry_level_roles=career_info["entry_level_roles"],
                learning_resources=career_info["learning_resources"],
                roadmap_outline=career_info["roadmap_outline"],
                proficiency_expectations=career_info["proficiency_expectations"]
            )
            db.add(career)
            db.commit()

            # Seed skill requirements for this career
            for skill_id, target_prof in career_info.get("proficiency_expectations", {}).items():
                req = CareerSkillRequirement(
                    career_id=career_info["id"],
                    skill_id=skill_id,
                    target_proficiency=int(round(target_prof)),
                    importance="critical" if target_prof >= 4.0 else "high",
                    learning_effort_hours=int(target_prof * 10)
                )
                db.add(req)
            db.commit()

    # 3. Seed Questions
    for q_data in QUESTION_BANK:
        existing = db.query(AssessmentQuestion).filter(AssessmentQuestion.question_text == q_data["question_text"]).first()
        if not existing:
            q = AssessmentQuestion(
                category=q_data["category"],
                difficulty=q_data["difficulty"],
                question_text=q_data["question_text"],
                code_snippet=q_data.get("code_snippet"),
                options=q_data["options"],
                correct_option_id=q_data["correct_option_id"],
                explanation=q_data.get("explanation"),
                relevant_skill_ids=q_data.get("relevant_skill_ids", [])
            )
            db.add(q)
    db.commit()

    # 4. Seed Projects
    for proj_data in PROJECTS_DATA:
        existing = db.query(Project).filter(Project.id == proj_data["id"]).first()
        if not existing:
            p = Project(
                id=proj_data["id"],
                title=proj_data["title"],
                career_id=proj_data["career_id"],
                level=proj_data["level"],
                problem_statement=proj_data["problem_statement"],
                required_skills=proj_data["required_skills"],
                learning_objectives=proj_data["learning_objectives"],
                suggested_features=proj_data["suggested_features"],
                implementation_milestones=proj_data["implementation_milestones"],
                rubric=proj_data["rubric"],
                submission_criteria=proj_data["submission_criteria"]
            )
            db.add(p)
    db.commit()

    # 5. Bootstrap Initial Admin and Demo Student (Chaithanya - 3rd Year CSE)
    # Check Admin
    admin_email = "admin@aicareer.internal"
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if not admin_user:
        admin_user = User(
            id="admin-bootstrap-001",
            email=admin_email,
            hashed_password=get_password_hash("AdminSecurePass2026!"),
            full_name="System Administrator",
            onboarding_completed=True
        )
        db.add(admin_user)
        db.commit()

        role = UserRole(user_id=admin_user.id, role="admin")
        db.add(role)
        db.commit()

    # Check Demo Student Chaithanya (3rd Year CSE)
    chaithanya_email = "chaithanya@student.college.edu"
    chaithanya_user = db.query(User).filter(User.email == chaithanya_email).first()
    if not chaithanya_user:
        chaithanya_user = User(
            id="chaithanya-student-demo-001",
            email=chaithanya_email,
            hashed_password=get_password_hash("ChaithanyaPass2026!"),
            full_name="Chaithanya",
            qualification="B.Tech Computer Science & Engineering (CSE)",
            institution="Government Engineering College",
            current_semester="Semester 6 (Year 3)",
            branch="Computer Science & Engineering",
            academic_interests=["Website development", "Problem-solving", "Software Engineering"],
            existing_skills=["C Programming", "HTML5 & Modern CSS", "Python Programming"],
            preferred_careers=["Full-Stack Developer", "Software Developer"],
            target_job_role="Associate Full-Stack Developer",
            available_hours_per_week=14,  # 2 hours per day
            preferred_learning_format="interactive",
            target_timeline_weeks=16,
            onboarding_completed=True
        )
        db.add(chaithanya_user)
        db.commit()

        role = UserRole(user_id=chaithanya_user.id, role="student")
        db.add(role)
        db.commit()
    else:
        # Ensure updated profile details
        chaithanya_user.full_name = "Chaithanya"
        chaithanya_user.qualification = "B.Tech Computer Science & Engineering (CSE)"
        chaithanya_user.current_semester = "Semester 6 (Year 3)"
        db.commit()

    # Check Demo Faculty/Mentor
    mentor_email = "mentor@faculty.college.edu"
    mentor_user = db.query(User).filter(User.email == mentor_email).first()
    if not mentor_user:
        mentor_user = User(
            id="mentor-faculty-demo-001",
            email=mentor_email,
            hashed_password=get_password_hash("MentorPass2026!"),
            full_name="Prof. Rajesh Sharma",
            qualification="Ph.D Computer Science & Engineering",
            institution="Government Engineering College",
            onboarding_completed=True
        )
        db.add(mentor_user)
        db.commit()

        role = UserRole(user_id=mentor_user.id, role="mentor")
        db.add(role)
        db.commit()


if __name__ == "__main__":
    from app.core.database import Base, engine, SessionLocal
    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Seeding initial dataset...")
        seed_database(db)
        print("Database initialized and seeded successfully.")
    finally:
        db.close()

