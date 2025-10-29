import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircleIcon, StarIcon, X, Calendar } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

// Constants
const image_base_url = 'https://image.tmdb.org/t/p/w500'

const MovieDetails = () => {

  const navigate = useNavigate()
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableCities, setAvailableCities] = useState([])
  const [availableTheaters, setAvailableTheaters] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [datesLoading, setDatesLoading] = useState(false)
  const [theatersLoading, setTheatersLoading] = useState(false)
  const { axios, user, getToken, fetchFavoriteMovies, favoriteMovies, shows } = useAppContext()
  
  useEffect(() => {
    if (user) {
      fetchFavoriteMovies()
    }
  }, [user, fetchFavoriteMovies])

  // Format date object from date string
  const formatDateObject = (dateString) => {
    const date = new Date(dateString);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      fullDate: date,
      day: dayNames[date.getDay()],
      date: date.getDate(),
      month: monthNames[date.getMonth()],
      formattedDate: dateString
    };
  };

  // No static data - all theaters and cities are fetched dynamically from the API

  // Define fetchCities function - only fetch cities with running shows for this movie
  const fetchCities = async () => {
    try {
      // Use the movie ID to get cities with running shows for this specific movie
      const { data } = await axios.get(`/api/show/cities/${id}`);
      if (data.success) {
        setAvailableCities(data.cities);
        // If no cities available, show a message
        if (data.cities.length === 0) {
          toast.error('No shows available for this movie');
        }
      }
    } catch (error) {
      console.error('Error fetching cities for movie:', error);
      toast.error('Error loading available cities');
      setAvailableCities([]);
    }
  };

  // Fetch available dates for a movie in a specific city
  const fetchDates = async (city) => {
    setDatesLoading(true);
    setSelectedDate(null);
    setAvailableDates([]);
    try {
      const { data } = await axios.get('/api/show/dates', {
        params: { movieId: id, city }
      });
      
      if (data.success && data.dates.length > 0) {
        // Format dates into the expected structure
        const formattedDates = data.dates.map(dateString => formatDateObject(dateString));
        setAvailableDates(formattedDates);
      } else {
        setAvailableDates([]);
        toast.error('No shows available for this city');
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
      toast.error('Error loading available dates');
      setAvailableDates([]);
    } finally {
      setDatesLoading(false);
    }
  };

  // Define fetchTheaters function
  const fetchTheaters = async (city, date) => {
    setTheatersLoading(true);
    setAvailableTheaters([]);
    try {
      // If both city and date are provided, use the new theater-slots endpoint
      if (date) {
        const { data } = await axios.get('/api/show/theater-slots', { 
          params: { 
            movieId: id, 
            city, 
            date: date.formattedDate 
          } 
        });
        
        if (data.success && data.theaterSlots.length > 0) {
          // Transform theater data into the format expected by the component
          // const formattedTheaters = data.theaterSlots.map((theaterData, index) => ({
          //   id: `${city.toLowerCase()}-${index}`,
          //   name: theaterData.theater,
          //   // location: "Location available in theater details",
          //   screens: theaterData.screens.join(', '), // Join screen names with commas
          //   screensList: theaterData.screens, // Store the original array for conditional rendering
          //   showtimes: theaterData.showtimes // Use real showtimes from API
          // }));
          const formattedTheaters = data.theaterSlots.map(theaterData => ({
  id: `${city.toLowerCase()}-${theaterData.theater.replace(/\s/g, '-')}`,
  name: theaterData.theater,
  location: "-", // If no location, placeholder
  slots: theaterData.slots || []
}));
          setAvailableTheaters(formattedTheaters);
        } else {
          setAvailableTheaters([]);
          toast.error('No theaters available for this selection');
        }
      } else {
        // If only city is provided, use the original theaters endpoint
        const { data } = await axios.get('/api/show/theaters', { params: { city } });
        
        if (data.success && data.theaters.length > 0) {
          // Transform theater names into the format expected by the component
          const formattedTheaters = data.theaters.map((theaterName, index) => ({
            id: `${city.toLowerCase()}-${index}`,
            name: theaterName,
            // location: "Location available in theater details",
            screens: "Select a date to see available screens",
            showtimes: []
          }));
          setAvailableTheaters(formattedTheaters);
        } else {
          setAvailableTheaters([]);
          toast.error('No theaters available for this selection');
        }
      }
    } catch (error) {
      console.error('Error fetching theaters:', error);
      toast.error('Error loading theaters');
      setAvailableTheaters([]);
    } finally {
      setTheatersLoading(false);
    }
  };

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.success) {
        setShow(data)
      } else {
        // If API returns success:false, check if we can find the movie in the shows context
        const movieFromContext = shows.find(movie => movie._id === id)
        if (movieFromContext) {
          // Create a compatible show object structure
          setShow({
            movie: movieFromContext,
            success: true
          })
        } else {
          toast.error("Could not load movie details")
        }
      }
    } catch (error) {
      console.log(error)
      toast.error("Error loading movie details")
      
      // Fallback to shows context if API fails
      const movieFromContext = shows.find(movie => movie._id === id)
      if (movieFromContext) {
        // Create a compatible show object structure
        setShow({
          movie: movieFromContext,
          success: true
        })
      }
    }
  }

  const handleFavorite = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");

      const { data } = await axios.post('/api/user/update-favorite', { movieId: id },
        { headers: { Authorization: `Bearer ${await getToken()}` } })

      if (data.success) {
        toast.success(data.message)
      }

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getShow()
    fetchCities() // Fetch cities when component mounts
  }, [id])

  // Compute trailerSrc once in the component render
  const trailerSrc = show ? getYoutubeEmbedUrl(show.movie.trailerUrl) : null;

  return show ? (
    <div>
      <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
        <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>

          {show.movie.poster_path ? (
            <img src={image_base_url + show.movie.poster_path} alt="" className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' />
          ) : (
            <div className='max-md:mx-auto rounded-xl h-104 max-w-70 bg-gray-800 flex items-center justify-center'>
              <span className='text-gray-400'>No poster available</span>
            </div>
          )}

          <div className='relative flex flex-col gap-3'>
            <BlurCircle top="-100px" left="-100px" />
            <p className='text-primary'>{show.movie.original_language || 'ENGLISH'}</p>
            <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
            <div className='flex items-center gap-2 text-gray-300'>
              <StarIcon className='w-5 h-5 text-primary fill-primary' />
              {show.movie.vote_average?.toFixed(1) || '0.0'} User Rating
            </div>
            <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>

            <p>
              {timeFormat(show.movie.runtime || 0)} · {show.movie.genres?.map(genre => genre.name).join(", ") || 'N/A'} · {show.movie.release_date?.split("-")[0] || 'N/A'}
            </p>

            <div className='flex items-center flex-wrap gap-4 mt-4'>
              <button
                onClick={() => trailerSrc ? setShowTrailer(true) : toast.error('Trailer not available')}
                className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'
              >
                <PlayCircleIcon className='w-5 h-5' />
                Watch Trailer
              </button>
              <button
                onClick={handleFavorite}
                className={`flex items-center gap-2 px-7 py-3 text-sm ${favoriteMovies.includes(id) ? 'bg-primary/20 text-primary' : 'bg-gray-800 hover:bg-gray-900'} transition rounded-md font-medium cursor-pointer active:scale-95`}
              >
                <Heart className={`w-5 h-5 ${favoriteMovies.includes(id) ? 'fill-primary' : ''}`} />
                {favoriteMovies.includes(id) ? 'Added to Favorites' : 'Add to Favorites'}
              </button>
            </div>

            <div className='flex items-center gap-4 mt-6'>
              <a href="#dateSelect" className='flex items-center gap-2 px-7 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'>
                <Calendar className='w-5 h-5' />
                Book Tickets
              </a>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {show.movie.credits && show.movie.credits.cast && show.movie.credits.cast.length > 0 && (
          <>
            <p className='text-lg font-medium mt-20 mb-8'>Cast</p>
            <div className='overflow-x-auto pb-4'>
              <div className='flex gap-8 w-max'>
                {show.movie.credits.cast.slice(0, 10).map((cast, index) => (
                  <div key={index} className='flex flex-col items-center text-center'>
                    <img src={image_base_url + cast.profile_path} alt="" className='rounded-full h-20 md:h-20 aspect-square object-cover' />
                    <p className='font-medium text-xs mt-3'>{cast.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {/* City and Date Selector */}
        <div id='dateSelect' className='pt-30'>
          <div className='flex flex-col items-center justify-center relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
            <BlurCircle top='-100px' left='-100px' />
            <BlurCircle top='100px' right='0px' />
            <div className='w-full max-w-xs'>
              <p className='text-lg font-semibold text-white text-center mb-4'>Select City</p>
              <div className="relative">
                {!user && (
                  <div
                    className="absolute inset-0 z-10 cursor-not-allowed"
                    onClick={() => toast.error('Please login first to select a city')}
                  ></div>
                )}
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    const city = e.target.value;
                    setSelectedCity(city);
                    if (city) {
                      fetchDates(city);
                    }
                  }}
                  className='w-full p-3 bg-gray-800 text-white border border-primary/50 rounded-md focus:outline-none focus:border-primary'
                >
                  <option value="" disabled>Select your city...</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Selection - Only visible when a city is selected */}
            {selectedCity && (
              <div className='w-full mt-6'>
                <p className='text-lg font-semibold text-white text-center mb-4'>Select Date</p>
                {datesLoading ? (
                  <div className='flex justify-center py-4'>
                    <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
                  </div>
                ) : availableDates.length > 0 ? (
                  <div className='flex items-center justify-center gap-2 overflow-x-auto pb-2'>
                    {availableDates.map((dateObj, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedDate(dateObj);
                          fetchTheaters(selectedCity, dateObj);
                        }}
                        className={`flex flex-col items-center justify-center p-3 min-w-[70px] rounded-lg transition-all ${selectedDate && selectedDate.formattedDate === dateObj.formattedDate
                          ? 'bg-primary text-white'
                          : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                      >
                        <span className='text-xs font-medium'>{dateObj.day}</span>
                        <span className='text-lg font-bold'>{dateObj.date}</span>
                        <span className='text-xs'>{dateObj.month}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-4 text-gray-300'>
                    No shows available for this city
                  </div>
                )}
              </div>
            )}

            {/* Theater List - Only visible when both city and date are selected */}
            {selectedCity && selectedDate && (
              <div className='w-full mt-8'>
                <p className='text-lg font-semibold text-white text-center mb-6'>Theaters in {selectedCity}</p>
                {theatersLoading ? (
                  <div className='flex justify-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
                  </div>
                ) : availableTheaters.length > 0 ? (
                  <div className='space-y-6'>
                    {availableTheaters.map((theater) => (
  <div key={theater.id} className="bg-gray-800/50 p-4 rounded-lg">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
      <h3 className="text-white font-medium">{theater.name}</h3>
      <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
        {theater.slots && theater.slots.length > 0 ? (
          theater.slots.map((slot, idx) => (
            <button
              key={slot.showId}
              className="bg-gray-700 hover:bg-primary/40 text-white text-xs px-3 py-1.5 rounded-md transition-all"
              onClick={() => {
                navigate(`/movies/${id}/${selectedDate.formattedDate}`, {
                  state: {
                    city: selectedCity,
                    theater: theater.name,
                    showtime: new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    movieTitle: show.movie.title,
                    date: selectedDate,
                    screen: slot.screen,
                    showId: slot.showId
                  }
                });
              }}
            >
              {new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} ({slot.screen})
            </button>
          ))
        ) : (
          <span className="text-gray-400 text-xs">No showtimes available</span>
        )}
      </div>
    </div>
  </div>
))}

                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-300'>
                    No theaters available for this date
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>
          <div className='flex flex-wrap max-sm:justify-center gap-8'>
            {shows.slice(0, 4).map((movie, index) => (
              <MovieCard key={index} movie={movie} />
            ))}
          </div>
          <div className='flex justify-center mt-20'>
            <button onClick={() => { navigate('/movies'); scrollTo(0, 0) }} className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Show more</button>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(10, 10, 10, 0.50)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)"
          }}>
          <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-3 right-3 bg-gray-800 hover:bg-gray-700 p-2 rounded-full z-10 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              {trailerSrc ? (
                <iframe
                  src={trailerSrc}
                  title={`${show.movie.title} Trailer`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <p className="text-gray-400 text-lg">Trailer not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  ) : <Loading />
}

// Helper function to convert YouTube URL to embed format
const getYoutubeEmbedUrl = (url) => {
  // Return null if URL is falsy
  if (!url) return null;

  // Handle YouTube Shorts format
  const shortsRegExp = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
  const shortsMatch = url.match(shortsRegExp);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // Handle different YouTube URL formats
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
  const match = url.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    // Return embed URL
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  // If URL is already in embed format, verify it's a valid YouTube embed
  if (url.includes('youtube.com/embed/') && url.split('youtube.com/embed/')[1].length >= 11) {
    return url;
  }

  // Return null if no valid YouTube URL format is detected
  return null;
};

export default MovieDetails