import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, BarChart3, TrendingUp } from 'lucide-react';

const AnalyserWelcome = () => {
  const navigate = useNavigate();

  const reports = [
    {
      title: "Reports Portal",
      description: "Access all unified analytics and tracking dashboards in one place",
      icon: BarChart3,
      path: "/analysisreport"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome, Analyser
          </h1>
          <p className="text-lg text-gray-600">
            Access your reports and analytics dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {reports.map((report, index) => {
            const Icon = report.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(report.path)}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-400 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-600 transition-colors duration-200">
                    <Icon className="text-blue-600 group-hover:text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {report.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {report.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyserWelcome;
