import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import axios from 'axios'
import { parseString } from 'xml2js'
import { HfInference } from '@huggingface/inference'

const youtube = google.youtube('v3')
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { videoUrl } = req.body
      const videoId = extractVideoId(videoUrl)
      
      if (!videoId) {
        return res.status(400).json({ error: 'Invalid YouTube URL' })
      }

      const transcript = await getTranscript(videoId)
      const videoDetails = await getVideoDetails(videoId)
      const guide = await analyzeTranscript(transcript, videoDetails.title)

      res.status(200).json({ guide })
    } catch (error) {
      console.error('Error generating guide:', error)
      res.status(500).json({ error: 'Failed to generate guide' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

function extractVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

async function getTranscript(videoId: string): Promise<string> {
  try {
    const response = await axios.get(`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`)
    return new Promise((resolve, reject) => {
      parseString(response.data, (err, result) => {
        if (err) reject(err)
        if (result && result.transcript && result.transcript.text) {
          const transcript = result.transcript.text.map((item: any) => item._).join(' ')
          resolve(transcript)
        } else {
          reject(new Error('No transcript found'))
        }
      })
    })
  } catch (error) {
    console.error('Error fetching transcript:', error)
    throw new Error('Failed to fetch transcript')
  }
}

async function getVideoDetails(videoId: string): Promise<{ title: string }> {
  try {
    const response = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId],
      key: process.env.YOUTUBE_API_KEY,
    })

    if (response.data.items && response.data.items.length > 0) {
      return { title: response.data.items[0].snippet?.title || 'Untitled Video' }
    } else {
      throw new Error('Video not found')
    }
  } catch (error) {
    console.error('Error fetching video details:', error)
    throw new Error('Failed to fetch video details')
  }
}

async function analyzeTranscript(transcript: string, title: string) {
  const prompt = `
    Analyze the following YouTube video transcript and title. Your task is to create a detailed, step-by-step guide for building the project or following the tutorial presented in the video.

    Title: ${title}
    Transcript: ${transcript.substring(0, 3000)}...

    Please follow these guidelines to create the guide:

    1. Determine if the video is a project tutorial or educational content suitable for a step-by-step guide.
    2. If it is suitable, create a comprehensive guide with the following structure:
       a. Introduction: Briefly describe the project or tutorial and its goals.
       b. Prerequisites: List any necessary tools, software, or knowledge required.
       c. Step-by-step instructions: Provide detailed steps, including:
          - Clear, concise descriptions of each action
          - Code snippets or commands, if applicable
          - Explanations of why certain steps are taken
          - Any potential pitfalls or common mistakes to avoid
       d. Testing and verification: Explain how to test or verify that each step was completed correctly.
       e. Conclusion: Summarize the project and suggest possible extensions or modifications.
    3. If the video is not suitable for a guide, explain why and suggest alternative resources if possible.

    Format the response as JSON with the following structure:
    {
      "isTutorial": boolean,
      "reason": string (if not a tutorial),
      "guide": {
        "introduction": string,
        "prerequisites": array of strings,
        "steps": array of objects (each with "title", "description", and optional "code" fields),
        "testing": string,
        "conclusion": string
      }
    }

    Ensure that the guide is clear, concise, and easy to follow, even for beginners.
  `

  const response = await hf.textGeneration({
    model: 'gpt2',  // Replace with your fine-tuned model when available
    inputs: prompt,
    parameters: {
      max_new_tokens: 2000,
      temperature: 0.7,
      top_p: 0.95,
      return_full_text: false,
    },
  })

  let result
  try {
    result = JSON.parse(response.generated_text)
  } catch (error) {
    console.error('Error parsing AI response:', error)
    throw new Error('Failed to generate guide')
  }

  if (result.isTutorial) {
    return result.guide
  } else {
    throw new Error(result.reason || 'This video is not suitable for generating a guide')
  }
}