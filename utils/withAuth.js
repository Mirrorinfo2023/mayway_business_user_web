// utils/withAuth.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      if (typeof window === 'undefined') return

      const uid = Cookies.get('uid') || sessionStorage.getItem('id')
      const role = Cookies.get('role') || sessionStorage.getItem('role')

      if (!uid || role !== 'user') {
        // Use replace to avoid history push
        router.replace('/login')
      } else {
        setLoading(false)
      }
    }, [router])

    // Prevent back navigation to protected pages
    useEffect(() => {
      if (typeof window === 'undefined') return

      const preventBack = () => window.history.pushState(null, '', window.location.href)
      window.history.pushState(null, '', window.location.href)
      window.addEventListener('popstate', preventBack)

      return () => window.removeEventListener('popstate', preventBack)
    }, [])

    if (loading) return <div>Loading...</div>

    return <WrappedComponent {...props} />
  }
}

export default withAuth
