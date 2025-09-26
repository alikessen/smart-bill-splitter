import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Users } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Bill Splitter
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Effortlessly split restaurant bills with friends. Browse menus, place orders, 
            and divide costs fairly with multiple splitting options.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => navigate('/menu')}
              className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Menu className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">View Menu</h3>
                  <p className="text-gray-600">
                    Browse available items and add them to your order
                  </p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/split')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-blue-500 p-4 rounded-full group-hover:bg-blue-400 transition-colors">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Start Bill Split</h3>
                  <p className="text-blue-100">
                    Calculate how much each person should pay
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}