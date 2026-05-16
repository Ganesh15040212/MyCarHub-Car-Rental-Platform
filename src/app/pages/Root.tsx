import { Outlet } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';

export default function Root() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
