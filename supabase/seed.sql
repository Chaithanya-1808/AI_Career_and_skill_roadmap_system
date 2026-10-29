-- ====================================================================
-- AI Career & Smart Roadmap System - Supabase Seed Data
-- ====================================================================

-- 1. Skills
INSERT INTO skills (id, name, category, description, prerequisite_skill_ids)
VALUES
('c-programming', 'C Programming', 'Programming Fundamentals', 'Syntax, pointers, memory allocation, and compilation in C.', '[]'::jsonb),
('python-programming', 'Python Programming', 'Programming Fundamentals', 'Python syntax, data types, OOP, modules, and standard library.', '[]'::jsonb),
('javascript', 'JavaScript (ES6+)', 'Web Development', 'Variables, arrow functions, promises, async/await, DOM, and event loop.', '[]'::jsonb),
('html-css', 'HTML5 & Modern CSS', 'Web Development', 'Semantic markup, flexbox, CSS grid, responsiveness, and accessibility.', '[]'::jsonb),
('react', 'React.js', 'Frontend Development', 'Components, JSX, props, state, hooks, lifecycle, and component composition.', '["javascript", "html-css"]'::jsonb),
('nodejs-express', 'Node.js & Express', 'Backend Development', 'Event-driven runtime, routing, middleware, REST APIs, and error handling.', '["javascript"]'::jsonb),
('sql-databases', 'Relational Databases & SQL', 'Databases', 'Table design, constraints, SELECT queries, JOINs, aggregations, indexing.', '[]'::jsonb),
('data-structures', 'Data Structures & Algorithms', 'Computer Science', 'Arrays, linked lists, stacks, queues, trees, sorting, and complexity analysis.', '["c-programming"]'::jsonb),
('git-github', 'Git & Version Control', 'Software Engineering', 'Repository management, branching, commits, pull requests, and merges.', '[]'::jsonb),
('docker-containers', 'Docker & Containers', 'DevOps & Cloud', 'Dockerfiles, image building, container lifecycle, and Docker Compose.', '[]'::jsonb),
('api-security', 'Web Security & Authentication', 'Cybersecurity', 'JWT, password hashing, CORS, XSS, CSRF, and input sanitization.', '["nodejs-express"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Careers
INSERT INTO career_profiles (id, title, overview, responsibilities, foundational_skills, technical_skills, soft_skills, prerequisites, recommended_projects, suggested_certifications, entry_level_roles, learning_resources, roadmap_outline, proficiency_expectations)
VALUES
(
    'full-stack-developer',
    'Full-Stack Developer',
    'Designs, implements, and maintains both client-side user interfaces and server-side services, databases, and APIs.',
    '["Build interactive, responsive web applications", "Develop resilient RESTful backend APIs", "Model relational database schemas", "Implement secure authentication and authorization", "Write automated tests"]'::jsonb,
    '["HTML5 & Modern CSS", "JavaScript (ES6+)", "Git & Version Control"]'::jsonb,
    '["React.js", "Node.js & Express", "Relational Databases & SQL", "Web Security & Authentication", "Docker & Containers"]'::jsonb,
    '["Systematic Debugging", "Collaborative Code Review", "Clear Technical Communication"]'::jsonb,
    '["Basic programming concept understanding", "Problem-solving aptitude"]'::jsonb,
    '["Personal Portfolio Website", "Interactive Task Tracker", "Full-Stack REST & SQL Web Application"]'::jsonb,
    '["Meta Front-End / Back-End Professional Certificate", "freeCodeCamp Full Stack Developer"]'::jsonb,
    '["Junior Full-Stack Engineer", "Associate Software Engineer", "Graduate Web Developer"]'::jsonb,
    '[{"title": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Learn"}]'::jsonb,
    '[{"stage": 1, "title": "Foundations & Responsive Frontend", "weeks": "1-3"}, {"stage": 2, "title": "Core JavaScript & Modern React", "weeks": "4-7"}, {"stage": 3, "title": "Server Architecture & REST APIs", "weeks": "8-11"}, {"stage": 4, "title": "Database Design & SQL Persistence", "weeks": "12-14"}, {"stage": 5, "title": "Full-Stack Integration, Security & Deployment", "weeks": "15-16"}]'::jsonb,
    '{"html-css": 4.5, "javascript": 4.0, "react": 4.0, "nodejs-express": 4.0, "sql-databases": 3.5, "git-github": 4.0}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
