import React, { useEffect, useState } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import MovieDetailsModal from '../components/MovieDetailsModal'
import axios from 'axios'

const Releases = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const { getToken } = useAppContext()

  // Fetch now playing movies from the API
  const fetchNowPlayingMovies = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/show/now-playing', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setNowPlayingMovies(data.movies)
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle between showing initial 8 movies and all movies
  const handleShowMore = () => {
    setShowAll(true)
  }

  // Handle movie card click to show modal
  const handleMovieClick = (movie) => {
    setSelectedMovie(movie)
  }

  // Close the modal
  const handleCloseModal = () => {
    setSelectedMovie(null)
  }

  useEffect(() => {
    fetchNowPlayingMovies()
  }, [])

  // Display only first 8 movies initially (2 rows of 4)
  const displayedMovies = showAll 
    ? nowPlayingMovies 
    : nowPlayingMovies.slice(0, 8)

  return (
    <div className='relative my-20 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[50vh]'>
      <BlurCircle top='50px' left='0px'/>
      <BlurCircle bottom='50px' right='50px'/>

      <h1 className='text-2xl font-medium mb-8'>Latest Releases</h1>
      
      {loading ? (
        <Loading />
      ) : nowPlayingMovies.length > 0 ? (
        <div className='relative'>
          {/* Responsive grid layout */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {displayedMovies.map((movie) => (
              <div key={movie.id} className="cursor-pointer">
                <MovieCard movie={movie} onMovieClick={handleMovieClick} />
              </div>
            ))}
          </div>
          
          {/* Show More button - only display if there are more than 8 movies and not all are shown */}
          {!showAll && nowPlayingMovies.length > 8 && (
            <div className='flex justify-center mt-8'>
              <button 
                onClick={handleShowMore}
                className='bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer'
              >
                Show More
              </button>
            </div>
          )}

          {/* Movie Details Modal */}
          {selectedMovie && (
            <MovieDetailsModal 
              movie={selectedMovie} 
              onClose={handleCloseModal} 
            />
          )}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center h-40'>
          <h1 className='text-xl font-medium text-center'>No new releases available</h1>
        </div>
      )}
    </div>
  )
}

export default Releases