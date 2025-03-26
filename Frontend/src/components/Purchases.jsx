import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RiHome2Fill } from 'react-icons/ri';
import { FaDiscourse, FaDownload } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import { IoLogIn, IoLogOut } from 'react-icons/io5';
import { HiX, HiMenu } from 'react-icons/hi';
import { BACKEND_URL } from '../utils/utils';

const Purchases = () => {
  const [purchases, setPurchase] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user data exists in localStorage
  const userDataString = localStorage.getItem("user");
  let user, token;
  
  try {
    if (userDataString) {
      user = JSON.parse(userDataString);
      token = user?.token;
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
  }

  // Handle case where no user is logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [token, navigate]);

  // Fetch purchases with refresh capability
  const fetchPurchases = async () => {
    if (!token) {
      setErrorMessage("Please login to view your purchased courses");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("Fetching purchases with token:", token);
      const response = await axios.get(
        `${BACKEND_URL}/user/purchases`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      console.log("Purchases API response:", response.data);
      
      if (response.data.courseData) {
        setPurchase(response.data.courseData);
        setErrorMessage("");
      } else {
        setPurchase([]);
        setErrorMessage("No purchases found");
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
      setErrorMessage(
        error.response?.data?.errors || "Failed to fetch purchase data"
      );
      setPurchase([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPurchases();
  }, [token]);

  // Listen for URL params that might indicate a new purchase
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const newPurchase = queryParams.get("newPurchase");
    
    if (newPurchase === "true") {
      fetchPurchases();
      // Clear the URL parameter
      navigate("/purchases", { replace: true });
    }
  }, [location.search, navigate]);

  // Add a manual refresh function
  const handleRefresh = () => {
    fetchPurchases();
    toast.success("Refreshing your purchases...");
  };

  const handleLogout = async () => {
    try {
      // Simply remove the token from localStorage
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-100 p-5 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 z-50`}
      >
        <nav>
          <ul className="mt-16 md:mt-0">
            <li className="mb-4">
              <Link to="/" className="flex items-center">
                <RiHome2Fill className="mr-2" /> Home
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/courses" className="flex items-center">
                <FaDiscourse className="mr-2" /> Courses
              </Link>
            </li>
            <li className="mb-4">
              <a href="#" className="flex items-center text-blue-500">
                <FaDownload className="mr-2" /> Purchases
              </a>
            </li>
            <li className="mb-4">
              <Link to="/settings" className="flex items-center">
                <IoMdSettings className="mr-2" /> Settings
              </Link>
            </li>
            <li>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="flex items-center">
                  <IoLogOut className="mr-2" /> Logout
                </button>
              ) : (
                <Link to="/login" className="flex items-center">
                  <IoLogIn className="mr-2" /> Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Sidebar Toggle Button (Mobile) */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <HiX className="text-2xl" />
        ) : (
          <HiMenu className="text-2xl" />
        )}
      </button>

      {/* Main Content */}
      <div
        className={`flex-1 p-8 bg-gray-50 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold mt-6 md:mt-0">
            My Purchases
          </h2>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Purchases
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-4">
            <p>Loading your purchases...</p>
          </div>
        )}

        {/* Error message */}
        {!loading && errorMessage && (
          <div className="text-red-500 text-center mb-4">{errorMessage}</div>
        )}

        {/* Render purchases */}
        {!loading && purchases && purchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {purchases.map((purchase, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 mb-6"
              >
                <div className="flex flex-col items-center space-y-4">
                  {/* Course Image */}
                  <img
                    className="rounded-lg w-full h-48 object-cover"
                    src={
                      purchase.image?.url || "https://via.placeholder.com/200"
                    }
                    alt={purchase.title}
                  />
                  <div className="text-center">
                    <h3 className="text-lg font-bold">{purchase.title}</h3>
                    <p className="text-gray-500">
                      {purchase.description && purchase.description.length > 100
                        ? `${purchase.description.slice(0, 100)}...`
                        : purchase.description}
                    </p>
                    <span className="text-green-700 font-semibold text-sm">
                      ${purchase.price} only
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-gray-500">You have no purchases yet.</p>
        )}
      </div>
    </div>
  );
};

export default Purchases;