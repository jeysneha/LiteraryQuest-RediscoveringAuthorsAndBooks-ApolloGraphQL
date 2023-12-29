import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import {useQuery} from '@apollo/client';
import queries from '../queries';
import { useParams } from 'react-router-dom';
import { Grid, Card, CardContent, Typography,Button } from '@mui/material';
import DeleteBookModal from './DeleteBookModal';
import EditBookModal from './EditBookModal';
console.log("kkk")
function Book() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [deleteBook, setDeleteBook] = useState(null);

    const { id } = useParams(); 
  const { loading, error, data,refetch } = useQuery(queries.GET_BOOK_BY_ID, {
    variables: { id: id },
    fetchPolicy: 'cache-and-network'
  });
  const handleOpenEditModal = (book) => {
    setShowEditModal(true);
    setEditBook(book);
    
  };

  const handleOpenDeleteModal = (book) => {
    setShowDeleteModal(true);
    setDeleteBook(book);
  };
  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    refetch()
  };
  const navigate = useNavigate();
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (data) {
    const {getBookById} = data;
    //console.log(getBookById)
    return (
  <div>
    
      
        <Card>
          <CardContent>
           
            <Typography variant="h5">{getBookById.title}</Typography>
            <Typography variant="body1">Genres: {getBookById.genres}</Typography>
            <Typography variant="body1">Publication Date: {getBookById.publicationDate}</Typography>
            <Typography variant="body1">Publisher: {getBookById.publisher}</Typography>
            <Typography variant="body1">Summary: {getBookById.summary}</Typography>
            <Typography variant="body1">ISBN: {getBookById.isbn}</Typography>
            <Typography variant="body1">Language: {getBookById.language}</Typography>
            <Typography variant="body1">Page Count: {getBookById.pageCount}</Typography>
            <Typography variant="body1">Price: ${getBookById.price}</Typography>
            <Typography variant="body1">Format: {getBookById.format}</Typography>
            <Typography variant="body1">Author: {getBookById.author.first_name} {getBookById.author.last_name}</Typography>
          </CardContent>
          <Button onClick={() => handleOpenEditModal(getBookById)}>Edit</Button>
        <Button onClick={() => handleOpenDeleteModal(getBookById)}>Delete</Button>
          
        </Card>
        
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
      
  
    <br/>
    <br/>
    <button onClick={() => navigate('/books')}>Back to Books</button>
        
    </div>
  );
}
}
export default Book;