import {
  Box,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  Fade,
  Card,
  CardContent,
  Container,
  alpha,
  styled
} from "@mui/material";
import { useState, useEffect } from "react";
import Image from "next/image";
import UserName from "./UserName";
import ForgotPassword from "./forgot-password";
import UnblockUser from "./unblock-user";
import AppLogo from "../../../public/mayway.jpg";
import api from "../../../utils/api";
import { DataEncrypt, DataDecrypt } from "../../../utils/encryption";

// Styled Components
const RootContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const MainCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  maxWidth: 1200,
  width: '100%',
  minHeight: '80vh',
  [theme.breakpoints.down('md')]: {
    minHeight: 'auto',
  },
}));

const BannerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: 600,
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    minHeight: 300,
    height: 300,
  },
}));

const BannerOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.common.black, 0.7)} 0%, 
    ${alpha(theme.palette.common.black, 0.4)} 50%, 
    ${alpha(theme.palette.common.black, 0.7)} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
}));

const BrandContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.common.white,
  maxWidth: 500,
}));

const FormContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  background: `linear-gradient(135deg, 
    ${theme.palette.background.default} 0%, 
    ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    minHeight: '60vh',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const FormWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
  },
}));

const BannerDot = styled(Box)(({ theme, active }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: active ? theme.palette.common.white : alpha(theme.palette.common.white, 0.5),
  margin: theme.spacing(0, 0.5),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.common.white,
    transform: 'scale(1.2)',
  },
}));

const BannerDotsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(3),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(1),
  zIndex: 10,
}));

const SkeletonImage = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: alpha(theme.palette.common.black, 0.1),
  background: `linear-gradient(90deg, 
    ${alpha(theme.palette.common.black, 0.1)} 25%, 
    ${alpha(theme.palette.common.black, 0.2)} 50%, 
    ${alpha(theme.palette.common.black, 0.1)} 75%)`,
  backgroundSize: '200% 100%',
  animation: 'loading 1.5s infinite',
  '@keyframes loading': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
}));

// API Service
const getBanner = async (categoryId) => {
  try {
    const payload = { categoryId };
    const encryptedData = DataEncrypt(JSON.stringify(payload));

    const response = await api.post('/api/banner/338876c40d469f2abe060d986593e12dfc9aa48c', {
      encReq: encryptedData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });

    let responseData;

    if (typeof response.data === 'string' && response.data.startsWith('ey')) {
      responseData = DataDecrypt(response.data);
      responseData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    } else if (response.data.encRes) {
      responseData = DataDecrypt(response.data.encRes);
      responseData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    } else {
      responseData = response.data;
    }

    return responseData;

  } catch (error) {
    console.error('Get Banner API Error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch banners');
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error('Failed to fetch banners');
    }
  }
};

// Banner Skeleton Component
const BannerSkeleton = () => (
  <BannerContainer>
    <SkeletonImage />
    <BannerOverlay>
      <BrandContainer>
        <Box sx={{ mb: 3 }}>
          <SkeletonImage sx={{ width: 200, height: 60, mx: 'auto', borderRadius: 2 }} />
        </Box>
        <SkeletonImage sx={{ width: 200, height: 24, mx: 'auto', mb: 2, borderRadius: 1 }} />
        <SkeletonImage sx={{ width: 300, height: 32, mx: 'auto', borderRadius: 1 }} />
      </BrandContainer>
    </BannerOverlay>
  </BannerContainer>
);

// Banner Component
const BannerSection = ({ banners, currentIndex, onBannerChange, loading, error }) => {
  if (loading) {
    return <BannerSkeleton />;
  }

  if (error || banners.length === 0) {
    return (
      <BannerContainer>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BrandContainer>
            <Box
              sx={{
                mb: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src={AppLogo}
                alt="Mayway Logo"
                width={200}
                height={60}
                priority
                style={{
                  filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.3))",
                }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Clarity is Purity...
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Welcome to Mayway Business
            </Typography>
          </BrandContainer>
        </Box>
      </BannerContainer>
    );
  }

  return (
    <BannerContainer>
      <Fade in={true} timeout={800}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src={banners[currentIndex]?.img}
            alt={banners[currentIndex]?.title || "Mayway Business Login"}
            fill
            priority
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            onError={(e) => {
              console.error('Banner image failed to load');
            }}
          />

          <BannerOverlay>
            <BrandContainer>
              <Box sx={{ mb: 3 }}>
                <Image
                  src={AppLogo}
                  alt="Mayway Logo"
                  width={200}
                  height={60}
                  style={{
                    filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.3))",
                  }}
                />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Clarity is Purity...
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Welcome to Mayway Business
              </Typography>
            </BrandContainer>
          </BannerOverlay>
        </Box>
      </Fade>

      {/* Banner Navigation Dots */}
      {banners.length > 1 && (
        <BannerDotsContainer>
          {banners.map((_, index) => (
            <BannerDot
              key={index}
              active={index === currentIndex}
              onClick={() => onBannerChange(index)}
            />
          ))}
        </BannerDotsContainer>
      )}
    </BannerContainer>
  );
};

const LoginPage = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showUnblock, setShowUnblock] = useState(false);
  const [bannerImages, setBannerImages] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  // Fetch banner images from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getBanner('login');

        if (response.status === 200 && response.data && response.data.length > 0) {
          setBannerImages(response.data);
        } else {
          setError('No banners available');
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-slide banners
  useEffect(() => {
    if (bannerImages.length > 1 && !error) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [bannerImages.length, error]);

  const handleBannerChange = (index) => {
    setCurrentBannerIndex(index);
  };

  return (
    <RootContainer>
      <MainCard>
        <Grid container sx={{ minHeight: '80vh' }}>
          {/* Left Section - Banners/Brand */}
          {!isMobile && (
            <Grid item xs={12} md={6}>
              <BannerSection
                banners={bannerImages}
                currentIndex={currentBannerIndex}
                onBannerChange={handleBannerChange}
                loading={loading}
                error={error}
              />
            </Grid>
          )}

          {/* Right Section - Login Form */}
          <Grid item xs={12} md={6}>
            <FormContainer>
              <FormWrapper>
                {/* Mobile Header */}
                {isMobile && (
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Image
                      src={AppLogo}
                      alt="Mayway Logo"
                      width={120}
                      height={36}
                      priority
                      style={{
                        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        mt: 1,
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent'
                      }}
                    >
                      Clarity is Purity...
                    </Typography>
                  </Box>
                )}

                {/* Error Alert */}
                {error && bannerImages.length === 0 && !loading && (
                  <Alert
                    severity="warning"
                    sx={{
                      mb: 3,
                      borderRadius: 2
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* Form Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    sx={{
                      fontWeight: 'bold',
                      mb: 1,
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}
                  >
                    {showForgotPassword
                      ? "Forgot Password"
                      : showUnblock
                        ? "Unblock User"
                        : "Welcome Back!"}
                  </Typography>

                  <Typography
                    variant={isMobile ? "body2" : "body1"}
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {showForgotPassword
                      ? "Enter your credentials to reset password"
                      : showUnblock
                        ? "Enter your username to unblock account"
                        : "Please enter your credentials to login"}
                  </Typography>
                </Box>

                {/* Form Content */}
                <Box sx={{ mb: 4 }}>
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
                </Box>

                {/* Footer */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ opacity: 0.8 }}
                  >
                    Follow Mayway Business Community
                  </Typography>
                </Box>
              </FormWrapper>
            </FormContainer>
          </Grid>
        </Grid>
      </MainCard>
    </RootContainer>
  );
};

export default LoginPage;