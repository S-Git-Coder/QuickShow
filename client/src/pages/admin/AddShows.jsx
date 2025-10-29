import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { CheckIcon, Trash2Icon, StarIcon, PencilIcon } from 'lucide-react';
import { KConverter } from '../../lib/KConverter';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Custom styles for dropdowns
const dropdownStyles = `
  select {
    background-color: black !important;
  }
  
  select option {
    background-color: black !important;
    color: white !important;
  }
`;

// Data structure for cities, theaters, and screens
const citiesData = [
  { id: 1, name: "Mumbai" },
  { id: 2, name: "Delhi" },
  { id: 3, name: "Bangalore" },
  { id: 4, name: "Hyderabad" },
  { id: 5, name: "Chennai" },
  { id: 6, name: "Ahmedabad" },
  { id: 7, name: "Kolkata" },
  { id: 8, name: "Pune" }
];

const theatersData = [
  { id: 1, name: "PVR Juhu", cityId: 1 },
  { id: 2, name: "INOX Malad", cityId: 1 },
  { id: 3, name: "Cinepolis Andheri", cityId: 1 },
  { id: 4, name: "PVR Select Citywalk", cityId: 2 },
  { id: 5, name: "INOX Nehru Place", cityId: 2 },
  { id: 6, name: "PVR Forum Mall", cityId: 3 },
  { id: 7, name: "INOX Garuda", cityId: 3 },
  { id: 8, name: "PVR Kukatpally", cityId: 4 },
  { id: 9, name: "INOX GVK One", cityId: 4 },
  { id: 10, name: "SPI Palazzo", cityId: 5 },
  { id: 11, name: "PVR Phoenix", cityId: 5 },
  { id: 12, name: "PVR Acropolis", cityId: 6 },
  { id: 13, name: "INOX R16", cityId: 6 },
  { id: 14, name: "INOX Quest", cityId: 7 },
  { id: 15, name: "PVR Diamond Plaza", cityId: 7 },
  { id: 16, name: "PVR Market City", cityId: 8 },
  { id: 17, name: "INOX Amanora", cityId: 8 }
];

const screensData = [
  { id: 1, name: "Screen 1", theaterId: 1 },
  { id: 2, name: "Screen 2", theaterId: 1 },
  { id: 3, name: "Screen 3", theaterId: 1 },
  { id: 4, name: "Screen 1", theaterId: 2 },
  { id: 5, name: "Screen 2", theaterId: 2 },
  { id: 6, name: "Screen 1", theaterId: 3 },
  { id: 7, name: "Screen 2", theaterId: 3 },
  { id: 8, name: "Screen 3", theaterId: 3 },
  { id: 9, name: "Screen 4", theaterId: 3 },
  { id: 10, name: "Screen 1", theaterId: 4 },
  { id: 11, name: "Screen 2", theaterId: 4 },
  { id: 12, name: "Screen 1", theaterId: 5 },
  { id: 13, name: "Screen 1", theaterId: 6 },
  { id: 14, name: "Screen 2", theaterId: 6 },
  { id: 15, name: "Screen 1", theaterId: 7 },
  { id: 16, name: "Screen 1", theaterId: 8 },
  { id: 17, name: "Screen 2", theaterId: 8 },
  { id: 18, name: "Screen 1", theaterId: 9 },
  { id: 19, name: "Screen 1", theaterId: 10 },
  { id: 20, name: "Screen 2", theaterId: 10 },
  { id: 21, name: "Screen 1", theaterId: 11 },
  { id: 22, name: "Screen 1", theaterId: 12 },
  { id: 23, name: "Screen 1", theaterId: 13 },
  { id: 24, name: "Screen 1", theaterId: 14 },
  { id: 25, name: "Screen 2", theaterId: 14 },
  { id: 26, name: "Screen 1", theaterId: 15 },
  { id: 27, name: "Screen 1", theaterId: 16 },
  { id: 28, name: "Screen 2", theaterId: 16 },
  { id: 29, name: "Screen 1", theaterId: 17 }
];

