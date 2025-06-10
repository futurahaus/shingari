import Sidebar from '@/components/layout/Sidebar';

export default function ComprasPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Mis Compras</h2>
          <p className="text-gray-600">Aquí se mostrarán las compras del usuario. (Mockup)</p>
        </div>
      </div>
    </div>
  );
} 