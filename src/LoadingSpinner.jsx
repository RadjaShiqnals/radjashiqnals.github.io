import React from 'react';
import './App.css'; // Ensure this file contains the necessary CSS

const LoadingSpinner = ({ showCloseButton, onClose }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      {showCloseButton && (
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      )}
    </div>
  );
};

export default LoadingSpinner;