import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets';
import Loading from '../components/Loading';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import isoTimeFormat from '../lib/isoTimeFormat';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

// Screen 1 layout based on first image
const screen1Layout = [
  // Row A - Recliner (₹350)
  [
    { id: "A01", type: "Recliner" }, { id: "A02", type: "Recliner" }, { id: "A03", type: "Recliner" },
    { id: "A04", type: "Recliner" }, { id: "A05", type: "Recliner" }, { id: "A06", type: "Recliner" },
    { id: "A07", type: "Recliner" }, { id: "A08", type: "Recliner" }, { id: "A09", type: "Recliner" },
    { id: "A10", type: "Recliner" }, { id: "A11", type: "Recliner" }, { id: "A12", type: "Recliner" },
    { id: "A13", type: "Recliner" }
  ],
  // Row B - Sofa (₹250)
  [
    null, null, { id: "B01", type: "Sofa" }, { id: "B02", type: "Sofa" }, { id: "B03", type: "Sofa" },
    { id: "B04", type: "Sofa" }, { id: "B05", type: "Sofa" }, { id: "B06", type: "Sofa" },
    null, { id: "B07", type: "Sofa" }, { id: "B08", type: "Sofa" }, { id: "B09", type: "Sofa" },
    { id: "B10", type: "Sofa" }, { id: "B11", type: "Sofa" }, { id: "B12", type: "Sofa" },
    { id: "B13", type: "Sofa" }, { id: "B14", type: "Sofa" }
  ],
  // Row C - Sofa (₹250)
  [
    null, null, { id: "C01", type: "Sofa" }, { id: "C02", type: "Sofa" }, { id: "C03", type: "Sofa" },
    { id: "C04", type: "Sofa" }, { id: "C05", type: "Sofa" }, { id: "C06", type: "Sofa" },
    null, { id: "C07", type: "Sofa" }, { id: "C08", type: "Sofa" }, { id: "C09", type: "Sofa" },
    { id: "C10", type: "Sofa" }, { id: "C11", type: "Sofa" }, { id: "C12", type: "Sofa" },
    { id: "C13", type: "Sofa" }, { id: "C14", type: "Sofa" }
  ],
  // Row D - Platinum (₹100)
  [
    null, null, { id: "D01", type: "Platinum" }, { id: "D02", type: "Platinum" }, { id: "D03", type: "Platinum" },
    null, null, null, null, { id: "D07", type: "Platinum" }, null, null,
    { id: "D10", type: "Platinum" }, { id: "D11", type: "Platinum" }, { id: "D12", type: "Platinum" },
    { id: "D13", type: "Platinum" }, { id: "D14", type: "Platinum" }, { id: "D15", type: "Platinum" }
  ],
  // Row E - Platinum (₹100)
  [
    null, null, { id: "E01", type: "Platinum" }, { id: "E02", type: "Platinum" }, null,
    null, null, null, null, { id: "E07", type: "Platinum" }, null, null,
    { id: "E10", type: "Platinum" }, { id: "E11", type: "Platinum" }, { id: "E12", type: "Platinum" },
    null, null, null
  ],
  // Row F - Platinum (₹100)
  [
    null, null, { id: "F01", type: "Platinum" }, { id: "F02", type: "Platinum" }, { id: "F03", type: "Platinum" },
    { id: "F04", type: "Platinum" }, null, null, null, null, null,
    { id: "F09", type: "Platinum" }, { id: "F10", type: "Platinum" }, { id: "F11", type: "Platinum" },
    { id: "F12", type: "Platinum" }
  ],
  // Row G - Platinum (₹100)
  [
    null, null, { id: "G01", type: "Platinum" }, { id: "G02", type: "Platinum" }, { id: "G03", type: "Platinum" },
    { id: "G04", type: "Platinum" }, { id: "G05", type: "Platinum" }, { id: "G06", type: "Platinum" },
    null, { id: "G07", type: "Platinum" }, { id: "G08", type: "Platinum" }, { id: "G09", type: "Platinum" },
    { id: "G10", type: "Platinum" }, { id: "G11", type: "Platinum" }, { id: "G12", type: "Platinum" }
  ],
  // Row H - Platinum (₹100)
  [
    null, null, { id: "H01", type: "Platinum" }, { id: "H02", type: "Platinum" }, { id: "H03", type: "Platinum" },
    { id: "H04", type: "Platinum" }, { id: "H05", type: "Platinum" }, { id: "H06", type: "Platinum" },
    null, { id: "H07", type: "Platinum" }, { id: "H08", type: "Platinum" }, { id: "H09", type: "Platinum" },
    { id: "H10", type: "Platinum" }, { id: "H11", type: "Platinum" }, { id: "H12", type: "Platinum" }
  ],
  // Row I - Gold (₹100)
  [
    null, null, { id: "I01", type: "Gold" }, { id: "I02", type: "Gold" }, { id: "I03", type: "Gold" },
    { id: "I04", type: "Gold" }, { id: "I05", type: "Gold" }, { id: "I06", type: "Gold" },
    null, { id: "I07", type: "Gold" }, { id: "I08", type: "Gold" }, { id: "I09", type: "Gold" },
    { id: "I10", type: "Gold" }, { id: "I11", type: "Gold" }, { id: "I12", type: "Gold" },
    { id: "I13", type: "Gold" }, { id: "I14", type: "Gold" }, { id: "I15", type: "Gold" }
  ],
  // Row J - Gold (₹100)
  [
    null, null, { id: "J01", type: "Gold" }, { id: "J02", type: "Gold" }, { id: "J03", type: "Gold" },
    { id: "J04", type: "Gold" }, { id: "J05", type: "Gold" }, { id: "J06", type: "Gold" },
    null, { id: "J07", type: "Gold" }, { id: "J08", type: "Gold" }, { id: "J09", type: "Gold" },
    { id: "J10", type: "Gold" }, { id: "J11", type: "Gold" }, { id: "J12", type: "Gold" },
    { id: "J13", type: "Gold" }, { id: "J14", type: "Gold" }, { id: "J15", type: "Gold" }
  ],
  // Row K - Gold (₹100)
  [
    null, null, { id: "K01", type: "Gold" }, { id: "K02", type: "Gold" }, { id: "K03", type: "Gold" },
    { id: "K04", type: "Gold" }, { id: "K05", type: "Gold" }, { id: "K06", type: "Gold" },
    null, { id: "K07", type: "Gold" }, { id: "K08", type: "Gold" }, { id: "K09", type: "Gold" },
    { id: "K10", type: "Gold" }, { id: "K11", type: "Gold" }, { id: "K12", type: "Gold" },
    { id: "K13", type: "Gold" }, { id: "K14", type: "Gold" }, { id: "K15", type: "Gold" }
  ]
];

