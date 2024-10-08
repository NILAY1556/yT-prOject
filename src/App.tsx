import React, { useState } from 'react'
import { Youtube } from 'lucide-react'
import VideoInput from './components/VideoInput'
import GuideDisplay from './components/GuideDisplay'

function App() {
  const [guide, setGuide] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVideoSubmit = async (videoUrl: string) => {
    setLoading(true)
    setError(null)
    setGuide(null)
    try {
      const response = await fetch('http://localhost:3001/api/generate-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate guide')
      }
      const data = await response.json()
      setGuide(data.guide)
    } catch (error) {
      if (error instanceof Error) {
        setError(`An error occurred while generating the guide: ${error.message}`)
      } else {
        setError('An unexpected error occurred while generating the guide.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Youtube className="mr-2" size={36} />
          YouTube Guide Generator
        </h1>
        <p className="text-gray-600">
          Generate step-by-step guides from YouTube project videos
        </p>
      </header>
      <main className="w-full max-w-3xl">
        <VideoInput onSubmit={handleVideoSubmit} disabled={loading} />
        {loading && (
          <div className="text-center mt-4">
            <p className="text-gray-600">Generating guide...</p>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}
        {guide && <GuideDisplay guide={guide} />}
      </main>
    </div>
  )
}

export default App