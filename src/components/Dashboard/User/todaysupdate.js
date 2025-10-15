import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Button,
    Collapse,
    IconButton,
    useTheme,
    useMediaQuery,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import {
    Share as ShareIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

// API Service for Today's Updates
const TodayUpdateService = {
    getTodayUpdate: async () => {
        try {
            // Replace with your actual API endpoint
            const response = await fetch('/api/today-update', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch today\'s update');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching today\'s update:', error);
            throw error;
        }
    }
};

// Main Today Update Widget Component
const TodayUpdateWidget = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateData, setUpdateData] = useState(null);

    // Mock data structure - replace with actual API response
    const mockData = {
        id: 1,
        shortText: '🎉 Welcome to Mayway Family, Dinesh Ji! 🙏',
        midText: 'Humein bahut khushi ho rahi hai ki Dinesh Singh Bohra ji from Haldwani, Uttarakhand se, sir ji ne Mayway Business me apna vishwas jataya, aur hamare safar me shamil hue. isliye mai Mayway family ki tarf se aapka Mayway business me welcome krta hu🤝✨',
        fullText: `Aapka yeh kadam sirf ek investment nahi, ek naye sapne ki shuruaat hai. 🌱
Mayway ek parivaar hai, jahan har ek member ki growth sabki zimmedari hai. 💼❤

💬 "Sapne wahi pure hote he, jinke peeche hausla ho aur saath ho ek strong system ka."

Dinesh ji, aapka welcome hai is safar me jahan har din ek naya mauka hai seekhne, badhne aur jeetne ka! 🚀

#WelcomeToMayway
#MaywayParivaar
#NewJourneyBegins
#TogetherWeGrow 🌟
#SuccessWithMayway`,
        imageUrl: '/assets/images/testing.jpg',
        createdAt: new Date().toISOString(),
        shareImageUrl: '/assets/images/testing.jpg'
    };

    useEffect(() => {
        loadTodayUpdate();
    }, []);

    const loadTodayUpdate = async () => {
        try {
            setLoading(true);
            setError(null);

            // Uncomment below line and remove mock data when API is ready
            // const data = await TodayUpdateService.getTodayUpdate();
            // setUpdateData(data);

            // Using mock data for now
            setTimeout(() => {
                setUpdateData(mockData);
                setLoading(false);
            }, 1000);

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            if (!updateData) return;

            const shareText = `${updateData.shortText}\n\n${updateData.fullText}`;

            if (navigator.share) {
                // For mobile devices with share API
                await navigator.share({
                    title: "Today's Update",
                    text: shareText,
                    url: window.location.href,
                });
            } else if (navigator.clipboard) {
                // For desktop - copy to clipboard
                await navigator.clipboard.writeText(shareText);
                // Show success message (you can use a snackbar or toast)
                alert('Update copied to clipboard!');
            } else {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Update copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Failed to share update');
        }
    };

    const handleShareWithImage = async () => {
        try {
            if (!updateData) return;

            const shareText = `${updateData.shortText}\n\n${updateData.fullText}`;

            if (navigator.share) {
                // For sharing with image (if supported)
                const files = [];
                if (updateData.shareImageUrl) {
                    // Convert image URL to File object (you might need to fetch the image first)
                    try {
                        const response = await fetch(updateData.shareImageUrl);
                        const blob = await response.blob();
                        const file = new File([blob], 'update-image.jpg', { type: blob.type });
                        files.push(file);
                    } catch (imgError) {
                        console.warn('Could not load image for sharing:', imgError);
                    }
                }

                await navigator.share({
                    title: "Today's Update",
                    text: shareText,
                    files: files.length > 0 ? files : undefined,
                    url: window.location.href,
                });
            } else {
                // Fallback to text-only share
                handleShare();
            }
        } catch (error) {
            console.error('Error sharing with image:', error);
            // Fallback to text-only share
            handleShare();
        }
    };

    if (loading) {
        return (
            <Card sx={{ p: 3, mb: 2 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                    <Typography variant="body1" sx={{ ml: 2 }}>
                        Loading today update...
                    </Typography>
                </Box>
            </Card>
        );
    }

    if (error) {
        return (
            <Card sx={{ p: 3, mb: 2 }}>
                <Alert severity="error" onClose={() => setError(null)}>
                    Failed to load today update: {error}
                </Alert>
                <Box display="flex" justifyContent="center" mt={2}>
                    <Button variant="contained" onClick={loadTodayUpdate}>
                        Retry
                    </Button>
                </Box>
            </Card>
        );
    }

    if (!updateData) {
        return (
            <Card sx={{ p: 3, mb: 2 }}>
                <Typography variant="body1" textAlign="center" color="text.secondary">
                    No updates available today.
                </Typography>
            </Card>
        );
    }

    return (
        <Card
            sx={{
                p: 3,
                mb: 2,
                background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEBCD 100%)',
                border: '2px solid #FFD700',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
        >
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 'bold',
                        color: '#8B4513',
                        background: 'linear-gradient(135deg, #8B4513, #FFD700)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent'
                    }}
                >
                    Today Update
                </Typography>
                <Button
                    startIcon={<ShareIcon />}
                    onClick={handleShareWithImage}
                    sx={{
                        color: '#8B4513',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: 'rgba(139, 69, 19, 0.1)'
                        }
                    }}
                >
                    Share Now
                </Button>
            </Box>

            {/* Image */}
            <Box display="flex" justifyContent="center" mb={3}>
                <Box
                    sx={{
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        borderRadius: 3,
                        overflow: 'hidden',
                        maxWidth: isMobile ? '100%' : 400,
                        width: '100%'
                    }}
                >
                    <Box
                        component="img"
                        src={updateData.imageUrl}
                        alt="Today's Update"
                        sx={{
                            width: '100%',
                            height: isMobile ? 250 : 350,
                            objectFit: 'cover',
                            display: 'block'
                        }}
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.target.style.display = 'none';
                        }}
                    />
                </Box>
            </Box>

            {/* Content */}
            <Box>
                {/* Short Text */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        color: '#8B4513',
                        textAlign: 'center'
                    }}
                >
                    {updateData.shortText}
                </Typography>

                {/* Mid Text */}
                <Typography
                    variant="body1"
                    sx={{
                        mb: 2,
                        color: '#8B4513',
                        lineHeight: 1.6
                    }}
                >
                    {updateData.midText}
                </Typography>

                {/* Full Text (Collapsible) */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Typography
                        variant="body1"
                        sx={{
                            mb: 2,
                            color: '#8B4513',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line'
                        }}
                    >
                        {updateData.fullText}
                    </Typography>
                </Collapse>

                {/* Action Buttons */}
                <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                    {/* Read More/Less Button */}
                    <Button
                        onClick={() => setIsExpanded(!isExpanded)}
                        endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{
                            color: '#1976d2',
                            fontWeight: 'bold'
                        }}
                    >
                        {isExpanded ? 'Show Less' : 'Read More'}
                    </Button>

                    {/* Divider */}
                    <Divider orientation="vertical" flexItem sx={{ mx: 2, height: 24 }} />

                    {/* Share Button */}
                    <Button
                        onClick={handleShareWithImage}
                        startIcon={<ShareIcon />}
                        sx={{
                            color: '#1976d2',
                            fontWeight: 'bold'
                        }}
                    >
                        Share Now
                    </Button>
                </Box>
            </Box>

            {/* Timestamp */}
            <Box mt={2} pt={2} borderTop="1px solid rgba(139, 69, 19, 0.2)">
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(139, 69, 19, 0.7)',
                        fontStyle: 'italic'
                    }}
                >
                    Updated on {new Date(updateData.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Typography>
            </Box>
        </Card>
    );
};

export default TodayUpdateWidget;

// Optional: If you want to use this component in your dashboard
export const TodayUpdateSection = () => {
    return (
        <Box sx={{ mb: 3 }}>
            <TodayUpdateWidget />
        </Box>
    );
};