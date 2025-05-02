import React from 'react';

const SimpleTest = ({ message = 'Hello World' }) => {
  return (
    <div className="simple-test">
      <h1>{message}</h1>
      <button onClick={() => alert('Button clicked!')}>Click Me</button>
    </div>
  );
};

export default SimpleTest; 