import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '../components/LandingPage';
import { AuthModal } from '../components/AuthModal';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <>
      <LandingPage onLoginClick={() => setIsAuthModalOpen(true)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <Footer />
    </>
  );
}
