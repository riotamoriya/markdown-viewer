'use client'

import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import CryptoJS from 'crypto-js'

// ハッシュ化されたパスワード
// const HASHED_PASSWORD = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' // 'password'のハッシュ
// ハッシュ化されたパスワード
const HASHED_PASSWORD = process.env.NEXT_PUBLIC_HASHED_PASSWORD || ''
// 試行制限の設定
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 30 * 60 * 1000 // 30分

// 認証コンポーネント
function AuthModal({ onAuth, isLocked, error, remainingTime }: {
  onAuth: (password: string) => void
  isLocked: boolean
  error: string
  remainingTime: string
}) {
  const [password, setPassword] = useState('')

  return (
    <Modal show backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>認証</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => {
          e.preventDefault()
          onAuth(password)
        }}>
          <Form.Group className="mb-3">
            <Form.Label>パスワード</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={!!error}
              disabled={isLocked}
            />
            <Form.Control.Feedback type="invalid">
              {error}
              {isLocked && remainingTime && (
                <div>再試行まで: {remainingTime}</div>
              )}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="d-grid">
            <Button 
              variant="primary" 
              type="submit"
              disabled={isLocked}
            >
              ログイン
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authState = sessionStorage.getItem('isAuthenticated')
    const storedLockoutEnd = localStorage.getItem('lockoutEndTime')
    const storedAttempts = localStorage.getItem('loginAttempts')

    if (authState === 'true') {
      setIsAuthenticated(true)
    }

    if (storedLockoutEnd) {
      const endTime = parseInt(storedLockoutEnd)
      if (Date.now() < endTime) {
        setIsLocked(true)
        setLockoutEndTime(endTime)
      } else {
        localStorage.removeItem('lockoutEndTime')
        localStorage.removeItem('loginAttempts')
      }
    }

    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts))
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLocked && lockoutEndTime) {
      timer = setInterval(() => {
        if (Date.now() >= lockoutEndTime) {
          setIsLocked(false)
          setLockoutEndTime(null)
          setAttempts(0)
          localStorage.removeItem('lockoutEndTime')
          localStorage.removeItem('loginAttempts')
        }
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isLocked, lockoutEndTime])

  const handleLogin = (password: string) => {
    const hashedInput = CryptoJS.SHA256(password).toString()

    if (isLocked) return

    if (hashedInput === HASHED_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('isAuthenticated', 'true')
      localStorage.removeItem('loginAttempts')
      setError('')
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem('loginAttempts', newAttempts.toString())
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const endTime = Date.now() + LOCKOUT_TIME
        setIsLocked(true)
        setLockoutEndTime(endTime)
        localStorage.setItem('lockoutEndTime', endTime.toString())
        setError(`アカウントがロックされました。${LOCKOUT_TIME / 60000}分後に再試行できます。`)
      } else {
        setError(`パスワードが正しくありません。残り${MAX_ATTEMPTS - newAttempts}回試行できます。`)
      }
    }
  }

  const getRemainingTime = () => {
    if (!lockoutEndTime) return ''
    const remaining = Math.ceil((lockoutEndTime - Date.now()) / 1000)
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60
    return `${minutes}分${seconds}秒`
  }

  if (isLoading) {
    return null
  }

  return (
    <>
      {!isAuthenticated && (
        <AuthModal
          onAuth={handleLogin}
          isLocked={isLocked}
          error={error}
          remainingTime={getRemainingTime()}
        />
      )}
      {isAuthenticated && children}
    </>
  )
}