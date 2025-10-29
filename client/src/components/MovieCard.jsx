import { StarIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'
import { useAppContext } from '../context/AppContext'

const MovieCard = ({ movie, onMovieClick }) => {

    const navigate = useNavigate()
    const { image_base_url } = useAppContext()
    
    const handleClick = () => {
        if (onMovieClick) {
            // If onMovieClick prop is provided (for Releases page), use it
            onMovieClick(movie)
        } else {
            // For Movies page, navigate to movie details
            navigate(`/movie/${movie._id}`)
        }
    }

    return (
        <div 
            onClick={handleClick}
            className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1
    transition duration-300 w-62 cursor-pointer'>

            <img 
                src={image_base_url + movie.poster_path} alt={movie.title} className='rounded-lg h-80 w-full object-cover
        object-top cursor-pointer' />

            <p className='font-semibold mt-2 truncate'>{movie.title}</p>

            <div className='flex items-center justify-between text-sm text-gray-400 mt-2'>
                <span>{movie.release_date || 'Release date not available'}</span>
                <span className='flex items-center gap-1'>
                    <StarIcon className='w-4 h-4 text-primary fill-primary' />
                    {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </span>
            </div>
            
            <div className='mt-4 pb-3'>
                {/* Buy Tickets button removed */}
            </div>

        </div>
    )
}

export default MovieCard