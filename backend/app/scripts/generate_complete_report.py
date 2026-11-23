# -*- coding: utf-8 -*-
import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import diagram_builders

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, total_pages):
        # Skip header and footer on cover page (page 1)
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#334155"))

        # Header
        self.drawString(54, A4[1] - 36, "AI Career & Smart Roadmap System for Students")
        self.drawRightString(A4[0] - 54, A4[1] - 36, "Dept. of CSE, NCET")
        self.setStrokeColor(colors.HexColor("#94a3b8"))
        self.setLineWidth(0.75)
        self.line(54, A4[1] - 40, A4[0] - 54, A4[1] - 40)

        # Footer
        self.line(54, 46, A4[0] - 54, 46)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(54, 32, "Dept. of CSE, NCET")
        self.drawCentredString(A4[0] / 2.0, 32, "2025-26")
        page_str = f"{self._pageNumber}"
        self.drawRightString(A4[0] - 54, 32, page_str)
        self.restoreState()

def build_pdf():
    output_filename = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "AI_CareerPath_Complete_Project_Report.pdf"))
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=28,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0f172a")
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#3b82f6")
    )

    dept_style = ParagraphStyle(
        'CoverDept',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1e293b")
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#475569")
    )

    chap_num_style = ParagraphStyle(
        'ChapNum',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        alignment=TA_LEFT,
        textColor=colors.HexColor("#2563eb")
    )

    chap_title_style = ParagraphStyle(
        'ChapTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        alignment=TA_LEFT,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=12,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor("#334155"),
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0f172a")
    )

    caption_style = ParagraphStyle(
        'Caption_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#2563eb"),
        spaceBefore=6,
        spaceAfter=12
    )

    story = []

    # ========================== COVER PAGE ==========================
    story.append(Spacer(1, 40))
    story.append(Paragraph("A PROJECT REPORT ON", meta_style))
    story.append(Spacer(1, 14))
    story.append(Paragraph("AI CAREER &amp; SMART ROADMAP SYSTEM FOR STUDENTS (AI CAREERPATH)", title_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("An Intelligent, Evidence-Based Platform for Career Guidance, Diagnostic Skill Assessments, Prerequisite Learning Roadmaps, and Verifiable Credentials", subtitle_style))
    story.append(Spacer(1, 40))

    story.append(Paragraph("Submitted in partial fulfillment of the requirements for the degree of", meta_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>BACHELOR OF ENGINEERING</b><br/>IN<br/><b>COMPUTER SCIENCE AND ENGINEERING</b>", dept_style))
    story.append(Spacer(1, 35))

    story.append(Paragraph("<b>Submitted by:</b>", dept_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>CHAITHANYA C</b> (1NC24CS034)<br/>3rd Year, Computer Science &amp; Engineering", meta_style))
    story.append(Spacer(1, 40))

    story.append(Paragraph("<b>Under the Guidance of:</b><br/>Faculty of Computer Science and Engineering", meta_style))
    story.append(Spacer(1, 40))

    story.append(HRFlowable(width="60%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=15))
    story.append(Paragraph("<b>DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING</b>", dept_style))
    story.append(Paragraph("<b>NAGARJUNA COLLEGE OF ENGINEERING AND TECHNOLOGY</b>", dept_style))
    story.append(Paragraph("(An Autonomous Institution affiliated to VTU, Belagavi, Accredited by NAAC with 'A+' Grade)", meta_style))
    story.append(Paragraph("Bengaluru – 562164, Karnataka, India", meta_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>ACADEMIC YEAR: 2025 – 2026</b>", dept_style))
    story.append(PageBreak())

    # ========================== CHAPTER 1 ==========================
    story.append(Paragraph("Chapter 1", chap_num_style))
    story.append(Paragraph("INTRODUCTION", chap_title_style))

    story.append(Paragraph(
        "Identifying an optimal professional career trajectory and acquiring industry-relevant technical competencies represents one of the most critical challenges encountered by undergraduate engineering students in today's fast-evolving technological landscape. In contemporary academia, students are confronted with an overwhelming diversity of career paths—ranging from Full-Stack Web Development, Artificial Intelligence and Machine Learning, to Cloud DevOps, Cybersecurity, and Data Engineering. However, traditional collegiate academic environments predominantly rely on unstructured, manual, and generalized mechanisms for career orientation.",
        body_style
    ))
    story.append(Paragraph(
        "Most students seek guidance through informal senior interactions, sporadic faculty counseling sessions, static syllabus guidelines, and generic internet roadmaps. These traditional channels fail to evaluate an individual student's verified skills, academic background, specific technical interests, and daily study availability. Consequently, students frequently embark on learning journeys without understanding foundational prerequisites, leading to cognitive fatigue, high drop-out rates from online courses, and severe skill mismatches during technical campus placement drives.",
        body_style
    ))
    story.append(Paragraph(
        "The primary objective of the <b>AI Career &amp; Smart Roadmap System (AI CareerPath)</b> is to transform this paradigm by delivering an intelligent, centralized, and evidence-based web application. Rather than providing subjective or generic career suggestions, AI CareerPath models a student's academic profile across 15 discrete dimensions, conducts server-scored diagnostic skill assessments with anti-cheat monitoring, calculates empirical skill gaps against industry benchmarks, and dynamically synthesizes personalized, prerequisite-aware learning roadmaps.",
        body_style
    ))
    story.append(Paragraph(
        "By integrating cutting-edge frontend engineering (React 18, Vite, TypeScript, and Tailwind CSS) with a high-performance asynchronous backend (FastAPI, Python 3.13, and SQLAlchemy) and generative AI (Google Gemini API with deterministic fallback), the system ensures students follow a structured, step-by-step path toward career readiness. Furthermore, the platform issues cryptographically verifiable PDF achievement certificates embedded with SHA-256 hashes and dynamic QR codes, enabling employers and academic institutions to validate authentic student accomplishments instantaneously.",
        body_style
    ))
    story.append(PageBreak())

    # ========================== CHAPTER 2 ==========================
    story.append(Paragraph("Chapter 2", chap_num_style))
    story.append(Paragraph("LITERATURE REVIEW", chap_title_style))

    lit_papers = [
        ("[1] R. Vadisetty and A. Polamarasetti (2024)", "AI-Augmented Skill Development Roadmaps: Tailoring 12-Month Learning Paths for Future-Ready Careers in Education 4.0 and Industry 4.0.",
         "The study utilizes learner profiling, AI-based content recommendations, and adaptive assessments to create structured skill-development roadmaps. It focuses on aligning individual learning needs with the technical skills required by emerging Industry 4.0 sectors. The approach supports continuous skill improvement through planned pedagogical activities and personalized recommendations."),
        ("[2] G. Lian, L. Shi, and Y. Wang (2025)", "AI-Driven Trinitarian Model for Vocational Education Internationalization: Digital Silk Road Practices in ASEAN and Africa.",
         "The study presents a Resource–Platform–Service architecture utilizing AI, learner data, and educational resources to support personalized vocational training. It highlights the importance of integrating digital platforms with structured learning resources and educational support services to improve access across diverse student cohorts."),
        ("[3] J. Simić and A. C. Abbah (2025)", "Artificial Intelligence as a National Interest of China: Common Achievements with the Belt and Road Initiative Countries and South-South Cooperation.",
         "The study investigates the strategic application of AI in education, talent development, skill training, and technical innovation. It emphasizes the role of artificial intelligence in strengthening technical education and preparing students for dynamically shifting workforce requirements through knowledge sharing."),
        ("[4] R. Sreevatsan, J. S. R. Ahamed, and A. B. H. Be (2026)", "Interactive Career Roadmap Website: Career Paths with Progress Tracking and AI Guided Recommendations.",
         "The study presents an interactive career roadmap system featuring prerequisite-based skill ordering, milestone progress tracking, knowledge graphs, and AI-guided recommendations. It assists learners in visualizing skill sequences and monitoring completion velocity toward professional goals."),
        ("[5] Y. Fettach, A. Bahaj, and M. Ghogho (2024)", "JobEdKG: An Uncertain Knowledge Graph-Based Approach for Recommending Online Courses and Predicting In-Demand Skills Based on Career Choices.",
         "The system employs a knowledge graph to identify high-demand career skills and recommend relevant online courses. It bridges the gap between labor-market skill demands and educational resources, supporting informed student learning decisions."),
        ("[6] X. Xu and H. Gao (2026)", "A Knowledge Graph-Integrated Recommendation Method for College Student Career Planning.",
         "The study combines knowledge graphs, Graph Convolutional Networks (GCN), and matrix factorization to produce personalized career recommendations. These techniques model relationships among student profiles, career tracks, and required competencies to facilitate data-driven career planning."),
        ("[7] S. Seesukong et al. (2024)", "CARIA: A Personalized Career Recommender Based on Individual Competency Similarity Measure.",
         "The system compares student competencies against target career requirements to compute similarity metrics, recommend suitable career tracks, and identify specific competency deficiencies requiring additional instructional focus."),
        ("[8] M. Vamshi Vardhan et al. (2026)", "GenAI Skill Gap Analyser and Personalized Learning Path Recommendation.",
         "The platform leverages generative AI for skill assessment, gap identification, adaptive quizzes, and multi-tier learning paths from foundational to advanced levels, illustrating the utility of generative models in instructional personalization."),
        ("[9] S. K. Mohapatra, P. Jena, and S. R. Dash (2025)", "Ontology-Driven Competency Mapping and Career Pathway Recommendation for Technical Education.",
         "The paper proposes an ontological framework that formalizes relationships between collegiate engineering curricula and professional competencies. By mapping academic courses to industry standards, it identifies curriculum gaps and recommends specialized learning modules."),
        ("[10] A. R. Patel and M. K. Sharma (2025)", "Machine Learning Approaches for Curriculum Sequencing and Skill Gap Detection in Higher Education.",
         "The study investigates supervised and unsupervised learning algorithms to analyze student academic performance and identify latent skill deficiencies. It emphasizes automated curriculum sequencing based on prerequisite dependencies in computer science curricula."),
        ("[11] Yaqi Lian and Feng He (2026)", "A Reinforcement Learning-Based Framework for Personalized Career Recommendations Among College Students, Journal of Advanced Computational Intelligence and Intelligent Informatics, Vol. 30, No. 5.",
         "The study introduces a reinforcement learning framework that models college students' evolving career preferences and development trajectories through hierarchical state modeling, optimizing career recommendations over longitudinal academic timelines."),
        ("[12] T. V. Sree Vastha, R. Raja Subramanian, P. Thisyanth, T. Venu Babu and P. Srikanth (2026)", "CareerAstra: An AI-Powered Hybrid Recommendation System for Career Guidance of Indian Students, Proc. of International Conference on Intelligent Systems for a Sustainable Future.",
         "The paper proposes a hybrid recommendation system tailored to Indian collegiate education. It synthesizes multiple recommendation filtering algorithms to evaluate student academic records and career interests, mitigating recommendation bias."),
        ("[13] Junshu Jiang, Songyun Ye, Wei Wang, Jingran Xu and Xiaosheng Luo (2020)", "Learning Effective Representations for Person-Job Fit by Feature Fusion, Proc. of the 29th ACM CIKM.",
         "The paper presents a feature fusion methodology combining explicit resume and job description features with historical application behaviors, demonstrating the necessity of multi-dimensional feature analysis for accurate person-job matching."),
        ("[14] Ziyang Wang, Wei Wei, Chenwei Xu, Jun Xu and Xian-Ling Mao (2022)", "Person-Job Fit Estimation from Candidate Profile and Related Recruitment History with Co-Attention Neural Networks, Neurocomputing, Vol. 501.",
         "The paper develops a Co-Attention Neural Network model capturing fine-grained semantic interactions between applicant profiles and recruitment history to compute robust candidate-job suitability estimations."),
        ("[15] Gongwen Xu, Guangyu Jia, Lin Shi and Zhijun Zhang (2021)", "Personalized Course Recommendation System Fusing with Knowledge Graph and Collaborative Filtering, Computational Intelligence and Neuroscience.",
         "The system combines knowledge graphs with collaborative filtering to overcome semantic blindness in traditional recommender systems, understanding structural linkages between course topics and student interests."),
        ("[16] Chunhong Liu, Haoyang Zhang, Jieyu Zhang, Zhengling Zhang and Peiyan Yuan (2023)", "Design of a Learning Path Recommendation System Based on a Knowledge Graph, Int. J. of Information and Communication Technology Education, Vol. 19, No. 1.",
         "The study designs a graph-based learning path recommendation system structuring concepts in a topological sequence, ensuring prerequisite foundational concepts are mastered prior to introducing advanced topics."),
        ("[17] Amir Hossein Nabizadeh, José Paulo Leal, Hamed N. Rafsanjani and Rajiv Ratn Shah (2020)", "Learning Path Personalization and Recommendation Methods: A Survey of the State-of-the-Art, Expert Systems with Applications, Vol. 159.",
         "The paper provides an extensive survey of learning path personalization techniques, analyzing curriculum sequencing algorithms, student preference modeling, and empirical evaluation metrics."),
        ("[18] Qianyi Gu (2024)", "Personalized Learning Path Recommendation Based on Knowledge Graph.",
         "The research explores knowledge graph integration for online education learning path synthesis, structuring learning activities dynamically based on evolving student knowledge states."),
        ("[19] Xin Xie and Xiangyang Feng (2025)", "Personalized Learning Path Recommendation Based on Learner Profile and Knowledge Graph, Computing and Informatics, Vol. 44, No. 4.",
         "The study proposes an Ant Colony Optimization (ACO) algorithm traversing learner profiles and knowledge graphs to discover optimal, personalized learning paths adhering to prerequisite constraints."),
        ("[20] IEEE Big Data (2024)", "Personalized Learning Path Recommendations: Fusing Knowledge Graph Embedding, Sequence Mining, and Collaborative Filtering, IEEE International Conference on Big Data.",
         "The paper introduces a hybrid model fusing knowledge graph embeddings, sequential pattern mining, and collaborative filtering to recommend coherent learning video sequences based on prior student mastery.")
    ]

    for ref, title, desc in lit_papers:
        story.append(Paragraph(f"<b>{ref}</b>", h2_style))
        story.append(Paragraph(f"<i>“{title}”</i>", ParagraphStyle('Sub', parent=body_style, fontName='Helvetica-Oblique', spaceAfter=2)))
        story.append(Paragraph(desc, body_style))

    story.append(PageBreak())

    # ========================== CHAPTER 3 ==========================
    story.append(Paragraph("Chapter 3", chap_num_style))
    story.append(Paragraph("GAPS IDENTIFIED", chap_title_style))

    story.append(Paragraph(
        "A rigorous critical analysis of the existing literature reveals significant theoretical, technical, and operational limitations across current career recommendation systems, knowledge graph frameworks, and automated learning path models. These identified gaps justify the architecture and implementation of the proposed AI CareerPath platform.",
        body_style
    ))

    gaps_data = [
        ("[1] Vadisetty and Polamarasetti (2024)", [
            "The proposed 12-month model assumes static annual timelines and fails to accommodate dynamic weekly study constraints (e.g., 10 vs. 25 hours/week).",
            "Relies on self-reported learner inputs without integrating proctored, server-scored diagnostic assessments.",
            "Lacks an automated mechanism to link recommended roadmap tasks with verifiable practical GitHub project submissions.",
            "Does not provide tamper-resistant cryptographic credential verification for completed learning milestones."
        ]),
        ("[2] Lian, Shi, and Wang (2025)", [
            "Focuses on macro-level institutional policy and lacks granular software implementation for individual skill-gap quantification.",
            "Does not incorporate prerequisite-aware directed acyclic graph (DAG) dependency modeling for technical computing skills.",
            "Fails to provide real-time student anti-cheat integrity monitoring during competency evaluations.",
            "Resource curation is non-automated and uncalibrated to personalized daily student study schedules."
        ]),
        ("[3] Simić and Abbah (2025)", [
            "Presents geopolitical and policy perspectives without proposing concrete algorithmic or architectural solutions for student career planning.",
            "Lacks personalized recommendation algorithms and objective skill benchmarking engines.",
            "Does not address the technical disconnect between theoretical engineering coursework and hands-on portfolio creation.",
            "Provides no technical mechanisms for automated student progress tracking or roadmap adaptation."
        ]),
        ("[4] Sreevatsan, Ahamed, and Be (2026)", [
            "Assumes uninterrupted cloud connectivity, lacking an offline deterministic rule engine when generative AI APIs fail or exceed quota.",
            "Client-side quiz evaluations leave assessment keys vulnerable to browser inspection and tampering.",
            "Does not support faculty or mentor governance workflows for reviewing student project deliverables.",
            "Provides static visual roadmaps without dynamic daily scheduling based on student study bandwidth."
        ]),
        ("[5] Fettach, Bahaj, and Ghogho (2024)", [
            "Knowledge graph construction relies on probabilistic scraping of job descriptions, leading to noise and obsolete skill requirements.",
            "Fails to incorporate multi-factor academic weighting such as collegiate degree, semester standing, and departmental branch.",
            "Provides course recommendations without structuring prerequisite-locked execution phases.",
            "Does not evaluate hands-on code development or practical milestone deliverables."
        ]),
        ("[6] Xu and Gao (2026)", [
            "Graph Convolutional Networks suffer from high computational complexity, hindering real-time roadmap synthesis on lightweight web backends.",
            "Model operates as a black-box neural recommender with zero explainability for why specific careers were recommended.",
            "Exhibits severe cold-start degradation when evaluating novice 1st- and 2nd-year students with sparse project histories.",
            "Omits automated anti-cheat integrity monitoring during skill evaluation."
        ]),
        ("[7] Seesukong et al. (2024)", [
            "Competency similarity calculation treats all skills with equal mathematical weight, failing to distinguish critical core requirements from secondary skills.",
            "Relies on subjective self-evaluations prone to inflation, lacking objective diagnostic verification.",
            "Generates gap lists without compiling them into actionable, scheduled weekly study agendas.",
            "Offers no downloadable or verifiable achievement certification upon gap remediation."
        ]),
        ("[8] Vamshi Vardhan et al. (2026)", [
            "Dependent exclusively on third-party GenAI APIs, resulting in total system failure under API rate limits or network outages.",
            "Exhibits LLM hallucination risks in recommended learning resources and dead URLs.",
            "Lacks server-side timer enforcement and window focus tracking during adaptive quiz administration.",
            "Does not provide a unified institutional dashboard for mentor oversight and audit logging."
        ]),
        ("[9] Mohapatra, Jena, and Dash (2025)", [
            "Ontological engineering requires extensive manual curation by domain experts, making real-time updates to emerging tech stacks difficult.",
            "Does not evaluate student learning velocity or dynamic actual-vs-estimated study hours.",
            "Lacks an interactive Single Page Application (SPA) frontend for dynamic student interaction.",
            "Does not provide cryptographic certificate verification mechanisms."
        ]),
        ("[10] Patel and Sharma (2025)", [
            "Machine learning sequencing models require large historical training datasets, failing in newly established academic colleges.",
            "Does not provide transparent mathematical formulas for student match percentage interpretability.",
            "Lacks integration with browser MediaDevices API for voluntary camera-assisted assessment proctoring.",
            "Curriculum sequences are generic and disconnected from student-declared daily hour availability."
        ]),
        ("[11] Lian and He (2026)", [
            "Reinforcement learning reward formulation requires extensive exploration steps, producing suboptimal recommendations for early-stage learners.",
            "High computational training cost prevents execution in resource-constrained collegiate server environments.",
            "Lacks structured fallback mechanisms to guarantee immediate roadmap delivery.",
            "Excludes practical project portfolio rubrics and mentor verification workflows."
        ]),
        ("[12] Sree Vastha et al. (2026)", [
            "Hybrid recommendation engine lacks explainable breakdown badges illustrating exactly which declared skills matched target roles.",
            "Assessment component does not randomize question options to prevent student answer sharing.",
            "Roadmaps do not enforce prerequisite locking, permitting students to attempt advanced milestones prematurely.",
            "Does not generate standardized, tamper-resistant PDF credentials."
        ]),
        ("[13] Jiang et al. (2020)", [
            "Feature fusion requires dense historical job application logs, making it inapplicable for pre-employment undergraduate students.",
            "Optimized strictly for employer-side candidate screening rather than student-side pedagogical guidance.",
            "Provides no interactive learning roadmap or modular study planning tools.",
            "Omits diagnostic skill testing and continuous proficiency tracking."
        ]),
        ("[14] Wang et al. (2022)", [
            "Co-attention neural networks demand extensive GPU hardware resources, rendering them impractical for standard academic deployment.",
            "Model architecture does not explain the specific cognitive or algorithmic prerequisites required for career advancement.",
            "Lacks integration with curated documentation repositories and open-source learning materials.",
            "Does not incorporate academic integrity tracking (tab-switching and window blur logging)."
        ]),
        ("[15] Xu et al. (2021)", [
            "Collaborative filtering suffers from severe sparsity when novel technologies or emerging career roles are introduced.",
            "Recommends isolated courses without synthesizing cohesive, multi-stage roadmaps.",
            "Provides no mechanism to measure whether recommended courses were genuinely completed or understood.",
            "Lacks institutional mentor review interfaces."
        ]),
        ("[16] Liu et al. (2023)", [
            "Graph path optimization focuses on theoretical concept nodes rather than concrete engineering deliverables and GitHub projects.",
            "Static path generation does not adapt when students score poorly on intermediate milestone quizzes.",
            "Lacks voluntary camera-monitored examination environments.",
            "Does not produce cryptographically verifiable achievement certificates."
        ]),
        ("[17] Nabizadeh et al. (2020)", [
            "Survey paper identifying architectural gaps across personalization literature without presenting a concrete, implemented web system.",
            "Highlights recurring trade-offs between heuristic rule engines and black-box neural models without implementing a dual-engine fallback solution.",
            "Documents widespread neglect of time-budget constraints in published roadmapping models.",
            "Emphasizes the absence of verifiable credentials linked directly to empirical skill assessment."
        ]),
        ("[18] Gu (2024)", [
            "Knowledge graph edges fail to encode time-to-learn estimates calibrated to student hours.",
            "Lacks an end-to-end full-stack software implementation supporting student authentication and role-based access control.",
            "Assessment engine does not prevent client-side answer inspection.",
            "Provides no structured weekly study planner distributing tasks across academic schedules."
        ]),
        ("[19] Xie and Feng (2025)", [
            "Ant Colony Optimization introduces stochastic variability, resulting in inconsistent roadmap structures for students with identical skill profiles.",
            "Heuristic convergence time increases dramatically with large skill graphs, introducing noticeable UI latency.",
            "Does not validate student code submissions or portfolio repositories.",
            "Lacks public certificate lookup and validation endpoints."
        ]),
        ("[20] IEEE Big Data (2024)", [
            "Restricted to video resource sequence mining without integrating structured documentation, interactive sandboxes, or capstone projects.",
            "Fails to capture rich academic student attributes such as engineering degree, semester, and institution.",
            "Lacks a deterministic offline fallback engine when backend graph embedding services fail.",
            "Provides no institutional audit logging for academic governance and compliance."
        ])
    ]

    for paper_title, bullets in gaps_data:
        story.append(Paragraph(f"<b>{paper_title}</b>", h2_style))
        for b in bullets:
            story.append(Paragraph(f"• {b}", bullet_style))

    story.append(PageBreak())

    # ========================== CHAPTER 4 ==========================
    story.append(Paragraph("Chapter 4", chap_num_style))
    story.append(Paragraph("OBJECTIVE OF THE PROJECT", chap_title_style))

    story.append(Paragraph(
        "The overarching objective of the <b>AI Career &amp; Smart Roadmap System</b> is to design, engineer, and validate an integrated, intelligent, and tamper-resistant web platform that empowers technical students to discover optimal career tracks, identify empirical skill deficiencies, execute personalized learning roadmaps, and earn verifiable credentials.",
        body_style
    ))

    story.append(Paragraph("<b>4.1 Primary Objectives:</b>", h1_style))
    primary_objs = [
        "Develop an Academic Profile Management Engine capturing 15 multidimensional parameters including degree, collegiate standing, granular skills with 4-tier proficiencies, and daily study availability.",
        "Implement an Explainable Career Recommendation Algorithm evaluating student capabilities against 12 standardized industry profiles to compute quantitative match percentages and skill alignment badges.",
        "Construct a Secure Diagnostic Assessment Module delivering randomized, server-evaluated technical tests with protected answer keys, client countdown timers, voluntary camera monitoring, and tab-switch integrity logging.",
        "Build an Evidence-Based Skill Gap Analysis Engine calculating mathematical deficiency scores, grouping remediation priorities, and rendering multi-axis polar radar charts.",
        "Architect a Dual-Engine Learning Roadmap Synthesizer integrating Google Gemini Generative AI structured schema enforcement with an offline deterministic prerequisite graph engine.",
        "Engineer a Verifiable Certificate Management System generating landscape PDF credentials with SHA-256 cryptographic verification digests, dynamic QR codes, and a public URL verification endpoint.",
        "Provide an Interactive 7-Day Weekly Study Planner dynamically translating long-term roadmaps into daily achievable study hour allocations.",
        "Implement Role-Based Access Control (RBAC) supporting student learning workflows, mentor project reviews, and administrative security audit logging."
    ]
    for obj in primary_objs:
        story.append(Paragraph(f"• {obj}", bullet_style))

    story.append(PageBreak())

    # ========================== CHAPTER 5 ==========================
    story.append(Paragraph("Chapter 5", chap_num_style))
    story.append(Paragraph("SYSTEM ANALYSIS", chap_title_style))

    story.append(Paragraph("5.1 Existing System", h1_style))
    story.append(Paragraph(
        "The existing system for identifying technical career paths and orchestrating student skill development relies on fragmented, outdated, and manual methodologies. In the absence of an integrated, automated software solution, academic institutions and students experience systemic inefficiencies:",
        body_style
    ))

    exist_points = [
        ("Data Management Inconsistencies:", "Student skills, academic records, and career aspirations are stored in disparate spreadsheets, paper resumes, or uncoordinated portal forms. This creates fragmented, conflicting records that cannot be systematically analyzed."),
        ("Lack of Architectural Integration:", "Collegiate counseling, assessment portals, and online learning resources operate in complete isolation. Updates in student coursework are never synchronized with career planning, disrupting continuity."),
        ("Inefficient and Subjective Identification:", "Traditional career matching relies on manual faculty reviews or superficial interest quizzes that fail to evaluate technical prerequisites, leading to suboptimal career alignment."),
        ("Limited Real-Time Accessibility:", "Students lack access to dynamic, up-to-date industry job competency benchmarks, leaving them unaware of shifting technological requirements."),
        ("Outdated Skill Assessment Paradigms:", "Self-assessment on public portals consists of non-monitored honor-system ratings or client-side quizzes where answers are easily exposed via browser developer tools."),
        ("Absence of Centralized Prerequisite Tracking:", "Generic public roadmaps present monolithic, linear technology stacks without verifying whether a student possesses foundational algorithmic and mathematical prerequisites."),
        ("Difficulty Adapting to Dynamic Time Budgets:", "Manual study plans cannot adapt to fluctuating student schedules, failing to reschedule missed tasks or calculate completion velocity.")
    ]
    for title, desc in exist_points:
        story.append(Paragraph(f"• <b>{title}</b> {desc}", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("5.2 Problem Statement", h1_style))
    story.append(Paragraph(
        "Technical students face acute cognitive overload and lack structured guidance when transitioning from formal academic coursework to industry-standard engineering roles. Current institutional approaches rely on manual counseling and static job descriptions disconnected from verified proficiencies, available study hours, and individual timelines. Consequently, students struggle to identify their empirical skill gaps, determine correct learning sequences, and produce verifiable proof of competency. A centralized, intelligent software platform is required to automate multi-factor career recommendation, deliver server-scored diagnostic assessments with integrity logging, calculate empirical skill gaps, synthesize prerequisite-aware adaptive roadmaps, and generate cryptographically verifiable credentials.",
        body_style
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph("5.3 Proposed System", h1_style))
    story.append(Paragraph(
        "The <b>AI Career &amp; Smart Roadmap System (AI CareerPath)</b> is engineered as a modern, full-stack web application designed to resolve the shortcomings of the existing system. The application combines React 18, Vite, TypeScript, Tailwind CSS, FastAPI, and SQLAlchemy to deliver an end-to-end student guidance lifecycle:",
        body_style
    ))

    prop_points = [
        ("Student Academic Profile Management:", "Captures 15 structured parameters, dynamically evaluates profile completion percentage, and synchronizes daily study hours with weekly capacity."),
        ("Explainable Career Recommendations:", "Executes multi-factor mathematical scoring across 12 standardized career profiles, ranking careers and displaying matching skill badges."),
        ("Diagnostic Assessments & Anti-Cheat Proctoring:", "Administers randomized 10-question technical tests, enforces a 15-minute server-side countdown, protects answers on the server, logs window blur/tab switches, and supports voluntary camera monitoring."),
        ("Evidence-Based Skill Gap Quantification:", "Compares verified diagnostic scores against career benchmarks, computing deficiency scores and rendering interactive radar charts."),
        ("AI-Assisted and Prerequisite-Aware Roadmaps:", "Constructs multi-stage curricula using Google Gemini API with strict JSON schema enforcement, backed by an offline deterministic prerequisite graph engine."),
        ("Curated Resources and Capstone Projects:", "Pairs learning tasks with authoritative documentation and multi-tier project specifications requiring GitHub repository submissions."),
        ("Weekly Study Planner & Progress Analytics:", "Distributes open tasks across a 7-day schedule based on daily hour targets, computing roadmap completion percentage dynamically."),
        ("Cryptographically Verifiable Certification:", "Issues ReportLab-compiled landscape PDF certificates with SHA-256 validation hashes, dynamic QR codes, and a public lookup endpoint."),
        ("Institutional Mentor Governance:", "Provides faculty dashboards for reviewing project submissions, monitoring cohort progress, and logging administrative actions.")
    ]
    for title, desc in prop_points:
        story.append(Paragraph(f"• <b>{title}</b> {desc}", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("5.4 Advantages of the Proposed System", h1_style))
    adv_points = [
        "Provides objective, mathematical career match scoring, eliminating subjective counseling bias.",
        "Prevents cognitive fatigue by strictly enforcing prerequisite task dependencies via directed graphs.",
        "Guarantees high platform availability through a dual-engine architecture combining Gemini AI with deterministic fallback.",
        "Protects assessment integrity through server-side evaluation, protected keys, and client focus monitoring.",
        "Ensures total student privacy by executing camera monitoring locally in browser memory without storing video streams.",
        "Produces verifiable, fraud-resistant PDF credentials containing SHA-256 cryptographic digests and scannable QR codes.",
        "Dynamically adapts weekly task workloads to individual student study budgets (1 to 8 hours/day)."
    ]
    for adv in adv_points:
        story.append(Paragraph(f"• {adv}", bullet_style))

    story.append(PageBreak())

    # ========================== CHAPTER 6 ==========================
    story.append(Paragraph("Chapter 6", chap_num_style))
    story.append(Paragraph("SYSTEM DESIGN", chap_title_style))

    story.append(Paragraph(
        "The system architecture of AI CareerPath is modularly decomposed into nine specialized functional modules and an overall three-tier block architecture. Each module operates autonomously while maintaining strict relational and API contracts.",
        body_style
    ))

    modules_design = [
        ("6.1 Student Academic Profile Management Module",
         "Captures, validates, and persists 15 academic, technical, and scheduling attributes. It models the learner profile, synchronizes weekly study budgets (study_hours_per_day * 7), seeds initial skill assessment baselines, and calculates completion percentage.",
         "Full Name, Education Level, Degree, Institution, Branch, Academic Year, Semester, Grad Year, Interests, Technical Skills with 4-tier levels, Target Career, Daily Study Hours, Learning Format, Timeline.",
         "Server-side Pydantic schema validation, mathematical completion percentage calculation, database upsert in profiles, and baseline insertion into skill_assessments.",
         "Updated profiles entity, baseline skill_assessments rows, and sanitized UserOut JSON payload.",
         "Supplies student parameters to Career Explorer, Skill Gap Analysis, and Study Planner.",
         "Fig 6.1: Student Profile Management Workflow (User -> Form Entry -> Client Validation -> PUT /api/auth/profile -> Backend Validation & Math Completion -> DB Profiles & SkillAssessments -> Updated UserOut)"),

        ("6.2 Career Exploration & Recommendation Module",
         "Maintains standardized industry role definitions and executes multi-factor recommendation scoring to align student competencies with career prerequisites.",
         "Student technical skills list, proficiency tiers, academic interests, collegiate branch, and preferred career choices.",
         "Traverses all active career_profiles, calculates proficiency-weighted skill points (+12 Adv, +9 Int, +6 Basic, +4 Beg), adds interest (+15) and branch (+10) bonuses, and normalizes scores to [0, 100%].",
         "Rank-ordered career list, top recommendation object, match percentage, and matching skill badges.",
         "Feeds target career ID into Diagnostic Assessment and Skill Gap Analysis modules.",
         "Fig 6.2: Career Recommendation Engine (User Request -> POST /api/careers/recommend -> Fetch Career Profiles -> Multi-Factor Score Calculation -> Normalize [0-100%] -> Sort Descending -> Return Recommendation List)"),

        ("6.3 Diagnostic Assessment & Anti-Cheat Monitoring Module",
         "Delivers timed technical examinations, enforces integrity monitoring, and evaluates answers strictly server-side.",
         "Career ID, selected proctoring mode (Standard Camera Off vs. Monitored Camera On), student answer map, and elapsed time.",
         "Randomly draws 10 questions, strips correct_option_id from client payload, tracks window blur events, calculates score percentage upon submission, and updates verified proficiencies in skill_assessments.",
         "Sanitized question payload (AssessmentQuestionClient), AssessmentResultOut containing score percentage, category mastery breakdown, and detailed explanations.",
         "Directly updates Skill Assessment records and triggers certificate eligibility checks.",
         "Fig 6.3: Diagnostic Assessment & Integrity Workflow (Launch -> Mode Select -> Draw 10 Randomized Qs -> Strip Correct IDs -> 15-Min Timer -> Answer Submissions -> Server Scoring against DB -> Return Score & Explanations)"),

        ("6.4 Evidence-Based Skill Gap Analysis Module",
         "Quantifies the mathematical deficit between assessed student skills and industry career benchmarks.",
         "Authenticated student ID and target Career ID.",
         "Queries career_skill_requirements and skill_assessments, calculates individual skill gap (Delta = Target - Current), computes overall weighted readiness percentage, and categorizes gaps into Critical, High, and Medium tiers.",
         "SkillGapReportOut payload containing overall match percentage, prioritized deficiencies, estimated remediation hours, and Recharts polar radar chart dataset.",
         "Feeds prioritized skill deficiencies directly into the AI Roadmap Generation Module.",
         "Fig 6.4: Skill Gap Analysis Architecture (GET /api/skills/gap-report -> Query SkillAssessments & CareerSkillReqs -> Delta Calculation -> Importance Weighting -> Group Priorities -> Build Radar Dataset -> Render Report)"),

        ("6.5 AI & Adaptive Learning Roadmap Module",
         "Synthesizes structured, prerequisite-aware, multi-stage curricula calibrated to student daily availability.",
         "Target career profile, confirmed skill gap report, weekly available study hours, and target deadline weeks.",
         "Evaluates Gemini API availability; if active, requests structured JSON adhering to ROADMAP_SCHEMA; if inactive, executes deterministic prerequisite graph algorithm; enforces task DAG constraints (Stage 1 available, subsequent locked).",
         "Persistent roadmaps and roadmap_tasks entities, interactive timeline view, and milestone progress tracking.",
         "Supplies actionable tasks to the Weekly Study Planner and unlocks tasks upon practical project completion.",
         "Fig 6.5: Dual-Engine Roadmap Generation Flow (POST /api/roadmaps/generate -> Check Active Roadmap -> Check Gemini API Key -> [Gemini API / Rule Engine] -> Generate DAG Tasks -> Set Stage 1 Available -> Save DB -> Return RoadmapOut)"),

        ("6.6 Curated Learning Resources & Project Portfolio Module",
         "Vets external educational materials and provides structured project specifications with GitHub repository submission tracking.",
         "Filter criteria (skill, career, format); student GitHub repo URL, live demo link, and project notes.",
         "Queries learning_resources by category; validates repository URL format; stores submission in project_submissions with status 'pending' awaiting faculty review.",
         "Categorized resource cards and project submission receipts with status badges.",
         "Project approvals satisfy milestone deliverables in the Roadmap and unlock certificate criteria.",
         "Fig 6.6: Resources and Project Submission Lifecycle (Browse Resources / Undertake Project -> Implement Local Code -> Push GitHub -> POST /api/projects/submit -> Validate URL -> Mentor Review -> Status 'approved' -> Unlock Roadmap Task)"),

        ("6.7 Student Progress Tracking & Weekly Study Planner Module",
         "Provides longitudinal study scheduling and dynamic milestone completion metrics.",
         "Student task status transitions (in_progress, completed), actual hours invested, and evidence notes.",
         "Verifies task prerequisite completion, marks status 'completed', unlocks downstream dependent tasks, recalculates roadmap completion percentage, and distributes tasks across 7 calendar days matching weekly study target.",
         "Updated dashboard metrics (Progress %, Tasks Completed, Velocity), and 7-day interactive study planner agenda.",
         "Updates Overview Page metrics and drives student learning momentum.",
         "Fig 6.7: Progress Tracking & Study Planner Flow (Fetch Roadmap Tasks -> Compute Completion % -> Distribute across 7 Days -> Student Marks Task 'completed' -> Verify Prerequisites -> Unlock Dependent Tasks -> Recalculate Roadmap %)"),

        ("6.8 Verifiable Certificate Generation & Verification Module",
         "Evaluates achievement eligibility, compiles official PDF credentials, and provides public verification.",
         "Student ID, requested achievement type (diagnostic_distinction, stage_completion); certificate ID for public verification.",
         "Validates criteria (score >= 70% or Stage 1 complete); generates unique ID (ACR-YYYY-ROLE-HEX); computes SHA-256 hash; generates verification QR code; renders landscape PDF via ReportLab; logs record in certificates table.",
         "Official downloadable PDF certificate and public verification endpoint returning credential status.",
         "Queries Assessment, Roadmap, and Project tables to verify completion thresholds.",
         "Fig 6.8: Certificate Issuance and Verification Architecture (POST /api/certificates/generate -> Eligibility Validation -> Compute SHA-256 -> Generate QR Code -> ReportLab PDF Rendering -> Save DB -> Public Query GET /api/certificates/verify/ID -> Return Validity Status)"),

        ("6.9 Mentor & Academic Administration Module",
         "Provides institutional oversight for faculty mentors and system administrators.",
         "Admin/Mentor credentials, project review determinations (approved/revision), qualitative feedback, and question bank updates.",
         "Enforces RBAC route security; calculates cohort academic aggregates; updates project submission statuses; records sensitive actions in audit_logs.",
         "Mentor cohort progress views, project grading interfaces, and administrative audit trails.",
         "Oversees all platform entities and guarantees institutional compliance.",
         "Fig 6.9: Mentor and Governance Workflow (Faculty Login -> RBAC Check -> Access Mentor Dashboard -> Review Student Project Submissions -> Submit Feedback -> Update Status -> Write Audit Log -> Update Roadmap Deliverable)")
    ]

    diag_builders = [
        diagram_builders.build_fig_6_1,
        diagram_builders.build_fig_6_2,
        diagram_builders.build_fig_6_3,
        diagram_builders.build_fig_6_4,
        diagram_builders.build_fig_6_5,
        diagram_builders.build_fig_6_6,
        diagram_builders.build_fig_6_7,
        diagram_builders.build_fig_6_8,
        diagram_builders.build_fig_6_9,
    ]

    for (title, intro, in_data, proc, out_data, interact, diag_caption), builder in zip(modules_design, diag_builders):
        story.append(Paragraph(f"<b>{title}</b>", h1_style))
        story.append(Paragraph(f"<b>1. Introduction:</b> {intro}", body_style))
        story.append(Paragraph(f"<b>2. Input:</b> {in_data}", body_style))
        story.append(Paragraph(f"<b>3. Processing:</b> {proc}", body_style))
        story.append(Paragraph(f"<b>4. Output:</b> {out_data}", body_style))
        story.append(Paragraph(f"<b>5. Interactions:</b> {interact}", body_style))
        story.append(Spacer(1, 4))
        diag_flow = builder()
        diag_flow.append(Spacer(1, 4))
        diag_flow.append(Paragraph(f"<b>{diag_caption}</b>", caption_style))
        story.append(KeepTogether(diag_flow))
        story.append(Spacer(1, 10))

    story.append(Spacer(1, 10))
    story.append(Paragraph("6.10 Overall System Architecture Block Diagram", h1_style))
    story.append(Paragraph(
        "The overall architecture of AI CareerPath is structured across three distinct tiers:",
        body_style
    ))
    story.append(Paragraph(
        "<b>Tier 1 – Client Presentation Layer:</b> Implemented as a Single Page Application (SPA) utilizing React 18, Vite, and TypeScript. Styled with Tailwind CSS and enhanced with Recharts visualizations, the client interfaces seamlessly with desktop, tablet, and mobile browsers.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Tier 2 – Application / RESTful API Service Layer:</b> Powered by FastAPI and Python 3.13, this tier handles business logic, input validation via Pydantic v2 schemas, JWT authentication, server-side scoring, prerequisite graph traversal, and ReportLab PDF document compilation.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Tier 3 – Database and Intelligence Layer:</b> Manages persistent relational state using SQLite / PostgreSQL via SQLAlchemy ORM. Coordinates generative AI curriculum synthesis via Google Gemini API while maintaining a deterministic offline rule engine fallback.",
        body_style
    ))
    story.append(Spacer(1, 6))
    fig10_flow = diagram_builders.build_fig_6_10()
    fig10_flow.append(Spacer(1, 4))
    fig10_flow.append(Paragraph("<b>Fig 6.10: Overall Three-Tier System Architecture (Client Presentation Tier &lt;-- HTTPS/JSON --&gt; FastAPI Application Tier &lt;-- ORM / API --&gt; Relational Database &amp; Gemini AI Services)</b>", caption_style))
    story.append(KeepTogether(fig10_flow))

    story.append(PageBreak())

    # ========================== CHAPTER 7 ==========================
    story.append(Paragraph("Chapter 7", chap_num_style))
    story.append(Paragraph("IMPLEMENTATION", chap_title_style))

    story.append(Paragraph("7.1 Frontend Development", h1_style))
    story.append(Paragraph(
        "The user interface is engineered using React 18 with TypeScript and Vite. Tailwind CSS provides a modular utility-first styling system utilizing a clean palette of slate, blue, and indigo. Recharts delivers hardware-accelerated SVG data visualizations, notably the multi-axis polar Skill Mastery Radar Chart. Lucide React supplies consistent iconography. Client-side routing is managed via React Router DOM with authentication route guards intercepting unauthorized navigation.",
        body_style
    ))

    story.append(Paragraph("7.2 Backend Development", h1_style))
    story.append(Paragraph(
        "The backend service layer is developed using Python 3.13 and FastAPI. It follows an asynchronous, modular microservice-style design pattern. Endpoints are organized by domain under /api/v1 (auth, careers, assessments, skills, roadmaps, planner, projects, resources, integrity, certificates, mentors, and admin). Input data is strictly validated through Pydantic v2 schemas equipped with custom before-validators to sanitize null values and prevent 500 server crashes.",
        body_style
    ))

    story.append(Paragraph("7.3 Database Implementation", h1_style))
    story.append(Paragraph(
        "Data persistence is implemented using SQLAlchemy ORM connected to SQLite (career_path.db) for local execution, with full schema compatibility for Supabase PostgreSQL. Core relational tables include profiles (user data, 15 profile attributes), user_roles (RBAC roles), skills (skill catalog, prerequisites), career_profiles (job tracks, benchmarks), career_skill_requirements (target proficiencies), assessment_questions (questions, protected correct answers), assessment_attempts (test instances, timers), assessment_answers (submitted options), skill_assessments (empirical proficiencies), roadmaps (curriculum instances), roadmap_tasks (DAG tasks, status), learning_resources (curated materials), projects (capstone specs), project_submissions (repo URLs, reviews), certificates (verifiable credentials, SHA-256 hashes), and audit_logs (security events).",
        body_style
    ))

    story.append(Paragraph("7.4 AI and Recommendation Implementation", h1_style))
    story.append(Paragraph(
        "The Career Recommendation Engine executes multi-factor proficiency-weighted matching: declared skills contribute points proportional to proficiency (Advanced=12, Intermediate=9, Basic=6, Beginner=4), combined with interest (+15), primary preference (+25), and branch affinity (+10) bonuses. The Roadmap Synthesizer implements a dual-engine architecture: it attempts generative structured synthesis using Google Gemini API enforcing ROADMAP_SCHEMA; if unconfigured or unreachable, it seamlessly invokes the deterministic fallback engine to construct a prerequisite-aware learning roadmap without service interruption.",
        body_style
    ))

    story.append(Paragraph("7.5 Structured Module Pseudocode", h1_style))

    pseudocode_blocks = [
        ("7.5.1 Student Registration and Authentication Pseudocode",
"""STRUCT UserCredentials: email, password, fullName END STRUCT
FUNCTION RegisterStudent(credentials: UserCredentials):
  IF length(credentials.password) < 6 THEN RAISE "Password must be >= 6 chars" END IF
  existing = DB.query("SELECT * FROM profiles WHERE email = credentials.email")
  IF existing IS NOT NULL THEN
    existing.hashed_password = BcryptHash(credentials.password)
    DB.commit()
    token = GenerateJWT(existing.id, ["student"])
    RETURN TokenResponse(token, existing)
  END IF
  newUser = NEW User(email=credentials.email, hashed_password=BcryptHash(credentials.password),
                     full_name=credentials.fullName, education_level="Undergraduate",
                     degree="B.Tech", academic_year="3rd Year", current_semester="Semester 6",
                     institution="NCET", branch="CSE", onboarding_completed=False)
  DB.insert(newUser)
  DB.insert(NEW UserRole(newUser.id, "student"))
  DB.commit()
  token = GenerateJWT(newUser.id, ["student"])
  RETURN TokenResponse(token, newUser)
END FUNCTION"""),

        ("7.5.2 Student Profile Management Pseudocode",
"""FUNCTION UpdateStudentProfile(studentId: String, data: ProfileUpdate):
  user = DB.query("SELECT * FROM profiles WHERE id = studentId")
  FOR EACH field IN data:
    IF field.value IS NOT NULL THEN user.set(field.name, field.value) END IF
  END FOR
  IF data.study_hours_per_day > 0 THEN user.available_hours_per_week = data.study_hours_per_day * 7 END IF
  IF data.technical_skills IS NOT NULL THEN
    FOR EACH item IN data.technical_skills:
      IF DB.query("SELECT * FROM skill_assessments WHERE user_id=studentId AND skill_id=item.skill") IS NULL THEN
        DB.insert(NEW SkillAssessment(studentId, item.skill, MapProficiency(item.level), "self-reported"))
      END IF
    END FOR
  END IF
  validCount = CountNonEmptyFields(user.15_profile_dimensions)
  user.completion_percentage = Round((validCount / 15.0) * 100)
  user.onboarding_completed = (user.completion_percentage >= 80)
  DB.commit()
  RETURN user
END FUNCTION"""),

        ("7.5.3 Career Recommendation Pseudocode",
"""FUNCTION RecommendCareers(user: User, interests: List, skills: List, preferences: List):
  allCareers = DB.query("SELECT * FROM career_profiles")
  recommendations = []
  FOR EACH career IN allCareers:
    score = 0; matching = []; missing = []
    FOR EACH reqSkill IN career.technical_skills:
      IF reqSkill IN skills THEN
        score = score + LookupProficiencyPoints(GetUserSkillLevel(user.id, reqSkill))
        matching.append(reqSkill)
      ELSE missing.append(reqSkill) END IF
    END FOR
    FOR EACH interest IN interests:
      IF interest IN career.overview THEN score = score + 15 END IF
    END FOR
    IF career.id == user.target_job_role OR career.title IN preferences THEN score = score + 25 END IF
    IF user.branch == "CSE" AND career.id IN ["full-stack-developer", "ai-ml-engineer"] THEN score = score + 10 END IF
    matchPct = Min(98.0, Max(25.0, (score / 120.0) * 100))
    recommendations.append({"career_id": career.id, "match_score": matchPct, "matching": matching, "missing": missing})
  END FOR
  SORT recommendations DESCENDING BY match_score
  RETURN {"top_recommendation": recommendations[0], "all_recommendations": recommendations}
END FUNCTION"""),

        ("7.5.4 Diagnostic Assessment & Scoring Pseudocode",
"""FUNCTION StartAssessment(userId: String, careerId: String, cameraEnabled: Boolean):
  questions = SHUFFLE(DB.query("SELECT * FROM assessment_questions WHERE career_id = careerId"))[0:10]
  attempt = NEW AssessmentAttempt(user_id=userId, career_id=careerId, status="in_progress",
                                  started_at=NowUTC(), expires_at=NowUTC()+15_MINS,
                                  camera_monitoring_enabled=cameraEnabled,
                                  integrity_summary={"question_ids": [q.id FOR q IN questions]})
  DB.insert(attempt); DB.commit()
  sanitizedQuestions = [StripCorrectKey(q) FOR q IN questions]
  RETURN (attempt.id, sanitizedQuestions, attempt.expires_at)
END FUNCTION

FUNCTION SubmitAssessment(attemptId: String, answers: Map, timeSpent: Integer):
  attempt = DB.query("SELECT * FROM assessment_attempts WHERE id = attemptId")
  IF attempt.status == "submitted" THEN RAISE "Already submitted" END IF
  IF NowUTC() > (attempt.expires_at + 5_MINS) THEN attempt.status = "expired"; DB.commit(); RAISE "Expired" END IF
  questions = DB.query("SELECT * FROM assessment_questions WHERE id IN attempt.integrity_summary.question_ids")
  correct = 0; reviews = []
  FOR EACH q IN questions:
    isCorr = (answers.get(q.id) == q.correct_option_id)
    IF isCorr THEN correct = correct + 1 END IF
    reviews.append(NEW ReviewItem(q.id, answers.get(q.id), q.correct_option_id, isCorr, q.explanation))
    DB.insert(NEW AssessmentAnswer(attemptId, q.id, answers.get(q.id), isCorr))
  END FOR
  attempt.score_percentage = (correct / 10.0) * 100.0
  attempt.status = "submitted"; attempt.time_spent_seconds = timeSpent; DB.commit()
  UpdateVerifiedSkills(attempt.user_id, reviews)
  RETURN AssessmentResultOut(attemptId, attempt.score_percentage, reviews)
END FUNCTION"""),

        ("7.5.5 Skill-Gap Analysis Pseudocode",
"""FUNCTION CalculateSkillGap(userId: String, careerId: String):
  reqs = DB.query("SELECT * FROM career_skill_requirements WHERE career_id = careerId")
  assessed = DB.query("SELECT * FROM skill_assessments WHERE user_id = userId")
  totGap = 0.0; totTarget = 0.0; priority = []
  FOR EACH r IN reqs:
    cur = assessed.get(r.skill_id, default=1.0)
    gap = Max(0.0, r.target_proficiency - cur)
    wt = (r.importance == "critical") ? 3.0 : ((r.importance == "high") ? 2.0 : 1.0)
    totGap = totGap + (gap * wt); totTarget = totTarget + (r.target_proficiency * wt)
    IF gap > 0.5 THEN priority.append({"skill_id": r.skill_id, "gap": gap, "wt": wt, "hours": r.learning_effort_hours}) END IF
  END FOR
  matchPct = Round((1.0 - (totGap / totTarget)) * 100.0)
  SORT priority DESCENDING BY (gap * wt)
  RETURN {"overall_match_percentage": matchPct, "priority_skills": priority}
END FUNCTION"""),

        ("7.5.6 Dual-Engine Roadmap Generation Pseudocode",
"""FUNCTION GenerateRoadmap(userId: String, careerId: String, forceRegen: Boolean):
  IF NOT forceRegen AND (exist = DB.query("SELECT * FROM roadmaps WHERE user_id=userId AND status='active'")) IS NOT NULL THEN
    RETURN exist
  END IF
  user = DB.query("SELECT * FROM profiles WHERE id = userId")
  gaps = CalculateSkillGap(userId, careerId)
  stages = NULL; isAI = False
  IF Config.GEMINI_API_KEY IS SET THEN stages, isAI = CallGeminiAPI(user, gaps) END IF
  IF NOT isAI THEN stages = GenerateDeterministicPrerequisiteGraph(careerId, gaps, user.available_hours_per_week) END IF
  roadmap = NEW Roadmap(user_id=userId, career_id=careerId, is_ai_generated=isAI, status="active")
  DB.insert(roadmap)
  FOR EACH stg IN stages:
    FOR EACH tsk IN stg.tasks:
      status = (stg.stage_number == 1 AND length(tsk.prerequisites) == 0) ? "available" : "locked"
      DB.insert(NEW RoadmapTask(roadmap_id=roadmap.id, stage_number=stg.stage_number, title=tsk.title, status=status))
    END FOR
  END FOR
  DB.commit()
  RETURN roadmap
END FUNCTION"""),

        ("7.5.7 Verifiable Certificate Generation Pseudocode",
"""FUNCTION GenerateCertificate(userId: String, achievementType: String):
  user = DB.query("SELECT * FROM profiles WHERE id = userId")
  IF achievementType == "diagnostic_distinction" THEN
    IF DB.query("SELECT * FROM assessment_attempts WHERE user_id=userId AND score_percentage >= 70.0") IS NULL THEN
      RAISE "Ineligible: Diagnostic score >= 70% required"
    END IF
  ELSE IF achievementType == "stage_completion" THEN
    IF DB.query("SELECT COUNT(*) FROM roadmap_tasks WHERE status='completed'") < 2 THEN
      RAISE "Ineligible: Stage 1 milestones incomplete"
    END IF
  END IF
  certId = "ACR-" + CurrentYear() + "-" + Upper(user.target_job_role[0:3]) + "-" + RandomHex(6)
  hash = SHA256(certId + ":" + userId + ":" + achievementType + ":" + NowUTC())
  qrCode = GenerateQR("https://aicareerpath.edu/verify?id=" + certId)
  pdfFile = BuildReportLabPDF(certId, user.full_name, achievementType, qrCode, hash)
  cert = NEW Certificate(certificate_id=certId, user_id=userId, verification_hash=hash, pdf_filename=pdfFile)
  DB.insert(cert); DB.commit()
  RETURN cert
END FUNCTION""")
    ]

    for title, code_text in pseudocode_blocks:
        story.append(Paragraph(f"<b>{title}</b>", h2_style))
        code_p = Paragraph(code_text.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style)
        t = Table([[code_p]], colWidths=[A4[0] - 108])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#cbd5e1")),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        story.append(t)
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 10))
    story.append(Paragraph("7.6 Overall System Workflow Algorithm", h1_style))
    story.append(Paragraph(
        "The end-to-end execution lifecycle of AI CareerPath coordinates student progression across ten synchronized phases as summarized below and illustrated in the architectural workflow pipeline:",
        body_style
    ))
    story.append(Paragraph(
        "1. Student authenticates via JWT; if profile completion &lt; 80%, redirects to 15-field profile view.<br/>"
        "2. Student completes academic details; system recalculates completion percentage and seeds baseline skills.<br/>"
        "3. Career Explorer calculates multi-factor compatibility scores and recommends top career tracks.<br/>"
        "4. Student initiates Diagnostic Assessment (Standard Mode / Camera Monitored); answers 10 randomized technical questions.<br/>"
        "5. Backend evaluates submission server-side, updates verified skill proficiencies, and outputs question explanations.<br/>"
        "6. Skill Gap Analysis calculates competency deficit and generates Recharts polar radar chart.<br/>"
        "7. Roadmap Generator synthesizes prerequisite-aware tasks via Gemini AI or deterministic rule engine.<br/>"
        "8. Weekly Planner schedules active tasks across 7 days based on student daily study hour availability.<br/>"
        "9. Student completes tasks, submits GitHub repository portfolio deliverables for faculty review.<br/>"
        "10. System verifies achievement criteria and compiles downloadable PDF certificate with SHA-256 verification hash and QR code.",
        body_style
    ))
    story.append(Spacer(1, 6))
    wf_flow = diagram_builders.build_workflow_7_6()
    wf_flow.append(Spacer(1, 4))
    wf_flow.append(Paragraph("<b>Fig 7.1: Overall End-to-End System Workflow Execution Pipeline</b>", caption_style))
    story.extend(wf_flow)
    story.append(PageBreak())

    # ========================== CHAPTER 8 ==========================
    story.append(Paragraph("Chapter 8", chap_num_style))
    story.append(Paragraph("SYSTEM TESTING", chap_title_style))

    story.append(Paragraph("8.1 Unit Testing", h1_style))
    story.append(Paragraph(
        "Unit testing evaluates individual components, mathematical functions, and API route controllers in isolation using Python's pytest framework. Unit tests verified password hashing divergence, JWT token signing and decoding, 15-field mathematical profile completion percentage calculations, server-side multiple-choice question grading, and SHA-256 verification hash generation.",
        body_style
    ))

    story.append(Paragraph("8.2 Integration Testing", h1_style))
    story.append(Paragraph(
        "Integration testing validates continuous workflows spanning multiple interconnected database tables and service layers. Verified integration sequences include: User Registration -&gt; Profile Sync -&gt; Career Recommendation; Diagnostic Assessment Submission -&gt; Skill Assessment Update -&gt; Skill Gap Radar Chart Recalculation; and Skill Gap -&gt; Roadmap Task Prerequisite Topological Sorting -&gt; Weekly Study Schedule Allocation.",
        body_style
    ))

    story.append(Paragraph("8.3 System Testing", h1_style))
    story.append(Paragraph(
        "System testing evaluated the complete application from the student and administrator perspectives. End-to-end tests confirmed responsive layout adaptations across desktop (1280px), tablet (768px), and mobile (375px) form factors; client-side route authorization guards; local MediaDevices webcam stream cleanup; and ReportLab PDF document rendering.",
        body_style
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph("8.4 Test Cases", h1_style))
    story.append(Paragraph(
        "The following individual tables present the results of twenty rigorous test cases executed against the live application codebase, verifying functional correctness across all implemented modules:",
        body_style
    ))

    test_cases_data = [
        ("Test Case 1: Successful Student Registration",
         "Verify that a new student can successfully create an account with valid credentials.",
         "Full Name: 'Chaithanya C', Email: '1nc24cs034@ncetmail.com', Password: 'password123'",
         "HTTP 200 OK, valid JWT access token generated, profile row inserted into database.",
         "Account created successfully; HTTP 200 returned with valid JWT access token and UserOut schema.", "Pass"),

        ("Test Case 2: Registration with Short Password",
         "Verify that registration is rejected when password is shorter than 6 characters.",
         "Full Name: 'Chaithanya C', Email: 'test@ncetmail.com', Password: '123'",
         "HTTP 422 Unprocessable Entity with Pydantic validation error message.",
         "Server returned HTTP 422 with validation error: 'String should have at least 6 characters'.", "Pass"),

        ("Test Case 3: Successful Student Authentication",
         "Verify that a registered student can authenticate with correct email and password.",
         "Email: '1nc24cs034@ncetmail.com', Password: 'password123'",
         "HTTP 200 OK, valid JWT token returned, user assigned 'student' role.",
         "Authenticated successfully; bearer token returned with 'roles': ['student'].", "Pass"),

        ("Test Case 4: Login with Incorrect Password",
         "Verify that authentication fails when an invalid password is provided.",
         "Email: '1nc24cs034@ncetmail.com', Password: 'WrongPassword999'",
         "HTTP 401 Unauthorized with detail 'Incorrect email or password'.",
         "Server returned HTTP 401 with 'detail': 'Incorrect email or password'.", "Pass"),

        ("Test Case 5: Academic Profile Update with All 15 Fields",
         "Verify updating the full 15 academic profile fields and calculating completion percentage.",
         "Level: 'Undergraduate', Degree: 'B.E.', Inst: 'NCET', Branch: 'CSE', Year: '3rd Year', Sem: 'Sem 6', Grad: '2026', Interests: ['Web'], Skills: [{'skill':'React.js','level':'Intermediate'}], Career: 'Full-Stack Developer', Study Hours: 3",
         "HTTP 200 OK, profile_completion_percentage = 100%, available_hours_per_week = 21.",
         "Profile updated successfully; completion evaluated to 100%; weekly hours updated to 21.", "Pass"),

        ("Test Case 6: Academic Profile Update with Partial Fields",
         "Verify completion percentage calculation when multiple fields are omitted or null.",
         "Updated full name only; remaining academic fields set to null or empty list.",
         "HTTP 200 OK, completion percentage calculated strictly proportional to non-empty fields (< 50%).",
         "Profile updated successfully; completion percentage calculated to 27%; no 500 errors.", "Pass"),

        ("Test Case 7: Career Recommendation Engine Execution",
         "Verify that the recommendation engine outputs rank-ordered careers based on student skills.",
         "Skills: ['HTML5 & Modern CSS', 'JavaScript (ES6+)', 'Python Programming'], Preferred: 'Full-Stack Developer'",
         "Top recommendation: 'Full-Stack Developer' with match score >= 80% and matching skill tags.",
         "Top career returned: 'Full-Stack Developer' with 95.0% match score; matching skills displayed.", "Pass"),

        ("Test Case 8: Diagnostic Assessment Launch (Standard Camera Off)",
         "Verify starting a diagnostic assessment in Standard Mode without camera access.",
         "career_id: 'full-stack-developer', camera_monitoring_enabled: false",
         "HTTP 200 OK, 10 randomized questions returned, correct answers stripped, camera inactive.",
         "10 questions received, correct_option_id absent, attempt status 'in_progress', camera off.", "Pass"),

        ("Test Case 9: Diagnostic Assessment Protection Verification",
         "Verify that server-side questions never transmit correct answers to browser client.",
         "Inspect JSON payload of POST /api/assessments/start response.",
         "Zero occurrences of 'correct_option_id' or answer indices in client payload.",
         "Confirmed: all option lists sanitized; correct keys remain exclusively in database.", "Pass"),

        ("Test Case 10: Diagnostic Assessment Submission & Server Scoring",
         "Verify submitting answers and receiving server-calculated score and explanations.",
         "attempt_id: Valid UUID, answers: Map of 10 question choices, time_spent_seconds: 120",
         "HTTP 200 OK, score percentage computed, 10 review items returned with explanations.",
         "Assessment scored successfully: 40.0% score, 4 of 10 correct, 10 question explanations provided.", "Pass"),

        ("Test Case 11: Rejection of Duplicate Assessment Submission",
         "Verify that an already submitted assessment attempt cannot be resubmitted.",
         "Resubmit payload for an attempt with status 'submitted'.",
         "HTTP 400 Bad Request with message indicating attempt is already submitted.",
         "Server returned HTTP 400: 'Cannot submit attempt: status is already submitted'.", "Pass"),

        ("Test Case 12: Assessment Integrity Event Logging",
         "Verify that client-side window blur and tab-switching are logged to the backend.",
         "attempt_id: Valid UUID, event_type: 'tab_switch', details: {'duration_ms': 1500}",
         "HTTP 200 OK, event row inserted into assessment_integrity_events.",
         "Event recorded successfully; HTTP 200 OK returned; status reflected in attempt record.", "Pass"),

        ("Test Case 13: Evidence-Based Skill Gap Analysis Calculation",
         "Verify retrieval of skill gap report and radar chart data points for target career.",
         "career_id: 'full-stack-developer', student with verified assessment history.",
         "HTTP 200 OK, overall match percentage computed, priority deficiency skills grouped.",
         "Gap report returned: match percentage calculated, priority skills ordered by gap weight.", "Pass"),

        ("Test Case 14: Roadmap Generation via Dual-Engine Architecture",
         "Verify roadmap synthesis with fallback execution when external AI key is absent.",
         "career_id: 'full-stack-developer', force_regenerate: true",
         "HTTP 200 OK, multi-stage roadmap created with DAG prerequisite task linkages.",
         "Roadmap generated successfully: 5 stages created; Stage 1 tasks unlocked; others locked.", "Pass"),

        ("Test Case 15: Roadmap Task Prerequisite Enforcement",
         "Verify that a locked task cannot be marked completed before prerequisites are done.",
         "Attempt to set status of a Stage 2 task to 'completed' while Stage 1 is incomplete.",
         "HTTP 400 Bad Request: 'Prerequisite tasks must be completed first'.",
         "Server returned HTTP 400 rejecting completion due to unsatisfied task dependencies.", "Pass"),

        ("Test Case 16: Weekly Study Planner Task Distribution",
         "Verify that open roadmap tasks are distributed across 7 days matching weekly hours.",
         "Active roadmap with open tasks, student daily study target of 2 hours/day (14 hrs/wk).",
         "HTTP 200 OK, 7 day buckets populated with cumulative duration <= 14 hours.",
         "Planner returned 7 daily schedules with allocated tasks matching 14-hour target.", "Pass"),

        ("Test Case 17: Practical Project Submission Validation",
         "Verify submitting a portfolio project with a valid GitHub repository URL.",
         "project_id: 'fsd-proj-portfolio', repository_url: 'https://github.com/student/portfolio'",
         "HTTP 200 OK, submission stored in project_submissions with status 'pending'.",
         "Submission created successfully with status 'pending'; reviewer feedback initialized.", "Pass"),

        ("Test Case 18: Ineligible Certificate Request Rejection",
         "Verify that a student with assessment score < 70% is denied distinction certificate.",
         "achievement_type: 'diagnostic_distinction', student highest score = 40%.",
         "HTTP 400 Bad Request explaining minimum 70% threshold is required.",
         "Server returned HTTP 400: 'Requires scoring at least 70% in a verified diagnostic assessment.'", "Pass"),

        ("Test Case 19: Eligible Certificate Generation & PDF Compilation",
         "Verify issuing certificate, SHA-256 hash generation, and PDF rendering for eligible student.",
         "achievement_type: 'stage_completion', student completed Stage 1 tasks.",
         "HTTP 200 OK, unique Certificate ID generated, PDF file compiled with QR code.",
         "Certificate issued (ACR-2026-FUL-5399C8), SHA-256 hash generated, PDF rendered on disk.", "Pass"),

        ("Test Case 20: Public Certificate Verification Endpoint",
         "Verify that third-party evaluators can validate certificate legitimacy by ID.",
         "Query GET /api/certificates/verify/ACR-2026-FUL-5399C8",
         "HTTP 200 OK, valid: true, recipient name, issue date, criteria summary returned.",
         "Verification successful: returns valid status, student full name, and criteria summary.", "Pass")
    ]

    table_header_style = ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.HexColor("#0f172a"))
    table_cell_style = ParagraphStyle('TD', fontName='Helvetica', fontSize=7.5, leading=9.5, textColor=colors.HexColor("#1e293b"))
    status_pass_style = ParagraphStyle('Pass', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.HexColor("#16a34a"))

    for tc_title, desc, inp, exp, act, stat in test_cases_data:
        story.append(Paragraph(f"<b>{tc_title}</b>", h2_style))
        data = [
            [Paragraph("Description", table_header_style),
             Paragraph("Input", table_header_style),
             Paragraph("Expected Output", table_header_style),
             Paragraph("Actual Result", table_header_style),
             Paragraph("Status", table_header_style)],
            [Paragraph(desc, table_cell_style),
             Paragraph(inp, table_cell_style),
             Paragraph(exp, table_cell_style),
             Paragraph(act, table_cell_style),
             Paragraph(stat, status_pass_style)]
        ]
        t = Table(data, colWidths=[110, 100, 115, 115, 48])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t)
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ========================== CHAPTER 9 ==========================
    story.append(Paragraph("Chapter 9", chap_num_style))
    story.append(Paragraph("CONCLUSION AND FUTURE ENHANCEMENT", chap_title_style))

    story.append(Paragraph("9.1 Conclusion", h1_style))
    story.append(Paragraph(
        "The development and implementation of the <b>AI Career &amp; Smart Roadmap System (AI CareerPath)</b> successfully resolves fundamental challenges encountered by technical engineering students during career navigation, competency benchmarking, and personalized skill acquisition. By integrating modern, type-safe frontend technologies (React 18, Vite, TypeScript, Tailwind CSS, Recharts) with an asynchronous, modular backend architecture (FastAPI, Python 3.13, SQLAlchemy, Pydantic v2), the platform transitions career guidance from subjective, generic advice into an objective, data-driven, and evidence-based software ecosystem.",
        body_style
    ))
    story.append(Paragraph(
        "The system realizes nine robust functional modules: 15-dimensional Academic Profile Management; Multi-Factor Explainable Career Matching across 12 modern technical disciplines; Protected Diagnostic Assessments with local video integrity monitoring and server-evaluated answer keys; Mathematical Skill Gap Quantification with multi-axis radar visualizations; Dual-Engine Prerequisite-Aware Roadmap Generation (combining Gemini AI with deterministic offline rule graphs); Curated Educational Resources and Milestone Project Tracking; Weekly Study Hour Planning; Verifiable Cryptographic PDF Certification embedded with SHA-256 hashes and QR verification codes; and Institutional Mentor Governance Workflows.",
        body_style
    ))
    story.append(Paragraph(
        "By enforcing strict prerequisite task dependencies, safeguarding examination integrity, adapting learning schedules dynamically to student time budgets, and providing instant third-party credential verification, AI CareerPath equips collegiate learners with an actionable, verifiable, and structured pathway to industry readiness.",
        body_style
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph("9.2 Future Enhancement", h1_style))
    future_points = [
        ("Integration with Real-Time Job Market APIs:", "Ingesting live postings from platforms like LinkedIn and Indeed to dynamically update skill requirement weights based on current market demand."),
        ("Automated Code Execution and Sandbox Evaluation:", "Incorporating WebAssembly or Docker sandbox environments to evaluate code solutions automatically alongside multiple-choice diagnostic tests."),
        ("Predictive Cohort Performance Analytics:", "Developing machine learning regression models to forecast course completion velocity and identify student dropout risks proactively."),
        ("Mobile Application Expansion:", "Developing React Native or Flutter mobile applications supporting offline learning agendas, flashcards, and push notification milestone reminders."),
        ("WebRTC Peer and Mentor Collaboration Channels:", "Implementing real-time video pair programming and mock technical interview scheduling directly within the portal."),
        ("Expanded Emerging Career Tracks:", "Broadening curriculum models to cover Quantum Computing, Bio-Informatics, Edge IoT/Robotics, and Blockchain Engineering.")
    ]
    for title, desc in future_points:
        story.append(Paragraph(f"• <b>{title}</b> {desc}", bullet_style))

    story.append(PageBreak())

    # ========================== REFERENCES ==========================
    story.append(Paragraph("REFERENCES", chap_title_style))
    refs = [
        "R. Vadisetty and A. Polamarasetti (2024), “AI-Augmented Skill Development Roadmaps: Tailoring 12-Month Learning Paths for Future-Ready Careers in Education 4.0 and Industry 4.0.”",
        "G. Lian, L. Shi, and Y. Wang (2025), “AI-Driven Trinitarian Model for Vocational Education Internationalization: Digital Silk Road Practices in ASEAN and Africa.”",
        "J. Simić and A. C. Abbah (2025), “Artificial Intelligence as a National Interest of China: Common Achievements with the Belt and Road Initiative Countries and South-South Cooperation.”",
        "R. Sreevatsan, J. S. R. Ahamed, and A. B. H. Be (2026), “Interactive Career Roadmap Website: Career Paths with Progress Tracking and AI Guided Recommendations.”",
        "Y. Fettach, A. Bahaj, and M. Ghogho (2024), “JobEdKG: An Uncertain Knowledge Graph-Based Approach for Recommending Online Courses and Predicting In-Demand Skills Based on Career Choices.”",
        "X. Xu and H. Gao (2026), “A Knowledge Graph-Integrated Recommendation Method for College Student Career Planning.”",
        "S. Seesukong et al. (2024), “CARIA: A Personalized Career Recommender Based on Individual Competency Similarity Measure.”",
        "M. Vamshi Vardhan et al. (2026), “GenAI Skill Gap Analyser and Personalized Learning Path Recommendation.”",
        "S. K. Mohapatra, P. Jena, and S. R. Dash (2025), “Ontology-Driven Competency Mapping and Career Pathway Recommendation for Technical Education.”",
        "A. R. Patel and M. K. Sharma (2025), “Machine Learning Approaches for Curriculum Sequencing and Skill Gap Detection in Higher Education.”",
        "Yaqi Lian and Feng He (2026), “A Reinforcement Learning-Based Framework for Personalized Career Recommendations Among College Students,” Journal of Advanced Computational Intelligence and Intelligent Informatics, Vol. 30, No. 5.",
        "T. V. Sree Vastha, R. Raja Subramanian, P. Thisyanth, T. Venu Babu and P. Srikanth (2026), “CareerAstra: An AI-Powered Hybrid Recommendation System for Career Guidance of Indian Students,” Proc. of Int. Conf. on Intelligent Systems for a Sustainable Future.",
        "Junshu Jiang, Songyun Ye, Wei Wang, Jingran Xu and Xiaosheng Luo (2020), “Learning Effective Representations for Person-Job Fit by Feature Fusion,” Proc. of the 29th ACM CIKM.",
        "Ziyang Wang, Wei Wei, Chenwei Xu, Jun Xu and Xian-Ling Mao (2022), “Person-Job Fit Estimation from Candidate Profile and Related Recruitment History with Co-Attention Neural Networks,” Neurocomputing, Vol. 501.",
        "Gongwen Xu, Guangyu Jia, Lin Shi and Zhijun Zhang (2021), “Personalized Course Recommendation System Fusing with Knowledge Graph and Collaborative Filtering,” Computational Intelligence and Neuroscience.",
        "Chunhong Liu, Haoyang Zhang, Jieyu Zhang, Zhengling Zhang and Peiyan Yuan (2023), “Design of a Learning Path Recommendation System Based on a Knowledge Graph,” Int. J. of Information and Communication Technology Education, Vol. 19, No. 1.",
        "Amir Hossein Nabizadeh, José Paulo Leal, Hamed N. Rafsanjani and Rajiv Ratn Shah (2020), “Learning Path Personalization and Recommendation Methods: A Survey of the State-of-the-Art,” Expert Systems with Applications, Vol. 159.",
        "Qianyi Gu (2024), “Personalized Learning Path Recommendation Based on Knowledge Graph.”",
        "Xin Xie and Xiangyang Feng (2025), “Personalized Learning Path Recommendation Based on Learner Profile and Knowledge Graph,” Computing and Informatics, Vol. 44, No. 4.",
        "IEEE Big Data (2024), “Personalized Learning Path Recommendations: Fusing Knowledge Graph Embedding, Sequence Mining, and Collaborative Filtering,” IEEE International Conference on Big Data.",
        "Fielding, R. T. (2000), “Architectural Styles and the Design of Network-based Software Architectures,” Doctoral dissertation, University of California, Irvine.",
        "Tiangolo, S. (2024), “FastAPI Framework Documentation and Modern Web API Architecture Guidelines.”",
        "Google DeepMind (2024), “Gemini API: Structured Output Enforcement and Schema Validation.”",
        "ReportLab Europe (2024), “ReportLab PDF Generation User Guide (Version 4.x/5.x).”"
    ]
    for idx, ref in enumerate(refs, 1):
        story.append(Paragraph(f"[{idx}] {ref}", ParagraphStyle('Ref', parent=body_style, fontSize=8.5, leading=12, leftIndent=20, firstLineIndent=-15)))

    story.append(PageBreak())

    # ========================== APPENDIX A ==========================
    story.append(Paragraph("APPENDIX A: ACRONYMS", chap_title_style))
    acronyms = [
        ("AI", "Artificial Intelligence"),
        ("API", "Application Programming Interface"),
        ("B.E.", "Bachelor of Engineering"),
        ("B.Tech", "Bachelor of Technology"),
        ("CORS", "Cross-Origin Resource Sharing"),
        ("CSE", "Computer Science and Engineering"),
        ("CSS", "Cascading Style Sheets"),
        ("DAG", "Directed Acyclic Graph"),
        ("DBMS", "Database Management System"),
        ("FSD", "Full-Stack Developer"),
        ("HTML", "HyperText Markup Language"),
        ("HTTP/HTTPS", "HyperText Transfer Protocol / Secure"),
        ("IDE", "Integrated Development Environment"),
        ("IEEE", "Institute of Electrical and Electronics Engineers"),
        ("JSON", "JavaScript Object Notation"),
        ("JWT", "JSON Web Token"),
        ("LLM", "Large Language Model"),
        ("ML", "Machine Learning"),
        ("NCET", "Nagarjuna College of Engineering and Technology"),
        ("ORM", "Object-Relational Mapping"),
        ("PDF", "Portable Document Format"),
        ("QR", "Quick Response (Code)"),
        ("RBAC", "Role-Based Access Control"),
        ("REST", "Representational State Transfer"),
        ("SHA", "Secure Hash Algorithm"),
        ("SPA", "Single Page Application"),
        ("SQL", "Structured Query Language"),
        ("UI/UX", "User Interface / User Experience"),
        ("URL", "Uniform Resource Locator"),
        ("UUID", "Universally Unique Identifier"),
        ("Vite", "Frontend Tooling (French for 'Fast')")
    ]
    acr_data = [[Paragraph("<b>Acronym</b>", table_header_style), Paragraph("<b>Complete Expansion</b>", table_header_style)]]
    for acr, exp in acronyms:
        acr_data.append([Paragraph(f"<b>{acr}</b>", table_cell_style), Paragraph(exp, table_cell_style)])

    acr_table = Table(acr_data, colWidths=[120, A4[0] - 228])
    acr_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(acr_table)

    story.append(Spacer(1, 14))
    story.append(Paragraph("APPENDIX B: SYSTEM SCREEN SNAPSHOTS & USER INTERFACE WALKTHROUGH", chap_title_style))
    story.append(Paragraph("This appendix provides comprehensive, high-resolution evidence of the working platform across all key interaction surfaces, diagnostic proctoring rooms, and verifiable credential workflows.", body_style))
    story.append(Spacer(1, 10))

    snapshots_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "snapshots"))

    snapshots = [
        ("Snapshot B.1 – Public Landing Page & Demo Portal", "Displays the hero header, core platform highlights, and one-click demo access button configured for student Chaithanya (3rd Year CSE).", "Snapshot_B1_Landing_Page.png"),
        ("Snapshot B.2 – Student Registration & Authentication Modal", "Displays secure sign-up and sign-in dialogs implementing bcrypt encryption, JWT token exchange, and validation error alerting.", "Snapshot_B2_Authentication_Modal.png"),
        ("Snapshot B.3 – Student Academic Profile Management View", "Displays the comprehensive 15-field profile editor, multi-select tag inputs, daily study hours slider, and real-time profile completion percentage indicator bar.", "Snapshot_B3_Academic_Profile.png"),
        ("Snapshot B.4 – Dashboard Overview View", "Central hub showcasing personalized welcome greetings, roadmap progress percentage, tasks completed counter, weekly study target, overall career match score, and next recommended learning actions.", "Snapshot_B4_Dashboard_Overview.png"),
        ("Snapshot B.5 – Career Explorer & Recommendation View", "Displays interactive career role cards, salary expectations, prerequisite listings, and computed match percentages based on student competencies.", "Snapshot_B5_Career_Explorer.png"),
        ("Snapshot B.6 – Timed Diagnostic Assessment Room", "Features the 15-minute countdown clock, voluntary camera monitoring toggle, question navigation palette, code snippet displays, and option selectors.", "Snapshot_B6_Diagnostic_Assessment_Room.png"),
        ("Snapshot B.7 – Diagnostic Score Report & Question Review", "Displays the student's evaluated percentage, correct vs. incorrect breakdown, category mastery analysis, and per-question technical explanations.", "Snapshot_B7_Diagnostic_Score_Report.png"),
        ("Snapshot B.8 – Skill Gap Analysis & Multi-Axis Radar Visualization", "Renders the Recharts polar radar chart contrasting assessed proficiency against career benchmarks, accompanied by prioritized deficiency badges.", "Snapshot_B8_Skill_Gap_Radar.png"),
        ("Snapshot B.9 – Prerequisite-Aware Learning Roadmap View", "Displays the stage-by-stage learning curriculum, prerequisite task status indicators (locked, available, in_progress, completed), and deliverable upload links.", "Snapshot_B9_Learning_Roadmap.png"),
        ("Snapshot B.10 – Weekly Study Planner Agenda", "Displays the 7-day calendar allocating open tasks to meet daily study hour targets with time tracking buttons.", "Snapshot_B10_Weekly_Study_Planner.png"),
        ("Snapshot B.11 – Curated Learning Resources & Capstone Project Repository", "Displays filterable technical documentation links, video tutorials, and structured project specifications with milestone checklists.", "Snapshot_B11_Resources_And_Projects.png"),
        ("Snapshot B.12 – Verifiable Certificate Generation & Public Verification Portal", "Displays the generated PDF certificate with embedded SHA-256 verification hash, dynamic QR code, and the public lookup endpoint confirming student achievement.", "Snapshot_B12_Verifiable_Certificate_Portal.png")
    ]

    for snap_title, snap_desc, snap_img in snapshots:
        img_path = os.path.join(snapshots_dir, snap_img)
        card_content = [
            [Paragraph(f"<b>{snap_title}</b>", ParagraphStyle('SnapTitle', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor("#1e3a8a")))],
            [Paragraph(snap_desc, ParagraphStyle('SnapDesc', fontName='Helvetica', fontSize=8, leading=11, textColor=colors.HexColor("#334155")))]
        ]
        if os.path.exists(img_path):
            card_content.append([Image(img_path, width=470, height=265)])

        card = Table(card_content, colWidths=[A4[0] - 108])
        card.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#eff6ff")),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#f8fafc")),
            ('BACKGROUND', (0,2), (-1,2), colors.HexColor("#0f172a")),
            ('ALIGN', (0,2), (-1,2), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#93c5fd")),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(KeepTogether([card, Spacer(1, 12)]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"COMPLETE_REPORT_GENERATED_SUCCESSFULLY: {output_filename}")

if __name__ == "__main__":
    build_pdf()
