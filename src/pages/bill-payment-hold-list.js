"use client"
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Cookies from "js-cookie";
import api from "../../utils/api";
import withAuth from "../../utils/withAuth";
import { callAlert } from "../../redux/actions/alert";
import Layout from "@/components/Dashboard/layout";
import Transactions from "@/components/BillPayment/bill_payment_hold";
import { Grid,Paper,TableContainer } from "@mui/material";
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { Steps } from 'antd';
import { Typography,Divider,Box,TextField} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';


const drawWidth = 220;
const getDate = (timeZone) => {
  const dateString = timeZone;
  const dateObject = new Date(dateString);

  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");
  const hours = String(dateObject.getHours()).padStart(2, "0");
  const minutes = String(dateObject.getMinutes()).padStart(2, "0");

  // Determine if it's AM or PM
  const amOrPm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  const formattedHours = hours % 12 === 0 ? "12" : String(hours % 12);

  const formattedDateTime = `${day}-${month}-${year} ${formattedHours}:${minutes} ${amOrPm}`;

  return formattedDateTime;
};

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',

    bgcolor: 'background.paper',
    borderRadius: 2,
    // border: '2px solid #000',
    boxShadow: 24, overflow: 'auto'
};

const innerStyle = {
    overflow: 'auto',
    width: 400,
    height: 400,
};


function TransactionHistory(props) {
  
    const [showServiceTrans, setShowServiceTrans] = useState({});
    

    
    const dispatch = useDispatch();
    const uid = Cookies.get('uid');
    let rows;

    if (showServiceTrans && showServiceTrans.length > 0) {
        rows = [
            ...showServiceTrans
        ];
    } else {
        rows = [];
    }
    // const [fromDate, setFromDate] = useState(new Date());
    // const [toDate, setToDate] = useState(new Date());
    const currentDate = new Date();
    const [fromDate, setFromDate] = React.useState(dayjs(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)));
    const [toDate, setToDate] = React.useState(dayjs(getDate.dateObject));
    
    const handlePageCountChange = (newPageCount) => {
      //setCurrentPageCount(newPageCount);
      getTnx();
    };



      const getTnx = async () => {
        const reqData = {
          from_date: fromDate.toISOString().split('T')[0],
          to_date: toDate.toISOString().split('T')[0],
          //page: parseInt(currentPageCount)+1
        };

        // const originalString = 'Hello, World!';
        // const encryptedData = DataEncrypt(JSON.stringify(originalString));
        // console.log(encryptedData);
        // const decryptedObject = DataDecrypt(encryptedData);
        // console.log(decryptedObject);
        try {
          const response = await api.post('/api/report/bill-payment-hold-report', reqData);
          
          if (response.status === 200) {
            setShowServiceTrans(response.data.data);
            settotalPageCount(response.data.totalPageCount);
          }
        } catch (error) {
          if (error?.response?.data?.error) {
            dispatch(callAlert({ message: error.response.data.error, type: 'FAILED' }));
          } else {
            dispatch(callAlert({ message: error.message, type: 'FAILED' }));
          }
        }
      };

      useEffect(() => {
  
        if (uid) {
          getTnx();
        }
      }, [uid, fromDate, toDate, dispatch]);

      const handleFromDateChange = (date) => {
        setFromDate(date);
      };
    
      const handleToDateChange = (date) => {
        setToDate(date);
      };

      const [searchTerm, setSearchTerm] = useState('');

      const filteredRows = rows.filter(row => {
        return (
          (row.first_name && row.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (row.last_name && row.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (row.mlm_id && row.mlm_id.includes(searchTerm)) ||
          (row.mobile && row.mobile.includes(searchTerm)) ||
          (row.email && row.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (row.ref_first_name && row.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (row.ref_last_name && row.ref_last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (row.ref_mlm_id && row.mlm_id.includes(searchTerm)) ||
          (row.ref_mobile && row.mobile.includes(searchTerm)) ||
          (row.ref_email && row.email.toLowerCase().includes(searchTerm.toLowerCase()))
          // Add conditions for other relevant columns
        );
    });
    return (

        <Layout>
            <Grid
                container
                spacing={4}
                sx={{ padding: 2 }}
            >
            
            <Grid item={true} xs={12}   >
              <TableContainer component={Paper} >
                <Box display={'inline-block'} justifyContent={'space-between'} alignItems={'right'} mt={1} mb={1} style={{width: '40%', verticalAlign: 'top'}} >
                    <Typography variant="h5"  sx={{ padding: 2 }}>Bill Payment Hold List</Typography>
                </Box>

                
                <Box display={'inline-block'} justifyContent={'space-between'} alignItems={'center'} mt={3} mb={1} sx={{ width: '20%', verticalAlign: 'top' }}>
                <TextField id="standard-basic" placeholder="Search" variant="standard" mt={2} style={{width: '100%'}}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <SearchIcon />
                    ),
                  }}/>
                        </Box>
            
                    <Box display={'inline-block'} justifyContent={'space-between'} alignItems={'center'} mt={1} mb={1} sx={{ verticalAlign: 'top' }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {/* <DemoContainer  ml={2} components={['DatePicker', 'DatePicker']}  > */}
                        <div>
                        
                        <DatePicker 
                            label="From Date"
                            value={fromDate}
                            sx={{ padding: 1, lineHeight: 20 }}
                            format="DD-MM-YYYY"
                            onChange={handleFromDateChange}
                            />
                    
                        <DatePicker 
                            label="To Date"
                            value={toDate}
                            sx={{ padding: 1, lineHeight: 20 }}
                            format="DD-MM-YYYY"
                            onChange={handleToDateChange}
                            />
                            
                        </div>
                        {/* </DemoContainer> */}
                        
                        </LocalizationProvider>
                        
                            
                        </Box>
                        </TableContainer>
            </Grid>
            
            </Grid>
            
            <Transactions showServiceTrans={filteredRows}  />
        </Layout>


    );
}
export default withAuth(TransactionHistory);

