// components/WebcamSurveillance.js
import { useState, useEffect, useRef } from 'react';

export default function WebcamSurveillance({ onAlert, onMetricsUpdate }) {
    const [stream, setStream] = useState(null);
    const [surveillanceActive, setSurveillanceActive] = useState(false);
    const [cameraStatus, setCameraStatus] = useState('📹 Activation de la caméra...');
    const [surveillanceStatus, setSurveillanceStatus] = useState({
        faceStatus: { status: 'warning', text: '👤 Détection faciale...' },
        positionStatus: { status: 'warning', text: '📍 Position...' },
        speechStatus: { status: 'warning', text: '🎤 Audio...' },
        peopleStatus: { status: 'warning', text: '👥 Présence...' }
    });
    const [metrics, setMetrics] = useState({
        faceDetections: 0,
        positionViolations: 0,
        speechDetections: 0,
        multiplePersonsDetected: 0,
        totalChecks: 0
    });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const surveillanceIntervalRef = useRef(null);
    const previousFrameRef = useRef(null);

    useEffect(() => {
        initCamera();
        return () => {
            cleanup();
        };
    }, []);

    const initCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            await initSurveillance(mediaStream);
            setCameraStatus('📹 Caméra active - Surveillance cognitive activée');
            startSurveillance();

        } catch (error) {
            setCameraStatus('⚠️ Caméra/Micro non disponible');
            console.error('Camera error:', error);
        }
    };

    const initSurveillance = async (mediaStream) => {
        try {
            // Initialize audio analysis
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(mediaStream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 512;
            analyserRef.current.smoothingTimeConstant = 0.8;
            source.connect(analyserRef.current);

            updateSurveillanceStatus('speechStatus', 'ok', '🎤 Analyse audio prête');
            updateSurveillanceStatus('faceStatus', 'ok', '👤 Détection prête');

        } catch (error) {
            console.error('Surveillance initialization error:', error);
            updateSurveillanceStatus('faceStatus', 'warning', '👤 Détection basique');
            updateSurveillanceStatus('speechStatus', 'warning', '🎤 Audio basique');
        }
    };

    const startSurveillance = () => {
        if (surveillanceActive) return;
        
        setSurveillanceActive(true);
        surveillanceIntervalRef.current = setInterval(performSurveillanceCheck, 2000);
    };

    const performSurveillanceCheck = async () => {
        try {
            setMetrics(prev => {
                const newMetrics = { ...prev, totalChecks: prev.totalChecks + 1 };
                onMetricsUpdate?.(newMetrics);
                return newMetrics;
            });

            await checkFacePosition();
            checkSpeechActivity();
            await checkMultiplePersons();

        } catch (error) {
            console.error('Surveillance check error:', error);
        }
    };

    const checkFacePosition = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas) return;

        try {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use alternative detection based on brightness and movement
            await checkFaceAlternative(video, ctx);

        } catch (error) {
            console.error('Face detection error:', error);
            updateSurveillanceStatus('faceStatus', 'warning', '👤 Erreur détection');
        }
    };

    const checkFaceAlternative = async (video, ctx) => {
        try {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;

            tempCtx.drawImage(video, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

            const pixels = imageData.data;
            let totalBrightness = 0;
            let faceRegionBrightness = 0;

            const centerX = tempCanvas.width / 2;
            const centerY = tempCanvas.height / 2;
            const faceWidth = tempCanvas.width * 0.4;
            const faceHeight = tempCanvas.height * 0.4;

            let facePixels = 0;
            let totalPixels = 0;

            for (let y = 0; y < tempCanvas.height; y += 4) {
                for (let x = 0; x < tempCanvas.width; x += 4) {
                    const index = (y * tempCanvas.width + x) * 4;
                    const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
                    totalBrightness += brightness;
                    totalPixels++;

                    if (Math.abs(x - centerX) <= faceWidth/2 && Math.abs(y - centerY) <= faceHeight/2) {
                        faceRegionBrightness += brightness;
                        facePixels++;
                    }
                }
            }

            const avgBrightness = totalBrightness / totalPixels;
            const avgFaceBrightness = faceRegionBrightness / facePixels;
            const brightnessDiff = Math.abs(avgFaceBrightness - avgBrightness);

            if (avgBrightness < 30) {
                updateSurveillanceStatus('faceStatus', 'danger', '👤 Caméra bloquée');
                updateSurveillanceStatus('positionStatus', 'danger', '📍 Pas de visibilité');
                showAlert('⚠️ La caméra semble bloquée ou éteinte', 'position');
                
            } else if (brightnessDiff > 15) {
                updateSurveillanceStatus('faceStatus', 'ok', '👤 Présence détectée');
                updateSurveillanceStatus('positionStatus', 'ok', '📍 Position OK');
                
                setMetrics(prev => ({ ...prev, faceDetections: prev.faceDetections + 1 }));

                // Draw approximate rectangle
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.strokeRect(centerX - faceWidth/2, centerY - faceHeight/2, faceWidth, faceHeight);
                
            } else {
                updateSurveillanceStatus('faceStatus', 'warning', '👤 Présence incertaine');
                updateSurveillanceStatus('positionStatus', 'warning', '📍 Position à vérifier');
            }

        } catch (error) {
            console.error('Alternative face detection error:', error);
            updateSurveillanceStatus('faceStatus', 'warning', '👤 Détection limitée');
        }
    };

    const checkSpeechActivity = () => {
        if (!analyserRef.current || !audioContextRef.current || audioContextRef.current.state !== 'running') {
            updateSurveillanceStatus('speechStatus', 'warning', '🎤 Audio non initialisé');
            return;
        }

        try {
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            analyserRef.current.getByteFrequencyData(dataArray);
            
            let sum = 0;
            let max = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
                if (dataArray[i] > max) max = dataArray[i];
            }
            const average = sum / bufferLength;

            const timeDomainArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteTimeDomainData(timeDomainArray);
            
            let timeDomainMax = 0;
            for (let i = 0; i < bufferLength; i++) {
                const sample = Math.abs(timeDomainArray[i] - 128);
                if (sample > timeDomainMax) timeDomainMax = sample;
            }

            const speechThreshold = 8;
            const timeDomainThreshold = 10;

            if (average > speechThreshold || max > 25 || timeDomainMax > timeDomainThreshold) {
                updateSurveillanceStatus('speechStatus', 'danger', '🎤 ACTIVITÉ VOCALE!');
                showAlert('⚠️ ATTENTION: Activité vocale détectée! Restez silencieux pendant le test.', 'speech');
                setMetrics(prev => ({ ...prev, speechDetections: prev.speechDetections + 1 }));
            } else if (average > speechThreshold * 0.5) {
                updateSurveillanceStatus('speechStatus', 'warning', '🎤 Bruit ambiant');
            } else {
                updateSurveillanceStatus('speechStatus', 'ok', '🎤 Silencieux');
            }

        } catch (error) {
            console.error('Speech detection error:', error);
            updateSurveillanceStatus('speechStatus', 'warning', '🎤 Erreur audio');
        }
    };

    const checkMultiplePersons = async () => {
        const video = videoRef.current;
        
        try {
            await checkMultiplePeopleAlternative(video);
        } catch (error) {
            console.error('Multiple persons detection error:', error);
            updateSurveillanceStatus('peopleStatus', 'warning', '👥 Contrôle manuel requis');
        }
    };

    const checkMultiplePeopleAlternative = async (video) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth / 4;
            canvas.height = video.videoHeight / 4;
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            if (previousFrameRef.current) {
                const motionZones = analyzeMotionZones(previousFrameRef.current, currentFrameData);
                
                if (motionZones.length > 2) {
                    updateSurveillanceStatus('peopleStatus', 'warning', '👥 Mouvement suspect');
                    showAlert('⚠️ Mouvement détecté dans plusieurs zones. Restez seul et immobile.', 'multiple_persons');
                } else if (motionZones.length <= 1) {
                    updateSurveillanceStatus('peopleStatus', 'ok', '👥 Mouvement normal');
                }
            } else {
                updateSurveillanceStatus('peopleStatus', 'ok', '👥 Analyse en cours');
            }
            
            previousFrameRef.current = currentFrameData;

        } catch (error) {
            console.error('Alternative people detection error:', error);
            updateSurveillanceStatus('peopleStatus', 'warning', '👥 Détection limitée');
        }
    };

    const analyzeMotionZones = (prevData, currData) => {
        const zones = [];
        const gridSize = 8;
        const threshold = 30;
        
        for (let y = 0; y < currData.height; y += gridSize) {
            for (let x = 0; x < currData.width; x += gridSize) {
                let motionSum = 0;
                let pixelCount = 0;
                
                for (let dy = 0; dy < gridSize && y + dy < currData.height; dy++) {
                    for (let dx = 0; dx < gridSize && x + dx < currData.width; dx++) {
                        const index = ((y + dy) * currData.width + (x + dx)) * 4;
                        
                        const prevGray = (prevData.data[index] + prevData.data[index + 1] + prevData.data[index + 2]) / 3;
                        const currGray = (currData.data[index] + currData.data[index + 1] + currData.data[index + 2]) / 3;
                        
                        motionSum += Math.abs(currGray - prevGray);
                        pixelCount++;
                    }
                }
                
                if (motionSum / pixelCount > threshold) {
                    zones.push({ x, y, motion: motionSum / pixelCount });
                }
            }
        }
        
        return zones;
    };

    const updateSurveillanceStatus = (statusKey, status, text) => {
        setSurveillanceStatus(prev => ({
            ...prev,
            [statusKey]: { status, text }
        }));
    };

    const showAlert = (message, type) => {
        onAlert?.({
            message,
            type,
            timestamp: Date.now()
        });

        // Visual alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-pulse';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 4000);
    };

    const cleanup = () => {
        setSurveillanceActive(false);
        
        if (surveillanceIntervalRef.current) {
            clearInterval(surveillanceIntervalRef.current);
        }
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'ok': return 'bg-green-100 text-green-800 border-green-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'danger': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">🔍 Surveillance en Temps Réel</h4>
            
            {/* Surveillance Status */}
            <div className="grid grid-cols-1 gap-2 mb-4">
                {Object.entries(surveillanceStatus).map(([key, { status, text }]) => (
                    <div 
                        key={key}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium ${getStatusClass(status)}`}
                    >
                        {text}
                    </div>
                ))}
            </div>

            {/* Video Container */}
            <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-48 object-cover"
                    onLoadedMetadata={() => {
                        if (canvasRef.current && videoRef.current) {
                            canvasRef.current.width = videoRef.current.videoWidth;
                            canvasRef.current.height = videoRef.current.videoHeight;
                        }
                    }
                    }
                />
                <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="text-center text-gray-600 text-sm">
                {cameraStatus}
            </div>
            <div className="text-center text-gray-600 text-sm mt-2">
                {surveillanceActive ? 'Surveillance active' : 'Surveillance inactive'}
            </div>
            <div className="text-center text-gray-600 text-sm mt-2">
                {`Détections faciales: ${metrics.faceDetections}, Violations de position: ${metrics.positionViolations}, Activité vocale: ${metrics.speechDetections}, Personnes détectées: ${metrics.multiplePersonsDetected}`}
            </div>
        </div>
    );
}
// Note: This code is a simplified version and may not include all the features of the original code.