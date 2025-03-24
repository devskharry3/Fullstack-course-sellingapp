import dotenv from "dotenv";
dotenv.config();

const JWT_USER_PASSWORD= process.env.JWT_USER_PASSWORD
const JWT_ADMIN_PASSWORD= process.env.JWT_ADMIN_PASSWORD
const STRIPE_SECRET_KEY= 
   "sk_test_51R1c4T2NSmnqJlWhjPVNeTKwzxereCSVXQ4RMrJS4lVEBVUZHaxWOv2wog0wf9w9VuPinBuLEdA9cE4DKCsxU5nR0083xrYosm"

export default {
    JWT_USER_PASSWORD,
    JWT_ADMIN_PASSWORD,
    STRIPE_SECRET_KEY
}