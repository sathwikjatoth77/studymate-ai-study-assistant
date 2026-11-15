# StudyMate – AI Study Assistant

StudyMate is an AI-powered study assistant that converts study topics and notes into interactive flashcards and multiple-choice quizzes. It helps students revise concepts and test their understanding.

## Features

- **AI-generated flashcards:** Generate flashcards from topics or pasted study notes.
- **Interactive flashcards:** Flip cards to reveal answers and navigate between cards.
- **AI-generated quizzes:** Generate multiple-choice questions with four answer options.
- **Instant feedback:** Check answers and view explanations.
- **Score tracking:** View quiz scores and incorrect answers.
- **Retry functionality:** Retry incorrectly answered questions.
- **Responsive interface:** Designed to work on desktop and mobile screens.
- **Error handling:** Handles empty input, API errors, invalid responses, and loading states.

## Tech Stack

**Frontend**
- React
- JavaScript
- CSS
- Vite

**Backend**
- Node.js
- Express.js
- Google Gemini API
- Google GenAI SDK
- dotenv
- CORS

## Project Structure

```text
study-assistant/
├── public/
├── server/
│   └── index.js
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/sathwikjatoth77
cd study-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the environment variable

Create a `.env` file in the project root.

Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get an API key from Google AI Studio:

https://aistudio.google.com/apikey

Never share or commit your actual API key.

### 4. Start the backend

Open a terminal and run:

```bash
npm run server
```

The backend runs at:

`http://localhost:5000`

### 5. Start the frontend

Open another terminal and run:

```bash
npm run dev
```

Open the local Vite URL displayed in the terminal, usually:

`http://localhost:5173`

## How to Use

1. Open StudyMate in your browser.
2. Enter a study topic or paste your notes.
3. Click **Generate Study Set**.
4. Review the generated flashcards.
5. Click a flashcard to reveal its answer.
6. Attempt the multiple-choice quiz.
7. Check your answers and read the explanations.
8. Review your score and retry incorrect questions.

## AI Integration

StudyMate uses the Google Gemini API through a Node.js and Express backend.

The backend receives the user's topic or notes, sends a structured generation prompt to Gemini, and returns flashcards and quiz questions in JSON format.

The generated response is validated before it is sent to the frontend.

The API key is stored in an environment variable and is not exposed in the React frontend.

## Error Handling

The application includes handling for:

- Empty study input.
- Failed API requests.
- Invalid JSON responses.
- Missing or incorrectly structured AI-generated content.
- Loading states during generation.
- Cancellation of previous requests when a new generation request starts.

## Limitations

- An active internet connection is required for Gemini API requests.
- Generation depends on Gemini API availability and applicable usage limits.
- Generated study material may occasionally contain inaccuracies and should be reviewed.
- Study sessions and quiz progress are not currently saved permanently.

## AI Usage Disclosure

AI tools were used as development assistance for understanding React concepts, debugging, improving code structure, and implementing parts of the application.

The application uses the Google Gemini API to generate study materials. The implementation and functionality were tested locally.

## Time Spent

Approximately **[enter your actual total development time]** hours.

## Future Improvements

- Save flashcards and quiz progress.
- Add user accounts and authentication.
- Support different quiz difficulty levels.
- Allow exporting flashcards.
- Add subject-wise study history.

---

Developed as part of a Software Engineering Internship assignment.
