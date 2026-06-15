import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Wifi, AlertCircle, CheckCircle } from 'lucide-react'
import Logo from '../components/Logo/Logo.jsx'
import { failoverService } from '../services/failoverService.js'
import useAppStore from '../store/appStore.js'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, addToast } = useAppStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [serverStatus, setServerStatus] = useState(null) // null | 'testing' | 'ok' | 'fail'

  useEffect(() => {
    if (isAuthenticated) navigate('/home', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const saved = localStorage.getItem('msplay-login')
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      setUsername(parsed.username || '')
      setPassword(parsed.password || '')
      setRemember(Boolean(parsed.username || parsed.password))
    } catch {
      localStorage.removeItem('msplay-login')
    }
  }, [])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Preencha usuário e senha.')
      return
    }

    setLoading(true)
    setServerStatus('testing')

    try {
      const result = await failoverService.tryLoginSequential({ username, password })
      setServerStatus('ok')

      if (remember) {
        localStorage.setItem('msplay-login', JSON.stringify({ username, password }))
      } else {
        localStorage.removeItem('msplay-login')
      }

      login(result.server, result.userInfo || { username })

      addToast({
        type: 'success',
        title: 'Conectado!',
        message: `Servidor: ${result.server.name}`,
      })

      setTimeout(() => navigate('/home', { replace: true }), 300)
    } catch (err) {
      setServerStatus('fail')
      setError(err.message || 'Falha na conexão. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-dark to-black" />
        {/* Grid de pontos */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #E50914 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        {/* Glow vermelho */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96
          bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          className="rounded-2xl border border-border p-8 shadow-2xl"
          style={{ background: 'rgba(20,20,20,0.97)', backdropFilter: 'blur(20px)' }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>

          {/* Título */}
          <h1 className="font-bebas text-4xl text-white text-center mb-1 tracking-wider">Entrar</h1>
          <p className="text-muted text-sm text-center mb-6 font-dm">Acesse sua conta IPTV</p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted font-dm mb-1.5 block">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="usuario"
                className="input-field"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-xs text-muted font-dm mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="senha"
                  className="input-field pr-10"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Lembrar */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div
                onClick={() => setRemember(!remember)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                  ${remember ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}
              >
                {remember && <CheckCircle size={12} className="text-white" />}
              </div>
              <span className="text-sm text-muted font-dm">Lembrar login</span>
            </label>

            {/* Erro */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs font-dm leading-relaxed">{error}</p>
              </div>
            )}

            {/* Status servidor */}
            {serverStatus === 'testing' && (
              <div className="flex items-center gap-2 text-muted text-xs">
                <Loader2 size={13} className="animate-spin" />
                Testando DNS disponíveis...
              </div>
            )}

            {/* Botão principal */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Conectando...</>
              ) : (
                <><Wifi size={18} /> Entrar</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
