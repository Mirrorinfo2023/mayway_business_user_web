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
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
 
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

function TransactionHistory(props) {

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 10,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 10,
  });
  
  
    const [showServiceTrans, setShowServiceTrans] = useState({});
    const dispatch = useDispatch();
    const router = useRouter();
    const { id } = router.query;

    const [category_name, setTitle] = useState('');
    const [description, setDescription] = useState('');
   
    let rows;

    if (showServiceTrans && showServiceTrans.length > 0) {
        rows = [
            ...showServiceTrans
        ];
    } else {
        rows = [];
    }

    useEffect(() => {
       
        const all_parameters = {
            "id": id
        };
        // const encryptedData = DataEncrypt(JSON.stringify(all_parameters));

        const getTnx = async () => {
        //   const reqData = {
        //     encReq: encryptedData
        //   };
          try {
            const response1 = await api.post('/api/graphics/get-category', all_parameters);
            if (response1.data.status === 200) {
                setTitle(response1.data.data.category_name);
                setDescription(response1.data.data.description);
             
            }
          } catch (error) {
            if (error?.response?.data?.error) {
              dispatch(callAlert({ message: error.response.data.error, type: 'FAILED' }));
            } else {
              dispatch(callAlert({ message: error.message, type: 'FAILED' }));
            }
          }
        };
    
        if (id) {
          getTnx();
        }
      }, [id, dispatch]);

    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleSubmit = async () => {
      
            const formData ={
                'id':id,
                'category_name':category_name,
                'description':description,
                'image': selectedFile,
            }

        try {
          
            const response = await api.post('/api/graphics/update-graphics-category', formData,{
                headers:{'content-type': 'multipart/form-data'}
            });
        
            if (response.data.status==200) {
                window.history.back();
                alert('Updated successfully');
            } else{
                alert("Failed to update");
            }

        } catch (error) {
            console.error('Error updating :', error);
        }
        
        };
          
        // const priorityhandleChange = (event) => {
        //     setpriority(event.target.value);
        // };
    
        const statushandleChange = (event) => {
            setstatus(event.target.value);
        };


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
                    <Typography variant="h5"  sx={{ padding: 2 }}>Graphics [Update] </Typography>
                </Box>
                </TableContainer>
            </Grid>
            
            
                <Grid item={true} xs={12}   >
                    <TableContainer component={Paper} >

                        <Box justifyContent={'space-between'} alignItems={'right'} mt={1} mb={1} style={{width: '50%', verticalAlign: 'top', padding: '0 10px'}} >
                            
                            <TextField required  fullWidth label="Category Name" variant="outlined" display={'inline-block'}
                            value={category_name} onChange={(e) => setTitle(e.target.value)}  />
                        </Box>

                   
                        <Box  justifyContent={'space-between'} alignItems={'right'} mt={3} ml={2} mb={0} style={{width: '50%', verticalAlign: 'top'}} >
                            
                            <TextareaAutosize  fullWidth
                                    label="Description" 
                                    minRows={3}
                                    size="normal"
                                    variant="outlined"
                                    placeholder="Enter Description" 
                                    style={{height: '90px', width:'968px', border: '1px solid #ced4da', borderRadius: '4px', padding: '10px' }}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                            /> 

                            
                        </Box>

                        <Box justifyContent="space-between" alignItems="center" mt={1} ml={2} mb={1} sx={{ width: '50%', verticalAlign: 'top' }}>
                                <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                                Upload file
                                <VisuallyHiddenInput type="file" onChange={(event) => handleFileChange(event)} />
                                </Button>
                                {selectedFile && (
                                <Typography variant="body2" sx={{ marginTop: 1 }}>
                                    {selectedFile.name}
                                </Typography>
                                )}
                        </Box>
              
                        <br /><br />
                        <Grid item>
                            <Box display="flex" justifyContent="flex-first" mr={2}  mt={1} ml={2} mb={1} >
                            <Button variant="contained" color="success" size="medium" onClick={handleSubmit}>
                                Update
                            </Button>
                            </Box>   
                        </Grid>
                        <br /><br />
                    </TableContainer>
                </Grid>
            </Grid>
        </Layout>


    );
}
export default withAuth(TransactionHistory);

