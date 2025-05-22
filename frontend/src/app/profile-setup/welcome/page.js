// app/profile-setup/welcome/page.tsx

'use client'

import { useRouter } from 'next/navigation'
import SignatureLayout from '@/components/SignatureLayout'
import SignatureIntro from '@/components/SignatureIntro'
import NextButton from '@/components/NextButton'

export default function ProfileWelcomePage() {
  const router = useRouter()

  const handleNext = () => {
    router.push('/profile-setup/writing')
  }

  return (
    <SignatureLayout title="Welcome to EDGUARD">
      <SignatureIntro />
      <div className="mt-6">
        <NextButton onClick={handleNext} text="Begin Setup" />
      </div>
    </SignatureLayout>
  )
}