import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router'
import { useEffect, useState } from 'react'
import './App.css'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import  { Toaster } from 'react-hot-toast';
import Courses from './components/Courses'
import Purchases from './components/Purchases'
import Buy from './components/Buy'
import AdminSignup from './admin/AdminSignup'
import AdminLogin from './admin/AdminLogin'
import Dashboard from './admin/Dashboard'
import CourseCreate from './admin/CourseCreate'
import UpdateCourse from './admin/UpdateCourse'
import OurCourses from './admin/OurCourses'
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  
  // Check for regular user authentication
  const user = JSON.parse(localStorage.getItem("user"))
  
  // Force check admin status on every render and route change
  useEffect(() => {
    const checkAdmin = () => {
      const adminData = localStorage.getItem("admin")
      console.log("Admin data in localStorage:", adminData)
      
      if (!adminData) {
        console.log("No admin data found")
        setIsAdminLoggedIn(false)
        return
      }
      
      try {
        const admin = JSON.parse(adminData)
        console.log("Parsed admin data:", admin)
        console.log("Admin token exists:", !!admin?.token)
        setIsAdminLoggedIn(!!admin?.token)
      } catch (error) {
        console.error("Error parsing admin data:", error)
        setIsAdminLoggedIn(false)
      }
    }
    
    checkAdmin()
  }, [location.pathname])
  
  // Redirect logic
  useEffect(() => {
    console.log("Current path:", location.pathname)
    console.log("Is admin logged in:", isAdminLoggedIn)
    
    if (location.pathname.startsWith('/admin/') && 
        location.pathname !== '/admin/login' && 
        location.pathname !== '/admin/signup') {
      
      if (!isAdminLoggedIn) {
        console.log("Redirecting to admin login")
        navigate('/admin/login', { replace: true })
      }
    }
  }, [location.pathname, isAdminLoggedIn, navigate])

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>  

        {/* Other Routes*/} 
        <Route path="/courses" element={<Courses/>}/>
        <Route path="/buy/:courseId" element={<Buy/>}/>
        <Route path="/purchases" element={user ? <Purchases /> : <Navigate to={"/login"} />} />

        {/*Admin Routes*/} 
        <Route 
          path="/admin/signup" 
          element={
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
              <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-2xl font-bold text-center mb-6">Admin Registration Closed</h1>
                <p className="text-gray-600 mb-6 text-center">
                  Admin registration is currently disabled. Please contact the system administrator for access.
                </p>
                <Link 
                  to="/admin/login" 
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 block text-center"
                >
                  Go to Admin Login
                </Link>
              </div>
            </div>
          }
        />
        <Route path="/admin/login" element={<AdminLogin/>}/>
        <Route 
          path="/admin/dashboard" 
          element={
            isAdminLoggedIn ? (
              <Dashboard />
            ) : (
              <Navigate to="/admin/login" replace={true} />
            )
          } 
        />
        <Route 
          path="/admin/create-course" 
          element={
            isAdminLoggedIn ? (
              <CourseCreate />
            ) : (
              <Navigate to="/admin/login" replace={true} />
            )
          }
        />
        <Route 
          path="/admin/update-course/:courseId" 
          element={
            isAdminLoggedIn ? (
              <UpdateCourse />
            ) : (
              <Navigate to="/admin/login" replace={true} />
            )
          }
        />
        <Route 
          path="/admin/our-courses" 
          element={
            isAdminLoggedIn ? (
              <OurCourses />
            ) : (
              <Navigate to="/admin/login" replace={true} />
            )
          }
        />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
