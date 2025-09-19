import { StarIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'
import { useAppContext } from '../context/AppContext'

const MovieCard = ({ movie }) => {
    const navigate = useNavigate()
    const { image_base_url } = useAppContext()

    if (!movie) return null

    const goToDetails = () => {
        navigate(`/movies/${movie._id}`)
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    }

    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '—'
    const genres = Array.isArray(movie.genres)
        ? movie.genres.slice(0, 2).map(g => g?.name).filter(Boolean).join(' | ')
        : '—'
    const runtime = movie.runtime ? timeFormat(movie.runtime) : '—'
    const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'

    return (
        <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-64'>
            <button
                type='button'
                onClick={goToDetails}
                className='group rounded-lg h-52 w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer'
                aria-label={`Open details for ${movie.title}`}
            >
                <img
                    src={image_base_url + movie.backdrop_path}
                    alt={movie.title || 'Movie poster'}
                    loading='lazy'
                    className='h-full w-full object-cover object-right-bottom transition-transform duration-300 group-hover:scale-[1.02]'
                />
            </button>

            <p className='font-semibold mt-2 truncate' title={movie.title}>{movie.title}</p>

            <p className='text-sm text-gray-400 mt-2'>
                {year} · {genres} · {runtime}
            </p>

            <div className='flex items-center justify-between mt-4 pb-3'>
                <button
                    type='button'
                    onClick={goToDetails}
                    className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
                >
                    Buy Tickets
                </button>

                <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
                    <StarIcon className='w-4 h-4 text-primary fill-current' />
                    {rating}
                </p>
            </div>
        </div>
    )
}

export default MovieCard