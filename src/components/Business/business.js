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
import api from '../../../utils/api';
import { DataEncrypt, DataDecrypt } from '../../../utils/encryption';

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
    const storedUserId = sessionStorage.getItem("id");

    if (storedUserId) {
      setUserId(storedUserId);

      // Construct userProfile from sessionStorage
      const firstName = sessionStorage.getItem("first_name") || '';
      const lastName = sessionStorage.getItem("last_name") || '';
      const mlmId = sessionStorage.getItem("mlm_id") || 'MR000000';
      const mobile = sessionStorage.getItem("mobile") || '0000000000';
      const registrationDateStr = sessionStorage.getItem("registration_date") || "";
      let joiningDate = "";

      // Extract only the date part (before the space)
      if (registrationDateStr) {
        joiningDate = registrationDateStr.split(" ")[0]; // "19-02-2025"
      } else {
        joiningDate = new Date().toLocaleDateString('en-IN'); // fallback
      }

      // Use in user profile
      setUserProfile({
        name: `${sessionStorage.getItem('first_name')} ${sessionStorage.getItem('last_name')}`.trim() || 'User Name',
        mlm_id: sessionStorage.getItem('mlm_id') || 'MR000000',
        mobile: sessionStorage.getItem('mobile') || '0000000000',
        joining_date: joiningDate
      });

      // Load API data for team & company
      loadAllData(storedUserId);
    } else {
      setError('User ID not found. Please login again.');
      setLoading(false);
    }
  }, []);



  const fetchTeamDetails = async (userId, planId = '3') => {
    try {
      const payload = {
        user_id: userId,
        plan_id: planId
      };
      const encReq = DataEncrypt(JSON.stringify(payload));

      const response = await api.post('/api/refferal-report/2f01312cafbd54f54f71b56d3d03cbae1fc8cdf7', { encReq });
      const decryptedData = DataDecrypt(response.data);

      console.log("decryptedData ", decryptedData)
      if (decryptedData.status === 200) {
        return transformTeamData(decryptedData);
      } else {
        throw new Error(decryptedData.message || 'Failed to fetch team details');
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw error;
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const response = await api.get('/api/refferal-report/92ba6b72c22a4434a2c259c84a956435fa6fb21a');
      console.log("Company Data:", response.data);

      if (response.data.status === 200) {
        return transformCompanyData(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch company details');
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  };

  // Data transformation functions
  const transformTeamData = (apiData) => {
    console.log("apiData ", apiData)
    if (apiData.data && apiData.data.length > 0) {
      const teamData = apiData.data[0];
      return {
        data: [{
          // Earnings and Withdrawals
          totalEarning: teamData.total_earning || 0,
          totalWithdrawal: teamData.total_withdrawal || 0,
          totalRepurchaseIncome: teamData.total_repurchase_income || 0,

          // Team Counts
          totalMember: teamData.total_member || 0,
          totalActive: teamData.total_active || 0,
          totalInactive: teamData.total_inactive || 0,

          // Plan Types
          primeA: teamData.prime_a || 0,
          primeB: teamData.prime_b || 0,
          booster: teamData.booste || 0,
          hybrid: teamData.hybrid || 0,

          // Level Rewards
          silver: teamData.total_silver_income || 0,
          gold: teamData.total_gold_income || 0,
          platinum: teamData.Platinum || 0,
          diamond: teamData.total_diamond_income || 0,
          doubleDiamond: teamData.total_DoubleDiamond_income || 0,
          ambassador: teamData.total_ambassador_income || 0,

          // Funds
          mobileFund: teamData.total_mobilefund_income || 0,
          carFund: teamData.total_carfund_income || 0,
          houseFund: teamData.total_housefund_income || 0,
          travelFund: teamData.total_travelfund_income || 0,
          comunityFund: teamData.total_Communityfund_income || 0
        }],
        leveldata: apiData.leveldata || [],
        rank: apiData.rank?.[0]?.user_rank || "No Rank"
      };
    }
    return getFallbackTeamData();
  };

  const transformCompanyData = (apiData) => {
    if (!apiData || typeof apiData !== "object") {
      console.warn("Invalid API data:", apiData);
      return getFallbackCompanyData();
    }

    return {
      // Today's Business
      todayBusiness: apiData.todayBussiness?.[0] ? {
        primeA: apiData.todayBussiness[0].prime_a || 0,
        primeB: apiData.todayBussiness[0].prime_b || 0,
        booster: apiData.todayBussiness[0].booster || 0,
        hybrid: apiData.todayBussiness[0].hybrid || 0
      } : { primeA: 0, primeB: 0, booster: 0, hybrid: 0 },

      // Monthly Business
      monthlyBusiness: apiData.MonthlyPlanBussiness?.[0] ? {
        primeA: apiData.MonthlyPlanBussiness[0].prime_a || 0,
        primeB: apiData.MonthlyPlanBussiness[0].prime_b || 0,
        booster: apiData.MonthlyPlanBussiness[0].booster || 0,
        hybrid: apiData.MonthlyPlanBussiness[0].hybrid || 0
      } : { primeA: 0, primeB: 0, booster: 0, hybrid: 0 },

      // Level Counts
      silver: apiData.Silver || 0,
      gold: apiData.Gold || 0,
      platinum: apiData.Platinum || 0,
      diamond: apiData.Diamond || 0,
      doubleDiamond: apiData.DoubleDiamond || 0,
      ambassador: apiData.Ambassador || 0,

      // Funds
      mobileFund: apiData.Mobilefund || 0,
      carFund: apiData.CarFund || 0,
      houseFund: apiData.HouseFund || 0,
      travelFund: apiData.TravelFund || 0,
      comunityFund: apiData.ComunityFund || 0,
    };
  };

  // Fallback data
  const getFallbackTeamData = () => {
    return {
      data: [{
        totalEarning: 0,
        totalWithdrawal: 0,
        totalMember: 0,
        totalActive: 0,
        totalInactive: 0,
        primeA: 0,
        primeB: 0,
        booster: 0,
        hybrid: 0,
        totalRepurchaseIncome: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        diamond: 0,
        doubleDiamond: 0,
        ambassador: 0,
        mobileFund: 0,
        carFund: 0,
        houseFund: 0,
        travelFund: 0,
        comunityFund: 0
      }],
      leveldata: [],

    };
  };

  const getFallbackCompanyData = () => {
    return {
      todayBusiness: { primeA: 0, primeB: 0, booster: 0, hybrid: 0 },
      monthlyBusiness: { primeA: 0, primeB: 0, booster: 0, hybrid: 0 },
      silver: 0, gold: 0, platinum: 0, diamond: 0,
      doubleDiamond: 0, ambassador: 0,
      mobileFund: 0, carFund: 0, houseFund: 0,
      travelFund: 0, comunityFund: 0,
    };
  };

  // Main data loading function
  const loadAllData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Call all APIs in parallel
      const [teamResponse, companyResponse] = await Promise.all([
        fetchTeamDetails(userId),
        fetchCompanyDetails()
      ]);

      setTeamData(teamResponse);
      setCompanyData(companyResponse);

      console.log("Loaded data:", { teamResponse, companyResponse });

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

      setTeamData(getFallbackTeamData());
      setCompanyData(getFallbackCompanyData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("id");
    if (storedUserId) {
      setUserId(storedUserId);
      loadAllData(storedUserId);
    } else {
      setError('User ID not found. Please login again.');
      setLoading(false);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Navigation Handlers
  const handleActionClick = (action) => {
    switch (action) {
      case 'self-invest':
        router.push('/redeem');
        break;
      case 'my-invest':
        router.push('/income-passbook');
        break;
      case 'invite':
        setComingSoonDialogOpen(true);
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
    }

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
          Loading Dashboard...
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
              // All Tab - Show all specified stats
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Earnings"
                    value={`₹${teamData?.data?.[0]?.totalEarning?.toLocaleString() || '0'}`}
                    icon={<WalletIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-earnings')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Withdraw"
                    value={`₹${teamData?.data?.[0]?.totalWithdrawal?.toLocaleString() || '0'}`}
                    icon={<WalletIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-withdraw')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Team"
                    value={teamData?.data?.[0]?.totalMember?.toLocaleString() || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-team')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Active Team"
                    value={teamData?.data?.[0]?.totalActive?.toLocaleString() || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('active-team')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Self Reward"
                    value={`₹${teamData?.data?.[0]?.totalRepurchaseIncome?.toLocaleString() || '0'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('self-reward')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Salary Reward"
                    value={`₹${teamData?.data?.[0]?.silver?.toLocaleString() || '0'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('salary-reward')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Level Reward"
                    value={`₹${teamData?.data?.[0]?.gold?.toLocaleString() || '0'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('level-reward')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Upgrade Reward"
                    value={`₹${teamData?.data?.[0]?.platinum?.toLocaleString() || '0'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('upgrade-reward')}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              // Earning Tab - Show only specified earning stats
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Earnings"
                    value={`₹${teamData?.data?.[0]?.totalEarning?.toLocaleString() || '0'}`}
                    icon={<WalletIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-earnings')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Total Withdraw"
                    value={`₹${teamData?.data?.[0]?.totalWithdrawal?.toLocaleString() || '0'}`}
                    icon={<WalletIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-withdraw')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Level Reward"
                    value={`₹${teamData?.data?.[0]?.gold?.toLocaleString() || '0'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('level-reward')}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <StatsCard
                    title="Upgrade Reward"
                    value={`₹${teamData?.data?.[0]?.platinum?.toLocaleString() || '0'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('upgrade-reward')}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              // Team Tab - Show only team stats
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6} sm={6} md={6}>
                  <StatsCard
                    title="Total Team"
                    value={teamData?.data?.[0]?.totalMember?.toLocaleString() || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('total-team')}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <StatsCard
                    title="Active Team"
                    value={teamData?.data?.[0]?.totalActive?.toLocaleString() || 0}
                    icon={<GroupsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('active-team')}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 3 && (
              // Salary Tab - Show only salary/reward stats
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6} sm={6} md={6}>
                  <StatsCard
                    title="Self Reward"
                    value={`₹${teamData?.data?.[0]?.totalRepurchaseIncome?.toLocaleString() || '0'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.darkGold}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('self-reward')}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <StatsCard
                    title="Salary Reward"
                    value={`₹${teamData?.data?.[0]?.silver?.toLocaleString() || '0'}`}
                    icon={<RewardsIcon />}
                    color={goldenTheme.brown}
                    isClickable={true}
                    onClick={() => handleStatsCardClick('salary-reward')}
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