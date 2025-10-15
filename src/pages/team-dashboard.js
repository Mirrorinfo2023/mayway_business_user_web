import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Container,
  Paper,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/router';

// Mock data - replace with actual API calls
const mockTeamData = {
  id: '1',
  name: 'John Doe',
  mlmId: 'MR123456',
  mobile: '9876543210',
  joiningDate: '2024-01-15',
  totalEarning: '15,250.00',
  totalWithdrawal: '5,000.00',
  totalMember: 45,
  totalActive: 32,
  primeB: 15,
  booster: 8,
  hybrid: 5,
  totalRepurchaseIncome: '2,500.00',
  silver: '1,200.00',
  mobileFund: '800.00',
  carFund: '1,500.00',
  gold: '2,000.00',
  houseFund: '3,000.00',
  platinum: '1,800.00',
  travelFund: '1,200.00',
  diamond: '2,500.00',
  communityFund: '900.00',
  doubleDiamond: '3,200.00',
  ambassador: '4,000.00'
};

const incomeList = [
  {
    name: "Total Earnings",
    income: "₹0",
    path: '/income-passbook',
    catId: 1,
    image: '/assets/b1.png',
    color: null
  },
  {
    name: "Total Withdraw",
    income: "₹0",
    path: '/redeem',
    catId: 1,
    image: '/assets/b2.png',
    color: null
  },
  {
    name: "Total Team",
    catId: 2,
    color: '#FFA500',
    income: "0",
    path: '/prime-team/3',
    image: '/assets/b3.png',
    id: '3'
  },
  {
    name: "Active Team",
    catId: 2,
    color: '#4CAF50',
    image: '/assets/b4.png',
    path: '/prime-team/4',
    income: "0",
    id: '4'
  },
  {
    name: "Self Reward",
    catId: 3,
    income: "0",
    image: '/assets/b7.png',
    color: null
  },
  {
    name: "Salary Reward",
    catId: 3,
    image: '/assets/b8.png',
    income: "0",
    color: null
  },
  {
    name: "Level Reward",
    catId: 1,
    income: "0",
    image: '/assets/b9.png',
    color: null
  },
  {
    name: "Upgrade Reward",
    catId: 1,
    income: "0",
    image: '/assets/b10.png',
    color: null
  },
];

// User Business Details Component
const UserBusinessDetails = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card 
      sx={{ 
        mb: 2,
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
        border: '2px solid #FFD700',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                color: '#8B4513',
                mb: 1
              }}
            >
              {data.name}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: '#8B4513', mb: 0.5 }}
            >
              <strong>ID:</strong> {data.mlmId}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: '#8B4513', mb: 0.5 }}
            >
              <strong>Mobile:</strong> {data.mobile}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: '#8B4513' }}
            >
              <strong>Joining Date:</strong> {new Date(data.joiningDate).toLocaleDateString('en-IN')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#FFD700',
                color: '#8B4513',
                fontSize: '2rem',
                fontWeight: 'bold',
                border: '3px solid #8B4513',
                mx: { xs: 'auto', sm: 'inherit' }
              }}
            >
              {data.name.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Income Card Component
const IncomeCard = ({ item, onCardClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
        border: item.color ? `3px solid ${item.color}` : '2px solid #FFD700',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        },
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}
      onClick={() => onCardClick(item)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {/* Image */}
        <Box
          sx={{
            width: 50,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            flexShrink: 0
          }}
        >
          <Box
            component="img"
            src={item.image}
            alt={item.name}
            sx={{
              width: 35,
              height: 35,
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          {/* Income Amount */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
            {item.color && (
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  mr: 1
                }}
              />
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#8B4513',
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              {item.income}
            </Typography>
          </Box>

          {/* Name */}
          <Typography
            variant="body2"
            sx={{
              color: '#8B4513',
              fontWeight: 600,
              lineHeight: 1.2,
              minHeight: { xs: '2.4em', sm: '2.8em' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {item.name}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

// Main Team Dashboard Component
const TeamDashboardScreen = ({ data = mockTeamData }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState(data);
  const [incomeData, setIncomeData] = useState(incomeList);

  useEffect(() => {
    // Simulate API call to fetch team details
    const fetchTeamDetails = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        setTimeout(() => {
          // Update income data with actual values from teamData
          const updatedIncomeData = incomeData.map(item => {
            let incomeValue = "0";
            
            switch(item.name) {
              case "Total Earnings":
                incomeValue = `₹${teamData.totalEarning}`;
                break;
              case "Total Withdraw":
                incomeValue = `₹${teamData.totalWithdrawal}`;
                break;
              case "Total Team":
                incomeValue = teamData.totalMember.toString();
                break;
              case "Active Team":
                incomeValue = teamData.totalActive.toString();
                break;
              case "Self Reward":
                incomeValue = `₹${teamData.totalRepurchaseIncome}`;
                break;
              case "Level Reward":
                incomeValue = `₹${teamData.silver}`;
                break;
              default:
                incomeValue = item.income;
            }
            
            return { ...item, income: incomeValue };
          });
          
          setIncomeData(updatedIncomeData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching team details:', error);
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, []);

  const handleCardClick = (item) => {
    if (item.path) {
      if (item.path.includes('/prime-team/')) {
        router.push(`/prime-team/${item.id}`);
      } else {
        router.push(item.path);
      }
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}
      >
        <CircularProgress sx={{ color: '#FFD700' }} />
        <Typography variant="h6" sx={{ ml: 2, color: '#8B4513' }}>
          Loading Team Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
      py: 2
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 3,
            background: 'linear-gradient(135deg, #8B4513 0%, #FFD700 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          {teamData.name} Portfolio
        </Typography>

        {/* User Business Details */}
        <UserBusinessDetails data={teamData} />

        {/* Income Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {incomeData.map((item, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <IncomeCard 
                item={item} 
                onCardClick={handleCardClick}
              />
            </Grid>
          ))}
        </Grid>

        {/* Additional Stats Section */}
        <Paper 
          sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
            border: '2px solid #FFD700',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: '#8B4513',
              mb: 2,
              textAlign: 'center'
            }}
          >
            Team Statistics
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
                  {teamData.primeB}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8B4513' }}>
                  Prime B Team
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
                  {teamData.booster}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8B4513' }}>
                  Booster Team
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
                  {teamData.hybrid}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8B4513' }}>
                  Hybrid Team
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
                  ₹{teamData.gold}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8B4513' }}>
                  Gold Royalty
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default TeamDashboardScreen;

// Optional: If you need to use this component with specific props
export const TeamDashboardWithData = ({ teamData }) => {
  return <TeamDashboardScreen data={teamData} />;
};