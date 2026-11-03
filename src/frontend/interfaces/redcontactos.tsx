export type EstadoEntrega = 'enviando' | 'enviado' | 'entregado' | 'leido' | 'error'
export interface Mensaje {
  id_mensaje: string;            
  id_conversacion: string;       
  id_emisor: number;
  id_receptor: number;
  contenido: string;             
  estado_entrega: EstadoEntrega
  fecha_envio: string;}
export interface Conversacion {
  id_conversacion: string;
  id_contacto: number;
  nombre_contacto: string;
  avatar_contacto: string;
  estado_presencia: 'online' | 'offline';
  mensajes_no_leidos: number;
  mensajes: Mensaje[]
}