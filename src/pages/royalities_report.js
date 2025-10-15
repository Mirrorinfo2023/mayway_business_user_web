"use client";
import { useEffect, useState } from 'react';
import Layout from "@/components/Dashboard/layout";
import api from "../../utils/api";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, TablePagination } from '@mui/material';
import dayjs from 'dayjs'; // Import dayjs for date handling

const RoyalityPage = () => {
  const [royality, setRoyality] = useState([]);
  const [filteredRoyality, setFilteredRoyality] = useState([]);
  const [error, setError] = useState(null);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchRoyality = async () => {
      try {
        const response = await api.post("/api/royality/63a14cf5d75879f5bfe50b7246dcc0ff57c91c71");
        setRoyality(response.data.data);
        setFilteredRoyality(response.data.data);
      } catch (error) {
        setError('Failed to fetch royality');
        console.log(error);
      }
    };

    fetchRoyality();
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      const filtered = royality.filter(royalty => {
        const entryDate = dayjs(royalty.entry_date).format('YYYY-MM-DD');
        return entryDate >= fromDate && entryDate <= toDate;
      });
      setFilteredRoyality(filtered);
    } else {
      setFilteredRoyality(royality);
    }
  }, [fromDate, toDate, royality]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Layout>
      <Container style={{ marginTop: '180px', marginBottom: '50px' }}>
        <Typography variant="h6" gutterBottom style={{ textAlign: "center" }}>Royality List</Typography>
        {error && <Typography color="error">{error}</Typography>}

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <TextField
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ marginRight: '10px' }}
            InputProps={{ inputProps: { max: dayjs().format('YYYY-MM-DD') } }} // Prevent future dates
          />
          <TextField
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ marginRight: '10px' }}
            InputProps={{ inputProps: { max: dayjs().format('YYYY-MM-DD') } }} // Prevent future dates
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (fromDate && toDate) {
                setFromDate(fromDate);
                setToDate(toDate);
              }
            }}
          >
            Filter
          </Button>
        </div>

        <TableContainer component={Paper} style={{ width: '100%' }}>
          <Table style={{ width: '100%' }}>
            <TableHead>
              <TableRow style={{ backgroundColor: "gainsboro" }}>
                <TableCell>Date</TableCell> {/* Header for sequential ID */}
                <TableCell>Entry date</TableCell>
                <TableCell>Credit per person </TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Royality</TableCell>
                <TableCell>Total credit user</TableCell>
                <TableCell>Total active user</TableCell>
                <TableCell>Total drop user</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoyality.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((royalty, index) => (
                <TableRow key={royalty.id}>
                  <TableCell>{index + 1 + page * rowsPerPage}</TableCell> {/* Sequential ID starting from 1 */}
                  <TableCell>{dayjs(royalty.entry_date).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>{royalty.credit_per_person}</TableCell>
                  <TableCell>{royalty.details}</TableCell>
                  <TableCell>{royalty.royalty}</TableCell>
                  <TableCell>{royalty.total_credit_user}</TableCell>
                  <TableCell>{royalty.total_active_users}</TableCell>
                  <TableCell>{royalty.total_drop_users}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination controls */}
        <TablePagination
          rowsPerPageOptions={[20, 50, 100]}
          component="div"
          count={filteredRoyality.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Container>
    </Layout>
  );
};

export default RoyalityPage;
