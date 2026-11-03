import  { useState } from 'react';

interface VideoItem {
  id: string;
  url: string;
  filename: string;
}

const RECENT_VIDEOS: VideoItem[] = [
  { id: '1', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', filename: 'video-reciente-1.mp4' },
  { id: '2', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', filename: 'video-reciente-2.mp4' },
  { id: '3', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', filename: 'video-reciente-3.mp4' },
];

const MORE_VIDEOS: VideoItem[] = [
  { id: '4', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyplays.mp4', filename: 'video-archivo-1.mp4' },
  { id: '5', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', filename: 'video-archivo-2.mp4' },
  { id: '6', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', filename: 'video-archivo-3.mp4' },
];

export default function App() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (video: VideoItem) => {
    setDownloadingId(video.id);
    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = video.filename;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(video.url, '_blank');
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  return (
    <div className="">
      {/* Botón Volver */}
      <div>
        <button
          onClick={() => window.history.back()}
          className="w-9 h-9 rounded-full border border-black flex items-center justify-center hover:bg-black/10 transition-colors"
          title="Volver"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      </div>

      {/* Contenido principal en una vista compacta */}
      <div className="flex-1 flex flex-col justify-center space-y-3 my-auto max-w-5xl mx-auto w-full">
        {/* Sección: Más recientes */}
        <section>
          <h2 className="text-xl font-bold mb-2 tracking-tight">Más recientes</h2>
          <div className="grid grid-cols-3 gap-4">
            {RECENT_VIDEOS.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isDownloading={downloadingId === video.id}
                onDownload={() => handleDownload(video)}
              />
            ))}
          </div>
        </section>

        {/* Sección: Más archivos */}
        <section>
          <h2 className="text-xl font-bold mb-2 tracking-tight">Más archivos</h2>
          <div className="grid grid-cols-3 gap-4">
            {MORE_VIDEOS.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isDownloading={downloadingId === video.id}
                onDownload={() => handleDownload(video)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Barra inferior deslizante */}
      <div className="w-full max-w-xs mx-auto pb-1">
        <div className="w-full bg-[#c2e2eb] h-2.5 rounded-full relative overflow-hidden border border-black/10">
          <div className="absolute left-3 top-0 bottom-0 w-10 bg-[#2b3543] rounded-full" />
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, isDownloading, onDownload }: { video: VideoItem; isDownloading: boolean; onDownload: () => void }) {
  return (
    <div
      onClick={onDownload}
      className="aspect-[16/10] bg-[#dcdcdc] border border-black rounded-none cursor-pointer overflow-hidden group relative"
      title="Haz clic para descargar"
    >
      <video
        src={`${video.url}#t=0.5`}
        preload="metadata"
        className="w-full h-full object-cover pointer-events-none"
        muted
        loop
        playsInline
        onMouseEnter={(e) => e.currentTarget.play()}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0.5;
        }}
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="bg-black/70 text-white p-2 rounded-full shadow-md">
          {isDownloading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}