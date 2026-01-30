import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Divider,
} from '@mui/material';
import { Download, ArrowBack, Verified } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../api/axios';

const CertificateView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const certificateRef = useRef(null);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const response = await api.get(`/certificates/${id}`);
                setCertificate(response.data.data);
            } catch (error) {
                console.error('Error fetching certificate:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificate();
    }, [id]);

    const handleDownload = async () => {
        if (!certificateRef.current) return;
        setDownloading(true);

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate-${certificate.course.title}.pdf`);
        } catch (error) {
            console.error('Error downloading certificate:', error);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!certificate) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h5">Certificate not found</Typography>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/student/dashboard')}
                    >
                        Back to Dashboard
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Download />}
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? 'Generating PDF...' : 'Download PDF'}
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Paper
                        ref={certificateRef}
                        elevation={3}
                        sx={{
                            width: '297mm',
                            height: '210mm',
                            p: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            border: '20px solid #1a237e',
                            position: 'relative',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                        }}
                    >
                        {/* Decorative Elements */}
                        <Box sx={{ position: 'absolute', top: 20, left: 20, color: '#1a237e' }}>
                            <Verified sx={{ fontSize: 60, opacity: 0.2 }} />
                        </Box>
                        <Box sx={{ position: 'absolute', bottom: 20, right: 20, color: '#1a237e' }}>
                            <Verified sx={{ fontSize: 60, opacity: 0.2 }} />
                        </Box>

                        <Typography variant="h2" sx={{ fontFamily: 'serif', color: '#1a237e', mb: 4, fontWeight: 'bold' }}>
                            Certificate of Completion
                        </Typography>

                        <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
                            This is to certify that
                        </Typography>

                        <Typography variant="h3" sx={{ mb: 2, color: '#000', fontFamily: 'cursive', borderBottom: '2px solid #1a237e', px: 4, pb: 1 }}>
                            {certificate.student.name}
                        </Typography>

                        <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
                            has successfully completed the course
                        </Typography>

                        <Typography variant="h4" sx={{ mb: 4, color: '#1a237e', fontWeight: 'bold' }}>
                            {certificate.course.title}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 8, mt: 4 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body1" sx={{ borderTop: '1px solid #000', pt: 1, width: 200 }}>
                                    {new Date(certificate.issueDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Date Issued
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body1" sx={{ borderTop: '1px solid #000', pt: 1, width: 200 }}>
                                    {certificate.course.instructor?.name || 'Instructor'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Instructor
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, color: 'text.disabled' }}>
                            Certificate ID: {certificate.certificateId}
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default CertificateView;
