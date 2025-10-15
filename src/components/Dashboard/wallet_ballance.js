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

// Mock data - replace with actual API calls
const mockUserData = {
    profilePic: '',
    firstName: 'John',
    lastName: 'Doe',
    mobile: '9876543210',
    mlmId: 'MR123456',
    walletBalance: '2500.00',
    cashbackWallet: '150.00'
};

const mockEarningsData = {
    totalEarning: '15,250.00',
    todayIncome: '1,250.00',
    graphData: [
        { rank: '5th' }
    ]
};

const mockInvestmentData = [
    {
        amount: '10,000',
        total_earning: '2,500',
        total_remaining: '7,500',
        multiplier: 1.5
    },
    {
        amount: '5,000',
        total_earning: '1,200',
        total_remaining: '3,800',
        multiplier: 1.2
    }
];

const serviceList = [
    {
        title: 'Activation',
        imageUrl: '/assets/activation.png',
        functions: '/id-activation'
    },
    {
        title: 'Business',
        imageUrl: '/assets/business.png',
        functions: '/business-dashboard'
    },
    {
        title: 'History',
        imageUrl: '/assets/history.png',
        functions: '/income-passbook'
    }
];

// Simple Pie Chart Component using SVG
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

// Investment Card Component
const InvestmentCardWidget = () => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setLoading] = useState(true);
    const [showNoData, setShowNoData] = useState(false);
    const [earnings, setEarnings] = useState([]);
    const [multiplier, setMultiplier] = useState(0);

    useEffect(() => {
        loadEarnings();

        // Show no data after 5 seconds if empty
        const timer = setTimeout(() => {
            if (earnings.length === 0) {
                setShowNoData(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const loadEarnings = async () => {
        try {
            // Replace with actual API call
            setTimeout(() => {
                setEarnings(mockInvestmentData);
                setMultiplier(1.5);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error loading earnings:', error);
            setLoading(false);
        }
    };

    const buildColumn = (value, label) => (
        <Box sx={{ flex: 1 }}>
            <Card
                elevation={10}
                sx={{
                    p: 1,
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    borderRadius: 2,
                    textAlign: 'center'
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        color: '#8B4513',
                        fontSize: '1rem',
                        mb: 0.5
                    }}
                >
                    {value}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 800,
                        color: '#8B4513',
                        fontSize: '0.75rem'
                    }}
                >
                    {label}
                </Typography>
            </Card>
        </Box>
    );

    const buildRemainingColumn = (value, label, multiplier) => (
        <Box sx={{ flex: 1, position: 'relative' }}>
            <Card
                elevation={10}
                sx={{
                    p: 1,
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    borderRadius: 2,
                    textAlign: 'center'
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        color: '#8B4513',
                        fontSize: '1rem',
                        mb: 0.5
                    }}
                >
                    {value || '0'}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 800,
                        color: '#8B4513',
                        fontSize: '0.75rem'
                    }}
                >
                    {label || 'No Label'}
                </Typography>
            </Card>

            {/* Multiplier Badge */}
            <Chip
                label={`${multiplier?.toFixed(1) || '0'}x`}
                size="small"
                sx={{
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    bgcolor: '#8B4513',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.6rem',
                    height: '20px',
                    minWidth: '30px'
                }}
            />
        </Box>
    );

    if (isLoading) {
        return <InvestmentCardShimmer />;
    }

    if (showNoData && earnings.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" color="text.secondary">
                    No investment data available
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {earnings.map((data, index) => {
                const isExpanded = selectedIndex === index;
                const chartData = [
                    {
                        title: 'Earnings',
                        value: parseFloat(data.total_earning.replace(',', '')),
                        color: '#FFD700'
                    },
                    {
                        title: 'Remaining',
                        value: parseFloat(data.total_remaining.replace(',', '')),
                        color: '#FFA500'
                    },
                ];

                return (
                    <Box key={index} sx={{ mb: 2 }}>
                        <Card
                            sx={{
                                p: 1,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            onClick={() => setSelectedIndex(isExpanded ? -1 : index)}
                        >
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {buildColumn(`₹${data.amount}`, 'Investment')}
                                {buildColumn(`₹${data.total_earning}`, 'Returns')}
                                {buildRemainingColumn(
                                    `₹${data.total_remaining}`,
                                    'Remaining',
                                    multiplier
                                )}
                            </Box>
                        </Card>

                        {isExpanded && (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <SimplePieChart data={chartData} size={120} />
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                                    {chartData.map((item, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    bgcolor: item.color,
                                                    borderRadius: '50%'
                                                }}
                                            />
                                            <Typography variant="caption">
                                                {item.title}: {((item.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

// Investment Card Shimmer Component
const InvestmentCardShimmer = () => (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {[1, 2, 3].map((item) => (
            <Box key={item} sx={{ flex: 1 }}>
                <Card sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box
                            sx={{
                                height: 20,
                                bgcolor: 'grey.300',
                                borderRadius: 1
                            }}
                        />
                        <Box
                            sx={{
                                height: 16,
                                bgcolor: 'grey.200',
                                borderRadius: 1
                            }}
                        />
                    </Box>
                </Card>
            </Box>
        ))}
    </Box>
);

// Service Button Component
const MirrorServiceButton = ({ title, assetFile, onPress }) => (
    <Button
        onClick={onPress}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 'auto',
            p: 1
        }}
    >
        {/* Fallback icon if image not available */}
        <Box
            sx={{
                width: 40,
                height: 40,
                mb: 1,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}
        >
            {title === 'Activation' && <LockIcon />}
            {title === 'Business' && <BusinessIcon />}
            {title === 'History' && <HistoryIcon />}
        </Box>
        <Typography
            variant="caption"
            sx={{
                fontWeight: 600,
                color: 'white',
                textAlign: 'center'
            }}
        >
            {title}
        </Typography>
    </Button>
);

// Main Wallet Balance Component
const WalletBalanceWidget = () => {
    const theme = useTheme();
    const router = useRouter();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [userData, setUserData] = useState(mockUserData);
    const [earningsData, setEarningsData] = useState(mockEarningsData);
    const [pieChartData, setPieChartData] = useState([
        { title: 'Earnings', value: 1250, color: '#FFD700' },
        { title: 'Expenses', value: 750, color: '#FFA500' },
    ]);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Mirror Hub',
                text: 'Check out Mirror Hub!',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            // Show snackbar for copied to clipboard
            console.log('Link copied to clipboard');
        }
    };

    const handleServicePress = (functionPath) => {
        switch (functionPath) {
            case '/id-activation':
                // Navigate to ID Activation page
                router.push('/id-activation');
                break;
            case '/business-dashboard':
                // Navigate to Business Dashboard
                router.push('/business-dashboard');
                break;
            case '/income-passbook':
                // Navigate to Income Passbook (History)
                router.push('/income-passbook');
                break;
            default:
                console.log('Coming soon feature');
                break;
        }
    };

    return (
        <Box sx={{ px: 1.25, py: 2 }}>
            {/* User Profile Section */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Avatar
                    src="/mayway.jpg"
                    sx={{
                        // Base size for mobile
                        width: { xs: 55, sm: 50, md: 55, lg: 90 },
                        height: { xs: 55, sm: 50, md: 55, lg: 90 },

                        // Responsive border
                        border: {
                            xs: '1.5px solid #FFD700',
                            sm: '2px solid #FFD700',
                            md: '2px solid #FFD700'
                        },

                        // Border radius
                        borderRadius: '50%',

                        // Background
                        bgcolor: 'transparent',

                        // Image styling
                        '& img': {
                            objectFit: 'contain',
                            width: '100%',
                            height: '100%'
                        },

                        // Responsive spacing
                        marginRight: { xs: 1, sm: 2 },

                        // Hover effect
                        '&:hover': {
                            transform: { xs: 'scale(1.05)', sm: 'scale(1.1)' },
                            transition: 'transform 0.3s ease',
                            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
                        }
                    }}
                    onError={(e) => {
                        // Fallback if logo doesn't load
                        e.target.style.display = 'none';
                        const fallback = e.target.nextSibling;
                        if (fallback) {
                            fallback.style.display = 'flex';
                            fallback.innerHTML = 'M';
                        }
                    }}
                >
                    {/* Fallback content */}
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            color: '#8B4513',
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem' },
                            borderRadius: '50%'
                        }}
                    >
                        M
                    </Box>
                </Avatar>

                <Box sx={{ flex: 1 }}>
                    {/* Greeting */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #101A33, #FFD700)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            cursor: 'pointer'
                        }}
                        onClick={() => router.push('/marketing-dashboard')}
                    >
                        {greeting()}...
                    </Typography>

                    {/* Full Name */}
                    <Box
                        sx={{
                            maxWidth: 250,
                            cursor: 'pointer'
                        }}
                        onClick={() => router.push('/marketing-dashboard')}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #101A33, #618DEC)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                fontSize: '1.3rem'
                            }}
                        >
                            {userData.firstName} {userData.lastName}..!
                        </Typography>
                    </Box>

                    {/* Mobile & MLM ID */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'grey.600' }} />
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'grey.800',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {userData.mobile} | {userData.mlmId}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Share Now Button */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    cursor: 'pointer'
                }}
                onClick={handleShare}
            >
                <Typography
                    variant="body1"
                    sx={{
                        color: 'primary.main',
                        fontWeight: 600
                    }}
                >
                    Share Now
                </Typography>
            </Box>

            {/* Investment Cards */}
            <InvestmentCardWidget />

            <Box sx={{ height: 10 }} />

            <Divider />

            <Box sx={{ height: 10 }} />

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
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#8B4513' }}>
                                        ₹{earningsData.totalEarning}
                                    </Typography>
                                </Box>

                                <Divider orientation="vertical" flexItem />

                                {/* Today's Earning */}
                                <Box
                                    sx={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => router.push('/income-passbook')}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#8B4513' }}>
                                        Today's Earning
                                    </Typography>
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
                                </Box>
                            </Box>

                            <Box sx={{ height: 20 }} />
                        </Box>

                        {/* Pie Chart */}
                        {pieChartData.length > 0 && (
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

            <Box sx={{ height: 15 }} />

            <Divider />

            <Box sx={{ height: 10 }} />

            {/* Services Card */}
            <Card
                sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: `2px solid #FFD700`,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    {serviceList.map((service, index) => (
                        <MirrorServiceButton
                            key={index}
                            title={service.title}
                            assetFile={service.imageUrl}
                            onPress={() => handleServicePress(service.functions)}
                        />
                    ))}
                </Box>
            </Card>

            <Box sx={{ height: 15 }} />

            <Divider sx={{ height: 2 }} />
        </Box>
    );
};

export default WalletBalanceWidget;