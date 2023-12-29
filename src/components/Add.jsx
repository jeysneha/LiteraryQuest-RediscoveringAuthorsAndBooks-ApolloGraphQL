import React from 'react';
import './App.css';

import {useQuery, useMutation} from '@apollo/client';
//Import the file where my query constants are defined
import queries from '../queries';

function Add(props) {
  const [addBook] = useMutation(queries.ADD_BOOK, {
    update(cache, {data: {addBook}}) {
      const {books} = cache.readQuery({
        query: queries.GET_BOOKS
      });
      cache.writeQuery({
        query: queries.GET_BOOKS,
        data: {books: [...books, addBook]}
      });
    },onError: (error) => {
      alert(`Error adding book: ${error.networkError.result.errors[0].message}`);
    },
    onCompleted: () => {
      alert('Book Added');
      document.getElementById('add-book-form').reset(); 
      props.closeAddFormState();
    }
  });
  const [addAuthor] = useMutation(queries.ADD_AUTHOR, {
    update(cache, {data: {addAuthor}}) {
      const {authors} = cache.readQuery({
        query: queries.GET_AUTHORS
      });
      cache.writeQuery({
        query: queries.GET_AUTHORS,
        data: {authors: [...authors, addAuthor]}
      });
    },
    onError: (error) => {
      alert(`Error adding author: ${error.networkError.result.errors[0].message}`);
    },
    onCompleted: () => {
      alert('Author Added');
      document.getElementById('add-author-form').reset(); 
      props.closeAddFormState();
    }
  });


  const onSubmitBook = (e) => {
    e.preventDefault();
  let title = document.getElementById('title');
  let genres = document.getElementById('genres'); 
  let publicationDate = document.getElementById('publicationDate');
  let publisher = document.getElementById('publisher');
  let summary = document.getElementById('summary');
  let isbn = document.getElementById('isbn');
  let language = document.getElementById('language');
  let pageCount = document.getElementById('pageCount');
  let price = document.getElementById('price');
  let format = document.getElementById('format'); 
  let authorId = document.getElementById('authorId');
//console.log(publicationDate.value)
  addBook({
    variables: {
      title: title.value,
      genres: genres.value?genres.value.split(',').map(genre => genre.trim()): [],
      publicationDate: publicationDate.value,
      publisher: publisher.value,
      summary: summary.value,
      isbn: isbn.value,
      language: language.value,
      pageCount: parseInt(pageCount.value,10),
      price: parseFloat(price.value),
      format: format.value?format.value.split(',').map(format => format.trim()): [],
      authorId: authorId.value
    }
  });

  // document.getElementById('add-book-form').reset(); 
  // alert('Book Added');
  // props.closeAddFormState();
  };





  const onSubmitAuthor = (e) => {
    e.preventDefault();
  let firstName = document.getElementById('firstName');
  let lastName = document.getElementById('lastName'); 
  let dateOfBirth = document.getElementById('dateOfBirth');
  let hometownCity = document.getElementById('hometownCity');
  let hometownState = document.getElementById('hometownState');
  console.log(firstName.value)
  console.log(lastName.value)
  console.log(dateOfBirth.value)
  console.log(hometownCity.value)
  console.log(hometownState.value)
  
  addAuthor({
    variables: {
      firstName: firstName.value,
      lastName: lastName.value,
      dateOfBirth: dateOfBirth.value,
      hometownCity: hometownCity.value,
      hometownState: hometownState.value,   
    }
  });

  // document.getElementById('add-author-form').reset(); 
  // alert('Author Added');
  // props.closeAddFormState();
  };

  
  let body = null;
  if (props.type === 'book') {
    body = (
      <div className='card'>
        <form className='form' id='add-book-form' onSubmit={onSubmitBook}>
          <div className='form-group'>
            <label>Title:<input id='title' required autoFocus /></label>
          </div>
          <div className='form-group'>
            <label>Genres (Enter comma-separated words):<input id='genres' required /></label>
          </div>
          <div className='form-group'>
            <label>Publication Date:<input  id='publicationDate' required /></label>
          </div>
          <div className='form-group'>
            <label>Publisher:<input id='publisher' required /></label>
          </div>
          <div className='form-group'>
            <label>Summary:<textarea id='summary' required /></label>
          </div>
          <div className='form-group'>
            <label>ISBN:<input id='isbn' required /></label>
          </div>
          <div className='form-group'>
            <label>Language:<input id='language' required /></label>
          </div>
          <div className='form-group'>
            <label>Page Count:<input type='number' id='pageCount' required /></label>
          </div>
          <div className='form-group'>
            <label>Price:<input type='number' step='0.00000000000000001' id='price' required /></label>
          </div>
          <div className='form-group'>
            <label>Format (Enter comma-separated):<input id='format' required /></label>
          </div>
          <div className='form-group'>
            <label>Author ID:<input id='authorId' required /></label>
          </div>
          <button className='button add-button' type='submit'>Add Book</button>

          <button type='button' className='button cancel-button' onClick={() => {document.getElementById('add-book-form').reset(); props.closeAddFormState();}}>
            Cancel
            </button>
        </form>
      </div>
    );
  }
  else if (props.type === 'author') {
    body = (
      <div className='card'>
        <form className='form' id='add-author-form' onSubmit={onSubmitAuthor}>
          <div className='form-group'>
            <label>first name:<input id='firstName' required  /></label>
          </div>
          <div className='form-group'>
            <label> last name:<input id='lastName' required /></label>
          </div>
          <div className='form-group'>
            <label>date Of Birth:<input  id='dateOfBirth' required /></label>
          </div>
          <div className='form-group'>
            <label>home town City:<input id='hometownCity' required /></label>
          </div>
          <div className='form-group'>
            <label>home town State:<textarea id='hometownState' required /></label>
          </div>
          
          <button className='button add-button' type='submit'>Add Author</button>

          <button type='button' className='button cancel-button' onClick={() => {document.getElementById('add-author-form').reset(); props.closeAddFormState();}}>
            Cancel
            </button>
        </form>
      </div>
    );
  }
  
  return <div>{body}</div>;
}

export default Add;
