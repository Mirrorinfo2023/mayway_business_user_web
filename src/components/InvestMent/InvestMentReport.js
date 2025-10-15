import { Box, Button, Grid, Table, TableBody, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, Modal } from "@mui/material";
import { useState } from "react";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import api from "../../../utils/api";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ThemedTableContainer = styled(TableContainer)(({ theme }) => ({
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px 0 rgba(33,150,243,0.08)',
    marginTop: 16,
    marginBottom: 16,
    overflowX: 'auto',
}));

const ThemedTableHeadCell = styled(TableCell)(({ theme }) => ({
    background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    padding: '8px 12px',
    borderRight: '1px solid #e3e3e3',
    letterSpacing: 1,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
}));

const ThemedTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': { background: '#f5faff' },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: 12,
    padding: '8px 12px',
    borderRight: '1px solid rgba(224, 224, 224, 1)',
    whiteSpace: 'nowrap',
}));

const NoRecordsBox = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f44336',
    fontWeight: 600,
    fontSize: 18,
    padding: '32px 0',
    width: '100%',
    gap: 8,
});

const StyledTablePagination = styled(TablePagination)(({ theme }) => ({
    '.MuiTablePagination-select': { color: '#2196f3', fontWeight: 600, paddingRight: '24px' },
    '.MuiTablePagination-selectLabel': { color: '#666', fontWeight: 500 },
    '.MuiTablePagination-displayedRows': { color: '#666', fontWeight: 500 },
    '.MuiTablePagination-actions .MuiIconButton-root': { color: '#2196f3' },
}));

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

const InvestMentTransactions = ({ showServiceTrans }) => {
    const rows = Array.isArray(showServiceTrans) ? showServiceTrans : [];

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [currentRejectId, setCurrentRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleApprove = async (id) => {
        try {
            const res = await api.put(`/api/prime-requests/${id}`, { status: "approved" });
            if (res.data.success) {
                alert("Approved successfully");
                location.reload();
            }
        } catch (error) {
            console.error(error);
            alert("Failed to approve request");
        }
    };

    const openRejectModal = (id) => {
        setCurrentRejectId(id);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const submitReject = async () => {
        if (!rejectReason.trim()) {
            alert("Please enter a reason for rejection.");
            return;
        }
        try {
            const res = await api.put(`/api/prime-requests/${currentRejectId}`, { status: "rejected", reason: rejectReason });
            if (res.data.success) {
                alert("Rejected successfully");
                location.reload();
            }
        } catch (error) {
            console.error(error);
            alert("Failed to reject request");
        } finally {
            setRejectModalOpen(false);
        }
    };

    const openImage = (url) => window.open(url, "_blank");

    return (
        <main className="p-6 space-y-6">
            <Grid container spacing={4} sx={{ padding: 2 }}>
                <Grid item xs={12}>
                    <ThemedTableContainer>
                        <Table aria-label="Prime Requests">
                            <TableHead>
                                <TableRow>
                                    <ThemedTableHeadCell>Sl No.</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Username</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>MLM ID</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Mobile</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Email</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>First Name</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Last Name</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Amount</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Remark</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>UTR IDs</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Images</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Status</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Created At</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Updated At</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Action</ThemedTableHeadCell>
                                    <ThemedTableHeadCell>Rejected Reason</ThemedTableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length > 0 ? (
                                    rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                        <ThemedTableRow key={row.id}>
                                            <StyledTableCell>{index + 1 + page * rowsPerPage}</StyledTableCell>
                                            <StyledTableCell>{row.username}</StyledTableCell>
                                            <StyledTableCell>{row.mlm_id}</StyledTableCell>
                                            <StyledTableCell>{row.mobile}</StyledTableCell>
                                            <StyledTableCell>{row.email}</StyledTableCell>
                                            <StyledTableCell>{row.first_name}</StyledTableCell>
                                            <StyledTableCell>{row.last_name}</StyledTableCell>
                                            <StyledTableCell>{row.amount}</StyledTableCell>
                                            <StyledTableCell>{row.remark}</StyledTableCell>
                                            <StyledTableCell>{row.utr_id?.join(', ')}</StyledTableCell>
                                            <StyledTableCell>
                                                {row.image_url?.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={`${BASE_URL}${img}`}
                                                        alt="image"
                                                        style={{ width: 50, cursor: 'pointer', marginRight: 4 }}
                                                        onClick={() => openImage(`${BASE_URL}${img}`)}
                                                    />
                                                ))}
                                            </StyledTableCell>
                                            <StyledTableCell>{row.status}</StyledTableCell>
                                            <StyledTableCell>{new Date(row.createdAt).toLocaleString()}</StyledTableCell>
                                            <StyledTableCell>{new Date(row.updatedAt).toLocaleString()}</StyledTableCell>
                                            <StyledTableCell>
                                                <Button
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#4caf50',
                                                        color: '#fff',
                                                        border: '1px solid #4caf50',
                                                        borderRadius: '4px',
                                                        marginRight: '8px',
                                                        '&:hover': { backgroundColor: '#45a049', borderColor: '#45a049' }
                                                    }}
                                                    onClick={() => handleApprove(row.id)}
                                                >
                                                    Approve
                                                </Button>

                                                <Button
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#f44336',
                                                        color: '#fff',
                                                        border: '1px solid #f44336',
                                                        borderRadius: '4px',
                                                        '&:hover': { backgroundColor: '#d32f2f', borderColor: '#d32f2f' }
                                                    }}
                                                    onClick={() => openRejectModal(row.id)}
                                                >
                                                    Reject
                                                </Button>
                                            </StyledTableCell>

                                            <StyledTableCell>{row.reason || '-'}</StyledTableCell>
                                        </ThemedTableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={16} align="center">
                                            <NoRecordsBox>
                                                <InfoOutlinedIcon color="error" sx={{ fontSize: 28 }} />
                                                No Records Found.
                                            </NoRecordsBox>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ThemedTableContainer>

                    <StyledTablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Grid>
            </Grid>

            {/* Reject Reason Modal */}
            <Modal
                open={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                aria-labelledby="reject-modal-title"
            >
                <Box sx={modalStyle}>
                    <Typography id="reject-modal-title" variant="h6" mb={2}>
                        Enter Rejection Reason
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejection"
                        variant="outlined"
                    />
                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                        <Button onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={submitReject}>Submit</Button>
                    </Box>
                </Box>
            </Modal>
        </main>
    );
};

export default InvestMentTransactions;
