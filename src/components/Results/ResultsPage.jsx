import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const ResultsPage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new overview page structure
    if (resultId) {
      navigate(`/results/${resultId}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [resultId, navigate]);

  // This component now serves as a redirect to the new structure
  return null;
};

export default ResultsPage;
