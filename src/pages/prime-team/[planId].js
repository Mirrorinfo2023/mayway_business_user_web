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
import api from '../../../utils/api';
import { DataEncrypt, DataDecrypt } from '../../../utils/encryption';

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
        mb: 1.5,
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
        border: '1px solid #FFD700',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-1px)',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, #FFEBCD 0%, #FFF8DC 100%)',
        }
      }}
      onClick={onLevelClick}
    >
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#8B4513' }}>
            Level {level}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Inactive Users */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'orange' }} />
              <Typography variant="body2" color="#8B4513" fontSize="0.8rem">
                {inactiveCount}
              </Typography>
            </Box>

            {/* Active Users */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'green' }} />
              <Typography variant="body2" color="#8B4513" fontSize="0.8rem">
                {activeCount}
              </Typography>
            </Box>

            {/* Total Users */}
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#8B4513', fontSize: '0.9rem' }}>
              Total: {getTotalDisplayCount()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Team Header Component
const TeamHeader = ({ title, activeUsers, inactiveUsers, showInactive = true }) => (
  <Card sx={{
    mb: 2,
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    border: '2px solid #FFD700'
  }}>
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B4513' }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {showInactive && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'orange' }} />
              <Typography variant="body2" sx={{ color: '#8B4513', fontWeight: 600, fontSize: '0.9rem' }}>
                Inactive: {inactiveUsers}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'green' }} />
            <Typography variant="body2" sx={{ color: '#8B4513', fontWeight: 600, fontSize: '0.9rem' }}>
              Active: {activeUsers}
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Data transformation function
const transformTeamData = (apiData) => {
  console.log("Transforming team data:", apiData);

  if (apiData.data && apiData.data.length > 0) {
    const teamData = apiData.data[0];
    return {
      data: [{
        totalMember: teamData.total_member || 0,
        totalActive: teamData.total_active || 0,
        totalInactive: teamData.total_inactive || 0,
        totalEarning: teamData.total_earning || 0,
        totalWithdrawal: teamData.total_withdrawal || 0,
        totalRepurchaseIncome: teamData.total_repurchase_income || 0,
      }],
      leveldata: apiData.leveldata || [],
    };
  }

  // Return empty data if no data
  return {
    data: [{
      totalMember: 0,
      totalActive: 0,
      totalInactive: 0,
      totalEarning: 0,
      totalWithdrawal: 0,
      totalRepurchaseIncome: 0,
    }],
    leveldata: [],
  };
};

