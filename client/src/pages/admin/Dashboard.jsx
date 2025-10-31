import { ChartLineIcon, PlayCircleIcon, StarIcon, UserIcon, Trash2Icon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { dummyDashboardData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import BlurCircle from '../../components/BlurCircle';
import { dateFormat } from '../../lib/simpleDateFormat';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {

  const { axios, getToken, user, image_base_url } = useAppContext()

  const currency = import.meta.env.VITE_CURRENCY

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedShows, setSelectedShows] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Small inline Rupee icon component used for dashboard cards (accepts className prop)
  // Make rupee glyph visually match the SVG icons by increasing font-size and removing extra line-height
  const RupeeIcon = ({ className }) => (
    <span className={`${className} inline-flex items-center justify-center text-2xl leading-none font-medium`}>
      ₹
    </span>
  );

  const dashboardCards = [
    { title: "Total Bookings", value: dashboardData.totalBookings || "0", icon: ChartLineIcon },
    { title: "Total Revenue", value: dashboardData.totalRevenue || "0", icon: RupeeIcon },
    { title: "Active Shows", value: dashboardData.activeShows.length || "0", icon: PlayCircleIcon },
    { title: "Total Users", value: dashboardData.totalUser || "0", icon: UserIcon },
  ]

  // helper to format paisa -> rupees with ₹ prefix for UI
  const formatRupee = (paisa) => {
    const n = Number(paisa) || 0;
    const rupees = n / 100;
    if (n % 100 === 0) return `₹ ${rupees}`;
    return `₹ ${rupees.toFixed(2).replace(/\.00$/, '')}`;
  };

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setDashboardData(data.dashboardData)
        setLoading(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Error fetching dashboard data:', error)
    }
  };

  const handleSelectShow = (showId) => {
    setSelectedShows(prev => {
      if (prev.includes(showId)) {
        return prev.filter(id => id !== showId);
      } else {
        return [...prev, showId];
      }
    });
  };

  const deleteSelectedShows = async () => {
    if (selectedShows.length === 0) return;

    try {
      const { data } = await axios.delete("/api/admin/shows", {
        headers: { Authorization: `Bearer ${await getToken()}` },
        data: { showIds: selectedShows }
      });

      if (data.success) {
        // Update UI by filtering out deleted shows
        setDashboardData(prev => ({
          ...prev,
          activeShows: prev.activeShows.filter(show => !selectedShows.includes(show._id))
        }));
        setSelectedShows([]);
        toast.success("Shows deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete shows");
      }
    } catch (error) {
      toast.error("Error deleting shows: " + (error.message || error));
    }

    setShowConfirmation(false);
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div className='relative flex flex-wrap gap-4 mt-6'>
        <BlurCircle top="-100px" left="0" />
        <div className='flex flex-wrap gap-4 w-full'>
          {dashboardCards.map((card) => (
            <div key={card.title} className='flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full'>
              <div>
                <h1 className='text-sm'>{card.title}</h1>
                <p className='text-xl font-medium mt-1'>
                  {card.title === 'Total Revenue' ? formatRupee(dashboardData.totalRevenue || 0) : card.value}
                </p>
              </div>
              <card.icon className='w-6 h-6' />
            </div>
          ))}
        </div>
      </div>

      <div className='mt-10 flex justify-between items-center'>
        <p className='text-lg font-medium'>Active Shows</p>
        <button
          onClick={() => selectedShows.length > 0 && setShowConfirmation(true)}
          disabled={selectedShows.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded ${selectedShows.length > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 cursor-not-allowed'} text-white transition`}
        >
          <Trash2Icon size={16} />
          Delete Selected
        </button>
      </div>
      <div className='relative flex flex-wrap gap-6 mt-4 max-w-5xl'>
        <BlurCircle top="100px" left="-10%" />
        {dashboardData.activeShows.map((show) => (
          <div key={show._id || show.id || `${show.movie._id}_${show.showDateTime}`} className='w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300'>
            <div className="relative">
              <img src={image_base_url + show.movie.poster_path} alt='' className="h-60 w-full object-cover" />
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedShows.includes(show._id)}
                  onChange={() => handleSelectShow(show._id)}
                  className="h-5 w-5 accent-primary cursor-pointer"
                />
              </div>
            </div>
            <p className='font-medium p-2 truncate'>{show.movie.title}</p>
            <div className='flex items-center justify-between px-2 text-sm'>
              <p className='text-gray-500'>{dateFormat(show.showDateTime)}</p>
              <p className='flex items-center gap-1 text-gray-400'>
                <StarIcon className='w-4 h-4 text-primary fill-primary' />
                {show.movie.vote_average.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-medium mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete {selectedShows.length} selected show{selectedShows.length > 1 ? 's' : ''}? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelectedShows}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  ) : <Loading />
}

export default Dashboard