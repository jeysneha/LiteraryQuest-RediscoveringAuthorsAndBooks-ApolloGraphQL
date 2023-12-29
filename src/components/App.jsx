import React from 'react';
import './App.css';
import {NavLink, Route, Routes} from 'react-router-dom';
import Home from './Home';
import Books from './Books';
import Book from './Book';
import Authors from './Authors';
import Author from './Author';
import Search from './Search';

function App() {
  return (
    <div>
      <header className='App-header'>
        <h1 className='App-title center'>
          GraphQL With Apollo Client/Server Demo
        </h1>
        <nav className='center'>
          <NavLink className='navlink' to='/'>
            Home
          </NavLink>
          <NavLink className='navlink' to='/books'>
            Books
          </NavLink>

          <NavLink className='navlink' to='/authors'>
            Authors
          </NavLink>
          <NavLink className='navlink' to='/search'>
            Search
          </NavLink>
        </nav>
      </header>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/books/' element={<Books />} />
        <Route path='/books/:id' element={<Book />} />
        <Route path='/authors/' element={<Authors />} />
        <Route path='/authors/:id' element={<Author />} />
        <Route path='/search' element={<Search />} />
        
        
      </Routes>
    </div>
  );
}

export default App;
