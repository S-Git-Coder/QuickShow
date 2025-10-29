import React, { useState } from 'react'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import axios from 'axios'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    // Name validation (min 2 characters, max 30 characters)
    const nameLength = formData.name.trim().length
    if (nameLength < 2) {
      toast.error('Name must be at least 2 characters long')
      return false
    }
    if (nameLength > 30) {
      toast.error('Name must not exceed 30 characters')
      return false
    }
    
    // Email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    
    // Message validation (min 10 characters, max 500 characters)
    const messageLength = formData.message.trim().length
    if (messageLength < 10) {
      toast.error('Message must be at least 10 characters long')
      return false
    }
    if (messageLength > 500) {
      toast.error('Message must not exceed 500 characters')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      return
    }
    
    try {
      // Send form data to API
      const response = await axios.post('/api/contact', formData)
      
      if (response.data.success) {
        // Show success message
        toast.success('Message sent successfully! We will get back to you soon.')
        
        // Reset form after successful submission
        setFormData({ name: '', email: '', message: '' })
      } else {
        toast.error(response.data.message || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error('An error occurred. Please try again later.')
    }
  }

  return (
    <div className="px-6 md:px-16 lg:px-36 pt-32 pb-20 min-h-screen relative">
      {/* Background blur effects */}
      <BlurCircle top="-100px" right="-100px" />
      <BlurCircle bottom="-100px" left="-100px" />
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Contact Us</h1>
        
        <p className="text-gray-300 mb-10">
          Have questions about QuickShow or need assistance with your booking? 
          Our team is here to help! Fill out the form below and we'll get back to you as soon as possible.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-gray-700 text-white 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-gray-700 text-white 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              required
              rows="5"
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-gray-700 text-white 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <button 
              type="submit" 
              className="px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium text-white"
            >
              Send Message
            </button>
          </div>
        </form>
        
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-black/30 p-6 rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold text-primary mb-3">Customer Support</h3>
            <p className="text-gray-300 mb-2">Email: support@quickshow.com</p>
            <p className="text-gray-300">Phone: +1-234-567-890</p>
          </div>
          
          <div className="bg-black/30 p-6 rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold text-primary mb-3">Business Inquiries</h3>
            <p className="text-gray-300 mb-2">Email: business@quickshow.com</p>
            <p className="text-gray-300">Phone: +1-234-567-891</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUs