import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Show from '../models/Show.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const migrateShowData = async () => {
  try {
    console.log('Starting migration of show data...');
    
    // Get all shows
    const shows = await Show.find({});
    console.log(`Found ${shows.length} shows to process`);
    
    let validShows = 0;
    let updatedShows = 0;
    let missingCityOrTheater = 0;
    
    for (const show of shows) {
      let needsUpdate = false;
      
      // Check if theater is null and city exists
      if (!show.theater && show.city) {
        console.log(`Updating show ${show._id} with null theater`);
        show.theater = "Unknown Theater";
        needsUpdate = true;
      }
      
      // Check if screen is null
      if (!show.screen) {
        console.log(`Updating show ${show._id} with null screen`);
        show.screen = "Unknown Screen";
        needsUpdate = true;
      }
      
      // Check if city is null
      if (!show.city) {
        console.log(`Updating show ${show._id} with null city`);
        show.city = "Unknown City";
        needsUpdate = true;
      }
      
      // Save if updates were made
      if (needsUpdate) {
        await show.save();
        updatedShows++;
      } else if (show.city && show.theater) {
        validShows++;
      } else {
        missingCityOrTheater++;
      }
    }
    
    console.log(`Migration complete:`);
    console.log(`- ${validShows} shows already have valid city and theater names`);
    console.log(`- ${updatedShows} shows were updated with default values`);
    console.log(`- ${missingCityOrTheater} shows still have missing data`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration Error:', error);
    process.exit(1);
  }
};

// Run the migration
migrateShowData();