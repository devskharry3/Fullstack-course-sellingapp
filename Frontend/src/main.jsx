import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51R1c4T2NSmnqJlWhE7AGA2j2gSxORDgk3xqFtqn91gx7SJUmoUSR3vQvtrr0PQoyZ8IvgX38sDuikr1MBIov6fDB00vyOmNc1p");



createRoot(document.getElementById('root')).render(



<Elements stripe={stripePromise}>
<BrowserRouter>
  <App/>
 </BrowserRouter>
</Elements>
)
