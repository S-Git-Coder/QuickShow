import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import { useClerk, UserButton, useUser, useAuth } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext';

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoaded: clerkLoaded } = useUser()
  const { openSignIn } = useClerk()
  const { isSignedIn } = useAuth()

  const navigate = useNavigate()

  const { favoriteMovies = [] } = useAppContext()

  const menuRef = useRef(null)
  const firstLinkRef = useRef(null)

  // Body scroll lock when menu open (mobile)
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
      // focus first link after animation frame
      requestAnimationFrame(() => firstLinkRef.current?.focus())
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const handleNavigate = (to) => {
    navigate(to)
    setIsOpen(false)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    // Placeholder routes updated to avoid duplicate path keys; adjust when real routes exist
    { to: '/theaters', label: 'Theaters' },
    { to: '/releases', label: 'Releases' },
    ...(favoriteMovies.length > 0 ? [{ to: '/favorite', label: 'Favorites' }] : [])
  ]

  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5'>
      <Link to='/' className='max-md:flex-1'>
        <img src={assets.logo} alt='QuickShow' className='w-36 h-auto' />
      </Link>

      {/* Mobile / Desktop Nav */}
      <nav
        ref={menuRef}
        id='main-navigation'
        aria-label='Main navigation'
        className={`max-md:fixed max-md:top-0 max-md:left-0 max-md:h-screen max-md:w-full md:static md:h-auto md:w-auto flex flex-col md:flex-row items-center justify-center gap-8 md:px-8 py-10 md:py-3 md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'max-md:translate-x-0 max-md:visible' : 'max-md:-translate-x-full max-md:invisible max-md:pointer-events-none'}`}
      >
        <button
          type='button'
          aria-label='Close menu'
          onClick={() => setIsOpen(false)}
          className='md:hidden absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary'
        >
          <XIcon className='w-6 h-6' />
        </button>
        {navLinks.map((l, idx) => (
          <NavLink
            key={`${l.to}-${l.label}`}
            to={l.to}
            ref={idx === 0 ? firstLinkRef : null}
            onClick={() => handleNavigate(l.to)}
            className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
            end={l.to === '/'}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className='flex items-center gap-6'>
        <button type='button' aria-label='Search' className='max-md:hidden w-6 h-6 text-gray-300 hover:text-white transition-colors'>
          <SearchIcon className='w-6 h-6' />
        </button>
        {clerkLoaded && (
          isSignedIn ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<TicketPlus width={15} />}
                  onClick={() => navigate('/my-bookings')}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              type='button'
              onClick={openSignIn}
              className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium'
            >
              Login
            </button>
          )
        )}
        <button
          type='button'
          aria-label='Open menu'
          aria-controls='main-navigation'
          aria-expanded={isOpen}
          onClick={() => setIsOpen(o => !o)}
          className='md:hidden w-8 h-8 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary'
        >
          <MenuIcon className='w-8 h-8' />
        </button>
      </div>
    </div>
  )
}

export default Navbar