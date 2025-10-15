"use client"
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import api from "../../utils/api";
import withAuth from "../../utils/withAuth";
import { callAlert } from "../../redux/actions/alert";
import Layout from "@/components/Dashboard/layout";
import { Grid,Paper,TableContainer, FormControl, InputLabel, Select, MenuItem,Button } from "@mui/material";
import { Typography,Divider,Box,TextField} from "@mui/material";
import { useRouter } from 'next/router';

function TransactionHistory(props) {
  
    const [showServiceTrans, setShowServiceTrans] = useState({});
    const dispatch = useDispatch();
    const router = useRouter();
    const { panel_id } = router.query;

    const [service_name, setservice_name] = useState('');
    const [service_short_name, setservice_short_name] = useState('');
    const [priority, setpriority] = useState('');
    const [status, setstatus] = useState('');
    const [isCashback, setisCashback] = useState('');
    const [data, setData] = useState('');
    const [operator, setOperator] = useState([]);

    let rows;

    if (showServiceTrans && showServiceTrans.length > 0) {
        rows = [
            ...showServiceTrans
        ];
    } else {
        rows = [];
    }

    useEffect(() => {
        const getTnx = async () => {
          const reqData = {
            "panel_id": panel_id
          };

          // const originalString = 'Hello, World!';
          // const encryptedData = DataEncrypt(JSON.stringify(originalString));
          // console.log(encryptedData);
          // const decryptedObject = DataDecrypt(encryptedData);
          // console.log(decryptedObject);
          try {
            const response = await api.post('/api/setting1/get-panel', reqData);
            if (response.status === 200) {
                setservice_name(response.data.data.service_name);
                setservice_short_name(response.data.data.short_name);
                setpriority(response.data.data.priority);
                setstatus(response.data.data.status);
                setisCashback(response.data.data.is_cashback);
                setData(response.data.operators);
            }
          } catch (error) {
            if (error?.response?.data?.error) {
              dispatch(callAlert({ message: error.response.data.error, type: 'FAILED' }));
            } else {
              dispatch(callAlert({ message: error.message, type: 'FAILED' }));
            }
          }
        };
    
        if (panel_id) {
          getTnx();
        }
        if (Array.isArray(data)) {
            const previousOperator = data.filter(d => d.active_status === 1).map(d => d.id);
            setOperator(previousOperator);
          } else {
            console.error('Data is not an array:', data);
          }

      }, [panel_id, dispatch, data]);

    const handleSubmit = async () => {
        // alert(status);
        
            // const formData = new FormData();
            // formData.append('img', selectedFile);
            // formData.append('title', title);
            // formData.append('categoryId',transactionType);

            const formData ={
                'panel_id': panel_id,
                'status': status,
                'priority': priority,
                'is_cashback': isCashback,
                'operator_ids': operator
            }

        try {
            const response = await api.post("/api/setting1/bbpsrecharge-panel", formData);
            
            if (response) {
                alert('Updated successfully');
                window.history.back();
            } 

        } catch (error) {
            console.error('Error updating :', error);
        }
        
        };
          
        const priorityhandleChange = (event) => {
            setpriority(event.target.value);
        };
    
        const statushandleChange = (event) => {
            setstatus(event.target.value);
        };

        const cashbackhandleChange = (event) => {
            setisCashback(event.target.value);
        };


        function ListItem({ item, operator, setOperator }) {
          const [isOn, setIsOn] = useState(item.active_status === 1);

          const toggleSwitch = () => {
              setIsOn(!isOn);
            };
          const handleCheckboxChange = () => {
            const updatedOperator = [...operator]; // Create a copy of the operator array
            const index = updatedOperator.indexOf(item.id); // Check if the item is already in the array
            //setIsOn(!isOn);
            // if (index === -1) {
            //   // If the item is not in the array, add it
            //   updatedOperator.push(item.id);
            //   //setIsOn(true); // Set the checkbox state to checked
            // } else {
            //   // If the item is already in the array, remove it
            //   updatedOperator.splice(index, 1);
            //   //setIsOn(false); // Set the checkbox state to unchecked
            // }

            // Update the state with the updated array
            //setOperator(updatedOperator);
            toggleSwitch();
          };
        
          return (
            <div>
              <span className="operator_name">{item.operator_name}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  value={item.id}
                  checked={isOn}
                  onChange={handleCheckboxChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
          );
        }
          
        function List({ data, operator, setOperator }) {
          if (!data || data.length === 0) {
              return <div>No items to display</div>;
            }
          return (
            <div>
              {data.map((item, index)  => (
                <ListItem key={index} item={item} operator={operator} setOperator={setOperator} style={{padding: '5px', display: 'inline-block', width: '100%'}} />
              ))}
            </div>
          );
        }


        //   const data = [
        //     { id: 1, name: 'Item 1' },
        //     { id: 2, name: 'Item 2' },
        //     { id: 3, name: 'Item 3' },
        //   ];
          console.log(operator);

    return (

        <Layout>
            <Grid
                container
                spacing={4}
                sx={{ padding: 2 }}
            >
            <br/><br/>
            <Grid item={true} xs={12}   >
              <TableContainer component={Paper} >
                <Box display={'inline-block'} justifyContent={'space-between'} alignItems={'right'} mt={1} mb={1} style={{width: '40%', verticalAlign: 'top'}} >
                    <Typography variant="h5"  sx={{ padding: 2 }}>BBPS Panel [Update] </Typography>
                </Box>
                </TableContainer>
            </Grid>
            
            
                <Grid item={true} xs={12}   >
                    <TableContainer component={Paper} >

                        <Box justifyContent={'space-between'} alignItems={'right'} mt={1} mb={1} style={{width: '50%', verticalAlign: 'top', padding: '0 10px'}} >
                            
                            <TextField required  fullWidth label="Service Name" variant="outlined" display={'inline-block'}
                            value={service_name}  />
                        </Box>
                        <br />
                        <Box justifyContent={'space-between'} alignItems={'right'} mt={1} mb={1} style={{width: '50%', verticalAlign: 'top', padding: '0 10px'}} >
                            
                            <TextField required  fullWidth label="Service Short Name" variant="outlined" display={'inline-block'}
                            value={service_short_name}  />
                        </Box>
                        <br />
                        <Box justifyContent={'space-between'} alignItems={'right'} mt={1} mb={1} style={{width: '50%', verticalAlign: 'top', padding: '0 10px'}} >

                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Priority</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={priority}
                                label="Priority"
                                onChange={priorityhandleChange}
                            >
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                            </Select>
                        </FormControl>
                        </Box>
                        <br />
                        <Box justifyContent={'space-between'} alignItems={'right'} mt={1} mb={1} style={{width: '50%', verticalAlign: 'top', padding: '0 10px'}} >
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Status</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={status}
                                label="Status"
                                onChange={statushandleChange}
                            >
                                <MenuItem value={1}>Active</MenuItem>
                                <MenuItem value={0}>Inactive</MenuItem>
                            </Select>
                        </FormControl>
                        
                        </Box><br/>

                        <Box justifyContent={'space-between'} alignItems={'right'} mt={1} mb={1} style={{width: '50%', verticalAlign: 'top', padding: '0 10px'}} >
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Is Cashback Services</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={isCashback}
                                label="Status"
                                onChange={cashbackhandleChange}
                            >
                                <MenuItem value={1}>Active</MenuItem>
                                <MenuItem value={0}>Inactive</MenuItem>
                            </Select>
                        </FormControl>

                        </Box>
                        {/* <Box justifyContent={'space-between'} alignItems={'right'} mt={1} mb={1} style={{width: '50%', verticalAlign: 'top', padding: '0 10px'}}>
                            <Typography variant="h6"  style={{fontSize: '18px', margin: '10px 0'}}>Select Operator </Typography>
                            <List data={data} operator={operator} setOperator={setOperator} />
                        </Box> */}

                        <br /><br />
                        <Grid item>
                            <Box display="flex" justifyContent="flex-first" mr={2}  mt={1} ml={2} mb={1} >
                            <Button variant="contained" color="success" size="medium" onClick={handleSubmit}>
                                Update
                            </Button>
                            </Box>   
                        </Grid>
                        <br /><br /><br /><br /><br />
                    </TableContainer>
                </Grid>
            </Grid>
        </Layout>


    );
}
export default withAuth(TransactionHistory);

