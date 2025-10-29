import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Show from '../models/Show.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Static data for reference
const citiesData = [
  { id: 1, name: "Mumbai" },
  { id: 2, name: "Delhi" },
  { id: 3, name: "Bangalore" },
  { id: 4, name: "Hyderabad" },
  { id: 5, name: "Chennai" },
  { id: 6, name: "Ahmedabad" },
  { id: 7, name: "Kolkata" },
  { id: 8, name: "Pune" }
];

const theatersData = [
  { id: 1, name: "PVR Juhu", cityId: 1 },
  { id: 2, name: "INOX Malad", cityId: 1 },
  { id: 3, name: "Cinepolis Andheri", cityId: 1 },
  { id: 4, name: "PVR Select Citywalk", cityId: 2 },
  { id: 5, name: "INOX Nehru Place", cityId: 2 },
  { id: 6, name: "PVR Forum Mall", cityId: 3 },
  { id: 7, name: "INOX Garuda", cityId: 3 },
  { id: 8, name: "PVR Kukatpally", cityId: 4 },
  { id: 9, name: "INOX GVK One", cityId: 4 },
  { id: 10, name: "SPI Palazzo", cityId: 5 },
  { id: 11, name: "PVR Phoenix", cityId: 5 },
  { id: 12, name: "PVR Acropolis", cityId: 6 },
  { id: 13, name: "INOX R16", cityId: 6 },
  { id: 14, name: "INOX Quest", cityId: 7 },
  { id: 15, name: "PVR Diamond Plaza", cityId: 7 },
  { id: 16, name: "PVR Market City", cityId: 8 },
  { id: 17, name: "INOX Amanora", cityId: 8 }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to get city name from ID
const getCityNameFromId = (cityId) => {
  const city = citiesData.find(c => c.id === parseInt(cityId));
  return city ? city.name : null;
};

// Function to get theater name from ID
const getTheaterNameFromId = (theaterId) => {
  const theater = theatersData.find(t => t.id === parseInt(theaterId));
  return theater ? theater.name : null;
};

// Main migration function
const migrateShows = async () => {
  try {
    console.log('Starting show migration...');
    
    // Get all shows
    const shows = await Show.find({});
    console.log(`Found ${shows.length} shows to process`);
    
    let updatedCount = 0;
    
    // Process each show
    for (const show of shows) {
      let needsUpdate = false;
      let updates = {};
      
      // Check if city is a number (ID) and convert to name
      if (show.city && !isNaN(parseInt(show.city))) {
        const cityName = getCityNameFromId(parseInt(show.city));
        if (cityName) {
          updates.city = cityName;
          needsUpdate = true;
        }
      }
      
      // Check if theater is a number (ID) and convert to name
      if (show.theater && !isNaN(parseInt(show.theater))) {
        const theaterName = getTheaterNameFromId(parseInt(show.theater));
        if (theaterName) {
          updates.theater = theaterName;
          needsUpdate = true;
        }
      }
      
      // Update the show if needed
      if (needsUpdate) {
        await Show.updateOne({ _id: show._id }, { $set: updates });
        updatedCount++;
        console.log(`Updated show ${show._id}: ${JSON.stringify(updates)}`);
      }
    }
    
    console.log(`Migration completed. Updated ${updatedCount} shows.`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateShows();