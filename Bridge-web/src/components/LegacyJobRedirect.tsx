import { Navigate, useParams } from 'react-router-dom';

/** Old links used `/job/:id`; forward to the seeker job detail route. */
export default function LegacyJobRedirect() {
  const { id } = useParams();
  const safeId = id && /^\d+$/.test(id) ? id : '1';
  return <Navigate to={`/seeker/jobs/${safeId}`} replace />;
}
