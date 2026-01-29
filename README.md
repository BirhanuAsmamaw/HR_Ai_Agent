# HR Assistant - AI-Powered Recruitment Platform

HR Assistant is a modern, AI-enhanced recruitment platform designed to streamline the hiring process. By leveraging the power of Google's Gemini AI, it automates resume screening and candidate communication, allowing HR professionals to focus on finding the best talent.

## Features

*   **Job Management:** Create and manage job postings with specific requirements.
*   **Applicant Tracking:** Centralized dashboard to view and manage all applicants.
*   **AI Resume Scoring:** Automatically evaluates resumes against job descriptions using Gemini AI, providing a score (0-100), matching skills, and a verdict (Shortlist/Reject).
*   **AI Email Generation:** Generates personalized emails for candidates based on their application status (Shortlisted, Rejected, Interview Invite) using AI.
*   **Interview Scheduling:** Integrated scheduler for setting up interviews (features Google Calendar integration via service account).
*   **Secure Authentication:** Powered by Supabase Auth for secure HR user access.
*   **Modern UI:** Built with React, Tailwind CSS, and Radix UI for a clean and responsive experience.

## Tech Stack

### Frontend
*   **Framework:** React
*   **Styling:** Tailwind CSS, Radix UI, Lucide React (Icons)
*   **State Management/Data Fetching:** TanStack Query, Zustand
*   **Http Client:** Axios

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** Supabase (PostgreSQL)
*   **AI Model:** Google Gemini (Generative AI)
*   **Email Service:** SendGrid & Node-Mailer
*   **File Parsing:** pdf-parse, multer

## Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn
*   Supabase Account
*   Google Gemini API Key
*   SendGrid API Key (optional, for email features)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd hr-assistant
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend/` directory with the following variables:
    ```env
    PORT=4000
    SUPABASE_URL=<your_supabase_url>
    SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
    GEMINI_API_KEY=<your_gemini_api_key>
    SENDGRID_API_KEY=<your_sendgrid_key>
    SENDGRID_FROM_EMAIL=<your_verified_sender_email>
    EMAIL_USER=<your_email_address>
    EMAIL_PASSWORD=<your_email_password>
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend Server**
    ```bash
    cd backend
    node server.js
    ```
    The server will start on `http://localhost:4000`.

2.  **Start the Frontend Client**
    ```bash
    cd frontend
    npm start
    ```
    The application will open at `http://localhost:3000`.

## License
[MIT](LICENSE)
# HR_Ai-agent
# HR_Ai-agent
# HR_Ai-agent
# HR_Ai_Agent
