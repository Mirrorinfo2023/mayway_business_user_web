import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Divider,
    Button,
    useTheme,
    useMediaQuery,
    CircularProgress,
    Chip,
    Stack,
    Paper,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    CardGiftcard as GiftIcon,
    Share as ShareIcon,
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    AccountBalanceWallet as WalletIcon,
    Groups as GroupsIcon,
    EmojiEvents as RewardsIcon,
    PieChart as PieChartIcon,
    Lock as LockIcon,
    History as HistoryIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

import api from "../../../utils/api";

import { DataEncrypt, DataDecrypt } from '../../../utils/encryption';

// Service Button Component
const MirrorServiceButton = ({ title, onPress }) => (
    <Button
        onClick={onPress}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 1.5,
            minWidth: 80,
            borderRadius: 2,
            backgroundColor: '#FFD700',
            color: '#8B4513',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            '&:hover': {
                backgroundColor: '#FFC107',
            },
        }}
    >
        <Box
            sx={{
                width: 50,
                height: 50,
                mb: 1,
                bgcolor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8B4513',
            }}
        >
            {title === 'Activation' && <LockIcon />}
            {title === 'Business' && <BusinessIcon />}
            {title === 'History' && <HistoryIcon />}
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center' }}>
            {title}
        </Typography>
    </Button>
);

// Single Investment Row Card
const InvestmentRow = ({ data, multiplier }) => {
    const buildCard = (title, value, showMultiplier = false) => (
        <Card
            sx={{
                flex: 1,
                p: .1,
                textAlign: 'center',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                position: 'relative',
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#8B4513', mb: 0.1 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#8B4513' }}>
                {title}
            </Typography>

            {showMultiplier && (
                <Chip
                    label={`${multiplier}x`}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: -1,
                        left: -1,
                        bgcolor: '#8B4513',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.65rem',
                        height: '18px',
                        minWidth: '28px',
                    }}
                />
            )}
        </Card>
    );

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {buildCard('Investment', `₹${data.amount}`)}
            {buildCard('Returns', `₹${data.total_earning}`)}
            {buildCard('Remaining', `₹${data.total_remaining}`, true)}
        </Box>
    );
};

