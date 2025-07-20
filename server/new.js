// bookinController.js
import stripe from 'stripe';

// stripe gateway initialization
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

// Creating line items to for Stripe
const line_items = [{
    price_data: {
        currency: 'usd',
        product_data: {
            name: showData.movie.title
        },
        unit_amount: Math.floor(booking.amount) * 100
    },
    quantity: 1
}]

const session = await stripeInstance.checkout.sessions.create({
    success_url: `${origin}/loading/my-bookings`,
    cancel_url: `${origin}/my-bookings`,
    line_items: line_items,
    mode: 'payment',
    metadata:{
        bookingId: booking._id.toString()
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
})

booking.paymentLink = session.url
await booking.save()

res.json({success: true, url: session.url})

//////////////////////////////////////////////////////////////////////////////////

// SeatLayout.jsx
if(data.success) {
    window.location.href = data.url;
}else{
    toast.error(data.message)
}

/////////////////////////////////////////////////////////////////

// Loading.jsx
// itna add kiya hai
const { nexturl } = useParams()
const navigate = useNavigate()

useEffect(()=>{
    if(nexturl){
        setTimeout(()=>{
            navigate('/', + nexturl)
        },8000)
    }
},[])

////////////////////////////////////////////////
// App.jsx
// add kiya route
<Route path="/loading/:nexturl" element={<Loading />} />