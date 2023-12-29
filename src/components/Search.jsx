import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import queries from '../queries';
import {Link} from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function Search() {
  const [searchType, setSearchType] = useState('booksByGenre');
  const [genre, setGenre] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [executeSearch, { data, loading, error }] = useLazyQuery(
    searchType === 'booksByGenre' ? queries.GET_BOOKS_BY_GENRE :
    searchType === 'booksByPriceRange' ? queries.GET_BOOKS_BY_PRICE_RANGE :
    queries.GET_SEARCH_AUTHORS_BY_NAME,
    { fetchPolicy: 'cache-and-network' }
  );


const handleSearch = (event) => {
    event.preventDefault(); // Prevent default form submission
  
    let query;
    let variables;
  
    if (searchType === 'booksByGenre') {
      if (!genre) {
        alert("Please provide a genre.");
        return;
      }
      query = queries.GET_BOOKS_BY_GENRE;
      variables = { genre };
    } 
    else if (searchType === 'booksByPriceRange') {
      if ( !max) {
        alert("Please provide maximum prices.");
        return;
      }
      query = queries.GET_BOOKS_BY_PRICE_RANGE;
      variables = { min: parseFloat(min) || 0, max: parseFloat(max) };
    } else if (searchType === 'searchAuthorsByName') {
      if (!searchTerm) {
        alert("Please provide an author's name.");
        return;
      }
      query = queries.GET_SEARCH_AUTHORS_BY_NAME;
      variables = { searchTerm };
    }
  
    if (query) {
      executeSearch({ query, variables });
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <select value={searchType} onChange={e => setSearchType(e.target.value)}>
          <option value="booksByGenre">Books by Genre</option>
          <option value="booksByPriceRange">Books by Price Range</option>
          <option value="searchAuthorsByName">Search Authors by Name</option>
        </select>

        {searchType === 'booksByGenre' && (
          <input type="text" value={genre} onChange={e => setGenre(e.target.value)} placeholder="Genre" />
        )}

        {searchType === 'booksByPriceRange' && (
          <div>
            <input type='number' step='0.000000000000000001' value={min} onChange={e => setMin(e.target.value)} placeholder="Min Price" />
            <input type='number' step='0.000000000000000001' value={max} onChange={e => setMax(e.target.value)} placeholder="Max Price" />
          </div>
        )}

        {searchType === 'searchAuthorsByName' && (
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Author Name" />
        )}

        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
      <div>
        {searchType === 'booksByGenre'&& data.booksByGenre && data.booksByGenre.map((book) => (
          <Card key={book._id} variant="outlined">
            <Link to={`/books/${book._id}`} >
            <CardContent>
              <Typography variant="h5" component="div">
                {book.title}
              </Typography>
              <Typography color="textSecondary">
                Genres: {book.genres.join(", ")}
              </Typography>
              <Typography variant="body2">
                Price: ${book.price}
              </Typography>
              <Typography variant="body2">
                Language: {book.language}
              </Typography>
            </CardContent>
            </Link>
          </Card>
        ))}
        {searchType === 'booksByGenre'&& data.booksByGenre&&data.booksByGenre.length===0 && (<p>{`Oops! Sorry no results for the search term:(`}</p>)}

        {searchType === 'booksByPriceRange'&&data.booksByPriceRange && data.booksByPriceRange.map((book) => (
        
          <Card key={book._id} variant="outlined">
            <Link to={`/books/${book._id}`} >
            <CardContent>
              <Typography variant="h5" component="div">
                {book.title}
              </Typography>
              <Typography color="textSecondary">
                Genres: {book.genres.join(", ")}
              </Typography>
              <Typography variant="body2">
                Price: ${book.price}
              </Typography>
              <Typography variant="body2">
                Language: {book.language}
              </Typography>
            </CardContent>
            </Link>
          </Card>
          
        ))}
   {searchType === 'booksByPriceRange'&&data.booksByPriceRange && data.booksByPriceRange.length===0 && (<p> {`Oops! Sorry no results for the search term:(`}</p>)}
        {searchType === 'searchAuthorsByName'&&data.searchAuthorsByName && data.searchAuthorsByName.map((author) => (
          <Card key={author._id} variant="outlined">
            <Link to={`/authors/${author._id}`}>
            <CardContent>
              <Typography variant="h5" component="div">
                {author.first_name} {author.last_name}
              </Typography>
              <Typography variant="body2">
                Number of Books: {author.numOfBooks}
              </Typography>
              <Typography variant="body2">
              Date Of Birth: {author.date_of_birth}
              </Typography>
              
            </CardContent>
            </Link>
          </Card>
        ))}
        {searchType === 'searchAuthorsByName'&&data.searchAuthorsByName &&data.searchAuthorsByName.length===0 &&  (<p>{`Oops! Sorry no results for the search term:(`}</p>)}
      </div>
    )}
  </div>
);
}

export default Search;
