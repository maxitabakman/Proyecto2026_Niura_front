import React from 'react';

interface CaregiverDashboardProps {
  onGuiaClick?: () => void;
  onHabilitarClick?: () => void;
  onTutorialesClick?: () => void;
  onNavClick?: (section: string) => void;
}

export const homecuidador: React.FC<CaregiverDashboardProps> = ({
  onGuiaClick,
  onHabilitarClick,
  onTutorialesClick,
  onNavClick,
}) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#8abec9] via-[#a3d4e0] to-[#cbe6ee] flex flex-col font-sans text-[#1d2a3a]">
      {/* Top Navbar */}
      <header className="w-full bg-[#7fb8c4]/80 backdrop-blur-sm border-b border-[#6baab7]/30 shadow-sm px-8 py-4">
        <nav className="max-w-6xl mx-auto flex justify-center items-center gap-12 text-sm font-medium">
          <button
            onClick={() => onNavClick?.('inicio')}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>inicio</span>
          </button>

          <button
            onClick={() => onNavClick?.('usuario')}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>tu usuario</span>
          </button>

          <button
            onClick={() => onNavClick?.('notificaciones')}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            <span>notificaciones</span>
          </button>

          <button
            onClick={() => onNavClick?.('red')}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <span>red de contactos</span>
          </button>
        </nav>
      </header>

      {/* Main Container with 3 Cards */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full items-stretch">
          
          {/* Card 1: Una guía */}
          <button
            onClick={onGuiaClick}
            className="group relative flex flex-col items-center justify-center p-8 h-80 rounded-2xl bg-gradient-to-b from-[#e8f4f8] to-[#b8dce8] border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            <div className="w-24 h-24 rounded-full bg-[#1c2738] flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white text-5xl font-bold leading-none select-none">?</span>
            </div>
            <h2 className="text-xl font-bold text-[#1c2738] text-center">
              Una guía:
            </h2>
            <p className="text-lg text-[#1c2738]/90 text-center font-normal">
              Cómo acompañar
            </p>
          </button>

          {/* Card 2: Habilitar nuevos ejercicios */}
          <button
            onClick={onHabilitarClick}
            className="group relative flex flex-col items-center justify-center p-8 h-80 rounded-2xl bg-gradient-to-b from-[#e8f4f8] to-[#b8dce8] border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            <div className="mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-28 h-28 text-[#1c2738]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1c2738] text-center leading-tight max-w-[200px]">
              Habilitar nuevos ejercicios
            </h2>
          </button>

          {/* Card 3: Tutoriales */}
          <button
            onClick={onTutorialesClick}
            className="group relative flex flex-col items-center justify-center p-8 h-80 rounded-2xl bg-gradient-to-b from-[#e8f4f8] to-[#b8dce8] border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            <div className="w-24 h-28 bg-[#1c2738] rounded-xl relative mb-6 shadow-md flex items-start justify-end p-2 group-hover:scale-105 transition-transform">
              {/* Internal Bookmark Notch */}
              <div className="w-6 h-10 bg-[#e8f4f8] clip-path-ribbon" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }} />
            </div>
            <h2 className="text-xl font-bold text-[#1c2738] text-center">
              Tutoriales
            </h2>
          </button>

        </div>
      </main>
    </div>
  );
};
