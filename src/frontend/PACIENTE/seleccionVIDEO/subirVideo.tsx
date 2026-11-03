import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import confirmar from '../confirmarSeleccionEjercicio/btn-confirmar.png';
import botonPausa from './pausarSeguir.png'; 
import './subirVideo.css';

export default function Video() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const [ grabando, setGrabando ] = useState<boolean>(false);
    const [ videoPrevisualizado, setVideoPrevisualizado ] = useState<string>('');
    const [ videoArchivo, setVideoArchivo ] = useState<File | null>(null);
    const navigate = useNavigate();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const partesRef = useRef<Blob[]>([]);

    useEffect(() => {
        const iniciarCamara = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error(error);
                alert("No se pudo acceder a la cámara. Por favor, revisa los permisos.");
            }
        };

        iniciarCamara();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleGrabacion = () => {
        if (!grabando) {
            if (!streamRef.current) return;

            if (videoPrevisualizado) {
                URL.revokeObjectURL(videoPrevisualizado);
                setVideoPrevisualizado('');
                setVideoArchivo(null);
            }

            partesRef.current = [];

            const recorder = new MediaRecorder(streamRef.current);
            recorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    partesRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const videoBlob = new Blob(partesRef.current, { type: "video/webm" });
                const url = URL.createObjectURL(videoBlob);
                const nombreArchivo = `grabacion_${Date.now()}.webm`;
                const file = new File([videoBlob], nombreArchivo, { type: "video/webm" });

                setVideoArchivo(file);
                setVideoPrevisualizado(url);
            };

            recorder.start();
            setGrabando(true);
        } else {
            if (recorderRef.current && recorderRef.current.state === "recording") {
                recorderRef.current.stop();
            }
            setGrabando(false);
        }
    };

    const handleConfirmar = () => {
        if (!videoPrevisualizado) return;
    
        const a = document.createElement("a");
        a.href = videoPrevisualizado;
        a.download = videoArchivo ? videoArchivo.name : `grabacion_${Date.now()}.webm`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        navigate(`/paciente/seleccionVIDEO/seleccionarArchivo/${type}/${id}`);
    };

    return (
        <div className='cuadroVideo'>
            
            {!videoPrevisualizado && (
                <div className="indicador-grabacion">
                    <span className={`punto-rojo ${grabando ? 'parpadeando' : ''}`}></span>
                    {grabando ? "Grabando el ejercicio" : "Iniciar ejercicio"}
                </div>
            )}

            {!videoPrevisualizado && (
                <div className="estado-grabacion">
                    <div className="video-wrapper">
                        <video ref={videoRef} autoPlay muted className="video-vivo" />
                        
                        <img 
                            src={botonPausa} 
                            onClick={handleGrabacion} 
                            alt="Grabar/Pausar" 
                            className="btn-accion-imagen" 
                        />
                    </div>
                </div>
            )}
    
            {videoPrevisualizado && (
                <div className="estado-previsualizacion">
                    <div className="tarjeta-celeste">
                        <span className="titulo-seccion">video</span>
                        <video 
                            controls 
                            src={videoPrevisualizado} 
                            className="video-reproductor" 
                        />
                        <img 
                            onClick={handleConfirmar} 
                            src={confirmar} 
                            alt="Confirmar" 
                            className="btn-confirmar-img" 
                        />
                    </div>
                </div>
            )}
        </div>
    )
}