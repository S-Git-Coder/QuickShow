import React from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({ dateTime, id }) => {

    const navigate = useNavigate();

    const [selected, setSelected] = useState(null)
    // Guard against undefined/null dateTime and precompute dates
    const dates = Object.keys(dateTime ?? {});

    const onBookHandler = () => {
        if (!selected) {
            return toast('Please select a date')
        }
        navigate(`/movies/${id}/${selected}`)
        scrollTo(0, 0)
    }

    return (
        <div id='dateSelect' className='pt-30'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
                <BlurCircle top='-100px' left='-100px' />
                <BlurCircle top='100px' right='0px' />
                <div>
                    <p className='text-lg font-semibold'>Choose Date</p>
                    <div className='flex items-center gap-6 text-sm mt-5'>
                        <ChevronLeftIcon width={28} />
                        <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
                            {dates.map((date) => {
                                const d = new Date(date);
                                const day = d.toLocaleString('en-IN', { day: '2-digit', timeZone: 'Asia/Kolkata' });
                                const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'Asia/Kolkata' });
                                return (
                                    <button
                                        onClick={() => setSelected(date)}
                                        key={date}
                                        className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${selected === date ? "bg-primary text-white" : "border border-primary/70"}`}
                                    >
                                        <span>{day}</span>
                                        <span>{month}</span>
                                    </button>
                                );
                            })}
                        </span>
                        <ChevronRightIcon width={28} />
                    </div>
                </div>
                <button
                    onClick={onBookHandler}
                    disabled={!selected}
                    className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary/60'
                >
                    Book Now
                </button>
            </div>
        </div>
    )
}

export default DateSelect