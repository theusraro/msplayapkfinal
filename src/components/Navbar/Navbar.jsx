import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, X, LogOut, Settings, ChevronDown } from 'lucide-react'
import Logo from '../Logo/Logo.jsx'
import useAppStore from '../../store/appStore.js'

const NAV_LINKS = [
  { to: '/home', label: 'Inicio' },
  { to: '/filmes', label: 'Filmes' },
  { to: '/series', label: 'Series' },
  { to: '/ao-vivo', label: 'TV ao Vivo' },
]

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, userInfo, searchQuery, setSearchQuery } = useAppStore()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    if (e.target.value && location.pathname === '/home') navigate('/filmes')
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/90 to-black/20'
      }`}
    >
      <div className="flex items-center gap-2 px-2 sm:px-4 md:px-8 h-16">
        <Link to="/home" className="flex-shrink-0 rounded-md focus-tv" aria-label="Ir para inicio">
          <Logo size="sm" />
        </Link>

        <div className="flex flex-1 items-center gap-1 overflow-x-auto content-row-scroll px-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`top-nav-link flex-shrink-0 px-2.5 sm:px-3 md:px-4 py-2 rounded-md text-[12px] sm:text-sm font-medium transition-colors duration-200 font-dm whitespace-nowrap ${
                location.pathname === link.to
                  ? 'text-white bg-white/10'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center">
            {searchOpen ? (
              <div className="flex items-center bg-dark/90 border border-border rounded-full px-3 py-1.5 gap-2">
                <Search size={15} className="text-muted flex-shrink-0" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Titulos, series, filmes..."
                  className="bg-transparent text-white text-sm outline-none w-36 md:w-56 placeholder-muted"
                />
                <button onClick={closeSearch} className="text-muted hover:text-white rounded-full focus-tv" aria-label="Fechar busca">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-muted hover:text-white transition-colors rounded-full hover:bg-white/10 focus-tv"
                aria-label="Abrir busca"
              >
                <Search size={18} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-white/10 transition-colors focus-tv"
              aria-label="Abrir perfil"
            >
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">
                {userInfo?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <ChevronDown size={14} className={`text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-white text-sm font-medium truncate">{userInfo?.username || 'Usuario'}</p>
                  <p className="text-muted text-xs">Conta ativa</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/configuracoes') }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted hover:text-white hover:bg-elevated transition-colors focus-tv"
                >
                  <Settings size={15} /> Configuracoes
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-elevated transition-colors focus-tv"
                >
                  <LogOut size={15} /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
