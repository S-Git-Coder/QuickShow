import React, { useState, useRef, useMemo } from 'react'
// import { dummyTrailers } from '../assets/assets'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { PlayCircleIcon } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const TrailerSection = () => {
    const { shows, image_base_url } = useAppContext()

    // Build trailer list from shows (unique by movie _id) where trailerUrl exists
    const trailers = useMemo(() => {
        if (!shows || !Array.isArray(shows) || shows.length === 0) {
            console.log('[TrailerSection] No shows available')
            return []
        }
        
        try {
            const list = []
            const seen = new Set()
            
            shows.forEach(movie => {
                // Skip invalid movies or already processed ones
                if (!movie || !movie._id || seen.has(movie._id)) return
                seen.add(movie._id)
                
                // Check if movie has a valid trailerUrl
                if (movie.trailerUrl && typeof movie.trailerUrl === 'string' && movie.trailerUrl.trim() !== '') {
                    // Ensure backdrop_path exists before using it
                    const backdropImage = movie.backdrop_path ? image_base_url + movie.backdrop_path : null;
                    
                    list.push({
                        id: movie._id,
                        videoUrl: movie.trailerUrl,
                        title: movie.title || 'Untitled Movie',
                        image: backdropImage
                    })
                }
            })
            
            if (process.env.NODE_ENV !== 'production') {
                console.log('[TrailerSection] shows length:', shows.length)
                console.log('[TrailerSection] trailers derived:', list.map(t => ({ id: t.id, videoUrl: t.videoUrl })))
            }
            return list
        } catch (error) {
            console.error('[TrailerSection] Error processing trailers:', error)
            return []
        }
    }, [shows, image_base_url])

    const [currentTrailer, setCurrentTrailer] = useState(null)
    // Initialize current trailer after trailers list available
    React.useEffect(() => {
        if (!currentTrailer && trailers.length) setCurrentTrailer(trailers[0])
    }, [trailers, currentTrailer])
    const playerRef = useRef(null)

    // Enhanced logging for debugging
    console.log('[TrailerSection] Final trailers list:', trailers);
    
    if (!trailers.length) {
        return (
            <section aria-label='Trailers' className='px-6 md:px-16 lg:px-24 xl:px-44 py-20'>
                <p className='text-gray-400 text-sm'>No trailers available yet. Add trailer URLs when creating shows.</p>
            </section>
        )
    }

    const selectTrailer = (t) => {
        if (!currentTrailer || t.videoUrl !== currentTrailer.videoUrl) {
            setCurrentTrailer(t)
            // Only scroll player into view if it's currently out of viewport (above or far below)
            requestAnimationFrame(() => {
                if (!playerRef.current) return
                const rect = playerRef.current.getBoundingClientRect()
                const vh = window.innerHeight || document.documentElement.clientHeight
                const navOffset = 80 // approximate fixed navbar height
                const outOfViewAbove = rect.top < navOffset * -0.25
                const outOfViewBelow = rect.top > vh * 0.7
                if (outOfViewAbove || outOfViewBelow) {
                    playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            })
        }
    }

    return (
        <section aria-label='Trailers' className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
            <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>

            <div ref={playerRef} className='relative mt-6 max-w-[960px] mx-auto'>
                <BlurCircle top='-100px' right='-100px' />
                <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-black/50'>
                    {currentTrailer && (
                        <ReactPlayer
                            url={currentTrailer.videoUrl}
                            controls
                            width='100%'
                            height='100%'
                            className='react-player'
                            onError={(e) => {
                                console.error('[TrailerSection] Player error:', e);
                                toast.error(`Failed to load trailer for "${currentTrailer.title}". Please try another trailer.`);
                            }}
                            fallback={<div className="flex items-center justify-center w-full h-full bg-black/50">
                                <p className="text-white">Loading trailer...</p>
                            </div>}
                        />
                    )}
                </div>
            </div>

            <div
                role='listbox'
                aria-label='Select trailer'
                className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mt-8 max-w-3xl mx-auto'
            >
                {trailers.map((tr) => {
                    const selected = currentTrailer && tr.videoUrl === currentTrailer.videoUrl
                    return (
                        <button
                            key={tr.id || tr.videoUrl}
                            type='button'
                            role='option'
                            aria-selected={selected}
                            onClick={() => selectTrailer(tr)}
                            className={`relative group overflow-hidden h-40 md:h-36 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-transform duration-300 ${selected ? 'ring-2 ring-primary' : 'hover:-translate-y-1'}`}
                        >
                            <img
                                src={tr.image}
                                alt={`${tr.title || 'Trailer'} thumbnail`}
                                loading='lazy'
                                className='w-full h-full object-cover brightness-75 group-hover:brightness-90'
                            />
                            <PlayCircleIcon
                                strokeWidth={1.6}
                                className='absolute top-1/2 left-1/2 w-8 h-8 md:w-10 md:h-10 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow'
                            />
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

export default TrailerSection