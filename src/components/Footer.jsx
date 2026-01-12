import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-200 text-black text-center p-4 ">
      <p>&copy; {new Date().getFullYear()} DegreeFyd. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
