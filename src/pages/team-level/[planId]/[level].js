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
  Pagination,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import api from '../../../../utils/api';
import { DataEncrypt, DataDecrypt } from '../../../../utils/encryption';

const TeamLevelDetailsScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { planId, level } = router.query;

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (planId && level) {
      loadTeamMembers();
    }
  }, [planId, level, currentPage]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = sessionStorage.getItem('id');
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const payload = {
        user_id: userId,
        level: parseInt(level),
        page: currentPage,
        teamType: parseInt(planId) || 1
      };

      console.log("Loading team members with payload:", payload);

      const encReq = DataEncrypt(JSON.stringify(payload));
      const response = await api.post('/api/refferal-report/65e1bce665c5b66ff4076e963488b62999b44c16', { encReq });

      const decryptedData = DataDecrypt(response.data);

      if (decryptedData.status === 200) {
        const members = decryptedData.data || [];
        setTeamMembers(members);

        // Calculate total pages based on response (assuming 10 items per page)
        if (members.length > 0) {
          setTotalPages(Math.ceil(members.length / 10) || 1);
        } else {
          setTotalPages(1);
        }

        console.log("Team members loaded successfully:", members);
      } else {
        throw new Error(decryptedData.message || 'Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      setError(error.message || 'Failed to load team members');
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setCurrentPage(1);
    loadTeamMembers();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const filteredMembers = teamMembers.filter(member => {
    if (filter === 'Active') return member.plan !== null && member.plan !== undefined;
    if (filter === 'Inactive') return !member.plan || member.plan === null;
    return true;
  });

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleWhatsApp = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  };

  const getPlanName = (planString) => {
    if (!planString) return null;
    try {
      // Extract first plan name from the comma-separated list
      const firstPlan = planString.split(',')[0];
      return firstPlan.split(' - ')[0] || 'Active Plan';
    } catch {
      return planString;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"
        sx={{ background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)' }}
      >
        <CircularProgress sx={{ color: '#FFD700' }} />
        <Typography variant="h6" sx={{ ml: 2, color: '#8B4513', fontWeight: 600 }}>
          Loading Team Members...
        </Typography>
      </Box>
    );
  }

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
              py: 0
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

        {/* Header */}
        <Card sx={{
          mb: 2,
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          border: '2px solid #FFD700'
        }}>
          <CardContent sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B4513', mb: 0.5 }}>
              Level {level} - {getPlanTitle()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#8B4513', opacity: 0.9 }}>
              Team Members
            </Typography>
          </CardContent>
        </Card>



        {/* Filter Dropdown */}
        {(planId === "3" || planId === "0") && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ color: '#8B4513', fontWeight: 600 }}>
              {filteredMembers.length} members
            </Typography>
            <TextField
              select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
              sx={{
                minWidth: 120,
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#FFD700',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FFA500',
                  },
                }
              }}
              label="Filter"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        )}

        {/* Team Members List */}
        {filteredMembers.length === 0 ? (
          <Card sx={{
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
            border: '1px solid #FFD700'
          }}>
            <Typography variant="body1" sx={{ color: '#8B4513' }}>
              No team members found
            </Typography>
            <Typography variant="body2" sx={{ color: '#8B4513', mt: 0.5 }}>
              {filter !== 'All' ? `No ${filter.toLowerCase()} members in level ${level}` : `No members in level ${level}`}
            </Typography>
          </Card>
        ) : (
          <Stack spacing={1}>
            {filteredMembers.map((member, index) => {
              const hasPlan = !!getPlanName(member.plan);
              return (
                <Card key={member.user_id || index} sx={{
                  p: 1.5,
                  background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
                  border: '1px solid #FFD700'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Status Indicator and Avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: hasPlan ? 'green' : 'orange',
                        flexShrink: 0
                      }} />
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          color: '#8B4513'
                        }}
                      >
                        {member.name?.charAt(0) || 'U'}
                      </Avatar>
                    </Box>

                    {/* Member Details - Single Row */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#8B4513', mb: 0.5 }}>
                        {member.name || 'Unknown User'}
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        alignItems: 'center'
                      }}>
                        <Typography variant="caption" sx={{ color: '#8B4513', fontWeight: 500 }}>
                          <strong>ID:</strong> {member.mlm_id || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8B4513' }}>
                          <strong>Joining Date:</strong> {formatDate(member.joining_date)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8B4513' }}>
                          <strong>Mobile:</strong> {member.mobile || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8B4513' }}>
                          <strong>Plan:</strong> {getPlanName(member.plan) || 'None'}
                        </Typography>
                        <Chip
                          label={hasPlan ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            backgroundColor: hasPlan ? '#4CAF50' : '#FF9800',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleCall(member.mobile)}
                        sx={{
                          border: 1,
                          borderColor: '#8B4513',
                          color: '#8B4513',
                          '&:hover': {
                            backgroundColor: '#8B4513',
                            color: 'white'
                          }
                        }}
                        disabled={!member.mobile}
                      >
                        <CallIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleWhatsApp(member.mobile)}
                        sx={{
                          border: 1,
                          borderColor: '#25D366',
                          color: '#25D366',
                          '&:hover': {
                            backgroundColor: '#25D366',
                            color: 'white'
                          }
                        }}
                        disabled={!member.mobile}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#8B4513',
                  border: '1px solid #FFD700',
                  fontSize: '0.8rem',
                  minWidth: 32,
                  height: 32,
                  '&.Mui-selected': {
                    backgroundColor: '#FFD700',
                    color: '#8B4513',
                    fontWeight: 'bold'
                  }
                }
              }}
            />
          </Box>
        )}


        {/* Summary Stats - Compact Version */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 1.5,
            width: '100%',
            mt:2
          }}
        >
          {/* Total Members */}
          <Box
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: '32%' },
              textAlign: 'center',
              p: 1.5,
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B4513', lineHeight: 1.2 }}>
              {teamMembers.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8B4513' }}>
              Total Members
            </Typography>
          </Box>

          {/* Active Members */}
          <Box
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: '32%' },
              textAlign: 'center',
              p: 1.5,
              background: 'linear-gradient(135deg, #90EE90 0%, #32CD32 100%)',
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B4513', lineHeight: 1.2 }}>
              {teamMembers.filter(m => getPlanName(m.plan)).length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8B4513' }}>
              Active Members
            </Typography>
          </Box>

          {/* Inactive Members */}
          <Box
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: '32%' },
              textAlign: 'center',
              p: 1.5,
              background: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B4513', lineHeight: 1.2 }}>
              {teamMembers.filter(m => !getPlanName(m.plan)).length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8B4513' }}>
              Inactive Members
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TeamLevelDetailsScreen;