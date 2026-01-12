const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;