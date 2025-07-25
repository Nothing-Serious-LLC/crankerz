import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AuthWrapper } from './components/Auth/AuthWrapper';
import { Home } from './components/Pages/Home';
import { Community } from './components/Pages/Community';
import { Store } from './components/Pages/Store';
import { Layout } from './components/Layout/Layout';
import { useAuth } from './context/AuthContext';
import './App.css';

type Tab = 'community' | 'home' | 'store';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<Tab>('home');

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'home':
        return <Home />;
      case 'community':
        return <Community />;
      case 'store':
        return <Store />;
      default:
        return <Home />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderCurrentTab()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
