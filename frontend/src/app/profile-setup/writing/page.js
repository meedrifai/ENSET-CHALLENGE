// app/profile-setup/writing/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SignatureLayout from '@/components/SignatureLayout'
import WritingPrompt from '@/components/WritingPrompt'
import NextButton from '@/components/NextButton'

export default function WritingStepPage() {
  const router = useRouter()
  const [response, setResponse] = useState('')

  const handleNext = () => {
    // Optionally validate response length before proceeding
    router.push('/profile-setup/questions')
  }

  return (
    <SignatureLayout title="Step 1: Share your thoughts">
      <WritingPrompt
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        maxWords={150}
      />
      <div className="mt-6">
        <NextButton onClick={handleNext} text="Continue" />
      </div>
    </SignatureLayout>
  )
}