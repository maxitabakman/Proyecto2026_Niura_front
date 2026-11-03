import { useNavigate } from 'react-router-dom';
import logoPaginaGeneral from '/src/frontend/images/logo_niura.png';

export default function PaginaGeneral() {
  const navigate = useNavigate();

  return (
    <div >
      {/* LOGO (solo el símbolo) */}
      <img
        src={logoPaginaGeneral}
        alt="Logo Niura"
        className="w-[250px] h-[325px] object-contain ml-[30px] "
      />

      {/* TEXTO NIURA */}
    

      {/* BOTONES */}
      <div className="mt-[77px] flex items-start justify-center gap-4">
        {/* Regístrate */}
        <button
          onClick={() => navigate('/elegirUsuario')}
          className="bg-[#D2E1F2] hover:bg-[#c3d6ec] text-black font-['Inter'] font-normal text-2xl px-3 py-2 rounded-[10px] border-2 border-[#1A8ECE] shadow-[0_3px_6px_rgba(0,0,0,0.25)] transition-all active:scale-95 cursor-pointer"
        >
          Registrate
        </button>

        {/* Inicia sesión */}
        <button
          onClick={() => navigate('/elegirinicio')}
          className="bg-[#1A8ECE] hover:bg-[#157BB5] text-black font-['Inter'] font-normal text-2xl px-2.5 py-2 rounded-[10px] shadow-[0_3px_6px_rgba(0,0,0,0.25)] transition-all active:scale-95 cursor-pointer"
        >
          Inicia sesión
        </button>
      </div>
    </div>
  );
}