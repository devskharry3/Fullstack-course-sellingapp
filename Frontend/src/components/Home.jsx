import React, { useEffect, useState } from 'react'
import logo from '/logo.webp'
import { Link } from 'react-router-dom'
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import axios from "axios"
import Slider from "react-slick";
import { toast } from 'react-hot-toast';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BACKEND_URL } from '../utils/utils';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
             //token
    useEffect(()=>{
        const token=localStorage.getItem("user");
        if(token){
            setIsLoggedIn(true);
        }else{
            setIsLoggedIn(false);
        }
    },[])


    const handleLogout = async() => {
        try {
            // Wait for the response using await
            const response = await axios.get( `${BACKEND_URL}/user/logout`, {
                withCredentials: true,
            });
            
            // Clear the token from localStorage
            toast.success(response.data.message);
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            
        } catch(error) {
            console.log("Error in logging out", error);
            toast.error(error.response?.data?.error || "Error in logging out");
        }
    }



     //fetch Courses
    useEffect(()=> {
        const fetchCourses= async ()=>{
            try{
                const response = await axios.get(`${BACKEND_URL}/course/courses`, {
                    withCredentials: "include",
                });
                console.log(response.data.courses)
                setCourses(response.data.courses)
            } catch(error) {
                console.error("Error fetching courses:", error.message);
                if (error.response) {
                    // The request was made and the server responded with a status code
                    console.error("Response data:", error.response.data);
                    console.error("Response status:", error.response.status);
                }
            }
        };
        fetchCourses();
    },[])

    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        initialSlide: 0,
        autoplay: true,
        autoplaySpeed:3000,
        cssEase:"linear",
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 2,
              infinite: true,
              dots: true
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
              initialSlide: 2
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
      };
  return (
    <div className='bg-gradient-to-r from-black to-blue-950 min-h-screen'>
        <div className=' text-white container mx-auto '>
        {/* Header */}
        <header className='flex items-center justify-between p-6 '>
            <div className='flex items-center space-x-2'>
                <img src={logo} alt="" className='w-10 h-10 rounded-full' />
                <h1 className='text-2xl text-orange-500 font-bold' >CourseMaven</h1>
            </div>
            <div className='space-x-4'>
                {isLoggedIn ? (
                    <button 
                        onClick={handleLogout}
                        className='bg-transparent text-white py-2 px-4 border border-white rounded'
                    >
                    Logout
                    </button>
                ) : (
                    <>
                        <Link to={"/login"} 
                            className='bg-transparent text-white py-2 px-4 border border-white rounded'>
                            Login
                        </Link>
                        <Link to={"/signup"} 
                            className='bg-transparent text-white py-2 px-4 border border-white rounded'>
                            Signup
                        </Link>
                    </>
                )}
            </div>
        </header>

        {/*Main section*/}
        <section className='text-center py-20'>
            <h1 className='text-4xl font-semibold text-orange-500'>CourseHaven</h1>
            <br />
            <br />
            <p className='text-gray-500'>Sharpen your skills with courses crafted by experts.</p>
            <div className='space-x-4 mt-8'>
                <Link to={"/courses"} className='bg-green-500 text-white py-3 px-6 rounded  font-semibold hover:bg-white duration-300 hover:text-black'>
                    Explore courses</Link>
                <Link to={"https://www.youtube.com/watch?v=VIIaMCBeQF0"} className='bg-white text-black  py-3 px-6 rounded  font-semibold hover:bg-green-500 duration-300 hover:text-white'>
                    Courses videos</Link>
            </div>
        </section>
        <section className='p-10'>
            <Slider {...settings}>
                {courses.map((course) => (
                    <div key={course._id} className="p-4">
                        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 transform hover:scale-105">
                            <img 
                                className="h-40 w-full object-cover" 
                                src={course.image.url} 
                                alt=""
                            />
                            <div className="p-4 text-center">
                                <h2 className="text-lg font-bold text-white">{course.title}</h2>
                                <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-blue-500 duration-300 ">
                                    Enroll now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </section>

         <hr className='my-20' />
        {/*Footer*/}
        <footer className='mt-10'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 px-4'>
                <div className='flex flex-col items-center md:items-start'>
                    <div className='flex items-center space-x-2'>
                    <img src={logo} alt="" className='w-10 h-10 rounded-full' />
                    <h1 className='text-2xl text-orange-500 font-bold'>
                        CourseHaven
                    </h1>
                </div>
                <div className='mt-3 ml-2 md:ml-0'>
                    <p className='mb-2' >follow us </p> 
                    <div className='flex space-x-4'>
                    <a href=""><FaFacebook className=' text-2xl hover:text-blue-400 duration-300'  /></a>
                     <a href=""><FaInstagram className='text-2xl hover:text-pink-600 duration-300' /></a>
                     <a href=""><FaTwitter className='text-2xl hover:text-blue-600 duration-300' /></a>
                     </div>
                </div>
                </div>
                <div className='items-center flex flex-col'>
                    <h3 className='text-lg font-semibold mb-4'>connects</h3>
                    <ul className='spcae-y-2 text-gray-400' >
                        <li className='hover:text-white cursor-pointer duration-300' >Youtube- Skharrychan</li>
                        <li className='hover:text-white cursor-pointer duration-300'>telegram- Skharrycodes</li>
                        <li className='hover:text-white cursor-pointer duration-300'>Github- Skharry</li>
                    </ul>
                </div>
                <div>
                <div className='items-center flex flex-col'>
                    <h3 className='text-lg font-semibold mb-4'>Copyright &#169; 2024</h3>
                    <ul className='spcae-y-2 text-gray-400' >
                        <li className='hover:text-white cursor-pointer duration-300' >Terms & Conditions</li>
                        <li className='hover:text-white cursor-pointer duration-300'>Privacy Policy</li>
                        <li className='hover:text-white cursor-pointer duration-300'>Refund & Cancellation</li>
                        </ul>
                        </div>
                </div>
            </div>
        </footer>
    </div>
    </div>
  )
}

export default Home