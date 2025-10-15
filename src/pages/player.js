'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Alert,
  Avatar,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  ThumbUp,
  ThumbDown,
  Favorite,
  FavoriteBorder,
  Share,
  MoreVert
} from '@mui/icons-material';
import Layout from '@/components/Dashboard/layout';

const PlayerPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const iframeRef = useRef(null);
  
  // Get parameters directly
  const videoId = searchParams.get('id');
  const title = searchParams.get('title') ? decodeURIComponent(searchParams.get('title')) : 'No Title';
  const videoUrl = searchParams.get('videoUrl') ? decodeURIComponent(searchParams.get('videoUrl')) : '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentYouTubeId, setCurrentYouTubeId] = useState('');

  // Mock data
  const channelInfo = {
    name: "Mayway Business",
    subscribers: "125K subscribers",
    avatar: "/assets/channel-avatar.jpg",
    isVerified: true
  };

  const videoInfo = {
    views: "125,432 views",
    uploadDate: "2 weeks ago",
    description: `In this comprehensive course, you'll learn everything about ${title}. This video covers all the essential concepts and practical applications.`
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
      /youtu\.be\/([^"&?\/\s]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Extract YouTube ID
  const youtubeId = extractYouTubeId(videoUrl);

  useEffect(() => {
    console.log('🔄 Video parameters changed:', {
      videoId,
      youtubeId,
      videoUrl
    });

    // Reset loading state when parameters change
    setLoading(true);

    // Check if parameters exist
    if (!videoId) {
      setError('Video ID not found in URL parameters.');
      setLoading(false);
      return;
    }

    if (!videoUrl) {
      setError('Video URL not found in URL parameters.');
      setLoading(false);
      return;
    }

    if (!youtubeId) {
      setError('Could not extract YouTube video ID from the URL.');
      setLoading(false);
      return;
    }

    // Set the current YouTube ID and clear any previous errors
    setCurrentYouTubeId(youtubeId);
    setError('');
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [videoId, videoUrl, youtubeId]);

  // Force iframe reload when youtubeId changes
  useEffect(() => {
    if (iframeRef.current && youtubeId) {
      console.log('🔄 Reloading iframe with new YouTube ID:', youtubeId);
      // The iframe will automatically reload because the src prop changes
    }
  }, [youtubeId]);

  const handleInteraction = async (type, commentText = '') => {
    try {
      console.log('Interaction:', type, commentText);
    } catch (error) {
      console.error('Error sending interaction:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '50vh',
          backgroundColor: '#0f0f0f'
        }}>
          <CircularProgress sx={{ color: '#3ea6ff' }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
            Loading video...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'grey.400' }}>
            Video ID: {videoId} | YouTube ID: {youtubeId}
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<ArrowBack />} 
              onClick={() => router.back()}
              sx={{
                backgroundColor: '#3ea6ff',
                '&:hover': {
                  backgroundColor: '#2d95e6'
                }
              }}
            >
              Back to Courses
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ 
        backgroundColor: '#0f0f0f', 
        minHeight: '100vh', 
        color: 'white',
        py: 2
      }}>
        <Container maxWidth="xl">
          
          {/* Back Button */}
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => router.back()}
            sx={{ 
              mb: 3,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Back to Courses
          </Button>

          {/* Video Info */}
          {/* <Alert severity="info" sx={{ mb: 2 }}>
            Now Playing: {title} (ID: {videoId})
          </Alert> */}

          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
            
            {/* Main Content */}
            <Box sx={{ flex: { lg: 7 } }}>
              
              {/* Video Player */}
              <Card sx={{ 
                borderRadius: 3, 
                overflow: 'hidden', 
                backgroundColor: 'transparent',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                mb: 3
              }}>
                <Box sx={{ 
                  position: 'relative', 
                  backgroundColor: 'black',
                  borderRadius: '12px 12px 0 0'
                }}>
                  {youtubeId ? (
                    <Box sx={{
                      position: 'relative',
                      paddingBottom: '56.25%',
                      height: 0,
                      overflow: 'hidden'
                    }}>
                      <iframe
                        ref={iframeRef}
                        key={youtubeId} // This forces React to recreate the iframe when youtubeId changes
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={title}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      paddingBottom: '56.25%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      backgroundColor: 'grey.900'
                    }}>
                      <Typography variant="h6">Video not available</Typography>
                    </Box>
                  )}
                </Box>
                
                <CardContent sx={{ p: 4, backgroundColor: 'transparent' }}>
                  
                  {/* Video Title */}
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: '700',
                      color: 'white',
                      lineHeight: 1.3
                    }}
                  >
                    {title}
                  </Typography>
                  
                  {/* Video Stats */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    
                    
                    {/* Engagement Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleInteraction('like')}
                        sx={{ color: 'grey.400', flexDirection: 'column' }}
                      >
                        <ThumbUp />
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                          1.2K
                        </Typography>
                      </IconButton>
                      
                      <IconButton 
                        onClick={() => handleInteraction('dislike')}
                        sx={{ color: 'grey.400', flexDirection: 'column' }}
                      >
                        <ThumbDown />
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                          45
                        </Typography>
                      </IconButton>
                      
                      <IconButton 
                        onClick={() => handleInteraction('favorite')}
                        sx={{ color: 'grey.400', flexDirection: 'column' }}
                      >
                        <FavoriteBorder />
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                          Favorite
                        </Typography>
                      </IconButton>
                      
                      <IconButton 
                        onClick={() => handleInteraction('share')}
                        sx={{ color: 'grey.400', flexDirection: 'column' }}
                      >
                        <Share />
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                          Share
                        </Typography>
                      </IconButton>

                      <IconButton sx={{ color: 'grey.400' }}>
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ backgroundColor: 'grey.800', my: 3 }} />

                  {/* Channel Info */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 4
                  }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar 
                        src={channelInfo.avatar}
                        sx={{ width: 56, height: 56 }}
                      />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                            {channelInfo.name}
                          </Typography>
                          {channelInfo.isVerified && (
                            <Chip 
                              label="Verified" 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#3ea6ff',
                                color: 'white',
                                height: 20,
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                        </Box>
                      
                      </Box>
                    </Box>
                  </Box>

                  {/* Video Description */}
                  <Box sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    borderRadius: 2, 
                    p: 3
                  }}>
                    <Typography 
                      variant="body1" 
                      color="white"
                      sx={{ 
                        whiteSpace: 'pre-line',
                        lineHeight: 1.6
                      }}
                    >
                      {videoInfo.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card sx={{ 
                borderRadius: 3, 
                overflow: 'hidden', 
                backgroundColor: 'transparent',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
                <CardContent sx={{ p: 4, backgroundColor: 'transparent' }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'white', 
                      mb: 4 
                    }}
                  >
                    Comments
                  </Typography>
                  
                  <Typography 
                    color="grey.400" 
                    sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      fontStyle: 'italic'
                    }}
                  >
                    Comments feature coming soon!
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Suggested Videos Sidebar */}
            <Box sx={{ 
              flex: { lg: 3 },
              display: { xs: 'none', lg: 'block' }
            }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'white', 
                  mb: 3 
                }}
              >
                Suggested Videos
              </Typography>
              
              {[1, 2, 3].map(item => (
                <Box 
                  key={item} 
                  sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 3, 
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 168, 
                      height: 94, 
                      backgroundColor: 'grey.800', 
                      borderRadius: 2,
                      flexShrink: 0
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.3,
                        mb: 0.5
                      }}
                    >
                      Related Video {item}
                    </Typography>
                    <Typography variant="caption" color="grey.400" sx={{ display: 'block' }}>
                      Mayway Business
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default PlayerPage;