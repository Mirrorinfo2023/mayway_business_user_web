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
  TextField,
  MenuItem,
  IconButton,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

// Static fallback data for team level details
const STATIC_LEVEL_DATA = {
  '0': { // My Team - Level wise data
    1: [
      { id: 1, name: 'Rajesh Kumar', mlmId: 'MLM001', userId: 'U001', joiningDate: '2024-01-15', plan: 'Starter Pack', mobile: '+919876543210', status: 'Active' },
      { id: 2, name: 'Priya Sharma', mlmId: 'MLM002', userId: 'U002', joiningDate: '2024-01-20', plan: null, mobile: '+919876543211', status: 'Inactive' },
      { id: 3, name: 'Amit Patel', mlmId: 'MLM003', userId: 'U003', joiningDate: '2024-02-01', plan: 'Business Pack', mobile: '+919876543212', status: 'Active' },
    ],
    2: [
      { id: 4, name: 'Sneha Reddy', mlmId: 'MLM004', userId: 'U004', joiningDate: '2024-01-10', plan: 'Premium Pack', mobile: '+919876543213', status: 'Active' },
      { id: 5, name: 'Vikram Singh', mlmId: 'MLM005', userId: 'U005', joiningDate: '2024-02-05', plan: null, mobile: '+919876543214', status: 'Inactive' },
      { id: 6, name: 'Anjali Mehta', mlmId: 'MLM006', userId: 'U006', joiningDate: '2024-01-25', plan: 'Starter Pack', mobile: '+919876543215', status: 'Active' },
      { id: 7, name: 'Rohit Verma', mlmId: 'MLM007', userId: 'U007', joiningDate: '2024-02-10', plan: 'Business Pack', mobile: '+919876543216', status: 'Active' },
    ],
    3: [
      { id: 8, name: 'Kiran Desai', mlmId: 'MLM008', userId: 'U008', joiningDate: '2024-01-05', plan: 'Premium Pack', mobile: '+919876543217', status: 'Active' },
      { id: 9, name: 'Sanjay Rao', mlmId: 'MLM009', userId: 'U009', joiningDate: '2024-02-15', plan: null, mobile: '+919876543218', status: 'Inactive' },
    ]
  },
  '1': { // Hybrid Team
    1: [
      { id: 1, name: 'Mohan Das', mlmId: 'HYB001', userId: 'H001', joiningDate: '2024-01-12', plan: 'Hybrid Basic', mobile: '+919876543220', status: 'Active' },
      { id: 2, name: 'Laxmi Nair', mlmId: 'HYB002', userId: 'H002', joiningDate: '2024-01-18', plan: 'Hybrid Pro', mobile: '+919876543221', status: 'Active' },
    ],
    2: [
      { id: 3, name: 'Arun Joshi', mlmId: 'HYB003', userId: 'H003', joiningDate: '2024-02-02', plan: 'Hybrid Basic', mobile: '+919876543222', status: 'Active' },
      { id: 4, name: 'Pooja Menon', mlmId: 'HYB004', userId: 'H004', joiningDate: '2024-01-28', plan: null, mobile: '+919876543223', status: 'Inactive' },
    ]
  },
  '2': { // Booster Team
    1: [
      { id: 1, name: 'Deepak Roy', mlmId: 'BST001', userId: 'B001', joiningDate: '2024-01-20', plan: 'Booster Gold', mobile: '+919876543230', status: 'Active' },
      { id: 2, name: 'Sunita Agarwal', mlmId: 'BST002', userId: 'B002', joiningDate: '2024-02-08', plan: 'Booster Silver', mobile: '+919876543231', status: 'Active' },
    ]
  },
  '3': { // Prime A Team
    1: [
      { id: 1, name: 'Rahul Malhotra', mlmId: 'PMA001', userId: 'P001', joiningDate: '2024-01-08', plan: 'Prime Elite', mobile: '+919876543240', status: 'Active' },
      { id: 2, name: 'Neha Gupta', mlmId: 'PMA002', userId: 'P002', joiningDate: '2024-01-22', plan: null, mobile: '+919876543241', status: 'Inactive' },
      { id: 3, name: 'Alok Choudhary', mlmId: 'PMA003', userId: 'P003', joiningDate: '2024-02-12', plan: 'Prime Pro', mobile: '+919876543242', status: 'Active' },
    ],
    2: [
      { id: 4, name: 'Swati Iyer', mlmId: 'PMA004', userId: 'P004', joiningDate: '2024-01-14', plan: 'Prime Elite', mobile: '+919876543243', status: 'Active' },
      { id: 5, name: 'Karan Mehta', mlmId: 'PMA005', userId: 'P005', joiningDate: '2024-02-03', plan: null, mobile: '+919876543244', status: 'Inactive' },
      { id: 6, name: 'Divya Nair', mlmId: 'PMA006', userId: 'P006', joiningDate: '2024-01-30', plan: 'Prime Pro', mobile: '+919876543245', status: 'Active' },
    ]
  },
  '4': { // Active Team
    1: [
      { id: 1, name: 'Vishal Kumar', mlmId: 'ACT001', userId: 'A001', joiningDate: '2024-01-25', plan: 'Active Basic', mobile: '+919876543250', status: 'Active' },
      { id: 2, name: 'Madhu Sharma', mlmId: 'ACT002', userId: 'A002', joiningDate: '2024-02-05', plan: 'Active Pro', mobile: '+919876543251', status: 'Active' },
      { id: 3, name: 'Ramesh Patel', mlmId: 'ACT003', userId: 'A003', joiningDate: '2024-01-18', plan: 'Active Basic', mobile: '+919876543252', status: 'Active' },
    ]
  }
};

