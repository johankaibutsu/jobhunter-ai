# JobHunter AI

JobHunter AI is an intelligent, all-in-one career assistant powered by Google's Gemini 2.5 model. It helps job seekers optimize their resumes, find relevant job opportunities using real-time data, analyze job descriptions for compatibility, and practice for interviews with an AI coach.

## Features

*   **Dashboard**

*   **Authentication & Profiles**
    *   Secure Sign Up/Login via Supabase.
    *   **Demo Mode** for instant testing without registration.
    *   User profile management (details, target role, saved jobs).

*   **Resume Optimizer**
    *   Upload PDF resumes or paste text.
    *   Get an instant **ATS Compatibility Score** (0-100).
    *   Receive AI-driven feedback on strengths, weaknesses, and improvements.
    *   **Auto-Rewrite**: The AI generates an improved version of your resume.
    *   **PDF Export**: Download the improved resume directly as a PDF.

*   **Smart Job Search**
    *   **Google Search Grounding**: Uses Gemini to find *real, active* job listings on the web.
    *   **Match My Resume**: Automatically generates search queries based on your uploaded resume context.
    *   **Advanced Filters**: Filter by Date Posted, Experience Level, and Minimum Salary.
    *   Save interesting jobs to your profile.

*   **Job Matcher**
    *   Compare your resume against a specific Job Description (JD).
    *   Get a **Match Score** and analysis of skill gaps.
    *   Identify missing keywords critical for passing ATS screens.
    *   Assess cultural fit based on the JD tone.

*   **Interview Coach**
    *   In Development


## Tech Stack

*   **Frontend:** React 18, Vite, TypeScript
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **AI & Data:** Google GenAI SDK (Gemini 2.5 Flash), Recharts (Visualization)
*   **Backend/Auth:** Supabase (PostgreSQL + Auth)
*   **Utilities:** jsPDF (PDF Generation), React Markdown

## How to Run Locally

### Prerequisites
1.  Node.js (v18 or higher) installed.
2.  A **Google Cloud / AI Studio** API Key.
3.  A **Supabase** project (free tier works).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/jobhunter-ai.git
    cd jobhunter-ai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create an env file named `.env` or `.env.local` and fill in your keys:
    ```bash
    # .env
    API_KEY=your_gemini_api_key
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Setup Database (Supabase)**
    *   Go to your Supabase Dashboard -> **SQL Editor**.
    *   Copy the contents of the `supabase_setup.sql` file included in this project.
    *   Run the script to create the `profiles` and `saved_jobs` tables and enable security policies.
    *   *Optional:* Go to Authentication -> URL Configuration and add `http://localhost:5173/**` to Redirect URLs.

5.  **Run the App**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

## Future Scope

*   **Cover Letter Generator:** Auto-generate cover letters based on the resume + specific job description.
*   **Voice Interview Mode:** Use Gemini Live API to support real-time voice conversations for the Interview Coach.
*   **Community:** Anonymous salary sharing and interview experience discussions. (Not sure about this one yet)

---

I license anyone to use this code for any purpose, including commercial use, and to modify it, as long as they give credit to the original author and provide a link to the original repository.
