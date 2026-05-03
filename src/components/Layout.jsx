import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex-grow container" style={{ padding: '2rem 1.5rem' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
