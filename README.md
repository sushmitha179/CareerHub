# CareerHub 🚀
### AI-Powered Placement & Recruitment Platform
Built using Next.js, TypeScript, Prisma, PostgreSQL, NextAuth, OpenAI, and UploadThing.
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![License](https://img.shields.io/badge/license-MIT-purple)

CareerHub is a full-stack placement and recruitment platform built with Next.js and TypeScript.

The platform enables students to discover opportunities, upload resumes, and receive AI-powered ATS feedback, while recruiters can create job postings, review applications, and manage the hiring workflow.

---

## Live Demo

🔗 https://career-hub-lemon.vercel.app

## Repository

🔗 https://github.com/sushmitha179/CareerHub

---

## Key Highlights

✔ Google Authentication with NextAuth

✔ Role-based access control (Student / Recruiter)

✔ AI Resume Analyzer with ATS feedback

✔ Resume upload and retrieval with UploadThing

✔ Job application tracking system

✔ Recruiter dashboard and applicant management

✔ PostgreSQL database with Prisma ORM

✔ Fully deployed on Vercel


## Features

### Authentication

* Google Authentication using NextAuth
* Secure session management
* Role-based access control (Student / Recruiter)

---

### Student Features

* Personalized student dashboard
* Browse and apply for jobs
* Track application status
* Resume upload with UploadThing
* View and download uploaded resumes
* AI Resume Analyzer with ATS feedback

---

### Recruiter Features

* Recruiter/company dashboard
* Create and manage job postings
* View student applications
* Access uploaded resumes
* Manage recruitment workflow

---

### AI Features

* Resume text extraction from PDF
* ATS score calculation
* Keyword extraction and matching
* Skill extraction from resumes
* Missing keyword detection
* AI-generated improvement suggestions
* Suggested job roles based on skills

---

## Tech Stack

* Next.js
* TypeScript
* Prisma ORM
* PostgreSQL (Neon DB)
* NextAuth
* UploadThing
* OpenAI API
* Tailwind CSS
* Vercel

---

## Architecture

* Frontend: Next.js + Tailwind CSS
* Backend: Next.js API Routes
* Database: PostgreSQL (Neon DB)
* Authentication: NextAuth (Google OAuth)
* File Uploads: UploadThing
* AI Integration: OpenAI API
* ORM: Prisma
* Deployment: Vercel

---

## Screenshots

### Student Dashboard Interface

<img width="1920" height="1080" alt="Student Dashboard" src="https://github.com/user-attachments/assets/ac28c12c-8709-4824-9786-302ec5ceb399" />

---

### Recruiter Management Dashboard

<img width="1920" height="1080" alt="Recruiter Dashboard" src="https://github.com/user-attachments/assets/f05b36f7-8163-4449-85e6-0a5cdf691420" />

---

### AI Resume Analyzer

<img width="1920" height="1080" alt="Resume Analyzer" src="https://github.com/user-attachments/assets/3b273f4b-99a8-4a46-96db-2c5087a56ada" />

The AI Resume Analyzer evaluates ATS compatibility, extracts skills, detects missing keywords, and provides improvement suggestions.

---

## Folder Structure

```bash
app/
components/
lib/
prisma/
public/
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/sushmitha179/CareerHub.git
```

Navigate to the project folder:

```bash
cd CareerHub
```

Install dependencies:

```bash
npm install
```

Add environment variables in `.env`:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENAI_API_KEY=
UPLOADTHING_TOKEN=
```

Run the development server:

```bash
npm run dev
```

---

## Future Enhancements

- Smart job recommendation system
- Email notifications
- Recruiter analytics dashboard
- Skill-gap analysis and learning recommendations
- Interview preparation assistant using AI

---

## Author

**Singam Sushmitha**

GitHub:
https://github.com/sushmitha179

LinkedIn:
www.linkedin.com/in/singam-sushmitha

Email:
sushmithasingam179@gmail.com

---

## License

This project is intended for educational and portfolio purposes.

---

⭐ If you like this project, consider starring the repository.
