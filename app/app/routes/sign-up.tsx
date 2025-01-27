import { SignUp } from '@clerk/remix'

export default function SignUpPage() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-grey-100'>
      <SignUp />
    </div>
  )
}