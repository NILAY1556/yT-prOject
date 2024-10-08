import React, { useState } from 'react'

interface VideoInputProps {
  onSubmit: (videoUrl: string) => void
  disabled: boolean
}

const VideoInput: React.FC<VideoInputProps> = ({ onSubmit, disabled }) => {
  const [videoUrl, setVideoUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (videoUrl.trim()) {
      onSubmit(videoUrl.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          Generate Guide
        </button>
      </div>
    </form>
  )
}

export default VideoInput