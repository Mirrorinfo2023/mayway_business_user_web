import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../../utils/api';
import { DataEncrypt, DataDecrypt } from '../../utils/encryption';

const TeamLevelPage = () => {
  const router = useRouter();
  const { userId, teamType } = router.query;
  const [teamLevelData, setTeamLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLevelTeamDetails = async (userId, level = 1, teamType = 'total', page = 1) => {
    try {
      const payload = {
        user_id: userId,
        level: level,
        teamType: teamType,
        page: page
      };
      
      const encReq = DataEncrypt(JSON.stringify(payload));
      const response = await api.post('/api/refferal-report/65e1bce665c5b66ff4076e963488b62999b44c16', { encReq });
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
  };

  useEffect(() => {
    if (userId) {
      loadTeamLevelData();
    }
  }, [userId, teamType]);

  const loadTeamLevelData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchLevelTeamDetails(userId, 1, teamType);
      setTeamLevelData(data);
      
    } catch (error) {
      console.error('Error loading team level data:', error);
      setError('Failed to load team level data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Team Details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" gutterBottom>
        Team Level Details - {teamType === 'total' ? 'Total Team' : 'Active Team'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {teamLevelData && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Level</TableCell>
                <TableCell>Total Members</TableCell>
                <TableCell>Active Members</TableCell>
                <TableCell>Inactive Members</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamLevelData.map((level, index) => (
                <TableRow key={index}>
                  <TableCell>{level.level}</TableCell>
                  <TableCell>{level.levelcount}</TableCell>
                  <TableCell>{level.totalActive}</TableCell>
                  <TableCell>{level.totalInactive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TeamLevelPage;