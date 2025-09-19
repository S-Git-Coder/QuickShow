import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

// Configure global axios defaults
axios.defaults.timeout = 15000; // 15 seconds timeout for all requests

// Add a response interceptor to handle common error patterns
axios.interceptors.response.use(
    response => response, // Return successful responses as-is
    error => {
        // Log all errors for debugging
        console.error('[Axios Error]', error.message, error.code);
        
        // Handle specific error types
        if (error.code === 'ECONNABORTED') {
            console.warn('Request timeout:', error.config.url);
        } else if (error.message === 'Network Error') {
            console.warn('Network error - check internet connection');
        } else if (error.response) {
            // Server responded with an error status
            console.warn(`Server error ${error.response.status}:`, error.response.data);
        }
        
        // Let the individual catch blocks handle specific UI feedback
        return Promise.reject(error);
    }
)

export const AppContext = createContext()

export const AppProvider = ({ children }) => {

    const [isAdmin, setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
    const [favoriteMovies, setFavoriteMovies] = useState([]);

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

    const { user } = useUser()
    const { getToken: clerkGetToken } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    // Wrap getToken to add logging
    const getToken = async () => {
        try {
            const token = await clerkGetToken();
            return token;
        } catch (error) {
            console.error('Error retrieving token:', error);
            return null;
        }
    }

    const fetchIsAdmin = async () => {
        try {
            const { data } = await axios.get('/api/admin/is-admin', {
                headers: { Authorization: `Bearer ${await getToken()}` },
                timeout: 15000 // 15 seconds timeout
            })
            setIsAdmin(data.isAdmin)

            if (!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/')
                toast.error('You are not authorized to access admin dashboard')
            }
        } catch (error) {
            console.error('[fetchIsAdmin] Error:', error)
            // Set isAdmin to false by default on error
            setIsAdmin(false)
            
            // Redirect from admin pages if there's an error
            if (location.pathname.startsWith('/admin')) {
                navigate('/')
                toast.error('Authentication error. Please log in again.')
            }
            
            // Don't show timeout errors to users as they're too technical
            if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Please try again later.');
            } else if (error.response && error.response.status === 401) {
                // Handle unauthorized errors silently - user might not be logged in
                console.log('[fetchIsAdmin] User not authenticated');
            }
        }
    }

    const fetchShows = async () => {
        try {
            // Add timeout to axios request to prevent long-running requests
            const { data } = await axios.get('/api/show/all', {
                timeout: 15000 // 15 seconds timeout
            })
            
            if (data.success) {
                // Process shows to ensure trailerUrl is properly handled
                const processedShows = data.shows.map(show => {
                    // Ensure trailerUrl is a string if it exists
                    if (show.trailerUrl) {
                        return {
                            ...show,
                            trailerUrl: String(show.trailerUrl)
                        };
                    }
                    return show;
                });
                
                setShows(processedShows);
                // Enhanced logging for debugging
                console.log('[fetchShows] received shows:', processedShows);
                console.log('[fetchShows] shows with trailerUrl:', processedShows.filter(m => m.trailerUrl).map(m => ({ 
                    id: m._id, 
                    title: m.title, 
                    trailerUrl: m.trailerUrl,
                    trailerType: typeof m.trailerUrl
                })));
            } else {
                console.warn('[fetchShows] API returned error:', data.message);
                toast.error(data.message || 'Failed to load shows')
            }
        } catch (error) {
            console.error('[fetchShows] Error:', error);
            // Don't show timeout errors to users as they're too technical
            if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Please try again later.');
            } else {
                toast.error('Failed to load shows. Please try refreshing the page.');
            }
            // Return empty array as fallback
            setShows([]);
        }
    }

    const fetchFavoriteMovies = async () => {
        try {
            const { data } = await axios.get('/api/user/favorites', {
                headers: { Authorization: `Bearer ${await getToken()}` },
                timeout: 15000 // 15 seconds timeout
            })

            if (data.success) {
                setFavoriteMovies(data.movies)
            } else {
                console.warn('[fetchFavoriteMovies] API returned error:', data.message);
                toast.error(data.message || 'Failed to load favorite movies')
            }
        } catch (error) {
            console.error('[fetchFavoriteMovies] Error:', error)
            // Don't show timeout errors to users as they're too technical
            if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Please try again later.');
            } else if (error.response && error.response.status === 401) {
                // Handle unauthorized errors silently - user might not be logged in
                console.log('[fetchFavoriteMovies] User not authenticated');
            } else {
                toast.error('Failed to load favorite movies. Please try again later.');
            }
            // Return empty array as fallback
            setFavoriteMovies([]);
        }
    }

    useEffect(() => {
        fetchShows()
    }, [])

    // useEffect(() => {
    //     if (user) {
    //         fetchIsAdmin()
    //         fetchFavoriteMovies()
    //     }
    // }, [user])

    useEffect(() => {

        if (user) {
            // Check for session storage items related to payment
            const pendingOrderId = sessionStorage.getItem('pendingOrderId');
            const paymentRedirect = sessionStorage.getItem('paymentRedirect');

            // Get phone number from user's phone numbers if available
            const phoneNumber = user.phoneNumbers && user.phoneNumbers.length > 0
                ? user.phoneNumbers[0].phoneNumber
                : user.primaryPhoneNumber?.phoneNumber || null;

            axios.post('/api/user/sync', {
                userId: user.id,
                name: user.fullName,
                email: user.primaryEmailAddress.emailAddress,
                image: user.imageUrl,
                phone: phoneNumber
            })
                .then(response => {

                    // If we have a pending order ID and we're coming from a payment redirect,
                    // redirect to my-bookings with the order ID
                    if (pendingOrderId && paymentRedirect === 'true') {
                        // Clear the payment redirect flag but keep the order ID
                        sessionStorage.removeItem('paymentRedirect');
                        // Redirect to my-bookings with the order ID
                        navigate(`/my-bookings?orderId=${pendingOrderId}`);
                    }
                })
                .catch(error => {
                    console.error('Error syncing user:', error);
                    // Even if the database sync fails, we can still use client-side user data
                    // and allow the user to continue using the app with limited functionality


                    // Still handle pending orders even if sync failed
                    if (pendingOrderId && paymentRedirect === 'true') {
                        sessionStorage.removeItem('paymentRedirect');
                        navigate(`/my-bookings?orderId=${pendingOrderId}`);
                    }
                })
                .finally(() => {
                    // Try to fetch admin status and favorite movies regardless of sync success or failure
                    // These will handle their own errors internally
                    fetchIsAdmin();
                    fetchFavoriteMovies();
                });
        } else {
        }
    }, [user, navigate]);

    const value = {
        axios,
        fetchIsAdmin,
        fetchShows,
        user, getToken, navigate, isAdmin, shows,
        favoriteMovies, setFavoriteMovies, image_base_url, fetchFavoriteMovies
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)