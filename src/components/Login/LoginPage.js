import { Box, Typography, Grid, useMediaQuery, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import Image from "next/image";
import UserName from "./UserName";
import ForgotPassword from "./forgot-password";
import UnblockUser from "./unblock-user";
import AppLogo from "../../../public/mayway.jpg";
import styles from "./Login.module.css";
import api from "../../../utils/api"; // Your base API instance
import { DataEncrypt, DataDecrypt } from "../../../utils/encryption";

const getBanner = async (categoryId) => {
  try {
    // Create payload as per your backend expectation
    const payload = { categoryId };
    
    // Encrypt the payload
    const encryptedData = DataEncrypt(JSON.stringify(payload));
    
    // Make API call with encrypted data
    const response = await api.post('/api/banner/338876c40d469f2abe060d986593e12dfc9aa48c', {
      encReq: encryptedData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}` // JWT token
      }
    });

    // Handle response - check if it's encrypted or direct
    let responseData;
    
    if (typeof response.data === 'string' && response.data.startsWith('ey')) {
      // Response is encrypted, decrypt it
      responseData = DataDecrypt(response.data);
      responseData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    } else if (response.data.encRes) {
      // Response has encrypted data in encRes field
      responseData = DataDecrypt(response.data.encRes);
      responseData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    } else {
      // Response is already decrypted
      responseData = response.data;
    }

    return responseData;
    
  } catch (error) {
    console.error('Get Banner API Error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || 'Failed to fetch banners');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Unable to connect to server');
    } else {
      // Something else happened
      throw new Error('Failed to fetch banners');
    }
  }
};

const LoginPage = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showUnblock, setShowUnblock] = useState(false);
  const [bannerImages, setBannerImages] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Media query for mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch banner images from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Use the getBanner function directly
        const response = await getBanner('login');
        
        if (response.status === 200 && response.data && response.data.length > 0) {
          setBannerImages(response.data);
        } else {
          setError(true); // No banners found
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
        setError(true); // Error occurred
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-slide banners if multiple images
  useEffect(() => {
    if (bannerImages.length > 1 && !error) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [bannerImages.length, error]);

  // Check if we should show banners or original brand container
  const shouldShowBanners = !error && bannerImages.length > 0 && !loading;

  return (
    <Box className={styles.root}>
      <Grid container className={styles.mainContainer}>
        {/* Mobile Header - Only show on mobile */}
        {isMobile && (
          <Grid item xs={12} className={styles.mobileHeader}>
            <Box className={styles.mobileBrandContainer}>
              <Image
                src={AppLogo}
                alt="Mirror Logo"
                width={120}
                height={36}
                style={{
                  filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
                }}
              />
              <Typography
                variant="h6"
                className={styles.mobileTagline}
                sx={{ cursor: "default", userSelect: "none" }}
              >
                Clarity is Purity...
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Left Section - Show either banners with overlay OR original brand container */}
        {!isMobile && (
          <Grid item xs={12} md={6} className={styles.leftSection}>
            {shouldShowBanners ? (
              // Show banners with overlay when available
              <Box className={styles.bannerContainer}>
                <Box className={styles.bannerImageWrapper}>
                  <Image
                    src={bannerImages[currentBannerIndex]?.img}
                    alt={bannerImages[currentBannerIndex]?.title || "Mayway Business Login"}
                    fill
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                    priority
                    onError={(e) => {
                      // If banner image fails to load, fallback to brand container
                      setError(true);
                    }}
                  />
                  
                  {/* Banner Overlay with Branding */}
                  <Box className={styles.bannerOverlay}>
                    <Box className={styles.brandContainer}>
                      <Box className={styles.logoWrapper}>
                        <Image
                          src={AppLogo}
                          alt="Mirror Logo"
                          width={200}
                          height={60}
                          style={{
                            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h3"
                        className={styles.tagline}
                        sx={{ cursor: "default", userSelect: "none" }}
                      >
                        Clarity is Purity...
                      </Typography>

                      <Typography
                        variant="h1"
                        className={styles.welcomeText}
                        sx={{ cursor: "default", userSelect: "none" }}
                      >
                        Welcome back to Mayway Business
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Banner Navigation Dots */}
                {bannerImages.length > 1 && (
                  <Box className={styles.bannerDots}>
                    {bannerImages.map((_, index) => (
                      <Box
                        key={index}
                        className={`${styles.dot} ${
                          index === currentBannerIndex ? styles.activeDot : ""
                        }`}
                        onClick={() => setCurrentBannerIndex(index)}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              // Show original brand container when no banners, error, or loading
              <Box className={styles.brandContainer}>
                <Box className={styles.logoWrapper}>
                  <Image
                    src={AppLogo}
                    alt="Mirror Logo"
                    width={200}
                    height={60}
                    style={{
                      filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
                    }}
                  />
                </Box>
                <Typography
                  variant="h3"
                  className={styles.tagline}
                  sx={{ cursor: "default", userSelect: "none" }}
                >
                  Clarity is Purity...
                </Typography>

                <Typography
                  variant="h1"
                  className={styles.welcomeText}
                  sx={{ cursor: "default", userSelect: "none" }}
                >
                  Welcome back to Mayway Business
                </Typography>
              </Box>
            )}
          </Grid>
        )}

        {/* Right Section - Login Form */}
        <Grid item xs={12} md={6} className={styles.rightSection}>
          <Box className={styles.formWrapper}>
              {/* Header */}
              <Typography
                variant="h4"
                className={`${styles.formTitle} `}
                sx={{ cursor: "default", userSelect: "none" }}
              >
                {showForgotPassword
                  ? "Forgot Password"
                  : showUnblock
                  ? "Unblock User"
                  : "Welcome Back!"}
              </Typography>

              <Typography
                variant="body1"
                className={`${styles.formSubtitle} `}
                sx={{ cursor: "default", userSelect: "none" }}
              >
                {showForgotPassword
                  ? "Enter your credentials to reset password"
                  : showUnblock
                  ? "Enter your username to unblock account"
                  : "Please enter your credentials to login"}
              </Typography>

              {/* Form */}
              {showForgotPassword ? (
                <ForgotPassword onBack={() => setShowForgotPassword(false)} />
              ) : showUnblock ? (
                <UnblockUser onBack={() => setShowUnblock(false)} />
              ) : (
                <UserName
                  onForgotPassword={() => setShowForgotPassword(true)}
                  onUnblock={() => setShowUnblock(true)}
                />
              )}

              {/* Footer Links */}
              <Box className={styles.footerLinks}>
                <Typography variant="body2" className={styles.communityLink}>
                  Follow Mayway Business Community
                </Typography>
              </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;