// Screen 2 layout based on second image
const screen2Layout = [
  // Row A - Premium (₹100)
  [
    null, null, { id: "A01", type: "Premium" }, { id: "A02", type: "Premium" }, null, null, null, null, null, null, null, null,
    { id: "A12", type: "Premium" }, { id: "A13", type: "Premium" }, { id: "A14", type: "Premium" }, { id: "A15", type: "Premium" },
    { id: "A16", type: "Premium" }, { id: "A17", type: "Premium" }, { id: "A18", type: "Premium" }
  ],
  // Row B - Premium (₹100)
  [
    null, { id: "B01", type: "Premium" }, { id: "B02", type: "Premium" }, { id: "B03", type: "Premium" },
    { id: "B04", type: "Premium" }, { id: "B05", type: "Premium" }, { id: "B06", type: "Premium" },
    { id: "B07", type: "Premium" }, { id: "B08", type: "Premium" }, null, null, null,
    { id: "B13", type: "Premium" }, { id: "B14", type: "Premium" }, { id: "B15", type: "Premium" },
    { id: "B16", type: "Premium" }
  ],
  // Row C - Premium (₹100)
  [
    null, { id: "C01", type: "Premium" }, { id: "C02", type: "Premium" }, { id: "C03", type: "Premium" },
    { id: "C04", type: "Premium" }, { id: "C05", type: "Premium" }, { id: "C06", type: "Premium" },
    null, null, { id: "C09", type: "Premium" }, { id: "C10", type: "Premium" }, { id: "C11", type: "Premium" },
    null, null, null, null
  ],
  // Row D - Premium (₹100)
  [
    null, { id: "D01", type: "Premium" }, { id: "D02", type: "Premium" }, { id: "D03", type: "Premium" },
    { id: "D04", type: "Premium" }, { id: "D05", type: "Premium" }, { id: "D06", type: "Premium" },
    { id: "D07", type: "Premium" }, { id: "D08", type: "Premium" }, null, { id: "D09", type: "Premium" },
    { id: "D10", type: "Premium" }, { id: "D11", type: "Premium" }, { id: "D12", type: "Premium" },
    { id: "D13", type: "Premium" }, { id: "D14", type: "Premium" }, { id: "D15", type: "Premium" },
    { id: "D16", type: "Premium" }
  ],
  // Row E - Premium (₹100)
  [
    null, { id: "E01", type: "Premium" }, { id: "E02", type: "Premium" }, { id: "E03", type: "Premium" },
    { id: "E04", type: "Premium" }, { id: "E05", type: "Premium" }, { id: "E06", type: "Premium" },
    { id: "E07", type: "Premium" }, { id: "E08", type: "Premium" }, null, { id: "E09", type: "Premium" },
    { id: "E10", type: "Premium" }, { id: "E11", type: "Premium" }, { id: "E12", type: "Premium" },
    { id: "E13", type: "Premium" }, { id: "E14", type: "Premium" }, { id: "E15", type: "Premium" },
    { id: "E16", type: "Premium" }
  ],
  // Row F - Premium (₹100)
  [
    null, { id: "F01", type: "Premium" }, { id: "F02", type: "Premium" }, { id: "F03", type: "Premium" },
    { id: "F04", type: "Premium" }, { id: "F05", type: "Premium" }, { id: "F06", type: "Premium" },
    { id: "F07", type: "Premium" }, { id: "F08", type: "Premium" }, null, { id: "F09", type: "Premium" },
    { id: "F10", type: "Premium" }, { id: "F11", type: "Premium" }, { id: "F12", type: "Premium" },
    { id: "F13", type: "Premium" }, { id: "F14", type: "Premium" }, { id: "F15", type: "Premium" },
    { id: "F16", type: "Premium" }
  ],
  // Row G - Premium (₹100)
  [
    null, null, null, null, { id: "G01", type: "Premium" }, { id: "G02", type: "Premium" },
    { id: "G03", type: "Premium" }, { id: "G04", type: "Premium" }, { id: "G05", type: "Premium" },
    null, { id: "G06", type: "Premium" }, { id: "G07", type: "Premium" }, { id: "G08", type: "Premium" },
    { id: "G09", type: "Premium" }, { id: "G10", type: "Premium" }, { id: "G11", type: "Premium" },
    { id: "G12", type: "Premium" }, { id: "G13", type: "Premium" }
  ],
  // Row H - Premium (₹100)
  [
    null, null, null, null, { id: "H01", type: "Premium" }, { id: "H02", type: "Premium" },
    { id: "H03", type: "Premium" }, { id: "H04", type: "Premium" }, { id: "H05", type: "Premium" },
    null, { id: "H06", type: "Premium" }, { id: "H07", type: "Premium" }, { id: "H08", type: "Premium" },
    { id: "H09", type: "Premium" }, { id: "H10", type: "Premium" }, { id: "H11", type: "Premium" },
    { id: "H12", type: "Premium" }, { id: "H13", type: "Premium" }
  ],
  // Row I - Premium (₹100)
  [
    null, null, null, null, { id: "I01", type: "Premium" }, { id: "I02", type: "Premium" },
    { id: "I03", type: "Premium" }, { id: "I04", type: "Premium" }, { id: "I05", type: "Premium" },
    null, { id: "I06", type: "Premium" }, { id: "I07", type: "Premium" }, { id: "I08", type: "Premium" },
    { id: "I09", type: "Premium" }, { id: "I10", type: "Premium" }, { id: "I11", type: "Premium" },
    { id: "I12", type: "Premium" }, { id: "I13", type: "Premium" }
  ],
  // Row J - Premium (₹100)
  [
    null, null, null, null, null, null, null, null, null,
    null, { id: "J01", type: "Premium" }, { id: "J02", type: "Premium" }, { id: "J03", type: "Premium" },
    { id: "J04", type: "Premium" }, { id: "J05", type: "Premium" }, { id: "J06", type: "Premium" },
    { id: "J07", type: "Premium" }, { id: "J08", type: "Premium" }
  ],
  // Row K - Executive (₹100)
  [
    null, { id: "K01", type: "Executive" }, { id: "K02", type: "Executive" }, { id: "K03", type: "Executive" },
    { id: "K04", type: "Executive" }, { id: "K05", type: "Executive" }, { id: "K06", type: "Executive" },
    { id: "K07", type: "Executive" }, { id: "K08", type: "Executive" }, null, { id: "K09", type: "Executive" },
    { id: "K10", type: "Executive" }, { id: "K11", type: "Executive" }, { id: "K12", type: "Executive" },
    { id: "K13", type: "Executive" }, { id: "K14", type: "Executive" }, { id: "K15", type: "Executive" },
    { id: "K16", type: "Executive" }
  ],
  // Row L - Executive (₹100)
  [
    null, { id: "L01", type: "Executive" }, { id: "L02", type: "Executive" }, { id: "L03", type: "Executive" },
    { id: "L04", type: "Executive" }, { id: "L05", type: "Executive" }, { id: "L06", type: "Executive" },
    { id: "L07", type: "Executive" }, { id: "L08", type: "Executive" }, null, { id: "L09", type: "Executive" },
    { id: "L10", type: "Executive" }, { id: "L11", type: "Executive" }, { id: "L12", type: "Executive" },
    { id: "L13", type: "Executive" }, { id: "L14", type: "Executive" }, { id: "L15", type: "Executive" },
    { id: "L16", type: "Executive" }
  ]
];

// Screen 3 layout based on third image
const screen3Layout = [
  // Row A - Recliner (₹250)
  [
    null, null, null, null, null, { id: "A02", type: "Recliner" }, { id: "A03", type: "Recliner" },
    null, null, null, null, null, { id: "A08", type: "Recliner" }, { id: "A09", type: "Recliner" }
  ],
  // Row B - Sofa (₹200)
  [
    null, { id: "B01", type: "Sofa" }, { id: "B02", type: "Sofa" }, null, { id: "B03", type: "Sofa" },
    { id: "B04", type: "Sofa" }, null, { id: "B05", type: "Sofa" }, { id: "B06", type: "Sofa" },
    null, { id: "B07", type: "Sofa" }, { id: "B08", type: "Sofa" }, null, { id: "B09", type: "Sofa" },
    { id: "B10", type: "Sofa" }, null, { id: "B11", type: "Sofa" }, { id: "B12", type: "Sofa" },
    null, { id: "B13", type: "Sofa" }, { id: "B14", type: "Sofa" }
  ],
  // Row C - Sofa (₹200)
  [
    null, { id: "C01", type: "Sofa" }, { id: "C02", type: "Sofa" }, null, { id: "C03", type: "Sofa" },
    { id: "C04", type: "Sofa" }, null, { id: "C05", type: "Sofa" }, { id: "C06", type: "Sofa" },
    null, { id: "C07", type: "Sofa" }, { id: "C08", type: "Sofa" }, null, { id: "C09", type: "Sofa" },
    { id: "C10", type: "Sofa" }, null, { id: "C11", type: "Sofa" }, { id: "C12", type: "Sofa" },
    null, { id: "C13", type: "Sofa" }, { id: "C14", type: "Sofa" }
  ],
  // Row D - Platinum (₹130)
  [
    null, null, null, null, { id: "D01", type: "Platinum" }, { id: "D02", type: "Platinum" },
    { id: "D03", type: "Platinum" }, { id: "D04", type: "Platinum" }, { id: "D05", type: "Platinum" },
    { id: "D06", type: "Platinum" }, { id: "D07", type: "Platinum" }, { id: "D08", type: "Platinum" },
    { id: "D09", type: "Platinum" }, null, { id: "D10", type: "Platinum" }, { id: "D11", type: "Platinum" },
    { id: "D12", type: "Platinum" }, { id: "D13", type: "Platinum" }, { id: "D14", type: "Platinum" },
    { id: "D15", type: "Platinum" }, { id: "D16", type: "Platinum" }
  ],
  // Row E - Platinum (₹130)
  [
    null, null, null, null, { id: "E01", type: "Platinum" }, { id: "E02", type: "Platinum" },
    { id: "E03", type: "Platinum" }, { id: "E04", type: "Platinum" }, { id: "E05", type: "Platinum" },
    { id: "E06", type: "Platinum" }, { id: "E07", type: "Platinum" }, { id: "E08", type: "Platinum" },
    { id: "E09", type: "Platinum" }, null, { id: "E10", type: "Platinum" }, { id: "E11", type: "Platinum" },
    { id: "E12", type: "Platinum" }, { id: "E13", type: "Platinum" }, { id: "E14", type: "Platinum" },
    { id: "E15", type: "Platinum" }, { id: "E16", type: "Platinum" }
  ],
  // Row F - Platinum (₹130)
  [
    null, null, null, null, { id: "F01", type: "Platinum" }, { id: "F02", type: "Platinum" },
    { id: "F03", type: "Platinum" }, { id: "F04", type: "Platinum" }, { id: "F05", type: "Platinum" },
    { id: "F06", type: "Platinum" }, { id: "F07", type: "Platinum" }, { id: "F08", type: "Platinum" },
    { id: "F09", type: "Platinum" }, null, { id: "F10", type: "Platinum" }, { id: "F11", type: "Platinum" },
    { id: "F12", type: "Platinum" }, { id: "F13", type: "Platinum" }, { id: "F14", type: "Platinum" },
    { id: "F15", type: "Platinum" }, { id: "F16", type: "Platinum" }
  ],
  // Row G - Platinum (₹130)
  [
    null, null, null, null, { id: "G01", type: "Platinum" }, { id: "G02", type: "Platinum" },
    { id: "G03", type: "Platinum" }, { id: "G04", type: "Platinum" }, { id: "G05", type: "Platinum" },
    { id: "G06", type: "Platinum" }, { id: "G07", type: "Platinum" }, { id: "G08", type: "Platinum" },
    { id: "G09", type: "Platinum" }, null, { id: "G10", type: "Platinum" }, { id: "G11", type: "Platinum" },
    { id: "G12", type: "Platinum" }, { id: "G13", type: "Platinum" }, { id: "G14", type: "Platinum" },
    { id: "G15", type: "Platinum" }, { id: "G16", type: "Platinum" }
  ],
  // Row H - Platinum (₹130)
  [
    null, null, null, null, null, { id: "H01", type: "Platinum" }, { id: "H02", type: "Platinum" },
    { id: "H03", type: "Platinum" }, { id: "H04", type: "Platinum" }, { id: "H05", type: "Platinum" },
    { id: "H06", type: "Platinum" }, null, { id: "H07", type: "Platinum" }, { id: "H08", type: "Platinum" },
    { id: "H09", type: "Platinum" }, { id: "H10", type: "Platinum" }, { id: "H11", type: "Platinum" },
    { id: "H12", type: "Platinum" }, { id: "H13", type: "Platinum" }
  ],
  // Row I - Gold (₹100)
  [
    null, null, null, null, { id: "I01", type: "Gold" }, { id: "I02", type: "Gold" },
    { id: "I03", type: "Gold" }, { id: "I04", type: "Gold" }, { id: "I05", type: "Gold" },
    { id: "I06", type: "Gold" }, null, { id: "I07", type: "Gold" }, { id: "I08", type: "Gold" },
    { id: "I09", type: "Gold" }, { id: "I10", type: "Gold" }, { id: "I11", type: "Gold" },
    { id: "I12", type: "Gold" }, { id: "I13", type: "Gold" }
  ],
  // Row J - Gold (₹100)
  [
    null, null, null, null, { id: "J01", type: "Gold" }, { id: "J02", type: "Gold" },
    { id: "J03", type: "Gold" }, { id: "J04", type: "Gold" }, { id: "J05", type: "Gold" },
    { id: "J06", type: "Gold" }, null, { id: "J07", type: "Gold" }, { id: "J08", type: "Gold" },
    { id: "J09", type: "Gold" }, { id: "J10", type: "Gold" }, { id: "J11", type: "Gold" },
    { id: "J12", type: "Gold" }, { id: "J13", type: "Gold" }
  ],
  // Row K - Gold (₹100)
  [
    null, null, null, null, { id: "K01", type: "Gold" }, { id: "K02", type: "Gold" },
    { id: "K03", type: "Gold" }, { id: "K04", type: "Gold" }, { id: "K05", type: "Gold" },
    { id: "K06", type: "Gold" }, null, { id: "K07", type: "Gold" }, { id: "K08", type: "Gold" },
    { id: "K09", type: "Gold" }, { id: "K10", type: "Gold" }, { id: "K11", type: "Gold" },
    { id: "K12", type: "Gold" }, { id: "K13", type: "Gold" }
  ]
];

