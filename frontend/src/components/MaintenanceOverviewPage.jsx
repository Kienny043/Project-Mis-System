import React from 'react';
import { useNavigate,Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer.jsx'

export default function ManagementOverview({ onNavigate }) {
  const cards = [
    {
      title: 'Staffers',
      description: 'Manage personnel responsible for handling maintenance tasks and system operations.',
      page: 'staffers',
    },
    {
      title: 'Buildings',
      description: 'Oversee all registered buildings, their details, and which staff members are assigned to them.',
      page: 'buildings',
    },
    {
      title: 'Complaints',
      description: 'Monitor system complaints, track their status, and assign them to the proper staff.',
      page: 'complaints',
    },
  ];

  return (<>
    <Header showSearch={false} />
    <div className="p-6 max-w-7xl min-h-screen flex flex-col mx-auto height: 100vh;">
      <h1 className="text-3xl font-bold mb-6">Management</h1>
      <p className="mb-8 text-gray-600">
        Manage the core resources of the maintenance system — staff, buildings, and complaints.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          >
            <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
            <p className="text-gray-600">{card.description}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Link to={`/maintenance/${card.title.toLowerCase()}`}>
                View {card.title}
              </Link>
              
            </button>
          </div>
        ))}
      </div>
    </div>
    <Footer/>
    </>
  );
}
