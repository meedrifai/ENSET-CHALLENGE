import { useState, useEffect, useRef } from 'react';

export default function WebcamSurveillance({ onAlert, onMetricsUpdate, mode = "quiz", onStop, studentId }) {
    const [stream, setStream] = useState(null);
    const [surveillanceActive, setSurveillanceActive] = useState(false);
    const [cameraStatus, setCameraStatus] = useState('📹 Activation de la caméra...');
    const [surveillanceStatus, setSurveillanceStatus] = useState({
        faceStatus: { status: 'warning', text: '👤 Détection faciale...' },
        positionStatus: { status: 'warning', text: '📍 Position...' },
        peopleStatus: { status: 'warning', text: '👥 Présence...' }
    });
    const [metrics, setMetrics] = useState({
        faceDetections: 0,
        positionViolations: 0,
        multiplePersonsDetected: 0,
        totalChecks: 0
    });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const surveillanceIntervalRef = useRef(null);
    const previousFrameRef = useRef(null);
    const alertsHistoryRef = useRef([]);
    const faceDetectionModelRef = useRef(false);
    const [fraudAttempts, setFraudAttempts] = useState(0);
    const [preVideoWarning, setPreVideoWarning] = useState(false);
    const [showSensibilisation, setShowSensibilisation] = useState(false);
    const [showExamEndDialog, setShowExamEndDialog] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);

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
            console.error('Erreur caméra:', error);
        }
    };

    const initSurveillance = async (mediaStream) => {
        try {
            // Initialiser l'analyse audio
            console.log('Initialisation audio...');
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(mediaStream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 512;
            analyserRef.current.smoothingTimeConstant = 0.8;
            source.connect(analyserRef.current);

            console.log('Audio Context State:', audioContextRef.current.state);

            // Setup canvas overlay
            const video = videoRef.current;
            const overlayCanvas = overlayCanvasRef.current;
            
            if (video && overlayCanvas) {
                video.addEventListener('loadedmetadata', () => {
                    overlayCanvas.width = video.videoWidth;
                    overlayCanvas.height = video.videoHeight;
                    console.log('Canvas configuré:', overlayCanvas.width, 'x', overlayCanvas.height);
                });
            }

            // Essayer de charger Face-API avec gestion d'erreur robuste
            try {
                console.log('Tentative de chargement Face-API...');
                
                if (typeof window.faceapi === 'undefined') {
                    // Charger le script face-api dynamiquement
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/face-api.js/0.22.2/face-api.min.js';
                    document.head.appendChild(script);
                    
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        setTimeout(reject, 10000); // timeout après 10s
                    });
                }

                if (typeof window.faceapi !== 'undefined') {
                    const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
                    
                    await Promise.race([
                        Promise.all([
                            window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                            window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                        ]),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                    ]);
                    
                    faceDetectionModelRef.current = true;
                    console.log('Face-API chargé avec succès');
                    updateSurveillanceStatus('faceStatus', 'ok', '👤 Détection avancée prête');
                } else {
                    throw new Error('Face-API non disponible');
                }
                
            } catch (faceApiError) {
                console.warn('Face-API non disponible, utilisation détection alternative:', faceApiError);
                faceDetectionModelRef.current = false;
                updateSurveillanceStatus('faceStatus', 'warning', '👤 Détection alternative');
            }

            console.log('Surveillance initialisée');

        } catch (error) {
            console.error('Erreur initialisation surveillance:', error);
            updateSurveillanceStatus('faceStatus', 'warning', '👤 Détection basique');
        }
    };

    const startSurveillance = () => {
        if (surveillanceActive) return;
        
        setSurveillanceActive(true);
        surveillanceIntervalRef.current = setInterval(performSurveillanceCheck, 2000);
        console.log('Surveillance démarrée');
    };

    const performSurveillanceCheck = async () => {
        try {
            setMetrics(prev => {
                const newMetrics = { ...prev, totalChecks: prev.totalChecks + 1 };
                onMetricsUpdate?.(newMetrics);
                return newMetrics;
            });

            await checkFacePosition();
            await checkMultiplePersons();

        } catch (error) {
            console.error('Erreur surveillance:', error);
        }
    };

    const checkFacePosition = async () => {
        const video = videoRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        
        if (!video || !overlayCanvas) return;

        try {
            const ctx = overlayCanvas.getContext('2d');
            ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

            if (faceDetectionModelRef.current && typeof window.faceapi !== 'undefined') {
                await checkFaceWithFaceAPI(video, ctx);
            } else {
                await checkFaceAlternative(video, ctx);
            }

        } catch (error) {
            console.error('Erreur détection faciale:', error);
            updateSurveillanceStatus('faceStatus', 'warning', '👤 Erreur détection');
            updateSurveillanceStatus('positionStatus', 'warning', '📍 Erreur position');
        }
    };

    const checkFaceWithFaceAPI = async (video, ctx) => {
        try {
            const detections = await window.faceapi.detectAllFaces(video, 
                new window.faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }));
            
            if (detections.length === 0) {
                updateSurveillanceStatus('faceStatus', 'danger', '👤 Visage non détecté');
                updateSurveillanceStatus('positionStatus', 'danger', '📍 Hors cadre');
                showAlert('⚠️ Attention: Votre visage n\'est pas visible. Regardez la caméra!', 'position');
                
                setMetrics(prev => ({ ...prev, positionViolations: prev.positionViolations + 1 }));
                await reportFraud('absence_detection', { type: 'visage_non_detecte' });
                
            } else if (detections.length === 1) {
                const detection = detections[0];
                
                // Dessiner le rectangle de détection
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 3;
                ctx.strokeRect(detection.box.x, detection.box.y, detection.box.width, detection.box.height);
                
                // Vérifier la position
                const faceCenter = {
                    x: detection.box.x + detection.box.width / 2,
                    y: detection.box.y + detection.box.height / 2
                };
                
                const videoCenter = { x: video.videoWidth / 2, y: video.videoHeight / 2 };
                const distance = Math.sqrt(Math.pow(faceCenter.x - videoCenter.x, 2) + Math.pow(faceCenter.y - videoCenter.y, 2));
                
                if (distance > 120) {
                    updateSurveillanceStatus('faceStatus', 'ok', '👤 Visage détecté');
                    updateSurveillanceStatus('positionStatus', 'warning', '📍 Position décentrée');
                    showAlert('⚠️ Repositionnez-vous face à la caméra', 'position');
                    setMetrics(prev => ({ ...prev, positionViolations: prev.positionViolations + 1 }));
                    await reportFraud('position_violation', { type: 'position_decentree' });
                } else {
                    updateSurveillanceStatus('faceStatus', 'ok', '👤 Visage détecté');
                    updateSurveillanceStatus('positionStatus', 'ok', '📍 Position correcte');
                }
                
                setMetrics(prev => ({ ...prev, faceDetections: prev.faceDetections + 1 }));
                
            } else {
                // Plusieurs visages
                detections.forEach(detection => {
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(detection.box.x, detection.box.y, detection.box.width, detection.box.height);
                });
                
                updateSurveillanceStatus('faceStatus', 'danger', `👤 ${detections.length} visages`);
                updateSurveillanceStatus('positionStatus', 'danger', '📍 Violation');
                showAlert('🚨 ATTENTION: Plusieurs personnes détectées! Test en cours d\'annulation.', 'multiple_persons');
                setMetrics(prev => ({ ...prev, multiplePersonsDetected: prev.multiplePersonsDetected + 1 }));
                await reportFraud('multiple_persons', { count: detections.length });
            }
            
            setFraudAttempts(prev => {
                const newAttempts = prev + 1;
                handleFraudAttempt(newAttempts);
                return newAttempts;
            });

        } catch (error) {
            console.error('Erreur Face-API:', error);
            await checkFaceAlternative(video, ctx);
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
            // Central square fallback: only analyze the central region (not a real face detector)
            const centerX = tempCanvas.width / 2;
            const centerY = tempCanvas.height / 2;
            const regionW = tempCanvas.width * 0.4;
            const regionH = tempCanvas.height * 0.4;
            let regionBrightness = 0;
            let regionPixels = 0;
            let minBrightness = 255;
            let maxBrightness = 0;
            for (let y = Math.floor(centerY - regionH/2); y < Math.ceil(centerY + regionH/2); y += 4) {
                for (let x = Math.floor(centerX - regionW/2); x < Math.ceil(centerX + regionW/2); x += 4) {
                    const idx = (y * tempCanvas.width + x) * 4;
                    const brightness = (imageData.data[idx] + imageData.data[idx+1] + imageData.data[idx+2]) / 3;
                    regionBrightness += brightness;
                    regionPixels++;
                    if (brightness < minBrightness) minBrightness = brightness;
                    if (brightness > maxBrightness) maxBrightness = brightness;
                }
            }
            const avgRegionBrightness = regionBrightness / regionPixels;
            const regionContrast = maxBrightness - minBrightness;
            // If region is too dark or too uniform, trigger absence
            if (avgRegionBrightness < 30 || regionContrast < 15) {
                updateSurveillanceStatus('faceStatus', 'danger', '👤 Absence détectée (zone centrale)');
                updateSurveillanceStatus('positionStatus', 'danger', '📍 Hors cadre');
                showAlert('⚠️ Votre présence n\'est plus détectée dans la zone centrale. Restez bien dans le champ de la caméra.', 'position');
                setFraudAttempts(prev => {
                    const newAttempts = prev + 1;
                    handleFraudAttempt(newAttempts);
                    return newAttempts;
                });
            } else {
                updateSurveillanceStatus('faceStatus', 'ok', '👤 Présence détectée');
                updateSurveillanceStatus('positionStatus', 'ok', '📍 Position correcte');
                setMetrics(prev => ({ ...prev, faceDetections: prev.faceDetections + 1 }));
            }
        } catch (error) {
            console.error('Erreur détection alternative:', error);
            updateSurveillanceStatus('faceStatus', 'warning', '👤 Détection limitée');
            updateSurveillanceStatus('positionStatus', 'warning', '📍 Contrôle manuel');
        }
    };

    const checkMultiplePersons = async () => {
        const video = videoRef.current;
        
        try {
            if (faceDetectionModelRef.current && typeof window.faceapi !== 'undefined') {
                const detections = await window.faceapi.detectAllFaces(video, 
                    new window.faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }));
                
                if (detections.length > 1) {
                    updateSurveillanceStatus('peopleStatus', 'danger', `👥 ${detections.length} personnes`);
                    showAlert('🚨 VIOLATION: Plusieurs personnes détectées! Le test pourrait être annulé.', 'multiple_persons');
                    setMetrics(prev => ({ ...prev, multiplePersonsDetected: prev.multiplePersonsDetected + 1 }));
                } else if (detections.length === 1) {
                    updateSurveillanceStatus('peopleStatus', 'ok', '👥 Seul détecté');
                } else {
                    updateSurveillanceStatus('peopleStatus', 'warning', '👥 Aucune personne');
                }
                
            } else {
                await checkMultiplePeopleAlternative(video);
            }
            
        } catch (error) {
            console.error('Erreur détection personnes:', error);
            updateSurveillanceStatus('peopleStatus', 'warning', '👥 Contrôle manuel requis');
        }
    };

    const checkMultiplePeopleAlternative = async (video) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if(video && ctx){
                canvas.width = video?.videoWidth / 4;
                canvas.height = video?.videoHeight / 4;
                
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            if (previousFrameRef.current) {
                const motionZones = analyzeMotionZones(previousFrameRef.current, currentFrameData);
                
                if (motionZones.length > 2) {
                    updateSurveillanceStatus('peopleStatus', 'danger', '👥 Mouvement suspect');
                    showAlert('⚠️ Mouvement détecté dans plusieurs zones. Restez seul et immobile.', 'multiple_persons');
                    await reportFraud('mouvement_suspect', { zones: motionZones.length });
                    setFraudAttempts(prev => {
                        const newAttempts = prev + 1;
                        handleFraudAttempt(newAttempts);
                        return newAttempts;
                    });
                } else if (motionZones.length <= 1) {
                    updateSurveillanceStatus('peopleStatus', 'ok', '👥 Mouvement normal');
                }
            } else {
                updateSurveillanceStatus('peopleStatus', 'ok', '👥 Analyse en cours');
            }
            
            previousFrameRef.current = currentFrameData;

        } catch (error) {
            console.error('Erreur détection alternative:', error);
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
        // Éviter les alertes répétitives
        const now = Date.now();
        const recentAlert = alertsHistoryRef.current.find(alert => 
            alert.message === message && (now - alert.timestamp) < 5000);
        
        if (recentAlert) return;
        
        alertsHistoryRef.current.push({ message, timestamp: now });

        onAlert?.({
            message,
            type,
            timestamp: now
        });

        // Alerte visuelle
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-pulse';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 4000);

        // Nettoyer l'historique des alertes anciennes
        alertsHistoryRef.current = alertsHistoryRef.current.filter(alert => (now - alert.timestamp) < 10000);
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

    const handleFraudAttempt = (newAttempts) => {
        if (newAttempts < 3) {
            updateSurveillanceStatus('peopleStatus', 'danger', `👥 Absence détectée`);
            showAlert(`⚠️ Votre présence n'est pas détectée.`, 'multiple_persons');
        } else if (newAttempts === 3) {
            setIsTransitioning(true);
            if (mode === "quiz") {
                // Pour le quiz : afficher la vidéo puis arrêter
                setPreVideoWarning(true);
                setTimeout(() => {
                    setPreVideoWarning(false);
                    setShowSensibilisation(true);
                    setTimeout(() => {
                        setShowSensibilisation(false);
                        setIsTransitioning(false);
                        if (onStop) setTimeout(onStop, 0);
                    }, 20000);
                }, 2000);
            } else if (mode === "exam") {
                // Pour l'examen : arrêter immédiatement sans vidéo
                setShowExamEndDialog(true);
                setTimeout(() => {
                    setIsTransitioning(false);
                    if (onStop) setTimeout(onStop, 0);
                }, 2000);
            }
        }
    };

    const handleVideoEnd = () => {
        setVideoEnded(true);
        setTimeout(() => {
            setShowSensibilisation(false);
            setIsTransitioning(false);
            if (onStop) setTimeout(onStop, 0);
        }, 2000);
    };

    const reportFraud = async (fraudType, details) => {
        const savedData = localStorage.getItem("studentData");
      
        if (!savedData) {
          console.error("studentData not found in localStorage");
          return;
        }
      
        const parsedStudent = JSON.parse(savedData);
            try {
                const fraudData = {
                    date_fraude: new Date().toISOString(),
                    details: details,
                    multiple_persons_detected: metrics.multiplePersonsDetected,
                    position_violations: metrics.positionViolations,
                    speech_detections: 0,
                    id: `fraude_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    id_ref: parsedStudent.id,
                    nombre_fraude: 1,
                    ref_type: mode === "quiz" ? "test_cognitif" : "examen",
                    type_fraude: fraudType
                };

                // Vérifier si studentId est disponible
                if (
                    !parsedStudent.id
                ) {
                    console.error('ID étudiant manquant');
                    return;
                }

                const response = await fetch('/api/fraud/report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(fraudData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Erreur lors du signalement de la fraude');
                }

                console.log('Fraude signalée avec succès:', data);
            } catch (error) {
                console.error('Erreur lors du signalement de la fraude:', error);
                // Ne pas bloquer l'exécution en cas d'erreur
            }
        };

    return (
        <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
                🔍 Surveillance en Temps Réel - {mode === "quiz" ? "Quiz" : "Examen"}
            </h4>
            
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
                        if (overlayCanvasRef.current && videoRef.current) {
                            overlayCanvasRef.current.width = videoRef.current.videoWidth;
                            overlayCanvasRef.current.height = videoRef.current.videoHeight;
                        }
                    }}
                />
                <canvas 
                    ref={overlayCanvasRef} 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="text-center text-gray-600 text-sm">
                {cameraStatus}
            </div>
            <div className="text-center text-gray-600 text-sm mt-2">
                {surveillanceActive ? 'Surveillance active' : 'Surveillance inactive'}
            </div>

            {/* Vidéo de sensibilisation */}
            {showSensibilisation && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 text-center shadow-2xl max-w-2xl w-full mx-4">
                        <h2 className="text-2xl font-bold text-yellow-600 mb-4">
                            {mode === "quiz" ? "📚 Sensibilisation à la Fraude" : "🚫 Violation des Règles"}
                        </h2>
                        <div className="mb-4">
                            <video
                                className="w-full max-h-80 rounded mx-auto bg-black"
                                controls
                                autoPlay
                                onEnded={handleVideoEnd}
                            >
                                <source src="/videos/video.mp4" type="video/mp4" />
                                <p className="text-white p-4">
                                    Votre navigateur ne supporte pas la vidéo. Veuillez mettre à jour votre navigateur.
                                </p>
                            </video>
                        </div>
                        <p className="text-gray-700 text-lg">
                            {videoEnded 
                                ? 'Vidéo terminée. Fermeture en cours...' 
                                : mode === "quiz" 
                                    ? 'Votre quiz sera arrêté à la fin de cette vidéo.'
                                    : 'Votre examen sera terminé à la fin de cette vidéo.'}
                        </p>
                        {!videoEnded && (
                            <div className="mt-4 bg-yellow-100 p-3 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    Cette vidéo vous sensibilise aux conséquences de la fraude académique.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Dialog fin d'examen */}
            {showExamEndDialog && mode === "exam" && !showSensibilisation && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 text-center shadow-2xl max-w-xl w-full mx-4">
                        <h2 className="text-3xl font-bold text-red-600 mb-6">🚫 EXAMEN TERMINÉ</h2>
                        <div className="mb-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <p className="text-xl text-gray-700 mb-4">
                                Votre examen est terminé suite à une violation des règles de surveillance.
                            </p>
                            <p className="text-lg text-gray-600">
                                Veuillez quitter la salle d'examen et contacter votre superviseur.
                            </p>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg">
                            <p className="text-sm text-red-800">
                                Tentatives de fraude: {fraudAttempts}/3 - Limite atteinte
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay de transition */}
            {isTransitioning && !preVideoWarning && !showSensibilisation && !showExamEndDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
                    <div className="bg-white rounded-xl p-8 text-center shadow-2xl max-w-xl w-full mx-4">
                        <h2 className="text-2xl font-bold text-blue-600 mb-4">⏳ Traitement en cours</h2>
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-gray-600">Analyse des violations...</span>
                        </div>
                        <p className="text-sm text-gray-500">Veuillez patienter</p>
                    </div>
                </div>
            )}
        </div>
    );
}