const TeamService = {
  getTeamDetails: async (userId, planId) => {
    try {
      const payload = {
        user_id: userId,
        plan_id: planId
      };

      const encReq = DataEncrypt(JSON.stringify(payload));
      const response = await api.post('/api/refferal-report/2f01312cafbd54f54f71b56d3d03cbae1fc8cdf7', { encReq });

      const decryptedData = DataDecrypt(response.data);

      if (decryptedData.status === 200) {
        return transformTeamData(decryptedData);
      } else {
        throw new Error(decryptedData.message || 'Failed to fetch team details');
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw error;
    }
  },
};

// Main Prime Team Component
const PrimeTeamScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { planId } = router.query;

  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (planId) {
      console.log("Plan ID from router:", planId);
      loadTeamData();
    }
  }, [planId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = sessionStorage.getItem('id');
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      console.log("Fetching team data for user:", userId, "plan:", planId);
      const data = await TeamService.getTeamDetails(userId, planId);

      if (data) {
        setTeamData(data);
        console.log("Team data loaded successfully:", data);
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      setError(error.message);
      setTeamData({
        data: [{
          totalMember: 0,
          totalActive: 0,
          totalInactive: 0,
          totalEarning: 0,
          totalWithdrawal: 0
        }],
        leveldata: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadTeamData();
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"
        sx={{ background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)' }}
      >
        <CircularProgress sx={{ color: '#FFD700' }} />
        <Typography variant="h6" sx={{ ml: 2, color: '#8B4513', fontWeight: 600 }}>
          Loading Team Data...
        </Typography>
      </Box>
    );
  }

  const teamInfo = teamData?.data?.[0] || {};
  const levelData = teamData?.leveldata || [];

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
      minHeight: '100vh',
      py: 1
    }}>
      <Container sx={{ py: 1 }}>
        {/* Back Button and Retry */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="contained"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
              }
            }}
          >
            Back
          </Button>

          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            variant="contained"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#8B4513',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
              }
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="warning"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #FFEBCD 0%, #FFF8DC 100%)',
              color: '#8B4513',
              border: '1px solid #FFD700',
              py: 0.5
            }}
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                RETRY
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Team Header */}
        <TeamHeader
          title={getPlanTitle()}
          activeUsers={teamInfo.totalActive || '0'}
          inactiveUsers={teamInfo.totalInactive || '0'}
          showInactive={planId === '3' || planId === '0'}
        />

        {/* User Business Details Card */}
        <Card sx={{
          mb: 2,
          background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
          border: '1px solid #FFD700'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 45,
                  height: 45,
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#8B4513'
                }}
              >
                {(sessionStorage.getItem('first_name') || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#8B4513', mb: 0.5 }}>
                  {sessionStorage.getItem('first_name')} {sessionStorage.getItem('last_name')}
                </Typography>

                {/* First Row */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 0.5, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#8B4513', fontWeight: 500 }}>
                    <strong>ID:</strong> {sessionStorage.getItem('mlm_id')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8B4513' }}>
                    <strong>Team:</strong> {teamInfo.totalMember || '0'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8B4513' }}>
                    <strong>Active:</strong> {teamInfo.totalActive || '0'}
                  </Typography>
                  {(planId === '3' || planId === '0') && (
                    <Typography variant="caption" sx={{ color: '#8B4513' }}>
                      <strong>Inactive:</strong> {teamInfo.totalInactive || '0'}
                    </Typography>
                  )}
                </Box>

                {/* Second Row */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#8B4513' }}>
                    <strong>Earnings:</strong> ₹{teamInfo.totalEarning?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8B4513' }}>
                    <strong>Withdrawals:</strong> ₹{teamInfo.totalWithdrawal?.toLocaleString() || '0'}
                  </Typography>
                  {teamInfo.totalRepurchaseIncome > 0 && (
                    <Typography variant="caption" sx={{ color: '#8B4513' }}>
                      <strong>Repurchase:</strong> ₹{teamInfo.totalRepurchaseIncome?.toLocaleString() || '0'}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Level-wise Team Breakdown */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: '#8B4513' }}>
            Team Levels
          </Typography>

          {levelData.length === 0 ? (
            <Card sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
              border: '1px solid #FFD700'
            }}>
              <Typography variant="body2" color="#8B4513">
                No team levels data available
              </Typography>
            </Card>
          ) : (
            levelData
              .filter(level => level.total_active > 0 || level.total_inactive > 0)
              .map((level, index) => (
                <TeamLevelCard
                  key={index}
                  level={level.level}
                  activeCount={level.total_active || 0}
                  inactiveCount={level.total_inactive || 0}
                  totalCount={level.levelcount || level.total_active || 0}
                  planId={planId}
                  onLevelClick={() => handleLevelClick(level.level)}
                />
              ))
          )}
        </Box>

        {/* Compact Team Stats */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
            border: '1px solid #FFD700',
            borderRadius: 2,
            boxShadow: 2,
            width: '100%',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontWeight: 600,
                color: '#8B4513',
                textAlign: 'center',
              }}
            >
              Team Summary
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              {/* Total Members */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: { xs: '45%', sm: '22%' },
                  textAlign: 'center',
                  p: 1,
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  borderRadius: 1,
                  height: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupsIcon sx={{ fontSize: 20, color: '#8B4513', mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: '#8B4513', fontWeight: 600, lineHeight: 1.1 }}>
                  {teamInfo.totalMember?.toLocaleString() || '0'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8B4513' }}>
                  Total
                </Typography>
              </Box>

              {/* Active Members */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: { xs: '45%', sm: '22%' },
                  textAlign: 'center',
                  p: 1,
                  background: 'linear-gradient(135deg, #90EE90 0%, #32CD32 100%)',
                  borderRadius: 1,
                  height: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupsIcon sx={{ fontSize: 20, color: '#8B4513', mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: '#8B4513', fontWeight: 600, lineHeight: 1.1 }}>
                  {teamInfo.totalActive?.toLocaleString() || '0'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8B4513' }}>
                  Active
                </Typography>
              </Box>

              {/* Inactive Members */}
              {(planId === '3' || planId === '0') && (
                <Box
                  sx={{
                    flex: 1,
                    minWidth: { xs: '45%', sm: '22%' },
                    textAlign: 'center',
                    p: 1,
                    background: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
                    borderRadius: 1,
                    height: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GroupsIcon sx={{ fontSize: 20, color: '#8B4513', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ color: '#8B4513', fontWeight: 600, lineHeight: 1.1 }}>
                    {teamInfo.totalInactive?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8B4513' }}>
                    Inactive
                  </Typography>
                </Box>
              )}

              {/* Levels */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: { xs: '45%', sm: '22%' },
                  textAlign: 'center',
                  p: 1,
                  background: 'linear-gradient(135deg, #87CEEB 0%, #1E90FF 100%)',
                  borderRadius: 1,
                  height: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupsIcon sx={{ fontSize: 20, color: '#8B4513', mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: '#8B4513', fontWeight: 600, lineHeight: 1.1 }}>
                  {levelData.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8B4513' }}>
                  Levels
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

      </Container>
    </Box>
  );
};

export default PrimeTeamScreen;