// Mock API Service
const TeamService = {
  getLevelTeamDetails: async (userId, level, primeId, page = 1) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate API failure 30% of the time
      if (Math.random() < 0.3) {
        throw new Error('API Network Error');
      }

      // Return mock data based on planId and level
      const planData = STATIC_LEVEL_DATA[primeId];
      if (planData && planData[level]) {
        return planData[level];
      }
      
      // Return empty array if no data found
      return [];
    } catch (error) {
      console.error('Error fetching level team details:', error);
      throw error;
    }
  }
};

const TeamLevelDetailsScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { planId, level } = router.query;
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (planId && level) {
      loadTeamMembers();
    }
  }, [planId, level]);

  const loadTeamMembers = async (useFallback = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useFallback) {
        // Use static fallback data directly
        const fallbackData = STATIC_LEVEL_DATA[planId]?.[level] || [];
        setTeamMembers(fallbackData);
        setUsingFallback(true);
        return;
      }

      const userId = 'user123';
      const members = await TeamService.getLevelTeamDetails(userId, level, planId);
      setTeamMembers(members);
      setUsingFallback(false);
    } catch (error) {
      console.error('Error loading team members:', error);
      setError('Failed to load team members. Showing demo data.');
      
      // Fallback to static data
      const fallbackData = STATIC_LEVEL_DATA[planId]?.[level] || [];
      setTeamMembers(fallbackData);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadTeamMembers(false);
  };

  const filteredMembers = teamMembers.filter(member => {
    if (filter === 'Active') return member.plan !== null;
    if (filter === 'Inactive') return member.plan === null;
    return true;
  });

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber) => {
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  const handleBack = () => {
    router.push(`/prime-team/${planId}`);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading team members...
        </Typography>
      </Box>
    );
  }

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
            Back to Team
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
            {error}
          </Alert>
        )}

        {/* Header */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
              Level {level} - {getPlanTitle()}
            </Typography>
            <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
              Team Members Details
            </Typography>
            {usingFallback && (
              <Chip 
                label="Demo Data" 
                size="small" 
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            )}
          </CardContent>
        </Card>

        {/* Filter Dropdown */}
        {(planId === "3" || planId === "0") && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" color="primary">
              {filteredMembers.length} members found
            </Typography>
            <TextField
              select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 120, bgcolor: 'white' }}
              label="Filter Status"
            >
              <MenuItem value="All">All Members</MenuItem>
              <MenuItem value="Active">Active Only</MenuItem>
              <MenuItem value="Inactive">Inactive Only</MenuItem>
            </TextField>
          </Box>
        )}

        {/* Team Members List */}
        {filteredMembers.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No team members found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filter !== 'All' ? `No ${filter.toLowerCase()} members in level ${level}` : `No members found in level ${level}`}
            </Typography>
            {usingFallback && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                This is sample data. Real data will appear when API is connected.
              </Typography>
            )}
          </Card>
        ) : (
          <Stack spacing={2}>
            {filteredMembers.map((member, index) => (
              <Card key={member.id || index} sx={{ p: 2, position: 'relative' }}>
                {usingFallback && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Chip label="Sample" size="small" color="warning" />
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Status Indicator */}
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: member.plan ? 'success.main' : 'error.main',
                    mt: 1.5,
                    flexShrink: 0
                  }} />
                  
                  {/* Member Avatar and Details */}
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: member.plan ? theme.palette.primary.main : theme.palette.grey[400],
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {member.name?.charAt(0) || 'U'}
                  </Avatar>

                  {/* Member Details */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {member.name || 'Unknown User'}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>User ID:</strong> {member.mlmId || member.userId || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>DOJ:</strong> {member.joiningDate || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Plan:</strong> {member.plan || 'Not Active'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Mobile:</strong> {member.mobile || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={member.plan ? 'Active' : 'Inactive'} 
                        size="small"
                        color={member.plan ? 'success' : 'default'}
                        variant={member.plan ? 'filled' : 'outlined'}
                      />
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, gap: 1, flexShrink: 0 }}>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleCall(member.mobile)}
                      sx={{ border: 1, borderColor: 'primary.main' }}
                      disabled={!member.mobile}
                    >
                      <CallIcon />
                    </IconButton>
                    <IconButton 
                      color="success" 
                      onClick={() => handleWhatsApp(member.mobile)}
                      sx={{ border: 1, borderColor: 'success.main' }}
                      disabled={!member.mobile}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        )}

        {/* Summary Stats */}
        <Card sx={{ mt: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Level {level} Summary
              </Typography>
              {usingFallback && (
                <Chip label="Sample Statistics" size="small" color="warning" />
              )}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {teamMembers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Members
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {teamMembers.filter(m => m.plan).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Members
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {teamMembers.filter(m => !m.plan).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inactive Members
                </Typography>
              </Box>
            </Box>
            
            {usingFallback && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  These statistics are based on demonstration data
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default TeamLevelDetailsScreen;