import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/simpleDateFormat'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '@clerk/clerk-react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY
  const { axios, getToken, user, image_base_url } = useAppContext()
  const { isLoaded } = useAuth()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // On redirect from payment, just show a toast and clean URL, no overlays
  useEffect(() => {
    if (orderId) {
      toast.success('Payment successful!')
      window.history.replaceState({}, document.title, '/my-bookings')
      sessionStorage.removeItem('pendingOrderId')
      sessionStorage.removeItem('paymentRedirect')
      // Trigger a quick background verify to flip Pending → Paid if webhook is slow
      axios.get(`/api/booking/verify/${orderId}`).catch(() => { })
    }
  }, [orderId])

  const getMyBookings = async () => {
    try {
      const token = await getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      const { data } = await axios.get('/api/user/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (_) {
      // ignore and stop loading
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch bookings when auth is ready
  useEffect(() => {
    if (!isLoaded) return
    if (user) getMyBookings()
    else setIsLoading(false)
  }, [isLoaded, user])

  return !isLoading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom='0px' left='600px' />
      </div>
      <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>

      {bookings.length === 0 && (
        <div className='bg-primary/8 border border-primary/20 rounded-lg p-6 max-w-3xl'>
          <p>You don't have any bookings yet.</p>
        </div>
      )}

      {bookings.map((item, index) => {
        // Defensive guards: item or nested properties may be null after redirect/webhook timing
        if (!item) return null

        const show = item.show || {}
        const movie = show.movie || {}
        const posterPath = movie.poster_path ? image_base_url + movie.poster_path : ''
        const title = movie.title || 'Untitled'
        const runtime = movie.runtime ? timeFormat(movie.runtime) : ''
        const showDate = show.showDateTime ? dateFormat(show.showDateTime) : ''
        const amount = typeof item.amount !== 'undefined' ? item.amount : '0'
        const bookedSeats = Array.isArray(item.bookedSeats) ? item.bookedSeats : []
        const isPaid = Boolean(item.isPaid)

        return (
          <div key={item._id || index} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
            <div className='flex flex-col md:flex-row'>
              <img src={posterPath} alt={title} className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' />
              <div className='flex flex-col p-4'>
                <p className='text-lg font-semibold'>{title}</p>
                <p className='text-gray-400 text-sm'>{runtime}</p>
                <p className='text-gray-400 text-sm mt-auto'>{showDate}</p>
              </div>
            </div>

            <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
              <div className='flex items-center gap-4'>
                <p className='text-2xl font-semibold mb-3'>{currency}{amount}</p>
                {!isPaid && (
                  <button
                    onClick={() => {
                      if (item.paymentLink) {
                        window.location.href = item.paymentLink
                      } else {
                        toast.error('Payment link not available. Please try again later.')
                        getMyBookings()
                      }
                    }}
                    className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'
                  >
                    Pay Now
                  </button>
                )}
              </div>
              <div className='text-sm'>
                <p><span className='text-gray-400'>Total Tickets:</span> {bookedSeats.length}</p>
                <p><span className='text-gray-400'>Seat Number:</span> {bookedSeats.join(', ')}</p>
                <p><span className='text-gray-400'>Status:</span> <span className={isPaid ? 'text-green-500' : 'text-yellow-500'}>{isPaid ? 'Paid' : 'Pending'}</span></p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  ) : <Loading />
}

export default MyBookings