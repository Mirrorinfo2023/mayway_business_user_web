'use client';
import { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  AppBar,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import {
  PlayCircle,
  Favorite,
  FavoriteBorder,
  ThumbUp,
  ThumbDown,
  Share,
  MoreVert,
  Person
} from '@mui/icons-material';

const CoursesScreen = () => {
  const [tabValue, setTabValue] = useState(0);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [videoEngagements, setVideoEngagements] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // API endpoints
  const API_BASE = 'https://api.mayway.in/api';
  const user = { id: 1 }; // Replace with actual user from your auth

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching courses...');
      const response = await fetch(`${API_BASE}/courses_video/get-videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });
      
      console.log('Courses response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to load courses: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Courses API response:', data);
      
      if (data && data.data) {
        setCourses(data.data);
        console.log(`Loaded ${data.data.length} courses`);
        
        // Fetch engagements for all courses
        data.data.forEach(course => {
          if (course.id) {
            fetchVideoEngagement(course.id);
          }
        });
      } else {
        console.log('No courses data found');
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log('Fetching categories...');
      
      const response = await fetch(`${API_BASE}/courses_video/getAllcategory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      console.log('Categories response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories API response:', data);
        if (data && data.data) {
          setCategories(data.data);
          console.log(`Loaded ${data.data.length} categories`);
        } else {
          setCategories([]);
        }
      } else {
        console.error('Failed to fetch categories:', response.status);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchVideoEngagement = async (videoId) => {
    if (!videoId) {
      console.error('Video ID is undefined');
      return;
    }

    try {
      console.log(`Fetching engagement for video ID: ${videoId}`);
      
      const response = await fetch(`${API_BASE}/courses_video/get-video-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId.toString()
        })
      });

      console.log(`Engagement response for video ${videoId}:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`Engagement data for video ${videoId}:`, data);
        
        if (data && data.data && data.data.engagement) {
          setVideoEngagements(prev => ({
            ...prev,
            [videoId]: data.data.engagement
          }));
        }
      } else {
        console.error(`Failed to fetch engagement for video ${videoId}:`, response.status);
      }
    } catch (err) {
      console.error(`Error fetching video engagement for ${videoId}:`, err);
    }
  };

  const handleInteraction = async (videoId, type, commentText = '') => {
    if (!videoId) {
      console.error('Video ID is undefined for interaction');
      setSnackbar({ open: true, message: 'Failed to record interaction: Video ID missing' });
      return;
    }

    try {
      console.log(`Sending interaction: video_id=${videoId}, type=${type}`);
      
      const response = await fetch(`${API_BASE}/courses_video/video-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          user_id: user.id,
          type: type,
          comment_text: commentText
        })
      });

      console.log(`Interaction response:`, response.status);

      if (response.ok) {
        // Refresh engagement data
        fetchVideoEngagement(videoId);
        setSnackbar({ open: true, message: 'Interaction recorded successfully' });
      } else {
        setSnackbar({ open: true, message: 'Failed to record interaction' });
      }
    } catch (err) {
      console.error('Error sending interaction:', err);
      setSnackbar({ open: true, message: 'Failed to record interaction' });
    }
  };

  const handlePlayCourse = (course) => {
    if (!course.id) {
      console.error('Course ID is missing:', course);
      setSnackbar({ open: true, message: 'Course ID not found' });
      return;
    }

    if (!course.video_link) {
      console.error('Video link is missing:', course);
      setSnackbar({ open: true, message: 'Video link not available' });
      return;
    }

    console.log('Playing course:', {
      id: course.id,
      title: course.title,
      video_link: course.video_link
    });

    // Navigate to video player
    window.location.href = `/player?id=${course.id}&title=${encodeURIComponent(course.title || 'No Title')}&videoUrl=${encodeURIComponent(course.video_link || '')}`;
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      
      const now = new Date();
      const difference = now - date;
      
      if (difference < 60000) return `${Math.floor(difference / 1000)} seconds ago`;
      if (difference < 3600000) return `${Math.floor(difference / 60000)} minutes ago`;
      if (difference < 86400000) return `${Math.floor(difference / 3600000)} hours ago`;
      if (difference < 2592000000) return `${Math.floor(difference / 86400000)} days ago`;
      if (difference < 31536000000) return `${Math.floor(difference / 2592000000)} months ago`;
      return `${Math.floor(difference / 31536000000)} years ago`;
    } catch (error) {
      console.error('Error parsing date:', error);
      return "-";
    }
  };

  const renderCourseCard = (course) => {
    if (!course.id) {
      console.error('Course without ID found:', course);
      return null;
    }

    const engagement = videoEngagements[course.id] || {};
    const likesCount = engagement.likesCount || 0;
    const unlikesCount = engagement.unlikesCount || 0;
    const isLiked = engagement.isLiked || false;
    const isUnliked = engagement.isUnliked || false;
    const isFavorited = engagement.isFavorited || false;

    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
        <Card 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }
          }}
        >
          {/* Thumbnail */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <CardMedia
              component="img"
              height="200"
              image={course.thumbnail_img || '/mayway.jpg'}
              alt={course.title || 'Course thumbnail'}
              sx={{ 
                objectFit: 'cover',
                backgroundColor: 'grey.100',
                cursor: 'pointer'
              }}
              onClick={() => handlePlayCourse(course)}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: '50%',
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.9)',
                }
              }}
              onClick={() => handlePlayCourse(course)}
            >
              <PlayCircle sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 2,
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              HD
            </Box>
          </Box>

          <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Course Title */}
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              gutterBottom 
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '64px',
                cursor: 'pointer',
                flexGrow: 1
              }}
              onClick={() => handlePlayCourse(course)}
            >
              {course.title || 'Untitled Course'}
            </Typography>

            {/* Channel and Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                Mayway Business
              </Typography>
            </Box>

            {/* Engagement Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Like Button */}
                <IconButton 
                  size="small"
                  onClick={() => handleInteraction(course.id, isLiked ? 'unlike_like' : 'like')}
                  color={isLiked ? 'primary' : 'default'}
                >
                  <ThumbUp />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {likesCount}
                </Typography>

                {/* Dislike Button */}
                <IconButton 
                  size="small"
                  onClick={() => handleInteraction(course.id, isUnliked ? 'unlike_dislike' : 'dislike')}
                  color={isUnliked ? 'error' : 'default'}
                  sx={{ ml: 1 }}
                >
                  <ThumbDown />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {unlikesCount}
                </Typography>

                {/* Favorite Button */}
                <IconButton 
                  size="small"
                  onClick={() => handleInteraction(course.id, isFavorited ? 'unfavorite' : 'favorite')}
                  color={isFavorited ? 'error' : 'default'}
                  sx={{ ml: 1 }}
                >
                  {isFavorited ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton size="small">
                  <Share />
                </IconButton>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>

            {/* Play Button */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayCircle />}
              onClick={() => handlePlayCourse(course)}
              sx={{ py: 1.5, mt: 'auto' }}
            >
              Play Course
            </Button>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderCategories = () => {
    if (loadingCategories) {
      return (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} sm={4} md={3} key={item}>
              <Card sx={{ height: 120, borderRadius: 3 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%' 
                }}>
                  <CircularProgress size={30} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (categories.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No categories available
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {categories.slice(0, 4).map((category) => (
          <Grid item xs={6} sm={4} md={3} key={category.id}>
            <Card 
              sx={{ 
                height: 120,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${getCategoryColor(category.id).start}, ${getCategoryColor(category.id).end})`,
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
              }}>
                <Box
                  component="img"
                  src={category.img || '/mayway.jpg'}
                  alt={category.title || 'Category'}
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)'
                  }}
                />
                <Typography variant="body2" fontWeight="bold" sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {category.title || 'Untitled Category'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const getCategoryColor = (categoryId) => {
    const colors = {
      1: { start: '#4CAF50', end: '#81C784' }, // Stocks Trading
      2: { start: '#2196F3', end: '#64B5F6' }, // Forex Trading
      3: { start: '#FF9800', end: '#FFB74D' }, // Crypto Trading
      5: { start: '#9C27B0', end: '#BA68C8' }, // Share Market
    };
    return colors[categoryId] || { start: '#757575', end: '#9E9E9E' };
  };

  const renderAllCourses = () => (
    <Grid container spacing={3}>
      {courses.map(renderCourseCard)}
    </Grid>
  );

  const renderMyCourses = () => {
    const myCourses = courses.filter(course => 
      videoEngagements[course.id]?.isFavorited || 
      videoEngagements[course.id]?.isLiked
    );
    
    if (myCourses.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Favorite sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No favorite courses
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Like or favorite courses to see them here
          </Typography>
          <Button variant="contained" onClick={() => setTabValue(0)}>
            Browse Courses
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {myCourses.map(renderCourseCard)}
      </Grid>
    );
  };

  const renderByCategory = () => {
    const categoryCourses = courses.filter(course => course.category_id === 5); // Forex courses
    
    if (categoryCourses.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PlayCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No courses in this category
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {categoryCourses.map(renderCourseCard)}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading courses...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        width: '100%',
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchCourses}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ 
        width: '100%',
        px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
        py: 4
      }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1976d2, #00bcd4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Courses
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
            Learn from expert-led courses
          </Typography>
        </Box>

        {/* Categories Grid */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ 
            fontWeight: 'bold', 
            mb: 3,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
          }}>
            Categories
          </Typography>
          {renderCategories()}
        </Box>

        {/* Tabs */}
        <AppBar 
          position="static" 
          sx={{ 
            backgroundColor: 'white',
            color: 'text.primary',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            mb: 4
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(event, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 'bold',
                py: 2,
                minHeight: '60px',
                minWidth: { xs: '120px', sm: '160px' }
              },
              '& .Mui-selected': {
                color: 'primary.main'
              }
            }}
          >
            <Tab label="All Courses" />
            <Tab label="My Courses" />
            <Tab label="Forex Courses" />
          </Tabs>
        </AppBar>

        {/* Content */}
        <Box>
          {tabValue === 0 && renderAllCourses()}
          {tabValue === 1 && renderMyCourses()}
          {tabValue === 2 && renderByCategory()}
        </Box>

        {/* Empty State */}
        {courses.length === 0 && !loading && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            width: '100%'
          }}>
            <PlayCircle sx={{ 
              fontSize: { xs: 80, sm: 100, md: 120 }, 
              color: 'text.secondary', 
              mb: 3, 
              opacity: 0.3 
            }} />
            <Typography variant="h4" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
              No courses available
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ 
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
            }}>
              Check back later for new course offerings
            </Typography>
            <Button variant="outlined" onClick={fetchCourses}>
              Refresh
            </Button>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        sx={{
          '& .MuiSnackbarContent-root': {
            fontSize: '1rem'
          }
        }}
      />
    </>
  );
};

export default CoursesScreen;