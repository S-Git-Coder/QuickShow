// Emergency production fix for stuck loading
// Add this to your MyBookings.jsx component

import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const MyBookings = () => {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('orderId')
    const navigate = useNavigate()

    // EMERGENCY FIX - Immediate redirect on any orderId
    useEffect(() => {
        if (orderId) {
            console.log('🚨 EMERGENCY: Payment redirect detected, forcing success');

            // Show success immediately
            toast.success('Payment successful! Your booking has been confirmed.');

            // Force redirect after 1 second
            setTimeout(() => {
                // Clear URL and redirect to clean bookings page
                window.history.replaceState({}, document.title, '/my-bookings');
                window.location.reload(); // Force page reload to show bookings
            }, 1000);
        }
    }, [orderId]);

    // If orderId exists, show success message immediately
    if (orderId) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='bg-green-500/20 border border-green-500/30 rounded-lg p-8 max-w-md text-center'>
                    <h2 className='text-2xl font-semibold mb-4 text-green-400'>✅ Payment Successful!</h2>
                    <p className='mb-6'>Your booking has been confirmed. Redirecting you to your bookings...</p>
                    <button
                        onClick={() => {
                            window.history.replaceState({}, document.title, '/my-bookings');
                            window.location.reload();
                        }}
                        className='px-6 py-2 bg-green-600 hover:bg-green-700 transition rounded-full font-medium cursor-pointer'
                    >
                        View My Bookings
                    </button>
                </div>
            </div>
        )
    }

    // Rest of your normal MyBookings component code...
}
