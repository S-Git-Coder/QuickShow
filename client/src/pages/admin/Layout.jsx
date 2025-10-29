import React, { useEffect, useState } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Loading from '../../components/Loading'

const Layout = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const {isAdmin, fetchIsAdmin} = useAppContext()

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                await fetchIsAdmin()
                setLoading(false)
            } catch (err) {
                setError('Unable to verify admin status. Please try again.')
                setLoading(false)
            }
        }
        
        checkAdmin()
    }, [])

    if (loading) {
        return <Loading />
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-red-500 text-center">{error}</div>
            </div>
        )
    }

    return isAdmin ? (
        <>
            <AdminNavbar />
            <div className='flex'>
                <AdminSidebar />
                <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto'>
                    <Outlet />
                </div>
            </div>
        </>
    ) : <Loading />
}

export default Layout