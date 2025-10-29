import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/simpleDateFormat';
import { useAppContext } from '../../context/AppContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const { axios, getToken, user } = useAppContext()

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    
    // Add title to the PDF
    doc.setFontSize(18);
    doc.text('Bookings List', 14, 22);
    
    // Define the columns for the table
    const tableColumn = ["User Name", "Movie Name", "Show Time", "Seats", "Amount"];
    
    // Define the rows for the table
    const tableRows = [];
    
    // Add data to rows
    bookings.forEach(item => {
      const userData = [
        item.user?.name || "Unknown User",
        item.show?.movie?.title || "Movie Not Found",
        item.show?.showDateTime ? dateFormat(item.show.showDateTime) : "Unknown Time",
        item.bookedSeats ? Object.keys(item.bookedSeats).map(seat => item.bookedSeats[seat]).join(", ") : "No Seats",
        item.amount
      ];
      tableRows.push(userData);
    });
    
    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [75, 75, 75],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Save the PDF
    doc.save('bookings-list.pdf');
  };

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      setBookings(data.bookings)
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false)
  };

  useEffect(() => {
    if(user){
      getAllBookings();
    }
  }, [user]);

  return !isLoading ? (
    <>
      <div className="flex justify-between items-center">
        <Title text1="List" text2="Bookings" />
        <button 
          onClick={generatePDF} 
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md flex items-center"
        >
          Download PDF
        </button>
      </div>
      <div className='max-w-4xl mt-6 overflow-x-auto'>
        <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
          <thead>
            <tr className='bg-primary/20 text-left text-white'>
              <th className='p-2 font-medium pl-5'>User Name</th>
              <th className='p-2 font-medium'>Movie Name</th>
              <th className='p-2 font-medium'>Show Time</th>
              <th className='p-2 font-medium'>Seats</th>
              <th className='p-2 font-medium'>Amount</th>
            </tr>
          </thead>
          <tbody className='text-sm font-light'>
            {bookings.map((item) => (
              <tr key={item._id} className='border-b border-primary/20 bg-primary/5 even:bg-primary/10'>
                <td className='p-2 min-w-45 pl-5'>{item.user?.name || "Unknown User"}</td>
                <td className='p-2'>{item.show?.movie?.title || "Movie Not Found"}</td>
                <td className='p-2'>{item.show?.showDateTime ? dateFormat(item.show.showDateTime) : "Unknown Time"}</td>
                <td className='p-2'>{item.bookedSeats? Object.keys(item.bookedSeats).map(seat => item.bookedSeats[seat]).join(", ") : "No Seats"}</td>
                <td className='p-2'>₹ {item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : <Loading />
}

export default ListBookings