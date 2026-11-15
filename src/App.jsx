
import { useEffect, useRef, useState } from 'react'
import './App.css'

const sampleCards = [
  {
    question: 'What is JavaScript?',
    answer: 'JavaScript is a programming language used to make websites interactive.'
  },
  {
    question: 'What is a variable?',
    answer: 'A variable is a named container used to store data.'
  },
  {
    question: 'What is a function?',
    answer: 'A function is a reusable block of code designed to perform a task.'
  }
]

const quizQuestions = [
  {
    question: 'What is JavaScript primarily used for?',
    options: [
      'Styling web pages',
      'Making websites interactive',
      'Managing databases',
      'Creating images'
    ],
    answer: 1,
    explanation: 'JavaScript adds interactivity and dynamic behavior to websites.'
  },
  {
    question: 'Which keyword declares a variable that can be reassigned?',
    options: ['const', 'let', 'return', 'function'],
    answer: 1,
    explanation: 'The let keyword declares a block-scoped variable that can be reassigned.'
  },
  {
    question: 'What is a function in JavaScript?',
    options: [
      'A reusable block of code',
      'A type of database',
      'An HTML element',
      'A CSS property'
    ],
    answer: 0,
    explanation: 'A function is a reusable block of code designed to perform a task.'
  }
]

