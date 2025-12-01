'use client';

interface ActivityPlayerProps {
  activityId: string;
}

export default function ActivityPlayer({ activityId }: ActivityPlayerProps) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Reproductor de Actividad</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Actividad ID: {activityId}
      </p>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Reproductor de actividades (pendiente de implementar)
      </p>
    </div>
  );
}

