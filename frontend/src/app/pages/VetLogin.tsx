import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function VetLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main login page with type=clinic
    navigate('/login?type=clinic', { replace: true });
  }, [navigate]);

  return null;
}