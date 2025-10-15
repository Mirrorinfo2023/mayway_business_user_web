import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Button,
  Paper,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Groups as GroupsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

// API Service
const API_CONFIG = {
  BASE_URL: 'https://your-api-domain.com/api',
  ENDPOINTS: {
    TEAM_DETAILS: 'refferal-report/2f01312cafbd54f54f71b56d3d03cbae1fc8cdf7',
    TEAM_LEVEL_DETAILS: 'refferal-report/65e1bce665c5b66ff4076e963488b62999b44c16'
  }
};

// Static fallback data
const STATIC_FALLBACK_DATA = {
  '0': { // My Team
    data: [{
      totalMember: 150,
      totalActive: 120,
      totalInactive: 30,
      totalEarning: 12500,
      totalWithdrawal: 8500
    }],
    leveldata: [
      { level: 1, totalActive: 5, totalInactive: 2, levelcount: 7 },
      { level: 2, totalActive: 15, totalInactive: 5, levelcount: 20 },
      { level: 3, totalActive: 35, totalInactive: 8, levelcount: 43 },
      { level: 4, totalActive: 45, totalInactive: 10, levelcount: 55 },
      { level: 5, totalActive: 20, totalInactive: 5, levelcount: 25 }
    ]
  },
  '1': { // Hybrid Team
    data: [{
      totalMember: 85,
      totalActive: 65,
      totalInactive: 20,
      totalEarning: 8200,
      totalWithdrawal: 6000
    }],
    leveldata: [
      { level: 1, totalActive: 3, totalInactive: 1, levelcount: 4 },
      { level: 2, totalActive: 12, totalInactive: 3, levelcount: 15 },
      { level: 3, totalActive: 25, totalInactive: 6, levelcount: 31 },
      { level: 4, totalActive: 20, totalInactive: 8, levelcount: 28 },
      { level: 5, totalActive: 5, totalInactive: 2, levelcount: 7 }
    ]
  },
  '2': { // Booster Team
    data: [{
      totalMember: 45,
      totalActive: 35,
      totalInactive: 10,
      totalEarning: 5200,
      totalWithdrawal: 3500
    }],
    leveldata: [
      { level: 1, totalActive: 2, totalInactive: 0, levelcount: 2 },
      { level: 2, totalActive: 8, totalInactive: 2, levelcount: 10 },
      { level: 3, totalActive: 15, totalInactive: 4, levelcount: 19 },
      { level: 4, totalActive: 8, totalInactive: 3, levelcount: 11 },
      { level: 5, totalActive: 2, totalInactive: 1, levelcount: 3 }
    ]
  },
  '3': { // Prime A Team
    data: [{
      totalMember: 200,
      totalActive: 160,
      totalInactive: 40,
      totalEarning: 18500,
      totalWithdrawal: 12000
    }],
    leveldata: [
      { level: 1, totalActive: 8, totalInactive: 3, levelcount: 11 },
      { level: 2, totalActive: 25, totalInactive: 7, levelcount: 32 },
      { level: 3, totalActive: 55, totalInactive: 12, levelcount: 67 },
      { level: 4, totalActive: 52, totalInactive: 13, levelcount: 65 },
      { level: 5, totalActive: 20, totalInactive: 5, levelcount: 25 }
    ]
  },
  '4': { // Active Team
    data: [{
      totalMember: 75,
      totalActive: 60,
      totalInactive: 15,
      totalEarning: 6800,
      totalWithdrawal: 4500
    }],
    leveldata: [
      { level: 1, totalActive: 4, totalInactive: 1, levelcount: 5 },
      { level: 2, totalActive: 10, totalInactive: 2, levelcount: 12 },
      { level: 3, totalActive: 22, totalInactive: 5, levelcount: 27 },
      { level: 4, totalActive: 18, totalInactive: 6, levelcount: 24 },
      { level: 5, totalActive: 6, totalInactive: 1, levelcount: 7 }
    ]
  }
};

const TeamService = {
  getTeamDetails: async (userId, planId) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINTS.TEAM_DETAILS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          user_id: userId, 
          plan_id: planId 
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch team details');
      
      const data = await response.json();
      return data.status === 200 ? data.data || data : null;
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw error; // Re-throw to handle in component
    }
  },

  getLevelTeamDetails: async (userId, level, primeId, page = 1) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINTS.TEAM_LEVEL_DETAILS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: userId,
          teamType: primeId,
          level: level,
          plan_id: primeId,
          page: page
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch level team details');
      
      const data = await response.json();
      return data.status === 200 ? data.data || data : [];
    } catch (error) {
      console.error('Error fetching level team details:', error);
      return [];
    }
  }
};

