import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import confirmar from '../confirmarSeleccionEjercicio/btn-confirmar.png';
import microfono from './microfono.png';
import botonPausa from './pausarSeguir.png';
import videoOnda from './download (3).mp4'
import './audio.css';

export default function SeleccionAudio() {
  const { type, id } = useParams();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const navigate = useNavigate();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Revisa los permisos de tu navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveAudioFile = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `grabacion_${type}_${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    navigate(`/paciente/seleccionAUDIO/seleccionarArchivo/${type}/${id}`);
  };

  return (
    <div className="grabadora-container">
      
      {/* Título unificado */}
      <div className="indicador-grabacion">
          <span className={`punto-rojo ${isRecording ? 'parpadeando' : ''}`}></span>
          {isRecording ? 'Grabando el ejercicio' : 'Iniciar ejercicio'}
      </div>
  
      {!audioUrl && (
        <div className="interfaz-audio-activa">
            
            {/* Contenedor central: Micrófono + Onda(Video) */}
            <div className="elementos-centro-audio">
                <img src={microfono} alt="Micrófono" className="icono-microfono-gigante" />
                
                {/* Espacio reservado para el video de la onda de sonido */}
                <div className="video-onda-placeholder">
                     <video src={videoOnda} autoPlay loop muted className="video-onda-real" />
                </div>
            </div>

            {/* Botón de Grabar/Pausar abajo */}
            <img 
                src={botonPausa} 
                className="btn-accion-imagen-audio" 
                onClick={isRecording ? stopRecording : startRecording}
                alt="Grabar/Pausar"
            />
        </div>
      )}
  
      {audioUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '30px' }}>
          <audio src={audioUrl} controls style={{ marginBottom: '30px', width: '300px' }} />
          <img src={confirmar} className="btn-confirmar-img" onClick={saveAudioFile} alt="Confirmar" />        
        </div>
      )}
    </div>
  );
}