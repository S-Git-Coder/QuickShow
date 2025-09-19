import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'
import { useAppContext } from '../context/AppContext'

const FeaturedSection = () => {

    const navigate = useNavigate()
    const { shows } = useAppContext()
    const list = Array.isArray(shows) ? shows.slice(0, 4) : []

    // Debug logging
    console.log('[FeaturedSection] shows:', shows)
    console.log('[FeaturedSection] list:', list)

    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>

            <div className='relative flex items-center justify-between pt-20 pb-10'>
                <BlurCircle top='0' right='-80px' />
                <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
                <button type="button" onClick={() => { navigate('/movies'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0) }} className='group flex items-center
            gap-2 text-sm text-gray-300 cursor-pointer'>
                    View All
                    <ArrowRight className='group-hover:translate-x-0.5 transition-transform w-4 h-4' />
                </button>
            </div>

            <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
                {list.map((show) => (
                    <MovieCard key={show._id} movie={show} />
                ))}
            </div>

            <div className='flex justify-center mt-20'>
                <button type="button" onClick={() => { navigate('/movies'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0) }}
                    className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition
            rounded-md font-medium cursor-pointer'>Show more</button>
            </div>

        </div>
    )
}

export default FeaturedSection