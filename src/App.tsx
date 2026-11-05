import './App.css';
import { Routes, Route } from 'react-router-dom';

// IMPORTS - AUTENTICACIÓN Y REGISTRO
import RegistroPaciente from './frontend/PACIENTE/registroPaciente/registroPaciente';
import RegistroMedico from './frontend/MEDICO/registroMedico/registroMedico';
import RegistroCuidador from './frontend/CUIDADOR/registroCuidador/registroCuidador';
import InicioSesionMedico from './frontend/MEDICO/inicioSesionMedico/inicioSesionMedico';
import InicioSesionPaciente from './frontend/PACIENTE/inicioSesionPaciente/inicioSesionPaciente';
import InicioSesionCuidador from './frontend/CUIDADOR/inicioSesionCuidador/inicioSesionCuidador';
import Elegirusuario from './frontend/pages/eleccion_de_usuario/elccion_de_usuario';
import Elegirinicio from './frontend/pages/eleccion_de_usuario/elegirinicio';

// IMPORTS - MÉDICO
import AsignarEjercicio from './frontend/MEDICO/asignarEjercicio/tsx/asignarEjercicio';
import CrearEjercicio from './frontend/MEDICO/asignarEjercicio/tsx/crearEjercicio';
import QuieresAsignarlo from './frontend/MEDICO/asignarEjercicio/tsx/quieresAsignarlo';
import Pacientes from './frontend/pages/Pacientes';
import DetallePaciente from './frontend/pages/DetallePaciente';
import Historial from './frontend/pages/historial/historial';
import Progresopaciente from './frontend/pages/progreso';

// IMPORTS - PACIENTE
import Ejercitar from './frontend/PACIENTE/Ejercitar/ejercitarInicio';
import EleccionEjercicio from './frontend/PACIENTE/EleccionEjercicio/EleccionEjercicio';
import SeleccionDeEjercicios from './frontend/PACIENTE/seleccionEjercicio/seleccionDeEjercicios';
import ConfirmarSeleccionEjercicio from './frontend/PACIENTE/confirmarSeleccionEjercicio/confirmar';
import AccionEjercitar from './frontend/PACIENTE/accionEjercitar/accionEjercitar';
import Video from './frontend/PACIENTE/seleccionVIDEO/subirVideo';
import SeleccionarArchivoVideo from './frontend/PACIENTE/seleccionVIDEO/seleccionarArchivo';
import SeleccionarArchivoAudio from './frontend/PACIENTE/seleccionAUDIO/seleccionarArchivoAudio';
import SeleccionAudio from './frontend/PACIENTE/seleccionAUDIO/audio';
import PerfilPaciente from './frontend/pages/usuario_paciente/usuario_paciente';
import GrabarVideo from './frontend/PACIENTE/seleccionVIDEO/subirVideo';
import GrabarAudio from './frontend/PACIENTE/seleccionAUDIO/audio';

// IMPORTS - CUIDADOR Y GENERAL
import PerfilCuidador from './frontend/pages/usuario_cuidador/usuario_cuidador';
import Noticias from './frontend/pages/notificaciones/notificaciones_cuidador';
import NoticiasPaciente from './frontend/pages/notificaciones/notificaciones';
import BotonNotificacion from './frontend/pages/notificaciones/notificaciones';
import ListaRacha  from './frontend/racha/racha';
import Header from './frontend/components/header';
import PaginaGeneral from './frontend/pages/paginageneral/paginageneral';
import PaginaGralCuidador from './frontend/CUIDADOR/paginagralCuidador/paginagralCuidador';
import Guia from './frontend/CUIDADOR/guia/guia';
import HabilitarEjercicios from './frontend/CUIDADOR/habilitarEjercicios/habilitarEjercicios';
import Tutoriales from './frontend/CUIDADOR/tutoriales/tutoriales';

// IMPORTS - RED DE CONTACTOS Y CHAT

import ChatSimplificadomiopaciente from './frontend/reddecontactos/lomio/redcontactos';

// PROVIDERS
import { PacienteProvider } from './frontend/Contexts/contextPaciente';
import { MedicoProvider } from './frontend/Contexts/contextoMedico';
import { RachaProvider } from './frontend/Contexts/providerracha';
import { CuidadorProvider } from './frontend/Contexts/contextoCuidador';