function App() {
  const [topic, setTopic] = useState('')
  const [submittedTopic, setSubmittedTopic] = useState('')

  const [flashcards, setFlashcards] = useState(sampleCards)
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const [quizSet, setQuizSet] = useState(quizQuestions)
  const [allQuizQuestions, setAllQuizQuestions] = useState(quizQuestions)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [wrongQuestions, setWrongQuestions] = useState([])
  const [quizFinished, setQuizFinished] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activeController = useRef(null)

  useEffect(() => {
    return () => {
      activeController.current?.abort()
    }
  }, [])

  async function handleGenerate() {
    const trimmedTopic = topic.trim()

    if (!trimmedTopic) {
      setError('Please enter a topic or your study notes.')
      return
    }

    // Cancel any previous generation request.
    activeController.current?.abort()

    const controller = new AbortController()
    activeController.current = controller

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic: trimmedTopic }),
        signal: controller.signal
      })

      let data

      try {
        data = await response.json()
      } catch {
        throw new Error('The server returned an invalid response. Please try again.')
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to generate study material.')
      }

      // Validate the structure before updating the UI.
      if (
        !Array.isArray(data.flashcards) ||
        data.flashcards.length === 0 ||
        !Array.isArray(data.quiz) ||
        data.quiz.length === 0
      ) {
        throw new Error('The generated study material is incomplete. Please try again.')
      }

      const validCards = data.flashcards.every((card) =>
        typeof card.question === 'string' &&
        card.question.trim() &&
        typeof card.answer === 'string' &&
        card.answer.trim()
      )

      const validQuestions = data.quiz.every((question) =>
        typeof question.question === 'string' &&
        question.question.trim() &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every((option) => typeof option === 'string' && option.trim()) &&
        Number.isInteger(question.answer) &&
        question.answer >= 0 &&
        question.answer < 4 &&
        typeof question.explanation === 'string'
      )

      if (!validCards || !validQuestions) {
        throw new Error('The AI returned incorrectly formatted questions. Please try again.')
      }

      // Update the study material only after successful validation.
      setFlashcards(data.flashcards)
      setQuizSet(data.quiz)
      setAllQuizQuestions(data.quiz)
      setSubmittedTopic(trimmedTopic)

      // Reset flashcard progress.
      setCardIndex(0)
      setIsFlipped(false)

      // Reset quiz progress.
      setQuizIndex(0)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setScore(0)
      setWrongQuestions([])
      setQuizFinished(false)

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      if (activeController.current === controller) {
        activeController.current = null
        setLoading(false)
      }
    }
  }

  function nextCard() {
    setCardIndex((current) => (current + 1) % flashcards.length)
    setIsFlipped(false)
  }

  function checkAnswer() {
    if (selectedAnswer === null || showFeedback) return

    const currentQuestion = quizSet[quizIndex]

    if (selectedAnswer === currentQuestion.answer) {
      setScore((previous) => previous + 1)
    } else {
      setWrongQuestions((previous) => [
        ...previous,
        currentQuestion
      ])
    }

    setShowFeedback(true)
  }

  function nextQuestion() {
    if (quizIndex < quizSet.length - 1) {
      setQuizIndex((previous) => previous + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setQuizFinished(true)
    }
  }

  function retryWrongAnswers() {
    setQuizSet(wrongQuestions)
    setWrongQuestions([])
    setQuizIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore(0)
    setQuizFinished(false)
  }

  function restartQuiz() {
    setQuizSet(allQuizQuestions)
    setQuizIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore(0)
    setWrongQuestions([])
    setQuizFinished(false)
  }

  return (
    <div className="app">

      <header className="header">
        <h2>StudyMate</h2>
        <span>AI Study Assistant</span>
      </header>

      <main className="main">

        <div className="intro">
          <h1>Study smarter, not harder.</h1>
          <p>
            Turn your notes into interactive flashcards
            and quizzes with AI.
          </p>
        </div>

        <section className="input-section">

          <label htmlFor="study-topic">
            Enter your topic or paste your notes
          </label>

          <textarea
            id="study-topic"
            placeholder="Example: Explain JavaScript fundamentals..."
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            disabled={loading}
          />

          <button onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating Study Material...' : 'Generate Study Set'}
          </button>

          {loading && (
            <p role="status">
              Please wait. AI is preparing your flashcards and quiz.
            </p>
          )}

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

        </section>

        {submittedTopic && (
          <>

            <section className="result">

              <h2>Your Study Topic</h2>
              <p className="topic-text">{submittedTopic}</p>

              <h2 className="section-heading">
                Practice Flashcards
              </h2>

              <div
                className="flashcard"
                onClick={() => setIsFlipped((previous) => !previous)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setIsFlipped((previous) => !previous)
                  }
                }}
              >
                <span className="card-label">
                  {isFlipped ? 'ANSWER' : 'QUESTION'}
                </span>

                <h3>
                  {isFlipped
                    ? flashcards[cardIndex].answer
                    : flashcards[cardIndex].question}
                </h3>

                <p>Click the card to flip</p>
              </div>

              <p className="card-count">
                Card {cardIndex + 1} of {flashcards.length}
              </p>

              <button onClick={nextCard}>
                Next Flashcard
              </button>

            </section>

            <section className="quiz-section">

              <h2>Test Your Knowledge</h2>

              {!quizFinished ? (
                <>

                  <p className="question-count">
                    Question {quizIndex + 1} of {quizSet.length}
                  </p>

                  <h3 className="quiz-question">
                    {quizSet[quizIndex].question}
                  </h3>

                  <div className="options">

                    {quizSet[quizIndex].options.map((option, index) => (
                      <button
                        key={index}
                        className={
                          selectedAnswer === index
                            ? 'option selected'
                            : 'option'
                        }
                        disabled={showFeedback}
                        onClick={() => setSelectedAnswer(index)}
                      >
                        {option}
                      </button>
                    ))}

                  </div>

                  {showFeedback && (
                    <div className="feedback">
                      <p>
                        {selectedAnswer === quizSet[quizIndex].answer
                          ? 'Correct! Well done.'
                          : `Incorrect. Correct answer: ${
                              quizSet[quizIndex].options[
                                quizSet[quizIndex].answer
                              ]
                            }`}
                      </p>

                      <p>
                        {quizSet[quizIndex].explanation}
                      </p>
                    </div>
                  )}

                  {!showFeedback ? (
                    <button
                      onClick={checkAnswer}
                      disabled={selectedAnswer === null}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button onClick={nextQuestion}>
                      {quizIndex === quizSet.length - 1
                        ? 'Finish Quiz'
                        : 'Next Question'}
                    </button>
                  )}

                </>
              ) : (

                <div className="quiz-results">

                  <h3>Quiz Completed!</h3>

                  <p>
                    Your score: <strong>{score} / {quizSet.length}</strong>
                  </p>

                  <p>
                    Incorrect answers: {wrongQuestions.length}
                  </p>

                  {wrongQuestions.length > 0 && (
                    <button onClick={retryWrongAnswers}>
                      Retry Incorrect Questions
                    </button>
                  )}

                  <button onClick={restartQuiz}>
                    Restart Full Quiz
                  </button>

                </div>

              )}

            </section>

          </>
        )}

      </main>
    </div>
  )
}

export default App
