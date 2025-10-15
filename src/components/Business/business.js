import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  Chip,
  Avatar,
  Stack,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccountBalanceWallet as WalletIcon,
  EmojiEvents as RewardsIcon,
  Share as ShareIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Groups as GroupsIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import api from '../../../utils/api'; // Your API utility
import { DataEncrypt, DataDecrypt } from '../../../utils/encryption'; // Your encryption utility

// API Configuration
const API_CONFIG = {
  ENDPOINTS: {
    TEAM_DETAILS: 'refferal-report/2f01312cafbd54f54f71b56d3d03cbae1fc8cdf7',
    COMPANY_PORTFOLIO: 'refferal-report/92ba6b72c22a4434a2c259c84a956435fa6fb21a',
    TEAM_LEVEL_DETAILS: 'refferal-report/65e1bce665c5b66ff4076e963488b62999b44c16',
    USER_PROFILE: 'users/profile' // Add your profile endpoint
  }
};

// API Service
const BusinessService = {
  getTeamDetails: async (userId, planId = '3') => {
    try {
      const payload = { 
        user_id: userId, 
        plan_id: planId 
      };
      const encReq = DataEncrypt(JSON.stringify(payload));
      
      const response = await api.post(API_CONFIG.ENDPOINTS.TEAM_DETAILS, { encReq });
      const decryptedData = DataDecrypt(response.data);
      
      if (decryptedData.status === 200) {
        return this.transformTeamData(decryptedData.data);
      } else {
        throw new Error(decryptedData.message || 'Failed to fetch team details');
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw error;
    }
  },

  getCompanyDetails: async (userId) => {
    try {
      const payload = { user_id: userId };
      const encReq = DataEncrypt(JSON.stringify(payload));
      
      const response = await api.post(API_CONFIG.ENDPOINTS.COMPANY_PORTFOLIO, { encReq });
      const decryptedData = DataDecrypt(response.data);
      
      if (decryptedData.status === 200) {
        return this.transformCompanyData(decryptedData.data);
      } else {
        throw new Error(decryptedData.message || 'Failed to fetch company details');
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  },

  getUserProfile: async (userId) => {
    try {
      const payload = { user_id: userId };
      const encReq = DataEncrypt(JSON.stringify(payload));
      
      const response = await api.post(API_CONFIG.ENDPOINTS.USER_PROFILE, { encReq });
      const decryptedData = DataDecrypt(response.data);
      
      if (decryptedData.status === 200) {
        return decryptedData.data;
      } else {
        throw new Error(decryptedData.message || 'Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  getLevelTeamDetails: async (userId, level, primeId, page = 1) => {
    try {
      const payload = {
        user_id: userId,
        teamType: primeId,
        level: level,
        plan_id: primeId,
        page: page
      };
      const encReq = DataEncrypt(JSON.stringify(payload));
      
      const response = await api.post(API_CONFIG.ENDPOINTS.TEAM_LEVEL_DETAILS, { encReq });
      const decryptedData = DataDecrypt(response.data);
      
      if (decryptedData.status === 200) {
        return decryptedData.data;
      } else {
        throw new Error(decryptedData.message || 'Failed to fetch level team details');
      }
    } catch (error) {
      console.error('Error fetching level team details:', error);
      throw error;
    }
  },

  // Data transformation
  transformTeamData: (apiData) => {
    if (apiData && apiData.length > 0) {
      const teamData = apiData[0];
      return {
        data: [{
          totalEarning: teamData.totalEarning || 0,
          totalWithdrawal: teamData.totalWithdrawal || 0,
          totalMember: teamData.totalMember || 0,
          primeB: teamData.primeB || 0,
          booster: teamData.booster || 0,
          hybrid: teamData.hybrid || 0,
          totalRepurchaseIncome: teamData.totalRepurchaseIncome || 0,
          silver: teamData.silver || 0,
          mobileFund: teamData.mobileFund || 0,
          carFund: teamData.carFund || 0,
          gold: teamData.gold || 0,
          houseFund: teamData.houseFund || 0,
          platinum: teamData.platinum || 0,
          travelFund: teamData.travelFund || 0,
          diamond: teamData.diamond || 0,
          comunityFund: teamData.comunityFund || 0,
          doubleDiamond: teamData.doubleDiamond || 0,
          ambassador: teamData.ambassador || 0,
          totalActive: teamData.totalActive || 0,
          totalInactive: teamData.totalInactive || 0
        }],
        leveldata: teamData.leveldata || [
          { level: 1, levelcount: 0, totalActive: 0, totalInactive: 0 },
          { level: 2, levelcount: 0, totalActive: 0, totalInactive: 0 },
          { level: 3, levelcount: 0, totalActive: 0, totalInactive: 0 }
        ]
      };
    }
    return this.getFallbackTeamData();
  },

  transformCompanyData: (apiData) => {
    return {
      todayBussiness: apiData.todayBussiness || [{
        primeA: 0,
        primeB: 0,
        booster: 0,
        hybrid: 0
      }],
      silver: apiData.silver || 0,
      mobilefund: apiData.mobilefund || 0,
      carFund: apiData.carFund || 0,
      gold: apiData.gold || 0,
      houseFund: apiData.houseFund || 0,
      platinum: apiData.platinum || 0,
      travelFund: apiData.travelFund || 0,
      diamond: apiData.diamond || 0,
      comunityFund: apiData.comunityFund || 0,
      doubleDiamond: apiData.doubleDiamond || 0,
      ambassador: apiData.ambassador || 0
    };
  },

  // Fallback data
  getFallbackTeamData: () => {
    return {
      data: [{
        totalEarning: 0,
        totalWithdrawal: 0,
        totalMember: 0,
        primeB: 0,
        booster: 0,
        hybrid: 0,
        totalRepurchaseIncome: 0,
        silver: 0,
        mobileFund: 0,
        carFund: 0,
        gold: 0,
        houseFund: 0,
        platinum: 0,
        travelFund: 0,
        diamond: 0,
        comunityFund: 0,
        doubleDiamond: 0,
        ambassador: 0,
        totalActive: 0,
        totalInactive: 0
      }],
      leveldata: [
        { level: 1, levelcount: 0, totalActive: 0, totalInactive: 0 },
        { level: 2, levelcount: 0, totalActive: 0, totalInactive: 0 },
        { level: 3, levelcount: 0, totalActive: 0, totalInactive: 0 }
      ]
    };
  }
};

// Coming Soon Dialog Component
const ComingSoonDialog = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          textAlign: 'center',
          p: 2,
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          border: '2px solid #FFD700'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: '1.5rem', 
        fontWeight: 700,
        color: '#8B4513',
        pb: 1
      }}>
        Coming Soon
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="#8B4513" sx={{ fontWeight: 500 }}>
          This feature is under development and will be available soon!
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          variant="contained" 
          onClick={onClose}
          sx={{ 
            minWidth: 120,
            background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
            }
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color, onClick, isClickable = false }) => (
  <Card 
    sx={{ 
      textAlign: 'center', 
      p: 2, 
      boxShadow: 3,
      borderLeft: `4px solid ${color}`,
      cursor: isClickable ? 'pointer' : 'default',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
      border: '1px solid #FFD700',
      height: '100%',
      '&:hover': isClickable ? {
        boxShadow: 6,
        transform: 'translateY(-3px)',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #FFEBCD 0%, #FFF8DC 100%)',
      } : {}
    }}
    onClick={isClickable ? onClick : undefined}
  >
    {React.cloneElement(icon, { 
      sx: { fontSize: 35, mb: 0.5, color: color } 
    })}
    <Typography variant="h6" sx={{ fontWeight: 700, color: color, fontSize: '1.1rem' }}>
      {value}
    </Typography>
    <Typography variant="body2" color="#8B4513" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
      {title}
    </Typography>
  </Card>
);

// Main Business Dashboard Component
const BusinessDashboardScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [userProfile, setUserProfile] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comingSoonDialogOpen, setComingSoonDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [userId, setUserId] = useState(null);

  // Golden Yellow Theme Colors
  const goldenTheme = {
    primary: '#FFD700',
    secondary: '#FFA500',
    darkGold: '#8B4513',
    lightGold: '#FFF8DC',
    cream: '#FFEBCD',
    brown: '#A0522D'
  };

  const tabLabels = ['All', 'Earning', 'Team', 'Salary'];

  useEffect(() => {
    // Get user ID from localStorage or authentication context
    const storedUserId = localStorage.getItem('userId') || 'user123'; // Replace with actual user ID source
    setUserId(storedUserId);
    loadDashboardData(storedUserId);
  }, []);

  useEffect(() => {
    if (userId && userProfile) {
      loadTeamData(userId);
    }
  }, [activeTab, userId, userProfile]);

  const loadDashboardData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile first
      const userData = await BusinessService.getUserProfile(userId);
      setUserProfile(userData);

      // Then load team and company data in parallel
      const [teamResponse, companyResponse] = await Promise.all([
        BusinessService.getTeamDetails(userId),
        BusinessService.getCompanyDetails(userId)
      ]);

      setTeamData(teamResponse);
      setCompanyData(companyResponse);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set fallback data
      setUserProfile({
        name: "User Name",
        mlm_id: "MR000000",
        mobile: "0000000000",
        joining_date: new Date().toLocaleDateString('en-IN'),
        totalEarning: "0.00",
        totalWithdrawal: "0.00",
        totalMember: 0,
        totalActive: 0,
        totalRepurchaseIncome: "0.00"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async (userId) => {
    try {
      const data = await BusinessService.getTeamDetails(userId);
      setTeamData(data);
    } catch (error) {
      console.error('Error loading team data:', error);
      setError('Failed to load team data');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Navigation Handlers - UPDATED
  const handleActionClick = (action) => {
    switch (action) {
      case 'self-invest':
        router.push('/redeem'); // Navigate to redeem page
        break;
      case 'my-invest':
        router.push('/income-passbook'); // Navigate to income passbook
        break;
      case 'invite':
        setComingSoonDialogOpen(true); // Show coming soon dialog
        break;
      default:
        break;
    }
  };

  const handleStatsCardClick = (cardType) => {
    const routes = {
      'total-earnings': '/income-passbook',
      'total-withdraw': '/redeem',
      'total-team': '/prime-team/3',
      'active-team': '/prime-team/4',
      'self-reward': '/income-passbook',
      'salary-reward': '/income-passbook',
      'level-reward': '/income-passbook',
      'upgrade-reward': '/income-passbook'
    };
    
    if (routes[cardType]) {
      router.push(routes[cardType]);
    }
  };

  const incomeDashboardList = [
    { name: 'Self Invest', navigation: 'self-invest' },
    { name: 'History', navigation: 'my-invest' },
    { name: 'Invite', navigation: 'invite' },
  ];

  const IncomeDashboardCard = ({ incomeList, onActionClick }) => {
    const getIcon = (name) => {
      switch (name) {
        case 'Self Invest': return <AddIcon />;
        case 'History': return <HistoryIcon />;
        case 'Invite': return <ShareIcon />;
        default: return <AddIcon />;
      }
    };

    return (
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {incomeList.map((item, index) => (
          <Grid item xs={4} key={index}>
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: 1,
                boxShadow: 3,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '2px solid #FFD700',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-3px)',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.9) 0%, rgba(255, 215, 0, 0.9) 100%)',
                }
              }}
              onClick={() => onActionClick(item.navigation)}
            >
              <Box sx={{ 
                color: '#8B4513',
                mb: 0.5
              }}>
                {getIcon(item.name)}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#8B4513', fontSize: '0.8rem' }}>
                {item.name}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)' }}
      >
        <CircularProgress sx={{ color: goldenTheme.primary }} />
        <Typography variant="h6" sx={{ ml: 2, color: goldenTheme.darkGold, fontWeight: 600 }}>
          Loading Business...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 50%, #FFF8DC 100%)',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ 
          mb: 1,
          mx: 1,
          mt: 1,
          background: 'linear-gradient(135deg, #FFEBCD 0%, #FFF8DC 100%)',
          color: '#8B4513',
          border: '1px solid #FFD700',
          '& .MuiAlert-icon': {
            color: '#8B4513'
          }
        }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Paper 
        sx={{ 
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
          color: 'white',
          borderRadius: 0,
          py: 3,
          px: 2,
          mb: 2,
          border: 'none',
          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
        }}
      >
        <Typography 
          variant="h5" 
          align="center" 
          sx={{ 
            fontWeight: 800,
            mb: 2,
            fontSize: isMobile ? '1.5rem' : '1.75rem',
            color: '#8B4513',
            textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)'
          }}
        >
          🏆 Mirror Business
        </Typography>
        
        <IncomeDashboardCard 
          incomeList={incomeDashboardList} 
          onActionClick={handleActionClick}
        />
      </Paper>

      {/* User Profile Card */}
      <Card sx={{ 
        mb: 2, 
        boxShadow: 3, 
        borderRadius: 0,
        mx: 0,
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
        border: 'none',
        borderBottom: '2px solid #FFD700',
        borderTop: '2px solid #FFD700'
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Grid container spacing={2} alignItems="center">
             <Grid item xs={4} sm={3}>
              <Avatar
                sx={{
                  width: isMobile ? 70 : 80,
                  height: isMobile ? 70 : 80,
                  mx: 'auto',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  fontSize: isMobile ? '1.5rem' : '1.75rem',
                  fontWeight: 'bold',
                  color: '#8B4513',
                  border: '3px solid #FFA500'
                }}
              >
                {(userProfile?.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: goldenTheme.darkGold }} fontSize="small" />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: isMobile ? '1.1rem' : '1.25rem', color: goldenTheme.darkGold }}>
                    {userProfile?.name || 'User Name'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ color: goldenTheme.brown }} fontSize="small" />
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: goldenTheme.brown, fontWeight: 500 }}>
                    ID : {userProfile?.mlm_id || 'MR000000'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ color: goldenTheme.brown }} fontSize="small" />
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: goldenTheme.brown, fontWeight: 500 }}>
                    Mob : {userProfile?.mobile || '0000000000'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: goldenTheme.brown }} fontSize="small" />
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: goldenTheme.brown, fontWeight: 500 }}>
                    Joining Date : {userProfile?.joining_date || new Date().toLocaleDateString('en-IN')}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
           
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Card sx={{ 
        mb: 2, 
        boxShadow: 3, 
        borderRadius: 0,
        mx: 0,
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
        border: 'none',
        borderBottom: '2px solid #FFD700'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: isMobile ? '0.9rem' : '1rem',
                py: isMobile ? 1.5 : 2,
                minHeight: 'auto',
                color: '#8B4513',
                '&.Mui-selected': {
                  color: '#FFD700',
                  background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700',
                height: 3
              }
            }}
          >
            {tabLabels.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Dynamic Tab Content */}
      <Box sx={{ 
        px: 0,
        mx: 0
      }}>
        <Card sx={{ 
          boxShadow: 3, 
          borderRadius: 0,
          mx: 0,
          background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
          border: 'none',
          borderBottom: '2px solid #FFD700'
        }}>
          <CardContent sx={{ 
            p: isMobile ? 2 : 3, 
            minHeight: isMobile ? 'auto' : 250 
          }}>
            {activeTab === 0 && (
              // All Tab - Show all stats from API
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Earnings"
                    value={`₹${teamData?.data?.[0]?.totalEarning || '0.00'}`}
                    icon={<WalletIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-earnings')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Withdraw"
                    value={`₹${teamData?.data?.[0]?.totalWithdrawal || '0.00'}`}
                    icon={<WalletIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-withdraw')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Team"
                    value={teamData?.data?.[0]?.totalMember || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-team')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Active Team"
                    value={teamData?.data?.[0]?.totalActive || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('active-team')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Self Reward"
                    value={`₹${teamData?.data?.[0]?.totalRepurchaseIncome || '0.00'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('self-reward')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Level Reward"
                    value={`₹${teamData?.data?.[0]?.silver || '0.00'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('level-reward')}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              // Earning Tab
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Earnings"
                    value={`₹${teamData?.data?.[0]?.totalEarning || '0.00'}`}
                    icon={<WalletIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-earnings')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Withdraw"
                    value={`₹${teamData?.data?.[0]?.totalWithdrawal || '0.00'}`}
                    icon={<WalletIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-withdraw')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Self Reward"
                    value={`₹${teamData?.data?.[0]?.totalRepurchaseIncome || '0.00'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('self-reward')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Level Reward"
                    value={`₹${teamData?.data?.[0]?.silver || '0.00'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('level-reward')}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              // Team Tab
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Team"
                    value={teamData?.data?.[0]?.totalMember || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-team')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Active Team"
                    value={teamData?.data?.[0]?.totalActive || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('active-team')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Prime B Team"
                    value={teamData?.data?.[0]?.primeB || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Booster Team"
                    value={teamData?.data?.[0]?.booster || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 3 && (
              // Salary Tab
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Self Reward"
                    value={`₹${teamData?.data?.[0]?.totalRepurchaseIncome || '0.00'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('self-reward')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Level Reward"
                    value={`₹${teamData?.data?.[0]?.silver || '0.00'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('level-reward')}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>

      <ComingSoonDialog
        open={comingSoonDialogOpen}
        onClose={() => setComingSoonDialogOpen(false)}
      />
    </Box>
  );
};

export default BusinessDashboardScreen;