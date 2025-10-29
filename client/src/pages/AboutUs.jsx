import React from 'react'
import BlurCircle from '../components/BlurCircle'
import aboutUsImage from '../assets/about_us.png';


const AboutUs = () => {
  return (
    <div className="px-6 md:px-16 lg:px-36 pt-32 pb-20 min-h-screen relative">
      {/* Background blur effect */}
      <BlurCircle top="-100px" right="-100px" />
      <BlurCircle bottom="-100px" left="-100px" />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">About Us</h1>
        
        <div className="flex flex-col md:flex-row gap-10 items-center mb-12">
          <div className="md:w-1/2">
            <img 
              src={aboutUsImage} 
              alt="QuickShow Experience" 
              className="rounded-lg shadow-lg w-full h-60 object-cover"
            />
          </div>
          
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold text-primary mb-4">Our Mission</h2>
            <p className="text-gray-300 mb-6">
              At QuickShow, we're revolutionizing the movie-going experience by making ticket booking seamless, 
              intuitive, and enjoyable. Our mission is to connect movie lovers with the perfect cinema experience, 
              eliminating the hassle of long queues and complicated booking processes.
            </p>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-4">The QuickShow Experience</h2>
          <p className="text-gray-300 mb-6">
            QuickShow offers a comprehensive platform where you can discover the latest releases, find nearby theaters, 
            and secure your perfect seat in seconds. Our intuitive interface provides real-time availability, 
            detailed movie information, and secure payment processing—all designed to enhance your cinema experience 
            from browsing to watching.
          </p>
          <p className="text-gray-300">
            We partner with theaters across the country to provide you with the widest selection of movies and showtimes. 
            Whether you're planning a weekend outing or a spontaneous movie night, QuickShow ensures you'll never miss 
            the films you love.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-4">Our Commitment</h2>
          <p className="text-gray-300 mb-6">
            Security and reliability are at the core of our service. We employ state-of-the-art encryption for all 
            transactions, ensuring your payment information remains protected. Our booking system is designed for 
            reliability, with instant confirmation and easy access to your tickets through our digital wallet.
          </p>
          <p className="text-gray-300">
            The QuickShow team is dedicated to continuous improvement, regularly updating our platform with new features 
            and expanding our theater network. We're passionate about movies and committed to making your cinema 
            experience as enjoyable as the films themselves.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutUs