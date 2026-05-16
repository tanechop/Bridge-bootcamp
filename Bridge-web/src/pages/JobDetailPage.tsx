import { useParams } from 'react-router-dom';

export default function JobDetailPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto bg-surface">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-on-surface">Job Detail {id && `- ID: ${id}`}</h1>
        <p className="text-secondary">This is a placeholder for the job description and application flow.</p>
      </div>
    </div>
  );
}
