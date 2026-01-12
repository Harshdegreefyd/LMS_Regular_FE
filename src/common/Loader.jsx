import React from "react";

const Loader = ({ size = 40, color = "#f6c300" }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderTop: "4px solid transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
      className="w-full h-screen border-4 border-blue-600"
    />
  );
};

export default Loader;