// Simple Pie Chart Component
const SimplePieChart = ({ data, size = 100 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
        <Box sx={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {data.map((item, index) => {
                    const percentage = (item.value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const largeArcFlag = angle > 180 ? 1 : 0;

                    const x1 = size / 2 + (size / 2) * Math.cos(currentAngle * Math.PI / 180);
                    const y1 = size / 2 + (size / 2) * Math.sin(currentAngle * Math.PI / 180);

                    const x2 = size / 2 + (size / 2) * Math.cos((currentAngle + angle) * Math.PI / 180);
                    const y2 = size / 2 + (size / 2) * Math.sin((currentAngle + angle) * Math.PI / 180);

                    const pathData = [
                        `M ${size / 2} ${size / 2}`,
                        `L ${x1} ${y1}`,
                        `A ${size / 2} ${size / 2} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');

                    const segment = (
                        <path
                            key={index}
                            d={pathData}
                            fill={item.color}
                            stroke="#fff"
                            strokeWidth="2"
                        />
                    );

                    currentAngle += angle;
                    return segment;
                })}
            </svg>

            {/* Center text */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}
            >
                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '10px' }}>
                    Total
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                    {total}
                </Typography>
            </Box>
        </Box>
    );
};


// Wallet Balance Widget
const WalletBalanceWidget = () => {
    const router = useRouter();
    const [userData, setUserData] = useState({
        firstName: sessionStorage.getItem('first_name') || '',
        lastName: sessionStorage.getItem('last_name') || '',
        mobile: sessionStorage.getItem('mobile') || '',
        mlmId: sessionStorage.getItem('mlm_id') || '',
    });

    const [investments, setInvestments] = useState([]);
    const [multiplier, setMultiplier] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [earningsData, setEarningsData] = useState({
        totalEarning: '0.00',
        todayIncome: '0.00'
    });
    const [pieChartData, setPieChartData] = useState([]);
    const [walletLoading, setWalletLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchInvestments(),
                    fetchWalletData()
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchInvestments = async () => {
        try {
            const userId = sessionStorage.getItem('id');
            if (!userId) throw new Error('User ID not found');

            const res = await api.post('/api/refferal-report/user-earning', { user_id: userId });

            if (res.data.status === 200 && Array.isArray(res.data.data)) {
                setInvestments(res.data.data);
                setMultiplier(res.data.multiplier || 0);
            } else {
                setInvestments([]);
                setMultiplier(0);
            }
        } catch (error) {
            console.error('Error fetching investment data:', error);
            setInvestments([]);
            setMultiplier(0);
        }
    };


    const fetchWalletData = async () => {
        try {
            const userId = sessionStorage.getItem('id');
            if (!userId) {
                console.error('User ID not found in sessionStorage');
                return;
            }

            // Encrypt the request payload
            const encryptedPayload = DataEncrypt(JSON.stringify({ user_id: userId }));

            // Send POST request with encrypted payload
            const response = await api.post('/api/wallet/e1af0d84d643e7c955bee1ee6d03a8b9a88a07fd', { encReq: encryptedPayload });
            console.log("response ", response)
            const decryptedData = DataDecrypt(response.data);
            console.log("decryptedData ", decryptedData)
            if (decryptedData) {
                // Decrypt the response data

                if (!decryptedData) {
                    console.error('Failed to decrypt wallet data');
                    setDefaultEarnings();
                    return;
                }

                const walletData = decryptedData

                if (walletData.status === 200) {
                    const { total_earning, today_income, walletBalance, cashbackBalance, primeBalance, affiliateBalance, voucher, rank, affiliateIncome, epinWalletBalance, is_portfolio } = walletData;

                    // Format numbers
                    const formatValue = (val) => (typeof val === 'number' ? val.toLocaleString() : parseFloat(val || 0).toLocaleString());

                    setEarningsData({
                        totalEarning: formatValue(total_earning),
                        todayIncome: formatValue(today_income),
                    });

                    setPieChartData([
                        { title: 'Total Earning', value: parseFloat(total_earning) || 0, color: '#FFD700' },
                        { title: "Today's Earning", value: parseFloat(today_income) || 0, color: '#FFA500' },
                    ]);

                    // // Optional: set other wallet balances
                    // setWalletBalances({
                    //     walletBalance,
                    //     cashbackBalance,
                    //     primeBalance,
                    //     affiliateBalance,
                    //     voucher,
                    //     rank,
                    //     affiliateIncome,
                    //     epinWalletBalance,
                    //     is_portfolio,
                    // });
                } else {
                    console.error('Error fetching wallet:', walletData.message);
                    setDefaultEarnings();
                }
            } else {
                console.error('No data received from wallet API');
                setDefaultEarnings();
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            setDefaultEarnings();
        } finally {
            setWalletLoading(false);
        }
    };


    const setDefaultEarnings = () => {
        setEarningsData({
            totalEarning: '0.00',
            todayIncome: '0.00'
        });
        setPieChartData([
            { title: 'Total Earning', value: 0, color: '#FFD700' },
            { title: "Today's Earning", value: 0, color: '#FFA500' },
        ]);
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const serviceList = [
        { title: 'Activation', functions: '/id-activation' },
        { title: 'Business', functions: '/business-dashboard' },
        { title: 'History', functions: '/income-passbook' },
    ];

    const handleServicePress = (path) => router.push(path);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ px: 2, py: 2 }}>
            {/* User Profile */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', // optional, aligns content to left
                    gap: 13, // increase gap between avatar and details
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: '#f5f5f5',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    mb: 2,
                }}
            >
                <Avatar src="/mayway.jpg" sx={{ width: 60, height: 60 }} />
                <Box sx={{ ml: 1 }}> {/* optional extra spacing */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {greeting()}...
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {userData.firstName} {userData.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.700', display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        {userData.mobile} | {userData.mlmId}
                    </Typography>
                </Box>
            </Box>


            {/* Investments */}
            {investments.length > 0 ? (
                investments.map((inv, idx) => (
                    <InvestmentRow key={idx} data={inv} multiplier={multiplier} />
                ))
            ) : (
                <Typography sx={{ textAlign: 'center', py: 2, color: 'grey.600' }}>
                    No investment data available
                </Typography>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Earnings Card */}
            <Card
                sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '2px solid #FFD700'
                }}
            >
                <Stack spacing={2}>
                    {/* Earnings Row */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ height: 16 }} />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {/* Total Earning */}
                                <Box
                                    sx={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => router.push('/income-passbook')}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#8B4513' }}>
                                        Total Earning
                                    </Typography>
                                    {walletLoading ? (
                                        <CircularProgress size={20} sx={{ color: '#8B4513' }} />
                                    ) : (
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#8B4513' }}>
                                            ₹{earningsData.totalEarning}
                                        </Typography>
                                    )}
                                </Box>

                                <Divider orientation="vertical" flexItem />

                                {/* Today's Earning */}
                                <Box
                                    sx={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => router.push('/income-passbook')}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#8B4513' }}>
                                        Today Earning
                                    </Typography>
                                    {walletLoading ? (
                                        <CircularProgress size={20} sx={{ color: '#8B4513' }} />
                                    ) : (
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                color: '#8B4513'
                                            }}
                                        >
                                            ₹{earningsData.todayIncome}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <Box sx={{ height: 20 }} />
                        </Box>

                        {/* Pie Chart */}
                        {pieChartData.length > 0 && !walletLoading && (
                            <Box
                                sx={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <SimplePieChart data={pieChartData} size={80} />
                            </Box>
                        )}
                    </Box>

                    {/* Action Buttons Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Refer Now Button */}
                        <Button
                            variant="contained"
                            startIcon={<GiftIcon />}
                            sx={{
                                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                                borderRadius: 8,
                                px: 3,
                                py: 1,
                                minWidth: 140,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
                                }
                            }}
                            onClick={() => router.push('/refer')}
                        >
                            Refer Now
                        </Button>

                        {/* ID Activation */}
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                color: '#8B4513'
                            }}
                            onClick={() => router.push('/id-activation')}
                        >
                            Id Activation &gt;&gt;&gt;
                        </Typography>
                    </Box>

                    <Box sx={{ height: 20 }} />

                    {/* My Rewards Card */}
                    <Card
                        sx={{
                            p: 2,
                            bgcolor: 'white',
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: '1px solid #FFD700'
                        }}
                        onClick={() => router.push('/income-passbook')}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    bgcolor: '#FFD700',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <GiftIcon sx={{ color: '#8B4513', fontSize: 20 }} />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#8B4513' }}>
                                    My Rewards !!
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#8B4513' }}>
                                    Start Refer And Get More Exciting Rewards &gt;
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                </Stack>
            </Card>

            <Box
                sx={{
                    backgroundColor: '#f5f5f5', // Container background
                    p: 4, // Padding around all blocks
                    borderRadius: 3,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    justifyContent: 'center',
                    mt: 4,
                }}
            >
                {serviceList.map((service, index) => (
                    <Paper
                        key={index}
                        onClick={() => handleServicePress(service.functions)}
                        sx={{
                            p: 3,
                            minWidth: 140,
                            maxWidth: 160,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: '#ffffff',
                            borderRadius: 2,
                            boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: '#e0f7fa', // Light blue on hover
                                transform: 'translateY(-5px) scale(1.05)',
                                boxShadow: '0px 8px 20px rgba(0,0,0,0.2)',
                            },
                        }}
                    >
                        {/* Optional: add an icon here */}
                        {/* <Icon sx={{ fontSize: 40, color: '#00acc1', mb: 1 }} /> */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {service.title}
                        </Typography>
                    </Paper>
                ))}
            </Box>


        </Box>
    );
};

export default WalletBalanceWidget;