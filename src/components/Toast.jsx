import { useState, useCallback } from 'react'

export function useToast() {
  const [visible, setVisible] = useState(false)
  const [msg, setMsg] = useState('')

  const showToast = useCallback((message) => {
    setMsg(message)
    setVisible(true)
    setTimeout(() => setVisible(false), 2500)
  }, [])

  return { visible, msg, showToast }
}

export default function Toast({ visible, msg }) {
  return (
    <div className={`toast ${visible ? 'show' : ''}`}>{msg}</div>
  )
}