// Function to convert 24-hour time to 12-hour format with AM/PM
const formatTime = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${period}`;
};

const AddShows = () => {

  const { axios, getToken, user, image_base_url } = useAppContext()

  const currency = import.meta.env.VITE_CURRENCY
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [addingShow, setAddingShow] = useState(false);

  // State for form fields
  const [city, setCity] = useState("");
  const [theater, setTheater] = useState("");
  const [screen, setScreen] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [showRecords, setShowRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);

  // Filtered lists based on selections
  const [availableTheaters, setAvailableTheaters] = useState([]);
  const [availableScreens, setAvailableScreens] = useState([]);

  // Use local state for cities to ensure rendering
  const [localCitiesData, setLocalCitiesData] = useState([]);

  // Fetch all cities from the API
   const fetchCities = async () => {
     try {
       const { data } = await axios.get('/api/show/all-cities');
       if (data.success && data.cities.length > 0) {
         // Map the cities to the format expected by the dropdown
         const formattedCities = data.cities.map((cityName, index) => ({
           id: index + 1,
           name: cityName
         }));
         setLocalCitiesData(formattedCities);
       } else {
         // Fallback to static data if no cities found
         setLocalCitiesData(citiesData);
       }
     } catch (error) {
       console.error('Error fetching cities:', error);
       // Fallback to static data on error
       setLocalCitiesData(citiesData);
     }
   };

  // Add style element to fix dropdown background color
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      select option {
        background-color: black !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Debug log to check citiesData
  // console.log("citiesData:", citiesData);

  // Handle city change
  const handleCityChange = (e) => {
    const cityValue = e.target.value;
    // Store the city name, not the ID
    const selectedCityName = localCitiesData.find(c => c.id.toString() === cityValue)?.name || cityValue;
    setCity(selectedCityName);

    // Reset dependent fields
    setTheater("");
    setScreen("");

    // Fetch theaters for the selected city
    if (selectedCityName) {
      fetchTheaters(selectedCityName);
    } else {
      setAvailableTheaters([]);
    }

    setAvailableScreens([]);
  };

  // Fetch theaters for a specific city
  const fetchTheaters = async (cityName) => {
    try {
      const { data } = await axios.get('/api/show/theaters', {
        params: { city: cityName }
      });
      
      if (data.success && data.theaters.length > 0) {
        // Map the theaters to the format expected by the dropdown
        const formattedTheaters = data.theaters.map((theaterName, index) => ({
          id: index + 1,
          name: theaterName
        }));
        setAvailableTheaters(formattedTheaters);
      } else {
        // Fallback to static data if no theaters found
        // Find city ID from name for fallback
        const selectedCity = citiesData.find(c => c.name === cityName);
        const selectedCityId = selectedCity ? selectedCity.id : null;
        
        if (selectedCityId) {
          const filteredTheaters = theatersData.filter(theater => theater.cityId === selectedCityId);
          setAvailableTheaters(filteredTheaters);
        } else {
          setAvailableTheaters([]);
        }
      }
    } catch (error) {
      console.error('Error fetching theaters:', error);
      // Fallback to static data on error
      const selectedCity = citiesData.find(c => c.name === cityName);
      const selectedCityId = selectedCity ? selectedCity.id : null;
      
      if (selectedCityId) {
        const filteredTheaters = theatersData.filter(theater => theater.cityId === selectedCityId);
        setAvailableTheaters(filteredTheaters);
      } else {
        setAvailableTheaters([]);
      }
    }
  };

  // Handle theater change
  const handleTheaterChange = (e) => {
    const selectedTheaterId = e.target.value;
    // Store the theater name, not the ID
    const selectedTheaterName = availableTheaters.find(t => t.id.toString() === selectedTheaterId)?.name || selectedTheaterId;
    setTheater(selectedTheaterName);

    // Reset dependent field
    setScreen("");

    // Filter screens based on selected theater
    if (selectedTheaterId) {
      const theaterIdNum = parseInt(selectedTheaterId);
      const filteredScreens = screensData.filter(screen => screen.theaterId === theaterIdNum);
      setAvailableScreens(filteredScreens);
    } else {
      setAvailableScreens([]);
    }
  };

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get('/api/show/now-playing', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setNowPlayingMovies(data.movies)
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setAddingShow(true)

      if (!selectedMovie || Object.keys(dateTimeSelection).length === 0) {
        return toast('Missing required fields');
      }

      const showsInput = Object.entries(dateTimeSelection).map(([date, time]) => ({ date, time }));

      const payload = {
        movieId: selectedMovie,
        showsInput
      }

      const { data } = await axios.post('/api/show/add', payload, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        toast.success(data.message)
        setSelectedMovie(null)
        setDateTimeSelection({})
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error('An error occurred. Please try again.')
    }
    setAddingShow(false)
  }

  // New handlers for form fields
  const handleAddRecord = () => {
    if (!city || !theater || !screen || !date || !time) {
      toast.error('Please fill all fields');
      return;
    }

    // For screen, we still need to find the object since we're using IDs in the dropdown
    const selectedScreenObj = screensData.find(s => s.id === parseInt(screen));
    const screenName = selectedScreenObj ? selectedScreenObj.name : '';

    // Use the city and theater names directly as they're already stored as names
    const recordData = {
      cityName: city, // Already storing the name
      theaterName: theater, // Already storing the name
      screenId: parseInt(screen),
      screenName: screenName,
      date,
      time
    };

    if (editIndex >= 0) {
      // Update existing record
      const updatedRecords = [...showRecords];
      updatedRecords[editIndex] = recordData;
      setShowRecords(updatedRecords);
      setEditIndex(-1);
    } else {
      // Add new record
      setShowRecords([...showRecords, recordData]);
    }

    // Clear form fields
    setCity("");
    setTheater("");
    setScreen("");
    setDate("");
    setTime("");

    // Clear filtered lists
    setAvailableTheaters([]);
    setAvailableScreens([]);
  };

  const handleEdit = (index) => {
    const record = showRecords[index];
    setCity(record.cityName);

    // Find city ID from name for fetching theaters
    const selectedCity = citiesData.find(c => c.name === record.cityName);
    const selectedCityId = selectedCity ? selectedCity.id : null;
    
    // Set available theaters for the selected city
    if (selectedCityId) {
      const filteredTheaters = theatersData.filter(theater => theater.cityId === selectedCityId);
      setAvailableTheaters(filteredTheaters);
    } else {
      // Try to fetch theaters from API
      fetchTheaters(record.cityName);
    }

    setTheater(record.theaterName);

    // Find theater ID from name for fetching screens
    const selectedTheater = theatersData.find(t => t.name === record.theaterName);
    const selectedTheaterId = selectedTheater ? selectedTheater.id : null;
    
    // Set available screens for the selected theater
    if (selectedTheaterId) {
      const filteredScreens = screensData.filter(screen => screen.theaterId === selectedTheaterId);
      setAvailableScreens(filteredScreens);
    }

    setScreen(record.screenId);
    setDate(record.date);
    setTime(record.time);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedRecords = showRecords.filter((_, i) => i !== index);
    setShowRecords(updatedRecords);
  };

  const handleAddShow = async () => {
    if (showRecords.length === 0) {
      toast.error('Please add at least one show record');
      return;
    }

    try {
      setAddingShow(true);

      const payload = {
        movieId: selectedMovie,
        trailerUrl,
        showsInput: showRecords.map(r => ({
          city: r.cityName,
          theater: r.theaterName,
          screen: r.screenName,
          date: r.date,
          time: Array.isArray(r.time) ? r.time : [r.time] // Ensure time is always an array
        }))
      };

      const { data } = await axios.post('/api/show/add', payload, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        toast.success('Show added successfully');
        // Clear all data
        setShowRecords([]);
        setTrailerUrl("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error adding show:', error);
      toast.error('An error occurred. Please try again.');
    }

    setAddingShow(false);
  };

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
      fetchCities(); // Fetch cities when component mounts
    }
    // Initialize localCitiesData with the citiesData array
    setLocalCitiesData(citiesData);
    // Debug log to check if component is mounting properly
    // console.log("Component mounted, citiesData:", citiesData);
  }, [user]);

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />
      <p className='mt-10 text-lg font-medium'>Now Playing Movies</p>
      <div className='overflow-x-auto pb-4'>
        <div className='group flex flex-wrap gap-4 mt-4 w-max'>
          {nowPlayingMovies.map((movie) => (
            <div key={movie.id} className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300`} onClick={() => setSelectedMovie(selectedMovie === movie.id ? null : movie.id)}>
              <div className='relative rounded-lg overflow-hidden'>
                <img src={image_base_url + movie.poster_path} alt="" className='w-full object-cover brightness-90' />
                <div className='text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0'>
                  <p className='flex items-center gap-1 text-gray-400'>
                    <StarIcon className='w-4 h-4 text-primary fill-primary' />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className='text-gray-300'>{KConverter(movie.vote_count)}Votes</p>
                </div>
              </div>
              {selectedMovie === movie.id && (
                <div className='absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded'>
                  <CheckIcon className='w-4 h-4 text-white' strokeWidth={2.5} />
                </div>
              )}
              <p className='font-medium truncate'>{movie.title}</p>
              <p className='text-gray-400 text-sm'>{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Show Details Section */}
      <div className='mt-10'>
        <h2 className='text-lg font-medium mb-4'>Show Details</h2>

        <div className='flex flex-wrap items-end gap-4'>
          {/* City Dropdown */}
          <div className='flex-1 min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>City</label>
            <div className="relative">
              {!selectedMovie && (
                <div
                  className="absolute inset-0 z-10 cursor-not-allowed"
                  onClick={() => toast('Please select a movie first.')}
                ></div>
              )}
              <select
                value={city ? (localCitiesData.find(c => c.name === city)?.id.toString() || "") : ""}
                onChange={handleCityChange}
                className='w-full border border-gray-700 text-white px-3 py-2 rounded-md outline-none bg-transparent'
                disabled={!selectedMovie}
              >
                <option value="">Select City</option>
                {localCitiesData.map(cityOption => (
                  <option key={cityOption.id} value={cityOption.id.toString()} className="text-white bg-transparent">
                    {cityOption.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Theater Dropdown */}
          <div className='flex-1 min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>Theater</label>
            <select
              value={theater ? (availableTheaters.find(t => t.name === theater)?.id.toString() || "") : ""}
              onChange={handleTheaterChange}
              className='w-full border border-gray-700 text-white px-3 py-2 rounded-md outline-none bg-transparent'
              disabled={!city}
            >
              <option value="">Select Theater</option>
              {availableTheaters.map(theaterOption => (
                <option key={theaterOption.id} value={theaterOption.id.toString()} className="text-white bg-transparent">{theaterOption.name}</option>
              ))}
            </select>
          </div>

          {/* Screen Dropdown */}
          <div className='flex-1 min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>Screen</label>
            <select
              value={screen}
              onChange={(e) => setScreen(e.target.value)}
              className='w-full border border-gray-700 text-white px-3 py-2 rounded-md outline-none bg-transparent'
              disabled={!theater}
            >
              <option value="">Select Screen</option>
              {availableScreens.map(screenOption => (
                <option key={screenOption.id} value={screenOption.id} className="text-white bg-transparent">{screenOption.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className='flex-1 min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className='w-full border border-gray-600 bg-transparent px-3 py-2 rounded-md outline-none'
            />
          </div>

          {/* Time Picker */}
          <div className='flex-1 min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className='w-full border border-gray-600 bg-transparent px-3 py-2 rounded-md outline-none'
            />
          </div>
        </div>

        {/* Add Record Button */}
        <div className='mt-4'>
          <button
            onClick={handleAddRecord}
            className='bg-primary text-white px-8 py-2 rounded hover:bg-primary/90 transition-all cursor-pointer'
          >
            {editIndex >= 0 ? 'Update Record' : 'Add Record'}
          </button>
        </div>
      </div>

      {/* Added Shows Table */}
      {showRecords.length > 0 && (
        <div className='mt-8'>
          <h3 className='text-lg font-medium mb-4'>Added Shows</h3>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-gray-800'>
                  <th className='text-left p-3'>City</th>
                  <th className='text-left p-3'>Theater</th>
                  <th className='text-left p-3'>Screen</th>
                  <th className='text-left p-3'>Date</th>
                  <th className='text-left p-3'>Time</th>
                  <th className='text-left p-3'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {showRecords.map((record, index) => (
                  <tr key={index} className='border-b border-gray-700'>
                    <td className='p-3'>{record.cityName}</td>
                    <td className='p-3'>{record.theaterName}</td>
                    <td className='p-3'>{record.screenName}</td>
                    <td className='p-3'>{record.date}</td>
                    <td className='p-3'>{formatTime(record.time)}</td>
                    <td className='p-3 flex gap-2'>
                      <button
                        onClick={() => handleEdit(index)}
                        className='p-1 bg-blue-500 text-white rounded hover:bg-blue-600'
                      >
                        <PencilIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className='p-1 bg-red-500 text-white rounded hover:bg-red-600'
                      >
                        <Trash2Icon size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trailer YouTube URL */}
      <div className='mt-8'>
        <label className='block text-sm font-medium mb-2'>Trailer YouTube URL</label>
        <input
          type="text"
          value={trailerUrl}
          onChange={(e) => setTrailerUrl(e.target.value)}
          placeholder='https://youtu.be/DUXaIw-l4lMmV93'
          className='w-full border border-gray-600 bg-transparent px-3 py-2 rounded-md outline-none'
        />
      </div>




      {/* Display Selected Times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className='mt-6'>
          <h2 className='mb-2'>Selected Date-Time</h2>
          <ul className='space-y-3'>
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className='font-medium'>{date}</div>
                <div className='flex flex-wrap gap-2 mt-1 text-sm'>
                  {times.map((time) => (
                    <div key={time} className='border border-primary px-2 py-1 flex items-center rounded'>
                      <span>{time}</span>
                      <DeleteIcon onClick={() => handleRemoveTime(date, time)} width={15} className='ml-2 text-red-500 hover:text-red-700 cursor-pointer' />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleAddShow} disabled={addingShow} className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'>
        Add Show
      </button>
    </>
  ) : <Loading />
}

export default AddShows