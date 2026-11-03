export const formatearFecha = (fechaIso: string): string => {
    if (!fechaIso) return '';
  
    const fecha = new Date(fechaIso);
    const ahora = new Date();
  
    // Si la fecha es inválida
    if (isNaN(fecha.getTime())) return '';
  
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 1. Hoy (muestra la hora en formato 24h, ej: "10:15")
    if (diffDias === 0) {
      return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  
    // 2. Hace 1 día
    if (diffDias === 1) {
      return 'Ayer';
    }
  
    // 3. Menos de 1 semana
    if (diffDias < 7) {
      return `Hace ${diffDias} días`;
    }
  
    // 4. Menos de 1 mes (Semanas)
    if (diffDias < 30) {
      const semanas = Math.floor(diffDias / 7);
      return semanas === 1 ? 'Hace 1 semana' : `Hace ${semanas} semanas`;
    }
  
    // 5. Menos de 1 año (Meses)
    if (diffDias < 365) {
      const meses = Math.floor(diffDias / 30);
      return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
    }
  
    // 6. Más de un año
    return 'Hace más de un año';
  };