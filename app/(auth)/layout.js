import React from 'react'

const AuthLayout = ({children}) => {
  return (
    <div className='min-h-screen flex justify-center pt-30 pb-10'>
        {children}
    </div>
  )
}

export default AuthLayout