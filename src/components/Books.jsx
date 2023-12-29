import React, {useState} from 'react';
import './App.css';

import {useQuery} from '@apollo/client';
import queries from '../queries';
import {Link} from 'react-router-dom';
import Add from './Add';
import DeleteBookModal from './DeleteBookModal';
import EditBookModal from './EditBookModal';
import { Grid, Card, CardContent, Typography, Button } from '@mui/material';
function Books() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);

  const {loading, error, data} = useQuery(queries.GET_BOOKS, {
    fetchPolicy: 'cache-and-network'
  });
//console.log(data.books)
  const handleOpenEditModal = (book) => {
    setShowEditModal(true);
    setEditBook(book);
  };

  const handleOpenDeleteModal = (book) => {
    setShowDeleteModal(true);
    setDeleteBook(book);
  };
  const closeAddFormState = () => {
    setShowAddForm(false);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  if (data) {
    const {books} = data;
    return (
      <div>
        <Button className='button' onClick={() => setShowAddForm(!showAddForm)}>
          Create Book
        </Button>
        {showAddForm && (
          <Add type='book' closeAddFormState={closeAddFormState} />
        )}
        <br />
        <br />
        <Grid container spacing={2} style={{ marginTop: 20 }}>
        {books.map((book) => <Grid item xs={12} sm={6} md={4} key={book._id}>
            <Card variant='outlined' sx={{ borderRadius: 5 }}>
              <Link to={`/books/${book._id}`} >
              
                <CardContent>
                  <Typography variant="h5">{book.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Author: {book.author.first_name}
                  </Typography>
                  <Typography variant="body2">
                    Genres: {book.genres.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    Language: {book.language}
                  </Typography>
                  <Typography variant="body2">
                    Price: ${book.price}
                  </Typography>
                </CardContent>
              </Link>
              <Button onClick={() => handleOpenEditModal(book)}>Edit</Button>
              <Button onClick={() => handleOpenDeleteModal(book)}>Delete</Button>
            </Card>
          </Grid>
        ) }
      </Grid>
        {console.log(editBook)}
        {showEditModal && (
          <EditBookModal
          
            isOpen={showEditModal}
            book={editBook}
            handleClose={handleCloseModals}
          />
        )}

        {showDeleteModal && (
          <DeleteBookModal
            isOpen={showDeleteModal}
            handleClose={handleCloseModals}
            deleteBook={deleteBook}
          />
        )}
      </div>
    );
  
  } else if (loading) {
    return <div>Loading</div>;
  } else if (error) {
    return <div>{error.message}</div>;
  }
}

export default Books;
