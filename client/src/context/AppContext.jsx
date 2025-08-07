import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL


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
        console.log('getToken called');
        try {
            const token = await clerkGetToken();
            console.log('Token retrieved successfully:', token ? 'Yes (token available)' : 'No');
            return token;
        } catch (error) {
            console.error('Error retrieving token:', error);
            return null;
        }
    }

    const fetchIsAdmin = async () => {
        try {
            const { data } = await axios.get('/api/admin/is-admin', {
                headers:
                    { Authorization: `Bearer ${await getToken()}` }
            })
            setIsAdmin(data.isAdmin)

            if (!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/')
                toast.error('You are not authorized to access admin dashboard')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchShows = async () => {
        try {
            const { data } = await axios.get('/api/show/all')
            if (data.success) {
                setShows(data.shows)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchFavoriteMovies = async () => {
        try {
            const { data } = await axios.get('/api/user/favorites', {
                headers:
                    { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setFavoriteMovies(data.movies)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
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
    console.log('AppContext - User effect triggered');
    console.log('User authenticated:', !!user);
    
    if (user) {
        console.log('User details:', {
            id: user.id,
            name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress
        });
        
        // Check for session storage items related to payment
        const pendingOrderId = sessionStorage.getItem('pendingOrderId');
        const paymentRedirect = sessionStorage.getItem('paymentRedirect');
        console.log('Session storage items:', { pendingOrderId, paymentRedirect });
        
        // Get phone number from user's phone numbers if available
        const phoneNumber = user.phoneNumbers && user.phoneNumbers.length > 0 
            ? user.phoneNumbers[0].phoneNumber 
            : user.primaryPhoneNumber?.phoneNumber || null;
        
        console.log('Syncing user data with backend...');
        axios.post('/api/user/sync', {
            userId: user.id,
            name: user.fullName,
            email: user.primaryEmailAddress.emailAddress,
            image: user.imageUrl,
            phone: phoneNumber
        })
        .then(response => {
            console.log('User sync response:', response.data);
            
            // If we have a pending order ID and we're coming from a payment redirect,
            // redirect to my-bookings with the order ID
            if (pendingOrderId && paymentRedirect === 'true') {
                console.log('Redirecting to my-bookings with pendingOrderId:', pendingOrderId);
                // Clear the payment redirect flag but keep the order ID
                sessionStorage.removeItem('paymentRedirect');
                // Redirect to my-bookings with the order ID
                navigate(`/my-bookings?orderId=${pendingOrderId}`);
            }
        })
        .catch(error => {
            console.error('Error syncing user:', error);
        });
        
        console.log('Fetching admin status...');
        fetchIsAdmin();
        console.log('Fetching favorite movies...');
        fetchFavoriteMovies();
    } else {
        console.log('No user authenticated, skipping data fetching');
    }
}, [user]);

    const value = {
        axios,
        fetchIsAdmin,
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