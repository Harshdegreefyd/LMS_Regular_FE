import React from 'react';

const ErrorTable = ({ errorData }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-red-600">Upload Errors</h2>
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-700">#</th>
              <th className="px-4 py-2 font-medium text-gray-700">Name</th>
              <th className="px-4 py-2 font-medium text-gray-700">Email</th>
              <th className="px-4 py-2 font-medium text-gray-700">Counsellor ID</th>
              <th className="px-4 py-2 font-medium text-gray-700">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {errorData.map((entry, index) => (
              <tr key={index} className="hover:bg-red-50">
                <td className="px-4 py-2 text-gray-500">{entry.index}</td>
                <td className="px-4 py-2">{entry.data.name}</td>
                <td className="px-4 py-2">{entry.data.email}</td>
                <td className="px-4 py-2">{entry.data.counsellorId}</td>
                <td className="px-4 py-2 text-red-600">{entry.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErrorTable;
