import OAuthButtons from '../components/OAuthButtons'
import useTitle from '../hooks/useTitle'


function LoginRegister() {
  useTitle('Sign in to JW Matrimony')
  return (
    <div>
      <p className='flex justify-center to-red-400 text-3xl font-semibold'>Sign in to JW Matrimony</p>
      <OAuthButtons />
    </div>
  )
}

export default LoginRegister
