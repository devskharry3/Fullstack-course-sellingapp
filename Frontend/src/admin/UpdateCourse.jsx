import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router'
import axios from 'axios';
import imgPlaceholder from "../assets/imgPL.webp";
import { BACKEND_URL } from '../utils/utils';

function UpdateCourse() {
  const { courseId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [imagePublicId, setImagePublicId] = useState("");
  const [imageError, setImageError] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState(null);

  const navigate = useNavigate();

  // Get admin token from localStorage
  const admin = JSON.parse(localStorage.getItem("admin"));
  if (!admin || !admin.token) {
    toast.error("Please login as admin");
    navigate("/admin/login");
    return null;
  }

  // Fetch course data on component mount
  useEffect(() => {
    //console.log("Course ID from URL params:", courseId);
    
    if (!courseId || courseId === "undefined") {
      toast.error("Invalid course ID");
      navigate("/admin/our-courses");
      return;
    }

    const fetchCourseData = async () => {
      try {
        //console.log("Fetching course with ID:", courseId);
        
        const response = await axios.get(
          `${BACKEND_URL}/course/${courseId}`
        );
        
        console.log("Course data response:", response.data);
        
        const courseData = response.data.course;
        if (!courseData) {
          throw new Error("Course data not found in response");
        }
        
        setTitle(courseData.title);
        setDescription(courseData.description);
        setPrice(courseData.price.toString());
        
        // Handle image data
        if (courseData.image && courseData.image.url) {
          setImagePublicId(courseData.image.public_id || "");
          setImagePreview("has_image");
          setLocalImageUrl(courseData.image.url);
          // Pre-load the image to check if it's valid
          const img = new Image();
          img.onerror = () => {
            console.log("Failed to load existing image, using placeholder");
            setLocalImageUrl(imgPlaceholder);
            setImageError(true);
          };
          img.src = courseData.image.url;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        console.error("Error response:", error.response?.data);
        toast.error("Failed to load course data: " + (error.response?.data?.errors || error.message));
        navigate("/admin/our-courses");
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  const changePhotoHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset error state
    setImageError(false);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    
    // Clean up previous URL if it exists
    if (localImageUrl && localImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localImageUrl);
    }
    
    setLocalImageUrl(objectUrl);
    setImage(file);
    setImagePreview("new_image");
    
    // Validate the image can be loaded
    const img = new Image();
    img.onerror = () => {
      console.log("Failed to load new image preview");
      URL.revokeObjectURL(objectUrl);
      setLocalImageUrl(imgPlaceholder);
      setImageError(true);
      toast.error("Failed to load image preview");
    };
    img.src = objectUrl;
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const admin = JSON.parse(localStorage.getItem("admin"));
      if (!admin?.token) {
        toast.error("Please login first");
        navigate("/admin/login");
        return;
      }

      // First, handle image upload if there's a new image
      let imageData = {};
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("file", image);
        
        try {
          const imageUploadResponse = await axios.post(
            `${BACKEND_URL}/course/upload-image`,
            imageFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${admin.token}`,
              },
            }
          );
          
          imageData = {
            imageUrl: imageUploadResponse.data.url,
            imagePublicId: imageUploadResponse.data.public_id
          };
        } catch (imageError) {
          console.error("Image upload failed:", imageError);
          toast.error("Failed to upload image");
          return;
        }
      }

      // Now send the course update with all data
      const updateResponse = await axios.put(
        `${BACKEND_URL}/course/update/${courseId}`,
        {
          title,
          description,
          price,
          ...imageData // Include image data if it exists
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${admin.token}`,
          },
        }
      );
      
      toast.success(updateResponse.data.message || "Course updated successfully");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Update error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.response?.data?.message || "Error updating course");
    } finally {
      setLoading(false);
    }
  };

  // Render image preview safely
  const renderImage = () => {
    if (imagePreview === "new_image" || imagePreview === "has_image") {
      if (localImageUrl) {
        return (
          <div className="relative">
            <img
              src={localImageUrl}
              alt="Course Preview"
              className="h-40 w-40 object-cover border"
              onError={(e) => {
                console.log("Image load error, falling back to placeholder");
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = imgPlaceholder;
                setImageError(true);
              }}
            />
            {imageError && (
              <p className="text-red-500 text-sm mt-1">
                Failed to load image preview
              </p>
            )}
          </div>
        );
      }
      return (
        <div className="h-40 w-40 bg-blue-100 flex items-center justify-center border">
          <p className="text-sm text-blue-600">Current course image</p>
        </div>
      );
    }
    
    return (
      <div className="border p-4 text-center">
        <p className="text-gray-500">No image selected</p>
      </div>
    );
  };

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup any object URLs when component unmounts
      if (localImageUrl && localImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localImageUrl);
      }
    };
  }, [localImageUrl]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Update Course</h2>
        
        <form onSubmit={handleUpdateCourse} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-lg">Title</label>
            <input
              type="text"
              placeholder="Enter your course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg">Description</label>
            <textarea
              placeholder="Enter your course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg">Price</label>
            <input
              type="number"
              placeholder="Enter your course price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg">Course Thumbnail</label>
            <div className="flex flex-col space-y-2">
              {imagePreview ? (
                <div className="relative">
                  {renderImage()}
                  <div className="mt-2">
                    <button 
                      type="button"
                      className="text-sm text-red-500"
                      onClick={() => {
                        console.log("Removing preview image");
                        setImagePreview("");
                        setImage(null);
                        setImagePublicId("");
                        setLocalImageUrl(null);
                        
                        // Clean up any object URLs
                        if (localImageUrl && localImageUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(localImageUrl);
                        }
                      }}
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border p-4 text-center">
                  <p className="text-gray-500">No image selected</p>
                </div>
              )}
              
              <input
                type="file"
                onChange={changePhotoHandler}
                className="w-full px-3 py-2 border border-gray-400 rounded-md"
                accept="image/*"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Course"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateCourse