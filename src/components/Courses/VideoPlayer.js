'use client';
import { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import {
  ArrowBack,
  ThumbUp,
  ThumbDown,
  Favorite,
  FavoriteBorder,
  Share
} from '@mui/icons-material';
import Layout from '@/components/Dashboard/layout';

const PlayerPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const videoId = searchParams.get('id');
  const title = decodeURIComponent(searchParams.get('title') || 'No Title');
  const videoUrl = decodeURIComponent(searchParams.get('videoUrl') || '');
  
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoDetails, setVideoDetails] = useState(null);
  const [error, setError] = useState('');

  const API_BASE = 'https://api.mayway.in/api';
  const user = { id: 1 };

  useEffect(() => {
    if (videoId) {
      console.log('Video ID from URL:', videoId);
      console.log('Video URL from URL:', videoUrl);
      console.log('Title from URL:', title);
      
      // For now, we'll skip API calls and focus on YouTube player
      setLoading(false);
    } else {
      setError('Video ID not found in URL');
      setLoading(false);
    }
  }, [videoId, videoUrl, title]);

  const extractYouTubeId = (url) => {
    if (!url) {
      console.log('No URL provided');
      return null;
    }
    
    console.log('Extracting YouTube ID from:', url);
    
    // Multiple patterns to extract YouTube ID
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
      /youtu\.be\/([^"&?\/\s]{11})/,
      /youtube\.com\/embed\/([^"&?\/\s]{11})/,
      /youtube\.com\/v\/([^"&?\/\s]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log('YouTube ID found:', match[1]);
        return match[1];
      }
    }

    console.log('No YouTube ID found in URL');
    return null;
  };

  const handleInteraction = async (type, commentText = '') => {
    try {
      const response = await fetch(`${API_BASE}/courses_video/video-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: parseInt(videoId),
          user_id: user.id,
          type: type,
          comment_text: commentText
        })
      });

      if (response.ok) {
        if (type === 'comment') {
          setNewComment('');
        }
      }
    } catch (error) {
      console.error('Error sending interaction:', error);
    }
  };

  const handleLike = () => {
    const type = isLiked ? 'unlike_like' : 'like';
    handleInteraction(type);
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    if (isDisliked) {
      setIsDisliked(false);
      setDislikes(prev => prev - 1);
    }
  };

  const handleDislike = () => {
    const type = isDisliked ? 'unlike_dislike' : 'dislike';
    handleInteraction(type);
    setIsDisliked(!isDisliked);
    setDislikes(prev => isDisliked ? prev - 1 : prev + 1);
    
    if (isLiked) {
      setIsLiked(false);
      setLikes(prev => prev - 1);
    }
  };

  const handleFavorite = () => {
    const type = isFavorited ? 'unfavorite' : 'favorite';
    handleInteraction(type);
    setIsFavorited(!isFavorited);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      handleInteraction('comment', newComment);
      setComments(prev => [...prev, {
        id: Date.now(),
        text: newComment,
        user: 'You',
        timestamp: new Date().toISOString()
      }]);
      setNewComment('');
    }
  };

  // Extract YouTube ID
  const youtubeId = extractYouTubeId(videoUrl);
  const isYouTube = !!youtubeId;

  console.log('Final YouTube ID:', youtubeId);
  console.log('Is YouTube video:', isYouTube);

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading video...
            </Typography>
          </Box>
        </Container>
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
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Video ID: {videoId}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<ArrowBack />} 
              onClick={() => router.back()}
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
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Back Button */}
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back to Courses
        </Button>

        {/* Debug Info - Remove in production */}
        <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Debug Info: Video ID: {videoId} | YouTube ID: {youtubeId} | URL: {videoUrl?.substring(0, 80)}...
          </Typography>
        </Box>

        {/* Video Player Section */}
        <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', backgroundColor: 'black' }}>
            {isYouTube && youtubeId ? (
              // YouTube Player
              <Box
                sx={{
                  position: 'relative',
                  paddingBottom: '56.25%', // 16:9 aspect ratio
                  height: 0,
                  overflow: 'hidden'
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
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
                  frameBorder="0"
                />
              </Box>
            ) : videoUrl ? (
              // Direct Video Player (for non-YouTube videos)
              <Box
                sx={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0
                }}
              >
                <video
                  controls
                  autoPlay
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                  src={videoUrl}
                  title={title}
                >
                  Your browser does not support the video tag.
                </video>
              </Box>
            ) : (
              // No video available
              <Box sx={{ 
                paddingBottom: '56.25%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                backgroundColor: 'grey.800'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Video Not Available
                  </Typography>
                  <Typography variant="body2">
                    The video URL is missing or invalid
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip 
                label={isYouTube ? "YouTube Video" : "Direct Video"} 
                color="primary" 
                size="small" 
              />
              <Typography variant="body2" color="text.secondary">
                Mayway Business
              </Typography>
            </Box>
            
            {/* Engagement Buttons */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={handleLike} 
                  color={isLiked ? 'primary' : 'default'}
                >
                  <ThumbUp />
                </IconButton>
                <Typography variant="body1" fontWeight="bold">{likes}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={handleDislike} 
                  color={isDisliked ? 'error' : 'default'}
                >
                  <ThumbDown />
                </IconButton>
                <Typography variant="body1" fontWeight="bold">{dislikes}</Typography>
              </Box>

              <IconButton 
                onClick={handleFavorite} 
                color={isFavorited ? 'error' : 'default'}
              >
                {isFavorited ? <Favorite /> : <FavoriteBorder />}
              </IconButton>

              <IconButton>
                <Share />
              </IconButton>
            </Box>

            {/* Video Description */}
            {videoDetails?.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {videoDetails.description}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Comments ({comments.length})
            </Typography>
            
            {/* Add Comment */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleComment();
                  }
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleComment}
                disabled={!newComment.trim()}
              >
                Post
              </Button>
            </Box>
            
            {/* Comments List */}
            {comments.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No comments yet. Be the first to comment!
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {comments.map(comment => (
                  <Box 
                    key={comment.id} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      backgroundColor: 'grey.50', 
                      borderRadius: 2 
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {comment.user}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {comment.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default PlayerPage;