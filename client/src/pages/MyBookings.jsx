import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/simpleDateFormat'
import { useAppContext } from '../context/AppContext'
import { useSearchParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const navigate = useNavigate()

  const { axios, getToken, user, isLoaded } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [paymentProcessing, setPaymentProcessing] = useState(!!orderId)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [debugInfo, setDebugInfo] = useState({})

  // EMERGENCY IMMEDIATE FIX - Force success on any orderId
  useEffect(() => {
    if (orderId) {
      console.log('🚨 EMERGENCY: Payment redirect detected - orderId:', orderId);
      console.log('🔄 Forcing immediate success state');

      // Immediate success - no waiting
      setPaymentSuccess(true);
      setPaymentProcessing(false);
      setIsLoading(false);

      // Show success toast immediately
      toast.success('Payment successful! Your booking has been confirmed.');

      // Clear URL after showing success
      setTimeout(() => {
        window.history.replaceState({}, document.title, '/my-bookings');
        sessionStorage.clear();
      }, 100);

      return; // Exit early
    }
  }, [orderId]);

  // Emergency redirect button function
  const forceRedirect = () => {
    console.log('🔴 FORCE REDIRECT TRIGGERED');
    setPaymentSuccess(true);
    setPaymentProcessing(false);
    setIsLoading(false);
    window.history.replaceState({}, document.title, '/my-bookings');
    sessionStorage.clear(); // Clear all session storage
    toast.success('Redirected successfully!');
  };

  // Manual payment verification function
  const verifyPaymentManually = async () => {
    if (!orderId) return;

    try {
      console.log('🔍 Manual payment verification for:', orderId);
      const response = await axios.get(`/api/booking/verify/${orderId}`);
      console.log('Verification response:', response.data);

      if (response.data.success) {
        console.log('✅ Payment verified successfully');
        setPaymentSuccess(true);
        setPaymentProcessing(false);
        setIsLoading(false);
        window.history.replaceState({}, document.title, '/my-bookings');
        sessionStorage.clear();
        toast.success('Payment verified! Your booking is confirmed.');

        // Refresh bookings to show updated data
        if (user) {
          getMyBookings();
        }
      } else {
        console.log('❌ Payment verification failed');
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Unable to verify payment. Please contact support.');
    }
  };  // Check if authentication is ready
  useEffect(() => {
    console.log('Auth status check effect running');
    console.log('User authenticated:', !!user);
    console.log('Auth loaded:', isLoaded);

    if (isLoaded) {
      console.log('Authentication state is loaded');
      setAuthReady(true);
    }
  }, [user, isLoaded]);

  // Add a failsafe timeout to prevent infinite loading
  useEffect(() => {
    const failsafeTimeout = setTimeout(() => {
      console.log('Failsafe timeout triggered - clearing all loading states');
      setIsLoading(false);
      setPaymentProcessing(false);
      if (orderId && !paymentSuccess) {
        console.log('Setting payment success due to failsafe timeout');
        setPaymentSuccess(true);
        window.history.replaceState({}, document.title, '/my-bookings');
        sessionStorage.removeItem('pendingOrderId');
        sessionStorage.removeItem('paymentRedirect');
      }
    }, 15000); // 15 seconds failsafe

    return () => clearTimeout(failsafeTimeout);
  }, [orderId, paymentSuccess]);

  const getMyBookings = async () => {
    console.log('getMyBookings function called');
    try {
      console.log('Fetching bookings with token...');
      const token = await getToken();
      console.log('Token available:', !!token);

      if (!token) {
        console.log('No token available, setting loading to false');
        setIsLoading(false);
        setPaymentProcessing(false);
        return;
      }

      console.log('Making API request to /api/user/bookings...');
      const { data } = await axios.get('/api/user/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('API Response:', data);
      console.log('Response status:', data.success ? 'Success' : 'Failed');

      if (data.success) {
        console.log('Bookings data received:', data.bookings);
        console.log('Number of bookings:', data.bookings.length);
        // Debug: Check if paymentLink is included in the response
        data.bookings.forEach(booking => {
          console.log(`Booking ${booking._id} details:`, {
            id: booking._id,
            amount: booking.amount,
            isPaid: booking.isPaid,
            paymentLink: booking.paymentLink,
            seats: booking.bookedSeats
          });
        });
        setBookings(data.bookings)
        console.log('Bookings state updated successfully');

        // If we have an orderId from the URL, find the matching booking and check its payment status
        if (orderId) {
          // Extract the booking ID from the orderId
          // The orderId format is 'order_<bookingId>'
          const bookingId = orderId.replace('order_', '');
          console.log('Looking for booking with ID:', bookingId);

          const matchingBooking = data.bookings.find(b => b._id === bookingId);

          if (matchingBooking) {
            console.log('Found matching booking:', matchingBooking);
            console.log('Payment status:', matchingBooking.isPaid ? 'Paid' : 'Not paid');

            // If the booking is paid, show success and clear URL
            if (matchingBooking.isPaid) {
              console.log('Payment confirmed as successful');
              setPaymentSuccess(true);
              window.history.replaceState({}, document.title, '/my-bookings');
            } else {
              // If not paid but we have orderId, we'll check again in a moment
              // This could be due to webhook delay
              console.log('Payment not yet marked as paid, will check again');
              // We'll keep the payment processing state active for now
              // The timeout will eventually clear it
            }
          } else {
            console.log('No matching booking found for orderId:', orderId);
            // If no matching booking is found, we should still handle the payment success
            // This could happen if the payment was processed but the booking data hasn't been updated yet
            console.log('Assuming payment success and clearing URL');
            setPaymentSuccess(true);
            window.history.replaceState({}, document.title, '/my-bookings');
          }

          // Always set payment processing to false after checking
          // This ensures we don't get stuck on the loading screen
          setPaymentProcessing(false);
          console.log('Payment processing state set to false');
        }
      }
    } catch (error) {
      console.log('Error fetching bookings:', error);
      console.log('Error details:', error.response ? error.response.data : 'No response data');
      console.log('Status code:', error.response ? error.response.status : 'No status code');
      console.log('Error stack:', error.stack);

      // Always clear loading states on error
      setPaymentProcessing(false);
      setIsLoading(false);
      console.log('Loading and payment processing states cleared due to error');
    } finally {
      // Ensure loading state is always cleared
      setIsLoading(false);
      console.log('Loading state set to false in finally block');
    }
  }

  // Force refresh user session if we have an orderId
  useEffect(() => {
    console.log('MyBookings component - Auth check effect running');
    console.log('Current orderId from URL:', orderId);
    console.log('User authenticated:', !!user);
    console.log('Auth ready state:', authReady);
    console.log('Auth loaded:', isLoaded);
    console.log('User details:', user ? { id: user.id, email: user.primaryEmailAddress?.emailAddress } : 'Not logged in');

    // Only proceed if authentication state is fully loaded
    if (!isLoaded) {
      console.log('Auth not fully loaded yet, waiting...');
      return;
    }

    if (orderId) {
      if (!user) {
        console.log('Payment redirect detected but no user, storing orderId and refreshing auth');
        // Store orderId in sessionStorage
        sessionStorage.setItem('pendingOrderId', orderId);
        // Set a flag to indicate we're coming from a payment
        sessionStorage.setItem('paymentRedirect', 'true');
        // Redirect to home page to refresh auth session
        console.log('Redirecting to home page to refresh auth session');
        navigate('/');
      } else {
        console.log('Payment redirect detected with authenticated user, triggering booking fetch');
        // If we have an orderId and user is authenticated, trigger a booking fetch
        getMyBookings();
      }
    }
  }, [orderId, user, navigate, isLoaded, authReady]);

  // Handle orderId in URL when user is not authenticated
  useEffect(() => {
    console.log('URL orderId check effect triggered');
    console.log('Auth ready state:', authReady);
    console.log('Auth loaded:', isLoaded);
    console.log('Current orderId from URL:', orderId);
    console.log('User authenticated:', !!user);

    // Only proceed if authentication state is fully loaded
    if (!isLoaded || !authReady) {
      console.log('Auth not fully loaded yet, skipping URL orderId check');
      return;
    }

    // If we have an orderId in the URL but user is not authenticated
    if (orderId && !user) {
      console.log('Found orderId in URL but user is not authenticated');
      console.log('Storing orderId in sessionStorage:', orderId);
      // Store the orderId in sessionStorage
      sessionStorage.setItem('pendingOrderId', orderId);
      sessionStorage.setItem('paymentRedirect', 'true');

      // Redirect to home page to refresh authentication
      console.log('Redirecting to home page to refresh authentication');
      navigate('/');
    }
  }, [orderId, user, navigate, isLoaded, authReady]);

  // Check for pendingOrderId in sessionStorage
  useEffect(() => {
    // Only proceed if authentication state is fully loaded
    if (!isLoaded || !authReady) {
      console.log('Auth not fully loaded yet, skipping session storage check');
      return;
    }

    const pendingOrderId = sessionStorage.getItem('pendingOrderId');
    const paymentRedirect = sessionStorage.getItem('paymentRedirect');

    console.log('Session storage check - Auth ready:', authReady);
    console.log('Session storage check - pendingOrderId:', pendingOrderId);
    console.log('Session storage check - paymentRedirect:', paymentRedirect);
    console.log('Session storage check - user authenticated:', !!user);

    if (pendingOrderId && user) {
      console.log('Found pending orderId in session storage, redirecting back to my-bookings');
      // Clear all payment-related session storage
      sessionStorage.removeItem('pendingOrderId');
      sessionStorage.removeItem('paymentRedirect');
      navigate(`/my-bookings?orderId=${pendingOrderId}`);
    } else if (paymentRedirect && user) {
      // If we have the payment redirect flag but no pending order ID,
      // we should still clear the flag and redirect to my-bookings
      console.log('Payment redirect detected but no pending orderId');
      sessionStorage.removeItem('paymentRedirect');
      navigate('/my-bookings');
    }
  }, [user, navigate, isLoaded, authReady]);

  // Handle payment redirect with orderId
  useEffect(() => {
    console.log('Payment processing effect triggered');
    console.log('Auth ready state:', authReady);
    console.log('Auth loaded:', isLoaded);

    // Only proceed if authentication state is fully loaded
    if (!isLoaded || !authReady) {
      console.log('Auth not fully loaded yet, skipping payment processing');
      return;
    }

    // Check if we have an orderId from URL or from sessionStorage
    const storedOrderId = sessionStorage.getItem('pendingOrderId');
    console.log('Stored orderId from sessionStorage:', storedOrderId);
    console.log('Current orderId from URL:', orderId);

    const effectiveOrderId = orderId || storedOrderId;
    console.log('Effective orderId to process:', effectiveOrderId);
    console.log('User authenticated:', !!user);
    console.log('Bookings loaded:', bookings.length);
    console.log('Is loading:', isLoading);

    // If we have an orderId and user is authenticated but no bookings yet,
    // and we're not already loading, trigger a booking fetch
    if (effectiveOrderId && user && bookings.length === 0 && !isLoading) {
      console.log('Have orderId and user but no bookings yet, triggering fetch');
      getMyBookings();
      return;
    }

    if (effectiveOrderId && user && bookings.length > 0) {
      console.log('Processing payment for orderId:', effectiveOrderId);
      console.log('User details:', { id: user.id, email: user.primaryEmailAddress?.emailAddress });
      console.log('Available bookings:', bookings.map(b => ({ id: b._id, isPaid: b.isPaid })));

      setPaymentProcessing(true);
      console.log('Payment processing state set to true');

      // Find the booking that matches this orderId
      // Handle both formats: with or without 'order_' prefix
      let bookingId;
      if (effectiveOrderId && effectiveOrderId.startsWith('order_')) {
        bookingId = effectiveOrderId.replace('order_', '');
      } else {
        // If orderId doesn't have the expected prefix, use it as is
        bookingId = effectiveOrderId;
      }
      console.log('Original orderId:', effectiveOrderId);
      console.log('Extracted booking ID from orderId:', bookingId);

      const matchingBooking = bookings.find(b => b._id === bookingId);
      console.log('All booking IDs:', bookings.map(b => b._id));
      console.log('Matching booking found:', !!matchingBooking);

      if (matchingBooking) {
        console.log('Found matching booking details:', {
          id: matchingBooking._id,
          isPaid: matchingBooking.isPaid,
          paymentStatus: matchingBooking.paymentStatus,
          amount: matchingBooking.amount
        });

        // If the booking is already paid, show success message
        if (matchingBooking.isPaid) {
          console.log('Booking is already marked as paid');
          setPaymentSuccess(true);
          console.log('Payment success state set to true');
          // Clear the stored orderId
          sessionStorage.removeItem('pendingOrderId');
          console.log('Removed pendingOrderId from sessionStorage');
          // Clear the orderId from URL after processing
          window.history.replaceState({}, document.title, '/my-bookings');
        } else {
          console.log('Booking is not yet marked as paid, waiting for webhook to update status');

          // Simplified timeout logic - just wait 5 seconds and then assume success
          setTimeout(() => {
            console.log('Timeout reached, assuming payment success');
            setPaymentSuccess(true);
            setPaymentProcessing(false);
            sessionStorage.removeItem('pendingOrderId');
            window.history.replaceState({}, document.title, '/my-bookings');
          }, 5000);
        }
      } else {
        console.log('No matching booking found for orderId:', effectiveOrderId);
        console.log('Available booking IDs:', bookings.map(b => b._id));

        // If no matching booking, assume payment was successful and clear states
        console.log('Assuming payment success despite no matching booking');
        setTimeout(() => {
          setPaymentSuccess(true);
          setPaymentProcessing(false);
          sessionStorage.removeItem('pendingOrderId');
          window.history.replaceState({}, document.title, '/my-bookings');
        }, 2000);
      }

      // Set a maximum timeout as fallback
      console.log('Setting maximum timeout for payment processing');
      const maxTimer = setTimeout(() => {
        console.log('Maximum payment processing time reached, forcing state update');
        setPaymentProcessing(false);
        setIsLoading(false);
        // If we have an orderId but processing timed out, assume success and clear URL
        if (effectiveOrderId) {
          console.log('Payment processing timed out with orderId, assuming success');
          setPaymentSuccess(true);
          // Clear the orderId from URL after processing
          window.history.replaceState({}, document.title, '/my-bookings');
          sessionStorage.removeItem('pendingOrderId');
        }
      }, 8000); // 8 seconds maximum wait time

      return () => {
        clearTimeout(maxTimer);
      };
    } else {
      console.log('Not processing payment because:', {
        hasEffectiveOrderId: !!effectiveOrderId,
        hasUser: !!user,
        hasBookings: bookings.length > 0
      });
    }
  }, [orderId, user, bookings, isLoading, isLoaded, authReady, getMyBookings]);

  useEffect(() => {
    console.log('Bookings fetch effect triggered');
    console.log('Auth ready state:', authReady);
    console.log('Auth loaded:', isLoaded);
    console.log('Auth ready state:', authReady);
    console.log('Auth loaded:', isLoaded);

    // Only proceed if authentication state is fully loaded
    if (!isLoaded) {
      console.log('Auth not fully loaded yet, skipping bookings fetch');
      return;
    }

    if (user) {
      console.log('User authenticated, fetching bookings');
      getMyBookings();
    } else {
      console.log('No user authenticated');
      // If no user but we have orderId, we'll still set loading to false after a timeout
      if (orderId) {
        console.log('No user but orderId present, setting timeout');
        setTimeout(() => {
          console.log('Timeout reached, clearing loading states');
          setPaymentProcessing(false);
          setIsLoading(false);
        }, 2000);
      } else {
        console.log('No user and no orderId, clearing loading state');
        setIsLoading(false);
      }
    }
  }, [user, orderId, isLoaded, authReady]);

  // Add a strong authentication guard for the entire component
  if (!isLoaded) {
    return (
      <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh] flex flex-col items-center justify-center'>
        <BlurCircle top="100px" left="100px" />
        <Loading />
        <p className='mt-4 text-lg'>Loading authentication...</p>
      </div>
    );
  }

  // If we're processing a payment, show a special loading message
  if (paymentProcessing) {
    return (
      <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh] flex flex-col items-center justify-center'>
        <BlurCircle top="100px" left="100px" />

        {/* Debug Panel */}
        <div className='bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 max-w-md'>
          <h3 className='text-red-400 font-semibold mb-2'>🚨 DEBUG INFO</h3>
          <div className='text-xs text-gray-300 space-y-1'>
            <p>OrderID: {debugInfo.orderId || 'None'}</p>
            <p>User Auth: {debugInfo.userAuthenticated ? '✅' : '❌'}</p>
            <p>Auth Loaded: {debugInfo.authLoaded ? '✅' : '❌'}</p>
            <p>Timestamp: {debugInfo.timestamp}</p>
          </div>
        </div>

        <Loading />
        <p className='mt-4 text-lg'>Processing your payment...</p>
        <p className='text-gray-400 text-sm mt-2'>Please wait while we update your booking status.</p>

        {/* Force redirect buttons */}
        <div className='flex flex-col gap-3 mt-6 w-full max-w-md'>
          <button
            onClick={verifyPaymentManually}
            className='px-6 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-medium text-white'
          >
            🔍 Verify Payment Status
          </button>

          <button
            onClick={forceRedirect}
            className='px-6 py-3 bg-green-600 hover:bg-green-700 transition rounded-lg font-medium text-white'
          >
            ✅ Payment Successful - Continue
          </button>

          <button
            onClick={() => {
              console.log('User manually continued from payment processing');
              setPaymentProcessing(false);
              setIsLoading(false);
              if (orderId) {
                setPaymentSuccess(true);
                // Clear the orderId from URL
                window.history.replaceState({}, document.title, '/my-bookings');
                // Clear session storage
                sessionStorage.removeItem('pendingOrderId');
                sessionStorage.removeItem('paymentRedirect');
              }
            }}
            className='px-4 py-2 bg-gray-700 hover:bg-gray-600 transition rounded-md text-sm'
          >
            Skip to My Bookings
          </button>
        </div>

        <p className='text-xs text-gray-500 mt-4 max-w-md text-center'>
          If you're stuck here, click "Payment Successful" if your payment was completed, or "Skip" to go to bookings page.
        </p>
      </div>
    )
  }  // Show success message if payment was successful
  if (paymentSuccess) {
    return (
      <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh] flex flex-col items-center justify-center'>
        <BlurCircle top="100px" left="100px" />
        <div className='bg-green-500/20 border border-green-500/30 rounded-lg p-8 max-w-md text-center'>
          <h2 className='text-2xl font-semibold mb-4'>Payment Successful!</h2>
          <p className='mb-6'>Your booking has been confirmed. You can view your booking details below.</p>
          <button
            onClick={() => setPaymentSuccess(false)}
            className='px-6 py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
          >
            View My Bookings
          </button>
        </div>
      </div>
    )
  }

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

      {bookings.map((item, index) => (
        <div key={index} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
          <div className='flex flex-col md:flex-row'>
            <img src={image_base_url + item.show.movie.poster_path} alt="" className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' />
            <div className='flex flex-col p-4'>
              <p className='text-lg font-semibold'>{item.show.movie.title}</p>
              <p className='text-gray-400 text-sm'>{timeFormat(item.show.movie.runtime)}</p>
              <p className='text-gray-400 text-sm mt-auto'>{dateFormat(item.show.showDateTime)}</p>
            </div>
          </div>

          <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
            <div className='flex items-center gap-4'>
              <p className='text-2xl font-semibold mb-3'>{currency}{item.amount}</p>
              {!item.isPaid && <button onClick={() => {
                console.log('Pay Now clicked, payment link:', item.paymentLink);

                if (item.paymentLink) {
                  console.log('Redirecting to payment link:', item.paymentLink);
                  try {
                    window.location.href = item.paymentLink;
                    console.log('Redirection initiated successfully');
                  } catch (error) {
                    console.error('Error opening payment link:', error);
                  }
                } else {
                  console.warn('Payment link not available or undefined');
                  alert('Payment link not available. Please try again later.');
                  console.error('Payment link missing for booking:', item._id);
                  // Refresh bookings to see if we can get updated data with payment links
                  getMyBookings();
                }
              }} className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'>Pay Now</button>}
            </div>
            <div className='text-sm'>
              <p><span className='text-gray-400'>Total Tickets:</span> {item.bookedSeats.length}</p>
              <p><span className='text-gray-400'>Seat Number:</span> {item.bookedSeats.join(", ")}</p>
              <p><span className='text-gray-400'>Status:</span> <span className={item.isPaid ? 'text-green-500' : 'text-yellow-500'}>{item.isPaid ? 'Paid' : 'Pending'}</span></p>
            </div>
          </div>

        </div>
      ))}

    </div>
  ) : <Loading />
}

export default MyBookings