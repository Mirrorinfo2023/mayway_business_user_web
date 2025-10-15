'use client';
import { useState, useEffect } from 'react';
import {
  AppBar,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import {
  VideoCall,
  LiveTv,
  OndemandVideo,
  Person,
  AccessTime,
  PlayCircle,
  Schedule,
  CheckCircle,
  Link as LinkIcon
} from '@mui/icons-material';

const helpVideos = [
  {
    title: "How to Join a Meeting",
    url: "https://www.youtube.com/watch?v=fq4N0hgOWzU",
    thumbnail: "/assets/app-logo.png"
  },
  {
    title: "Troubleshoot Mic Issues", 
    url: "https://www.youtube.com/watch?v=Ej_Pcr4uC2Q",
    thumbnail: "/assets/app-logo.png"
  }
];

const MeetingScreen = () => {
  const [tabValue, setTabValue] = useState(0);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://api.mayway.in/api/meeting/get-upcoming-list');
      
      if (!response.ok) {
        throw new Error(`Failed to load meetings: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.data) {
        setMeetings(data.data);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      setError('Failed to fetch meetings. Please try again.');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingStatus = (meetingDate) => {
    if (!meetingDate) return 'completed';
    
    const now = new Date();
    const meetingTime = new Date(meetingDate);
    const endTime = new Date(meetingTime.getTime() + 60 * 60 * 1000);

    if (now >= meetingTime && now <= endTime) return 'ongoing';
    if (now < meetingTime) return 'upcoming';
    return 'completed';
  };

  const getStatusConfig = (status) => {
    const config = {
      ongoing: { 
        color: 'success', 
        icon: <PlayCircle sx={{ fontSize: 16 }} />, 
        label: 'Ongoing',
        gradient: ['#4CAF50', '#81C784']
      },
      upcoming: { 
        color: 'warning', 
        icon: <Schedule sx={{ fontSize: 16 }} />, 
        label: 'Upcoming',
        gradient: ['#FF9800', '#FFB74D']
      },
      completed: { 
        color: 'default', 
        icon: <CheckCircle sx={{ fontSize: 16 }} />, 
        label: 'Completed',
        gradient: ['#757575', '#9E9E9E']
      }
    };
    return config[status] || config.completed;
  };

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    } else {
      setSnackbar({ open: true, message: 'No meeting link available' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderMeetingCard = (meeting) => {
    const status = getMeetingStatus(meeting.meeting_date);
    const statusConfig = getStatusConfig(status);

    return (
      <Grid item xs={12} md={6} lg={4} key={meeting.id}>
        <Card 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }
          }}
        >
          {/* Header with status-based background */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${statusConfig.gradient[0]}, ${statusConfig.gradient[1]})`,
              color: 'white',
              p: 3,
              flexShrink: 0
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`ID: ${meeting.id || 'N/A'}`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.3)', 
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              />
              <Box sx={{ flexGrow: 1 }} />
              <Chip
                icon={statusConfig.icon}
                label={statusConfig.label}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.3)', 
                  color: 'white',
                  fontWeight: 'bold',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            </Box>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {meeting.name || 'Unnamed Meeting'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ fontSize: 18, mr: 1, opacity: 0.9 }} />
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Host: {meeting.created_by || 'Unknown Host'}
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Description */}
            {meeting.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, flexGrow: 1 }}>
                {meeting.description}
              </Typography>
            )}

            {/* Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <AccessTime sx={{ fontSize: 24, mr: 2, color: 'primary.main', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight="medium" color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  {formatDate(meeting.meeting_date)}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {(status === 'ongoing' || status === 'upcoming') && (
                <Button
                  variant="contained"
                  startIcon={<VideoCall />}
                  onClick={() => handleJoinMeeting(meeting.meeting_link)}
                  size="large"
                  sx={{
                    backgroundColor: `${statusConfig.color}.main`,
                    '&:hover': {
                      backgroundColor: `${statusConfig.color}.dark`
                    },
                    flex: { xs: '1 1 100%', sm: 1 },
                    py: 1.5,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    minWidth: '140px'
                  }}
                >
                  Join Meeting
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => handleJoinMeeting(meeting.meeting_link)}
                size="large"
                sx={{ 
                  py: 1.5,
                  minWidth: '120px',
                  flex: { xs: '1 1 100%', sm: '0 1 auto' }
                }}
              >
                Link
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderMeetingsTab = () => {
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
            Loading meetings...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh',
          width: '100%',
          p: 3
        }}>
          <Alert 
            severity="error"
            sx={{ 
              mb: 3, 
              maxWidth: 500,
              width: '100%',
              '& .MuiAlert-message': { fontSize: '1.1rem' }
            }}
            action={
              <Button color="inherit" size="large" onClick={fetchMeetings}>
                Retry
              </Button>
            }
          >
            <Typography variant="h6">{error}</Typography>
          </Alert>
        </Box>
      );
    }

    if (meetings.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          width: '100%',
          p: 3
        }}>
          <VideoCall sx={{ fontSize: { xs: 80, sm: 100, md: 120 }, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
          <Typography variant="h4" color="text.secondary" gutterBottom sx={{ 
            fontWeight: 'bold', 
            mb: 2,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
          }}>
            No upcoming meetings
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ 
            mb: 4, 
            maxWidth: 400,
            fontSize: { xs: '1rem', sm: '1.1rem' }
          }}>
            You don't have any scheduled meetings at the moment. Check back later for updates.
          </Typography>
          <Button variant="outlined" size="large" onClick={fetchMeetings} sx={{ px: 4, py: 1.5 }}>
            Refresh
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3} sx={{ py: 3 }}>
        {meetings.map(renderMeetingCard)}
      </Grid>
    );
  };

  const renderLiveStreamTab = () => (
    <Box sx={{ 
      textAlign: 'center', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      width: '100%',
      p: 3
    }}>
      <LiveTv sx={{ fontSize: { xs: 80, sm: 100, md: 120 }, color: 'error.main', mb: 3 }} />
      <Typography variant="h3" gutterBottom sx={{ 
        fontWeight: 'bold', 
        mb: 2,
        fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
      }}>
        Live Stream
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ 
        mb: 4, 
        maxWidth: 500,
        fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
      }}>
        Live streaming features will be available soon. Stay tuned for exciting live sessions!
      </Typography>
      <Button 
        variant="contained" 
        color="error" 
        size="large"
        startIcon={<PlayCircle />}
        onClick={() => window.open('https://youtube.com/live/YOUR_STREAM_ID', '_blank')}
        sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
      >
        Watch Demo Stream
      </Button>
    </Box>
  );

  const renderHelpVideosTab = () => (
    <Grid container spacing={3} sx={{ py: 3 }}>
      {helpVideos.map((video, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}
            onClick={() => window.open(video.url, '_blank')}
          >
            <CardContent sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Box
                sx={{
                  width: { xs: '100%', sm: 120 },
                  height: { xs: 160, sm: 90 },
                  borderRadius: 2,
                  backgroundColor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: { xs: 0, sm: 3 },
                  mb: { xs: 2, sm: 0 },
                  flexShrink: 0
                }}
              >
                <OndemandVideo sx={{ fontSize: 40, color: 'grey.500' }} />
              </Box>
              <Box sx={{ flexGrow: 1, mb: { xs: 2, sm: 0 } }}>
                <Typography variant="h5" fontWeight="medium" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                  {video.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Click to watch this helpful tutorial
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                endIcon={<PlayCircle />}
                sx={{ 
                  minWidth: '140px', 
                  py: 1.5,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Watch Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      width: '100%'
    }}>
      <Box sx={{ 
        width: '100%',
        px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
        py: 4
      }}>
        {/* Header */}
        <Box sx={{ 
          py: 4, 
          textAlign: 'center',
          width: '100%'
        }}>
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
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Meetings & Live Stream
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
            Manage your meetings and access live streaming content
          </Typography>
        </Box>

        {/* Tabs */}
        <AppBar 
          position="static" 
          sx={{ 
            backgroundColor: 'white',
            color: 'text.primary',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            mb: 4,
            width: '100%'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(event, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.875rem', sm: '1.1rem' },
                fontWeight: 'bold',
                py: { xs: 2, sm: 2.5 },
                minHeight: { xs: '60px', sm: '70px' },
                minWidth: { xs: '100px', sm: '160px' }
              },
              '& .Mui-selected': {
                color: 'primary.main'
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '2px 2px 0 0'
              }
            }}
          >
            <Tab icon={<VideoCall sx={{ fontSize: { xs: 20, sm: 28 } }} />} iconPosition="start" label="Meetings" />
            <Tab icon={<LiveTv sx={{ fontSize: { xs: 20, sm: 28 } }} />} iconPosition="start" label="Live Stream" />
            <Tab icon={<OndemandVideo sx={{ fontSize: { xs: 20, sm: 28 } }} />} iconPosition="start" label="Help Videos" />
          </Tabs>
        </AppBar>

        {/* Content */}
        <Box sx={{ minHeight: '60vh', width: '100%' }}>
          {tabValue === 0 && renderMeetingsTab()}
          {tabValue === 1 && renderLiveStreamTab()}
          {tabValue === 2 && renderHelpVideosTab()}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            fontSize: '1rem'
          }
        }}
      />
    </Box>
  );
};

export default MeetingScreen;