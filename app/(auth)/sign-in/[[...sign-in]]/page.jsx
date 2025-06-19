import { SignIn } from '@clerk/nextjs'
import React from 'react'

const SignInPage = () => (
  <div className="flex min-h-[calc(100vh-64px)] items-center justify-center pt-16">
    <SignIn />
  </div>
)

export default SignInPage