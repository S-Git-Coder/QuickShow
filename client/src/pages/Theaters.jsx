import React, { useState } from 'react';
import BlurCircle from '../components/BlurCircle';

const Theaters = () => {
  // Theater data organized by city with addresses and exact image URLs
  const theatersByCity = [
    {
      city: "Mumbai",
      theaters: [
        { 
          id: 1, 
          name: "PVR Juhu", 
          imageUrl: "https://images.jdmagicbox.com/v2/comp/mumbai/97/022pf013697/catalogue/pvr-cinemas-dynamic-mall--juhu-mumbai-cinema-halls-2zwji58-250.jpg",
          address: "5th Floor, Dynamix Mall, Next to Chandan Cinema, J M Marg, Juhu, Mumbai, Maharashtra 400049"
        },
        { 
          id: 2, 
          name: "INOX Malad", 
          imageUrl: "https://images.jdmagicbox.com/v2/comp/mumbai/59/022p8004859/catalogue/inox-cinemas-inorbit-mall--malad-west-mumbai-cinema-halls-40k5g6e-250.jpg",
          address: "2nd Floor, Inorbit Mall, Goregaon Malad Link Road, Malad West, Mumbai, Maharashtra 400064"
        },
        { 
          id: 3, 
          name: "Cinepolis Andheri", 
          imageUrl: "https://images.jdmagicbox.com/v2/comp/mumbai/19/022p8700519/catalogue/cinepolis-cinema-fun-republic-mall-andheri-west-mumbai-cinema-halls-8s9wlvqpvr-250.jpg",
          address: "1st Floor, Plot No. 844/4, Fun Republic Mall, Next to Yash Raj Films, New Link Road, Andheri West, Mumbai 400053"
        }
      ]
    },
    {
      city: "Delhi",
      theaters: [
        { 
          id: 4, 
          name: "PVR Select Citywalk", 
          imageUrl: "https://images.jdmagicbox.com/comp/def_content_category/pvr-cinemas/4-pvr-cinemas-4-h72fz-250.jpg",
          address: "A-3/2, Select City Walk, 2nd Floor, Saket, New Delhi 110017"
        },
        { 
          id: 5, 
          name: "INOX Nehru Place", 
          imageUrl: "https://images.jdmagicbox.com/v2/comp/delhi/b1/011pxx11.xx11.000218567259.v6b1/catalogue/inox-cinemas-nehru-place-delhi-cinema-halls-3u98678-250.jpg",
          address: "1st Floor, Paras Cinema Building, Nehru Place, New Delhi 110019"
        }
      ]
    },
    {
      city: "Bangalore",
      theaters: [
        { 
          id: 6, 
          name: "PVR Forum Mall", 
          imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnNAwkDJaiixkOMJtCksuj9IF2cMwR1ttzMw&s",
          address: "The Forum, 21-22, Hosur Road, Koramangala, Bengaluru, Karnataka 560095"
        },
        { 
          id: 7, 
          name: "INOX Garuda", 
          imageUrl: "https://images.jdmagicbox.com/v2/comp/bangalore/09/080pf013709/catalogue/inox-cinemas-garuda-shopping-mall-magrath-road-bangalore-multiplex-cinema-halls-x1rs1poyl1-250.jpg",
          address: "Garuda Mall, Magrath Road, Ashok Nagar, Bengaluru, Karnataka 560025"
        }
      ]
    },
    {
      city: "Hyderabad",
      theaters: [
        { 
          id: 8, 
          name: "PVR Kukatpally", 
          imageUrl: "https://images.jdmagicbox.com/v2/comp/hyderabad/b1/040pxx40.xx40.140904140856.n7b1/catalogue/pvr-cinemas-forum-sujana-mall-kukatpally-hyderabad-multiplex-cinema-halls-259lo6s-250.jpg",
          address: "Forum Sujana Mall, 5th Floor, Kukatpally, Hyderabad, Telangana 500072"
        },
        { 
          id: 9, 
          name: "INOX GVK One", 
          imageUrl: "https://images.jdmagicbox.com/v2/comp/hyderabad/u3/040pxx40.xx40.000303959952.q5u3/catalogue/inox-gvk-one-mall-banjara-hills-hyderabad-inox-cinemas-947rcs1e5r-250.jpg",
          address: "GVK One Mall, Road No. 1, Banjara Hills, Hyderabad, Telangana 500034"
        }
      ]
    },
    {
      city: "Chennai",
      theaters: [
        { 
          id: 10, 
          name: "SPI Palazzo", 
          imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/e5/b4/e9/photo0jpg.jpg?w=1200&h=-1&s=1",
          address: "Nexus Vijaya Mall, 4th Floor, 142, Arcot Rd, Vadapalani, Chennai, Tamil Nadu 600026"
        },
        { 
          id: 11, 
          name: "PVR Phoenix", 
          imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDsWp1QBM0mEX3lOft_qyGd0YRX2NBH8i8Tg&s",
          address: "Phoenix Market City, 142, Velachery Main Road, Indira Gandhi Nagar, Velachery, Chennai, Tamil Nadu 600042"
        }
      ]
    },
    {
      city: "Ahmedabad",
      theaters: [
        { 
          id: 12, 
          name: "PVR Acropolis", 
          imageUrl: "https://images.jdmagicbox.com/comp/def_content_category/pvr-cinemas/6-pvr-cinemas-2-hs9np-250.jpg",
          address: "Acropolis Mall, Thaltej - Hebatpur Road, Thaltej, Ahmedabad, Gujarat 380059"
        },
        { 
          id: 13, 
          name: "INOX R16", 
          imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyGrMrR5McDaxr8wskrAJAzYRmtJjs9-vTUWMNRW9SkyA_dgyVWuynDhyM_1VqpzmD-7hb-JTUxuTj9v2mK8p76HcGIp1u0ewryUH67Tf6K85nejuKk4zQfw8VkOtdYsFFYZ2_3=s1360-w1360-h1020-rw",
          address: "R16, Reliance Mega Mall, Jodhpur Cross Road, Satellite, Ahmedabad, Gujarat 380015"
        }
      ]
    },
    {
      city: "Kolkata",
      theaters: [
        { 
          id: 14, 
          name: "INOX Quest", 
          imageUrl: "https://images.jdmagicbox.com/v2/comp/kolkata/r5/033pxx33.xx33.140124115053.d7r5/catalogue/inox-cinemas-quest-mall-circus-avenue-kolkata-cinema-halls-xd6zukl4us-250.jpg",
          address: "Quest Mall, 33, Syed Amir Ali Avenue, Ballygunge, Kolkata, West Bengal 700017"
        },
        { 
          id: 15, 
          name: "PVR Diamond Plaza", 
          imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToohGPaXCzqRKrNbdGDTcQkzrJEs5HVe2Q5Q&s",
          address: "Diamond Plaza, 68, Jessore Road, Nagerbazar, Kolkata, West Bengal 700055"
        }
      ]
    },
    {
      city: "Pune",
      theaters: [
        { 
          id: 16, 
          name: "PVR Market City", 
          imageUrl: "https://images.jdmagicbox.com/comp/pune/u4/020pxx20.xx20.121221161053.c3u4/catalogue/inox-cinemas-hadapsar-pune-cinema-halls-d8829-250.png",
          address: "Phoenix Market City, 207, Viman Nagar Road, Viman Nagar, Pune, Maharashtra 411014"
        },
        { 
          id: 17, 
          name: "INOX Amanora", 
          imageUrl: "https://images.jdmagicbox.com/comp/pune/u4/020pxx20.xx20.121221161053.c3u4/catalogue/inox-cinemas-hadapsar-pune-cinema-halls-d8829-250.png",
          address: "Amanora Town Centre, Hadapsar, Pune, Maharashtra 411028"
        }
      ]
    }
  ];

  // Fallback images for theaters without direct photo links
  const [fallbackImages] = useState([
    "/assets/images/theater-placeholder.svg",
    "https://img.freepik.com/free-photo/empty-cinema-auditorium-with-red-seats_1232-3221.jpg",
    "https://img.freepik.com/free-photo/cinema-entertainment-concept-with-popcorn_23-2149242198.jpg",
    "https://img.freepik.com/free-photo/movie-background-collage_23-2149876028.jpg",
    "https://img.freepik.com/free-photo/cinema-elements-red-background-with-copy-space_23-2148457853.jpg"
  ]);
  
  // Function to get a random fallback image
  const getRandomFallbackImage = () => {
    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
    return fallbackImages[randomIndex];
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-10 relative">
      <BlurCircle className="left-0 top-0" />
      <BlurCircle className="right-0 bottom-0" />
      
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Our Theaters</h1>
      
      {theatersByCity.map((cityData) => (
        <div key={cityData.city} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b-2 border-primary">
            {cityData.city}
          </h2>
          
          {cityData.theaters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityData.theaters.map((theater) => (
                <div 
                  key={theater.id}
                  className="bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                >
                  {/* 
                    Image placeholder - to be replaced with actual theater images
                    Naming convention: theater-name-in-lowercase.jpg (e.g., pvr-juhu.jpg)
                  */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={theater.imageUrl}
                      alt={`${theater.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholderImage;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{theater.name}</h3>
                    <div className="text-gray-400 text-sm">
                      <p className="line-clamp-3 hover:line-clamp-none transition-all duration-200">{theater.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              No theaters in this city yet
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Theaters;