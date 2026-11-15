
import process from "node:process";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const app = express()
const PORT = 5000

app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use(express.json({ limit: '100kb' }))

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing. Check your .env file.')
  process.exit(1)
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

app.get('/', (req, res) => {
  res.send('StudyMate backend is running!')
})

// Generate flashcards and quiz questions using Gemini
app.post('/api/generate', async (req, res) => {
  try {
    const { topic } = req.body

    if (typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        error: 'Please provide a topic or study notes.'
      })
    }

    if (topic.length > 12000) {
      return res.status(400).json({
        error: 'Please keep your notes under 12,000 characters.'
      })
    }

    const prompt = `
You are an educational assistant.

Create study material using only the topic or notes below.

TOPIC OR NOTES:
${topic}

Return valid JSON only, using exactly this structure:
{
  "flashcards": [
    {
      "question": "A short question",
      "answer": "A clear and useful answer"
    }
  ],
  "quiz": [
    {
      "question": "A multiple-choice question",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Requirements:
- Create 5 flashcards.
- Create 5 quiz questions.
- Every quiz must have exactly 4 options.
- The answer must be the zero-based index of the correct option (0, 1, 2, or 3).
- Make questions clear and educational.
- Do not include markdown or text outside the JSON.
`

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    })

    const result = JSON.parse(response.text)

    // Validate the AI response before sending it to the frontend
    if (
      !Array.isArray(result.flashcards) ||
      !Array.isArray(result.quiz) ||
      result.flashcards.length === 0 ||
      result.quiz.length === 0
    ) {
      throw new Error('Gemini returned an invalid study set.')
    }

    const validFlashcards = result.flashcards.every((card) =>
      typeof card.question === 'string' &&
      card.question.trim() &&
      typeof card.answer === 'string' &&
      card.answer.trim()
    )

    const validQuiz = result.quiz.every((question) =>
      typeof question.question === 'string' &&
      question.question.trim() &&
      Array.isArray(question.options) &&
      question.options.length === 4 &&
      question.options.every((option) => typeof option === 'string') &&
      Number.isInteger(question.answer) &&
      question.answer >= 0 &&
      question.answer < 4 &&
      typeof question.explanation === 'string'
    )

    if (!validFlashcards || !validQuiz) {
      throw new Error('Gemini returned incomplete or invalid questions.')
    }

    res.json({
      flashcards: result.flashcards,
      quiz: result.quiz
    })
  } catch (error) {
    console.error('Study material generation failed:', error.message)

    res.status(500).json({
      error: 'Unable to generate study material. Please try again.'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
