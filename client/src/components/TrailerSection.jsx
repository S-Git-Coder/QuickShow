import React, { useState, useEffect } from 'react'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { PlayCircleIcon } from 'lucide-react'
import axios from 'axios'

const TrailerSection = () => {
    const [trailers, setTrailers] = useState([])
    const [currentTrailer, setCurrentTrailer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [hasTrailers, setHasTrailers] = useState(true)

    useEffect(() => {
        const fetchTrailers = async () => {
            try {
                setLoading(true)
                const response = await axios.get('/api/show/active-trailers')
                
                if (response.data.success) {
                    setTrailers(response.data.trailers)
                    setHasTrailers(response.data.hasTrailers)
                    
                    if (response.data.trailers.length > 0) {
                        setCurrentTrailer(response.data.trailers[0])
                    } else {
                        setCurrentTrailer(null)
                    }
                }
            } catch (error) {
                console.error('Error fetching trailers:', error)
                setHasTrailers(false)
            } finally {
                setLoading(false)
            }
        }

        fetchTrailers()
    }, [])

    if (loading) {
        return (
            <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
                <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>
                <div className='flex justify-center items-center h-[540px]'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
                </div>
            </div>
        )
    }

    if (!hasTrailers || trailers.length === 0) {
        return (
            <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
                <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>
                <div className='flex justify-center items-center h-[300px]'>
                    <p className='text-gray-400 text-lg'>No active trailers available</p>
                </div>
            </div>
        )
    }

    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
            <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>

            <div className='relative mt-6'>
                <BlurCircle top='-100px' right='-100px' />
                {currentTrailer && (
                    <ReactPlayer 
                        url={currentTrailer.videoUrl} 
                        controls={false}
                        className='mx-auto max-w-full' 
                        width="960px" 
                        height="540px"  // Desktop
                        style={{
        height: window.innerWidth < 768 ? '300px' : '400px'
    }}
                    />
                )}
            </div>

            {trailers.length > 1 && (
                <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
                    {trailers.map((trailer) => (
                        <div 
                            key={trailer.image} 
                            className={`relative group-hover:not-hover:opacity-50 overflow-hidden
                            hover:-translate-y-1 duration-300 transition aspect-[2/3] cursor-pointer rounded-lg
                            ${currentTrailer && currentTrailer.videoUrl === trailer.videoUrl ? 'ring-2 ring-primary ring-offset-0' : ''}`}
                            onClick={() => setCurrentTrailer(trailer)}
                        >
                            <img 
                                src={trailer.image} 
                                alt={trailer.title} 
                                className='rounded-lg w-full h-full object-cover brightness-75'
                            />
                            <PlayCircleIcon 
                                strokeWidth={1.6} 
                                className='absolute top-1/2 left-1/2 w-5
                                md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2'
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TrailerSection