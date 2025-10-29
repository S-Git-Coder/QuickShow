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
        try {
            const token = await clerkGetToken();
            return token;
        } catch (error) {

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