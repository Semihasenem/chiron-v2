# Chiron Experiment

**Chiron** is a research-focused chat application designed to explore psychological well-being through AI-mediated conversations. It acts as a digital "Insight Guide" (İçgörü Rehberi), helping users reflect on their thoughts and feelings using Socratic questioning and cognitive reframing techniques. This project focuses on the *Experiment* phase, where users participate in a structured session to evaluate the efficacy of AI in providing psychological support.

## 🛠️ Technologies Used

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI Model**: [Google Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/) (via Vercel AI SDK)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

## 🔐 Environment Variables

Create a `.env.local` file in the root directory and add the following keys. These are required for Firebase connection and the AI chat functionality.

```env
# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🚀 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/chiron-experiment.git
    cd chiron-experiment
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  **Open the application:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
chiron-experiment/
├── app/                  # Next.js App Router directory
│   ├── api/              # API routes (Chat endpoint)
│   │   └── chat/         # Handles AI streaming response
│   ├── experiment/       # Main experiment flow (Survey -> Chat -> Post-test)
│   ├── info/             # Research information page
│   └── page.tsx          # Landing page
├── components/           # Reusable UI components (ChatInterface, etc.)
├── lib/                  # Utility functions
│   └── firebase.ts       # Firebase initialization and helper functions
├── public/               # Static assets (images, icons)
└── ...config files       # tailwind, next.config, tsconfig, etc.
```

## ✨ Key Features

-   **Interactive Landing Page**: A visually engaging introduction to the project mission with smooth animations.
-   **AI Chat Interface**: Real-time streaming chat with Chiron, an AI persona engaged in Socratic dialogue with the user.
-   **Experiment Flow**: A structured path for participants:
    1.  **Info**: Understanding the research scope.
    2.  **Experiment**: Pre-survey (demographics), Chat Session (interaction with AI), and potentially Post-Survey data collection.
-   **Firebase Integration**: Secure logging of consent, participant metadata, and anonymized chat logs for research analysis.

## 📜 Scripts

-   `npm run dev`: Starts the local development server.
-   `npm run build`: Builds the application for production.
-   `npm start`: Runs the built application in production mode.
-   `npm run lint`: Runs ESLint to check for code quality issues.