function App() {
  return (
    <CuidadorProvider>
      <RachaProvider>
        <MedicoProvider>
          <PacienteProvider>
            <div className="min-h-screen w-full bg-[#C5DCEE] flex flex-col justify-between m-0 p-0 overflow-x-hidden">
              {/* Header global */}
              <Header />

              {/* Rutas de la aplicación */}
              <main className="flex-1 flex items-center justify-center p-4">
                <Routes>
                  {/* Rutas Públicas y Generales */}
                  <Route path="/" element={<PaginaGeneral />} />
                  <Route path="/elegirusuario" element={<Elegirusuario />} />
                  <Route path="/elegirinicio" element={<Elegirinicio />} />

                  {/* Autenticación y Registro */}
                  <Route path="/registroPaciente" element={<RegistroPaciente />} />
                  <Route path="/registroMedico" element={<RegistroMedico />} />
                  <Route path="/registroCuidador" element={<RegistroCuidador />} />
                  <Route path="/inicioSesionPaciente" element={<InicioSesionPaciente />} />
                  <Route path="/inicioSesionMedico" element={<InicioSesionMedico />} />
                  <Route path="/inicioSesionCuidador" element={<InicioSesionCuidador />} />

                  {/* Rutas de Médico */}
                  <Route path="/medico/pacient" element={<Pacientes />} />
                  <Route path="/medico/pacient/:id" element={<DetallePaciente />} />
                  <Route path="/medico/pacient/:id/historial" element={<Historial />} />
                  <Route path="/medico/pacient/:id/progreso" element={<Progresopaciente />} />
                  <Route path="/medico/noticias" element={<Noticias />} />
                  <Route path="/medico/perfil" element={<PerfilCuidador />} />
                  <Route path="/medico/reddecontactosmia" element={<ChatSimplificadomiopaciente usuario_id={2} />} />
                  <Route path="/pendientesmedico" element={<AsignarEjercicio />} />
                  <Route path="/medico/crearEjercicio/:pacienteId" element={<CrearEjercicio />} />
                  <Route path="/medico/asignarEjercicio/:pacienteId" element={<AsignarEjercicio />} />
                  <Route path="/medico/quieresAsignar/:pacienteId/:ejercicioId" element={<QuieresAsignarlo />} />

                  {/* Rutas de Paciente */}
                  <Route path ="/paciente/seleccionAUDIO" element={<SeleccionAudio />} />
                  <Route path="/paciente/perfil" element={<PerfilPaciente />} />
                  <Route path="/paciente/noticias" element={<NoticiasPaciente />} />
                  <Route path="/paciente/notificaciones" element={<BotonNotificacion />} />
                  <Route path="/paciente/racha" element={<ListaRacha />} />
                  <Route path="/paciente/ejercitar" element={<Ejercitar />} />
                  <Route path="/paciente/eleccionEjercicio" element={<EleccionEjercicio />} />
                  <Route path="/paciente/seleccionDeEjercicios/:type" element={<SeleccionDeEjercicios />} />
                  <Route path="/paciente/ejercicio/:type/:id" element={<ConfirmarSeleccionEjercicio />} />
                  <Route path="/paciente/accionEjercitar/:type/:id" element={<AccionEjercitar />} />
                  <Route path="/paciente/video/:id" element={<Video />} />
                  <Route path="/paciente/video/:type/:id" element={<Video />} />
                  <Route path="/paciente/seleccionarArchivo/:type/:id" element={<SeleccionarArchivoVideo />} />
                  <Route path="/paciente/seleccionVIDEO/seleccionarArchivo/:type/:id" element={<SeleccionarArchivoVideo />} />
                  <Route path="/paciente/seleccionAUDIO/seleccionarArchivo/:type/:id" element={<SeleccionarArchivoAudio />} />
                  <Route path="/paciente/seleccionVIDEO/grabarVideo/:type/:id" element={<GrabarVideo />} />
                  <Route path="/paciente/seleccionAUDIO/grabarAudio/:type/:id" element={<GrabarAudio />} />
                  <Route path="/paciente/reddecontactosmia" element={<ChatSimplificadomiopaciente usuario_id={2} />} />

                  {/* Rutas de Cuidador */}
                  <Route path="/cuidador/perfil" element={<PerfilCuidador />} />
                  <Route path="/cuidador/noticias" element={<Noticias />} />
                  <Route path="/cuidador/noticias" element={<Noticias />} />
                  <Route path="/cuidador/reddecontactosmia" element={<ChatSimplificadomiopaciente usuario_id={2} />} />
                  <Route path="/cuidador/paginagralcuidador" element={<PaginaGralCuidador />} />
                  <Route path="/cuidador/guia" element={<Guia />} />
                  <Route path="/cuidador/habilitar-ejercicios" element={<HabilitarEjercicios />} />
                  <Route path="/cuidador/tutoriales" element={<Tutoriales />} />

                  {/* Multimedia / General */}
                  <Route path="/video" element={<Video />} />
                  <Route path="/subirvideo" element={<Video />} />


                </Routes>
              </main>
            </div>
          </PacienteProvider>
        </MedicoProvider>
      </RachaProvider>
    </CuidadorProvider>
  );
}

export default App;