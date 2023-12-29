import React from 'react';
import './App.css';

function Home() {
  return (
    <div className='card'>
      <div className='card-body'>
        <h5 className='card-title'>GraphQL Demo</h5>
        <p className='cap-first-letter:first-letter'>
          Lab7- This is a  front-end application that uses Apollo Client to connect to the GraphQL server
        </p>
        <p>
          It uses Apollo Server as the GraphQL server and Apollo Client and
          React as the client and demonstrates queries and mutations
        </p>
      </div>
    </div>
  );
}

export default Home;
