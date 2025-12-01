'use client';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      <video
        src={url}
        controls
        className="w-full rounded-lg"
      >
        Tu navegador no soporta la reproducción de video.
      </video>
    </div>
  );
}