// Seat type price lookup
const seatTypePrices = {
  "Recliner": { price: 4, label: "Recliner" },
  "Sofa": { price: 3, label: "Sofa" },
  "Platinum": { price: 2, label: "Platinum" },
  "Gold": { price: 1, label: "Gold" },
  "Premium": { price: 2, label: "Premium" },
  "Executive": { price: 1, label: "Executive" }
};

// Combined layouts object
const layouts = {
  "Screen 1": screen1Layout,
  "Screen 2": screen2Layout,
  "Screen 3": screen3Layout
};

// Component for zone header with price and horizontal line
const ZoneHeader = ({ type, width }) => {
  const { price, label } = seatTypePrices[type];

  return (
    <div className="flex items-center mb-2 mt-4">
      <div className="flex items-center">
        <span className="text-gray-500 font-medium mr-2">₹{price}</span>
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <div className="ml-3 h-px bg-gray-300 flex-grow" style={{ width: `${width}px` }}></div>
    </div>
  );
};

const SeatLayout = () => {
  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const location = useLocation()
  const bookingDetails = location.state || {}

  const navigate = useNavigate()

  const { axios, getToken, user } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      console.log("API response", data);
      if (data.success) {
        // setShow(data.show);
        setShow(data)
      }
    } catch (error) {
      toast.error('Failed to load show details');
    }
  };

  const handleSeatClick = (seatId) => {
    // if (!selectedTime) {
    //   return toast("Please select a time first")
    // }
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast("You can only select up to 5 seats")
    }
    if (occupiedSeats.includes(seatId)) {
      return toast("This seat is already booked")
    }
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId])
  }

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`)
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to book tickets')
    }
  }

  // Lazy-load Cashfree SDK
  const loadCashfreeSdk = () => new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve(window.Cashfree);
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.body.appendChild(script);
  });

  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Please login to proceed")

      // Comprehensive validation checks before API call
      if (!selectedTime) {
        toast.error("Please select valid showtime before proceeding");
        return;
      }
      
      if (!selectedTime.showId) {
        toast.error("Invalid showtime selected. Please try again.");
        return;
      }
      
      if (!selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
        toast.error("Please select at least one seat");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Generating payment link...");

      // Calculate the amount based on selected seats
      const seatLayout = layouts[bookingDetails.screen] || layouts["Screen 1"];
      const amount = selectedSeats.reduce((acc, seatId) => {
        // Use the same layout that's being used for rendering
        const seat = seatLayout ? seatLayout.flat().find(s => s && s.id === seatId) : null;
        return acc + (seat && seat.type ? seatTypePrices[seat.type].price : 0);
      }, 0);
      
      // Convert rupees to paise (multiply by 100) for payment gateway
      const amountInPaise = amount * 100;
      
      // Log the request being made
      console.log('Sending booking request:', { showId: selectedTime.showId, selectedSeats, amount: amountInPaise });

      const { data } = await axios.post('/api/booking/create', { 
        showId: selectedTime.showId, 
        selectedSeats, 
        amount: amountInPaise // Amount in paise for payment gateway
      }, { headers: { Authorization: `Bearer ${await getToken()}` } });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      console.log('Booking response:', data);

      if (data.success && (data.paymentSessionId || data.paymentLink)) {
        // Store tempBookingId in localStorage for potential recovery
        if (data.tempBookingId) {
          localStorage.setItem('pendingBookingId', data.tempBookingId);
          // Also store in sessionStorage for more reliable recovery
          sessionStorage.setItem('pendingOrderId', `order_${data.tempBookingId}`);
          sessionStorage.setItem('paymentRedirect', 'true');
        }

        // Preferred: use Cashfree SDK with paymentSessionId
        // if (data.paymentSessionId) {
        //   try {
        //     const Cashfree = await loadCashfreeSdk();
        //     const cashfree = Cashfree({ mode: 'production' });
        //     console.log('Opening Cashfree checkout with session:', data.paymentSessionId);
        //     await cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: '_self' });
        //     return; // control will go to redirect URL after payment
        //   } catch (sdkErr) {
        //     console.error('Cashfree SDK checkout failed, falling back to direct link:', sdkErr);
        //   }
        // }

        // Fallback: direct redirect to hosted checkout URL
        // if (data.paymentLink && data.paymentLink.startsWith('https://payments.cashfree.com/session/')) {
        //   console.log('Redirecting to payment page (fallback):', data.paymentLink);
        //   window.location.href = data.paymentLink;
        //   return;
        // }

        if (data.paymentLink) {
          console.log('Redirecting to payment page:', data.paymentLink);
          window.location.href = data.paymentLink;
          return;
        }

        toast.error('Could not open payment page. Please try again.');
      } else {
        console.error('Payment link generation failed:', data);
        toast.error(data.message || "Failed to generate payment link");
      }
    } catch (error) {
      console.error('Booking error:', error);

      // Extract the most useful error message
      let errorMessage = "An error occurred while processing your request";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  }

  useEffect(() => {
    getShow()
  }, [])

  useEffect(() => {
    console.log("Show object : ", show);
    if (show) {
      // Set selectedTime with the show object when component loads
      if (!selectedTime && show.dateTime) {
        const dateOptions = Object.keys(show.dateTime || {});
        if (dateOptions.length > 0) {
          const selectedDate = dateOptions[0];
          const slots = show.dateTime[selectedDate] || [];
          if (slots.length > 0) {
            setSelectedTime(slots[0]);
          }
        }
      }
      
      if (selectedTime) {
        getOccupiedSeats()
      }
    }
  }, [show, selectedTime]);

  return show ? (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
      {/* Booking Details and Available Timings */}
      {bookingDetails.city && bookingDetails.theater && bookingDetails.showtime && (
        <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30'>
          <p className='text-lg font-semibold px-6'>Booking Details</p>
          <div className='mt-5 px-6 space-y-3'>
            <div>
              <p className='text-gray-400 text-xs'>Movie</p>
              <p className='text-white text-sm font-medium'>{bookingDetails.movieTitle || show?.movie?.title}</p>
            </div>
            <div>
              <p className='text-gray-400 text-xs'>Date</p>
              <p className='text-white text-sm font-medium'>
                {bookingDetails.date ? `${bookingDetails.date.day}, ${bookingDetails.date.date} ${bookingDetails.date.month}` : date}
              </p>
            </div>
            <div>
              <p className='text-gray-400 text-xs'>City</p>
              <p className='text-white text-sm font-medium'>{bookingDetails.city}</p>
            </div>
            <div>
              <p className='text-gray-400 text-xs'>Theater</p>
              <p className='text-white text-sm font-medium'>{bookingDetails.theater?.name}</p>
            </div>
            <div>
              <p className='text-gray-400 text-xs'>Showtime</p>
              <p className='text-white text-sm font-medium'>{bookingDetails.showtime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Seats Layout */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className='text-2xl font-semibold mb-4'>Select your seat</h1>

        <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
          {(() => {
            // NEW LOGIC HERE
    const dateOptions = Object.keys(show?.dateTime || {});
    const selectedDate = dateOptions[1];
    const slots = show?.dateTime?.[selectedDate] || [];
    const currentShow = slots[0] || {};
  const seatLayout = layouts[bookingDetails.screen] || layouts["Screen 1"];

            return seatLayout.map((row, rowIndex) => {
              // Check if this row is the first of its type in the layout
              const currentType = row.find(seat => seat !== null)?.type;
              const prevType = rowIndex > 0 ? seatLayout[rowIndex - 1].find(seat => seat !== null)?.type : null;
              const isFirstOfType = currentType && currentType !== prevType;

              // Calculate the approximate width for the horizontal line
              // Count non-null seats to estimate the width
              const seatCount = row.filter(seat => seat !== null).length;
              const estimatedWidth = seatCount * 40; // Assuming each seat is about 40px wide with gaps

              return (
                <React.Fragment key={rowIndex}>
                  {/* Render zone header if this is the first row of a type */}
                  {isFirstOfType && currentType && (
                    <ZoneHeader type={currentType} width={estimatedWidth} />
                  )}

                  <div className='flex gap-2 mt-2'>
                    {/* Row label - show only for the first non-null seat in the row */}
                    {row.some(seat => seat !== null) && (
                      <div className='flex items-center justify-center w-6 h-8 text-gray-400 font-medium'>
                        {row.find(seat => seat !== null)?.id.charAt(0)}
                      </div>
                    )}
                    <div className='flex flex-wrap items-center justify-center gap-2'>
                      {row.map((seat, seatIndex) => {
                        if (seat === null) {
                          // Render an empty space for null seats (aisles/gaps)
                          return <div key={`gap-${rowIndex}-${seatIndex}`} className='h-8 w-8'></div>;
                        }

                        return (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat.id)}
                            className={`h-8 w-8 rounded border border-primary/60 cursor-pointer 
                              ${selectedSeats.includes(seat.id) && "bg-primary text-white"}
                              ${occupiedSeats.includes(seat.id) && "opacity-50"}`}
                          >
                            {seat.id.substring(1)} {/* Display only the number part of the seat ID */}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </React.Fragment>
              );
            });
          })()}
        </div>

        <div className='flex flex-col items-center mt-16 mb-10'>
          <img src={assets.screenImage} alt="screen" />
          <p className='text-gray-400 text-sm mt-2'>All eyes this way please</p>
        </div>

        <button onClick={bookTickets} className='flex items-center gap-1 mt-10 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
        </button>

      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default SeatLayout