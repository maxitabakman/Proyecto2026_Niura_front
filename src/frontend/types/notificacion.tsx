type Notificacion = {
    id: string;
    emisor: string;
    mensaje: string;
};

type NotificacionMensaje = Notificacion & {
    tipo: 'mensaje';
}

type NotificacionRecordatorio = Notificacion & {
    tipo: 'recordatorio';
    tipoTarea: 'motriz' | 'cognitiva';
}

type NotificacionRacha = Notificacion & {
    tipo: 'racha';
    diasRacha: number;
}

type NotificacionSolicitud = Notificacion & {
    tipo: 'solicitud';
}

export type Notificaciones = NotificacionMensaje | NotificacionRecordatorio | NotificacionRacha | NotificacionSolicitud;