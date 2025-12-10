import Header from '@/components/sections/header';
import ReservationContent from '@/components/sections/reservation-content';

export default function ReservationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        <ReservationContent />
      </main>
    </div>
  );
}