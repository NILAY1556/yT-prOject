import React, { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import CodeSnippet from './CodeSnippet'

interface Step {
  title: string
  description: string
  code?: string
}

interface GuideDisplayProps {
  guide: {
    introduction: string
    prerequisites: string[]
    steps: Step[]
    testing: string
    conclusion: string
  }
}

const GuideDisplay: React.FC<GuideDisplayProps> = ({ guide }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Step-by-Step Guide</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Introduction</h3>
        <p>{guide.introduction}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Prerequisites</h3>
        <ul className="list-disc pl-5">
          {guide.prerequisites.map((prereq, index) => (
            <li key={index}>{prereq}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Project Steps</h3>
        <div className="space-y-2">
          {guide.steps.map((step, index) => (
            <div key={index} className="border rounded-md">
              <button
                className="w-full text-left p-3 flex items-center justify-between focus:outline-none"
                onClick={() => setActiveStep(activeStep === index ? null : index)}
              >
                <span className="font-medium">{`${index + 1}. ${step.title}`}</span>
                {activeStep === index ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              {activeStep === index && (
                <div className="p-3 bg-gray-50">
                  <p>{step.description}</p>
                  {step.code && <CodeSnippet code={step.code} />}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Testing and Verification</h3>
        <p>{guide.testing}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Conclusion</h3>
        <p>{guide.conclusion}</p>
      </div>
    </div>
  )
}

export default GuideDisplay