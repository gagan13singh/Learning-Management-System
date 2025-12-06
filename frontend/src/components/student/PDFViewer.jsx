import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    Box,
    IconButton,
    Typography,
    Toolbar,
    Tooltip,
    ButtonGroup,
    Button,
    TextField,
    Divider,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    ZoomIn,
    ZoomOut,
    NavigateBefore,
    NavigateNext,
    Fullscreen,
    FullscreenExit,
    Download,
    Print,
    FitScreen,
    Highlight,
    Edit,
    Create,
} from '@mui/icons-material';
import { saveAs } from 'file-saver';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ pdfUrl, lectureTitle, userName, isFullscreenProp = false, onToggleFullscreen }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(isFullscreenProp);
    const [loading, setLoading] = useState(true);
    const [pageInput, setPageInput] = useState('1');
    const [annotations, setAnnotations] = useState({});
    const [annotationMode, setAnnotationMode] = useState(null); // 'highlight', 'text', 'draw'
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState(null);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Load annotations from localStorage
    useEffect(() => {
        const savedAnnotations = localStorage.getItem(`pdf-annotations-${pdfUrl}`);
        if (savedAnnotations) {
            setAnnotations(JSON.parse(savedAnnotations));
        }
    }, [pdfUrl]);

    // Save annotations to localStorage
    const saveAnnotations = (newAnnotations) => {
        setAnnotations(newAnnotations);
        localStorage.setItem(`pdf-annotations-${pdfUrl}`, JSON.stringify(newAnnotations));
    };

    useEffect(() => {
        setIsFullscreen(isFullscreenProp);
    }, [isFullscreenProp]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const changePage = (offset) => {
        setPageNumber((prevPageNumber) => {
            const newPage = prevPageNumber + offset;
            if (newPage >= 1 && newPage <= numPages) {
                setPageInput(String(newPage));
                return newPage;
            }
            return prevPageNumber;
        });
    };

    const goToPage = (page) => {
        const pageNum = parseInt(page, 10);
        if (pageNum >= 1 && pageNum <= numPages) {
            setPageNumber(pageNum);
            setPageInput(String(pageNum));
        }
    };

    const handleZoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
    };

    const handleZoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
    };

    const handleFitToWidth = () => {
        setScale(1.0);
    };

    const toggleFullscreen = () => {
        const newFullscreen = !isFullscreen;
        setIsFullscreen(newFullscreen);
        if (onToggleFullscreen) {
            onToggleFullscreen(newFullscreen);
        }
    };

    const handleDownload = async () => {
        try {
            saveAs(pdfUrl, `${lectureTitle}.pdf`);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const handlePrint = () => {
        window.open(pdfUrl, '_blank');
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === '=') {
                e.preventDefault();
                handleZoomIn();
            } else if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                handleZoomOut();
            } else if (e.key === 'ArrowLeft') {
                changePage(-1);
            } else if (e.key === 'ArrowRight') {
                changePage(1);
            } else if (e.key === 'Home') {
                goToPage(1);
            } else if (e.key === 'End') {
                goToPage(numPages);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [numPages]);

    // Annotation handlers
    const handleMouseDown = (e) => {
        if (!annotationMode) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (annotationMode === 'draw') {
            setIsDrawing(true);
            setDrawStart({ x, y });
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || annotationMode !== 'draw') return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Draw line on canvas
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && drawStart) {
            ctx.strokeStyle = '#FF5722';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drawStart.x, drawStart.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            setDrawStart({ x, y });
        }
    };

    const handleMouseUp = (e) => {
        if (annotationMode === 'draw') {
            setIsDrawing(false);
            // Save drawing to annotations
            const canvas = canvasRef.current;
            if (canvas) {
                const imageData = canvas.toDataURL();
                const newAnnotations = {
                    ...annotations,
                    [pageNumber]: {
                        ...(annotations[pageNumber] || {}),
                        drawings: [...(annotations[pageNumber]?.drawings || []), imageData]
                    }
                };
                saveAnnotations(newAnnotations);
            }
        }
    };

    const handleHighlight = () => {
        setAnnotationMode(annotationMode === 'highlight' ? null : 'highlight');
    };

    const handleTextAnnotation = () => {
        setAnnotationMode(annotationMode === 'text' ? null : 'text');
    };

    const handleDraw = () => {
        setAnnotationMode(annotationMode === 'draw' ? null : 'draw');
    };

    const clearAnnotations = () => {
        if (window.confirm('Clear all annotations on this page?')) {
            const newAnnotations = { ...annotations };
            delete newAnnotations[pageNumber];
            saveAnnotations(newAnnotations);

            // Clear canvas
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? 0 : 'auto',
                left: isFullscreen ? 0 : 'auto',
                right: isFullscreen ? 0 : 'auto',
                bottom: isFullscreen ? 0 : 'auto',
                zIndex: isFullscreen ? 9999 : 'auto',
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                height: isFullscreen ? '100vh' : '70vh',
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Watermark Overlay (only in fullscreen) */}
            {isFullscreen && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        opacity: 0.15,
                        zIndex: 10,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignContent: 'space-around',
                        justifyContent: 'space-around',
                        transform: 'rotate(-30deg)',
                    }}
                >
                    {Array.from({ length: 20 }).map((_, i) => (
                        <Typography
                            key={i}
                            sx={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'text.primary',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {userName} - {new Date().toLocaleDateString()}
                        </Typography>
                    ))}
                </Box>
            )}

            {/* Toolbar */}
            <Paper elevation={2} sx={{ borderRadius: 0 }}>
                <Toolbar sx={{ gap: 1, flexWrap: 'wrap', minHeight: 64 }}>
                    {/* Page Navigation */}
                    <ButtonGroup size="small" variant="outlined">
                        <Tooltip title="Previous Page (←)">
                            <span>
                                <IconButton
                                    onClick={() => changePage(-1)}
                                    disabled={pageNumber <= 1}
                                    size="small"
                                >
                                    <NavigateBefore />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                            <TextField
                                size="small"
                                value={pageInput}
                                onChange={(e) => setPageInput(e.target.value)}
                                onBlur={() => goToPage(pageInput)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        goToPage(pageInput);
                                    }
                                }}
                                sx={{ width: 50 }}
                                inputProps={{ style: { textAlign: 'center' } }}
                            />
                            <Typography sx={{ mx: 1 }}>/ {numPages || '...'}</Typography>
                        </Box>
                        <Tooltip title="Next Page (→)">
                            <span>
                                <IconButton
                                    onClick={() => changePage(1)}
                                    disabled={pageNumber >= numPages}
                                    size="small"
                                >
                                    <NavigateNext />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </ButtonGroup>

                    <Divider orientation="vertical" flexItem />

                    {/* Zoom Controls */}
                    <ButtonGroup size="small" variant="outlined">
                        <Tooltip title="Zoom Out (Ctrl -)">
                            <IconButton onClick={handleZoomOut} disabled={scale <= 0.5} size="small">
                                <ZoomOut />
                            </IconButton>
                        </Tooltip>
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                            <Typography variant="body2">{Math.round(scale * 100)}%</Typography>
                        </Box>
                        <Tooltip title="Zoom In (Ctrl +)">
                            <IconButton onClick={handleZoomIn} disabled={scale >= 3.0} size="small">
                                <ZoomIn />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Fit to Width">
                            <IconButton onClick={handleFitToWidth} size="small">
                                <FitScreen />
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>

                    <Divider orientation="vertical" flexItem />

                    {/* Annotation Tools */}
                    <ButtonGroup size="small" variant="outlined">
                        <Tooltip title="Highlight Text">
                            <IconButton
                                onClick={handleHighlight}
                                size="small"
                                color={annotationMode === 'highlight' ? 'primary' : 'default'}
                            >
                                <Highlight />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Note">
                            <IconButton
                                onClick={handleTextAnnotation}
                                size="small"
                                color={annotationMode === 'text' ? 'primary' : 'default'}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Draw">
                            <IconButton
                                onClick={handleDraw}
                                size="small"
                                color={annotationMode === 'draw' ? 'primary' : 'default'}
                            >
                                <Create />
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>

                    {annotations[pageNumber] && (
                        <Button size="small" onClick={clearAnnotations} color="error" variant="outlined">
                            Clear Annotations
                        </Button>
                    )}

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Action Buttons */}
                    <ButtonGroup size="small" variant="outlined">
                        <Tooltip title="Download PDF">
                            <IconButton onClick={handleDownload} size="small">
                                <Download />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Print">
                            <IconButton onClick={handlePrint} size="small">
                                <Print />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                            <IconButton onClick={toggleFullscreen} size="small">
                                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>
                </Toolbar>
            </Paper>

            {/* PDF Document */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    bgcolor: '#525659',
                    p: 2,
                    position: 'relative',
                }}
            >
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                )}

                <Box
                    sx={{ position: 'relative' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<CircularProgress />}
                        error={
                            <Box sx={{ p: 4, textAlign: 'center', color: 'white' }}>
                                <Typography>Failed to load PDF</Typography>
                            </Box>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                        />
                    </Document>

                    {/* Annotation Canvas Overlay */}
                    <canvas
                        ref={canvasRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            pointerEvents: annotationMode ? 'auto' : 'none',
                            cursor: annotationMode === 'draw' ? 'crosshair' : 'default',
                        }}
                        width={595 * scale}
                        height={842 * scale}
                    />
                </Box>
            </Box>

            {/* Status Bar */}
            <Paper sx={{ p: 1, borderRadius: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <span>{lectureTitle}</span>
                    {annotationMode && (
                        <Chip
                            label={`${annotationMode.toUpperCase()} MODE ACTIVE`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                </Typography>
            </Paper>
        </Box>
    );
};

export default PDFViewer;
