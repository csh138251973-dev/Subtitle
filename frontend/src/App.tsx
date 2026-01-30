import { useState } from 'react'
import VideoUploader from './components/VideoUploader'
import SubtitleGenerator from './components/SubtitleGenerator'
import SubtitleTranslator from './components/SubtitleTranslator'
import SubtitleExporter from './components/SubtitleExporter'
import QualityVerifier from './components/QualityVerifier'
import './App.css'

function App() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string>('upload')

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎬 AI Video Subtitle Processor</h1>
        <p>Extract, translate, and verify subtitles with AI intelligence</p>
      </header>

      <main className="app-main">
        {currentStep === 'upload' && (
          <VideoUploader 
            onUploadSuccess={(id) => {
              setJobId(id)
              setCurrentStep('generate')
            }}
          />
        )}

        {jobId && currentStep === 'generate' && (
          <SubtitleGenerator
            jobId={jobId}
            onGenerateSuccess={() => setCurrentStep('translate')}
            onBack={() => setCurrentStep('upload')}
          />
        )}

        {jobId && currentStep === 'translate' && (
          <SubtitleTranslator
            jobId={jobId}
            onTranslateSuccess={() => setCurrentStep('verify')}
            onBack={() => setCurrentStep('generate')}
          />
        )}

        {jobId && currentStep === 'verify' && (
          <QualityVerifier
            jobId={jobId}
            onVerifySuccess={() => setCurrentStep('export')}
            onBack={() => setCurrentStep('translate')}
          />
        )}

        {jobId && currentStep === 'export' && (
          <SubtitleExporter
            jobId={jobId}
            onBack={() => setCurrentStep('verify')}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 AI Video Subtitle Processor - Powered by OpenAI</p>
      </footer>
    </div>
  )
}

export default App