// Team Level Card Component
const TeamLevelCard = ({ level, activeCount, inactiveCount, totalCount, onLevelClick, planId }) => {
  const getTotalDisplayCount = () => {
    if (planId === '3' || planId === '0') {
      return totalCount; // levelcount for Prime A
    }
    return activeCount; // totalActive for other teams
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': { 
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }
      }}
      onClick={onLevelClick}
    >
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Level {level}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {/* Inactive Users */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'orange' }} />
              <Typography variant="body2" color="text.secondary">
                {inactiveCount}
              </Typography>
            </Box>
            
            {/* Active Users */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'green' }} />
              <Typography variant="body2" color="text.secondary">
                {activeCount}
              </Typography>
            </Box>
            
            {/* Total Users */}
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Total: {getTotalDisplayCount()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Team Header Component
const TeamHeader = ({ title, activeUsers, inactiveUsers, showInactive = true, isUsingFallback = false }) => (
  <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
            {title}
          </Typography>
          {isUsingFallback && (
            <Chip 
              label="Demo Data" 
              size="small" 
              sx={{ 
                mt: 1, 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {showInactive && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'orange' }} />
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                Inactive: {inactiveUsers}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'green' }} />
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
              Active: {activeUsers}
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Main Prime Team Component
const PrimeTeamScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { planId } = router.query;
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (planId) {
      loadTeamData();
      console.log('Plan ID:', planId);
    }
  }, [planId]);

  const loadTeamData = async (useFallback = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useFallback) {
        // Use static fallback data
        const fallbackData = STATIC_FALLBACK_DATA[planId] || STATIC_FALLBACK_DATA['0'];
        setTeamData(fallbackData);
        setUsingFallback(true);
        return;
      }

      const userId = 'user123'; // Replace with actual user ID
      const data = await TeamService.getTeamDetails(userId, planId);
      
      if (data) {
        setTeamData(data);
        setUsingFallback(false);
      } else {
        // If API returns null, use fallback
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      setError(error.message);
      
      // Automatically fall back to static data
      const fallbackData = STATIC_FALLBACK_DATA[planId] || STATIC_FALLBACK_DATA['0'];
      setTeamData(fallbackData);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadTeamData(false); // Try API again
  };

  const getPlanTitle = () => {
    switch (planId) {
      case '0': return 'My Team';
      case '1': return 'Hybrid Team';
      case '2': return 'Booster Team';
      case '3': return 'Prime A Team';
      case '4': return 'Active Team';
      default: return 'Team Details';
    }
  };

  const handleLevelClick = (level) => {
    router.push(`/team-level/${planId}/${level}`);
  };

  const handleBack = () => {
    router.push('/business');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const teamInfo = teamData?.data?.[0] || {};
  const levelData = teamData?.leveldata || [];

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Back Button and Retry */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="outlined"
          >
            Back to Dashboard
          </Button>
          
          {usingFallback && (
            <Button 
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              variant="contained"
              color="primary"
            >
              Retry API
            </Button>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                RETRY
              </Button>
            }
          >
            {error}. Showing demo data instead.
          </Alert>
        )}

        {/* Team Header */}
        <TeamHeader
          title={getPlanTitle()}
          activeUsers={teamInfo.totalActive || '0'}
          inactiveUsers={teamInfo.totalInactive || '0'}
          showInactive={planId === '3' || planId === '0'}
          isUsingFallback={usingFallback}
        />

        {/* User Business Details Card */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                U
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  User Business Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Team: {teamInfo.totalMember || '0'} | Active: {teamInfo.totalActive || '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Earnings: ₹{teamInfo.totalEarning || '0'} | Withdrawals: ₹{teamInfo.totalWithdrawal || '0'}
                </Typography>
                {usingFallback && (
                  <Typography variant="caption" color="warning.main" sx={{ fontStyle: 'italic' }}>
                    * Displaying sample data for demonstration
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Level-wise Team Breakdown */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
            Team Levels
          </Typography>
          
          {levelData.length === 0 ? (
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No team levels data available
              </Typography>
            </Card>
          ) : (
            levelData.map((level, index) => (
              <TeamLevelCard
                key={index}
                level={level.level}
                activeCount={level.totalActive || 0}
                inactiveCount={level.totalInactive || 0}
                totalCount={level.levelcount || level.totalActive || 0}
                planId={planId}
                onLevelClick={() => handleLevelClick(level.level)}
              />
            ))
          )}
        </Box>

        {/* Additional Team Stats */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Team Statistics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                <GroupsIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {teamInfo.totalMember || '0'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Total Members
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <GroupsIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {teamInfo.totalActive || '0'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Active Members
                </Typography>
              </Box>
              
              {(planId === '3' || planId === '0') && (
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                  <GroupsIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    {teamInfo.totalInactive || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Inactive Members
                  </Typography>
                </Box>
              )}
            </Box>
            
            {usingFallback && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Note: This is demonstration data. Real data will load when API is available.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PrimeTeamScreen;