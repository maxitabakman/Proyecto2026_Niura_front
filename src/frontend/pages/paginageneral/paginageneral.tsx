import { useNavigate } from 'react-router-dom';
import logoPaginaGeneral from '/src/frontend/images/logo_niura.png';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Cerebro from '../cerebro a importar/cerebro';
import { Suspense } from 'react';

export default function PaginaGeneral() {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-hidden font-['Inter']">
      
      {/* SECCIÓN 1: Pantalla inicial (Logo y botones centrados) */}
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <img
          src={logoPaginaGeneral}
          alt="Logo Niura"
          className="w-[250px] h-[325px] object-contain"
        />

        <div className="mt-[77px] flex items-start justify-center gap-4">
          <button
            onClick={() => navigate('/elegirUsuario')}
            className="bg-[#D2E1F2] hover:bg-[#c3d6ec] text-black text-2xl px-4 py-2 rounded-[10px] border-2 border-[#1A8ECE] shadow-[0_3px_6px_rgba(0,0,0,0.25)] transition-all active:scale-95 cursor-pointer"
          >
            Registrate
          </button>

          <button
            onClick={() => navigate('/elegirinicio')}
            className="bg-[#1A8ECE] hover:bg-[#157BB5] text-black text-2xl px-4 py-2 rounded-[10px] shadow-[0_3px_6px_rgba(0,0,0,0.25)] transition-all active:scale-95 cursor-pointer"
          >
            Inicia sesión
          </button>
        </div>
      </div>

      {/* SECCIÓN 2: Subtítulos ajustados + Texto descriptivo mantenido grande */}
      <div className="w-full flex flex-col items-start justify-center px-6 md:px-12 py-16 gap-12 text-left">
        
        {/* PRIMEROS DOS PÁRRAFOS */}
        <div className="w-full text-left">
          {/* Subtítulo achicado a un punto medio */}
          <h2 className="!text-[34px] md:!text-[44px] font-bold mb-3 leading-tight">
            Reconstruir. Rehabilitar. Recuperar.
          </h2>
          {/* Texto descriptivo se mantiene amplio */}
          <p className="!text-[18px] md:!text-[22px] leading-relaxed">
            Controlá, tené un panorama de rehabilitación a tu conveniencia en un lugar. Bajá videos y explorá y asegurá un monitoreo de tus objetivos y tu perfil de salud.
          </p>
        </div>

        <div className="w-full text-left">
          <h2 className="!text-[34px] md:!text-[44px] font-bold mb-3 leading-tight">
            ¿Qué es un ACV?
          </h2>
          <p className="!text-[18px] md:!text-[22px] leading-relaxed">
            El accidente cerebro vascular ocurre por fallas en el cerebro causado por un derrame de sangre. Sea cual sea el motivo, y el/las zonas afectadas del cerebro, las secuelas varían de modo salvaje. Aprender sobre las consecuencias nos encamina a la gran rehabilitación.
          </p>
        </div>

        {/* CEREBRO EN EL MEDIO DE LA PANTALLA */}
        <div className="w-full h-[500px] md:h-[600px]"> 
          <Canvas camera={{ position: [0, 0, 4.5] }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            
            <Suspense fallback={null}>
              <Cerebro />
            </Suspense>

            <OrbitControls enableZoom={true} />
          </Canvas>
        </div>

        {/* DOS PÁRRAFOS FINALES */}
        <div className="w-full text-left">
          <h2 className="!text-[34px] md:!text-[44px] font-bold mb-3 leading-tight">
            NIURA para cuidadores
          </h2>
          <p className="!text-[18px] md:!text-[22px] leading-relaxed">
            Anotá el progreso de tus pacientes de forma automatizada, y aprendé cómo acompañar en la rutina que está llevando a cabo tu familiar.
          </p>
        </div>
        
        <div className="w-full text-left">
          <h2 className="!text-[34px] md:!text-[44px] font-bold mb-3 leading-tight">
            NIURA para profesionales
          </h2>
          <p className="!text-[18px] md:!text-[22px] leading-relaxed">
            Teniendo el control total/estratégico de tu paciente y asigná nuevas rutinas para potenciar su recuperación. Asegurándole un seguimiento constante, incentiva al paciente para hacer los ejercicios de rehabilitación de forma virtual.
          </p>
        </div>

      </div>
      
    </div>
  );
}