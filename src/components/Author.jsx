import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import {useQuery} from '@apollo/client';
import queries from '../queries';
import { useParams } from 'react-router-dom';
import { Grid, Card, CardContent, Typography,Button } from '@mui/material';
import DeleteAuthorModal from './DeleteAuthorModal';
import EditAuthorModal from './EditAuthorModal';
console.log("kkk")
function Author() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editAuthor, setEditAuthor] = useState(null);
    const [deleteAuthor, setDeleteAuthor] = useState(null);

    const { id } = useParams(); 
  const { loading, error, data,refetch } = useQuery(queries.GET_AUTHOR_BY_ID, {
    variables: { id: id ,"limit": 3},
    fetchPolicy: 'cache-and-network'
  });
  
  const handleOpenEditModal = (author) => {
    setShowEditModal(true);
    setEditAuthor(author);
    
  };

  const handleOpenDeleteModal = (author) => {
    setShowDeleteModal(true);
    setDeleteAuthor(author);
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
    const {getAuthorById} = data;
    //console.log(getAuthorById)
    return (
  <div>
    
      
        <Card>
          <CardContent>
           
           
            <Typography variant="body1">Author first_name: {getAuthorById.first_name}</Typography>
            <Typography variant="body1">Author last_name: {getAuthorById.last_name}</Typography>
            <Typography variant="body1">Date of birth: {getAuthorById.date_of_birth}</Typography>
            <Typography variant="body1">home town City: {getAuthorById.hometownCity}</Typography>
            <Typography variant="body1">home town State: {getAuthorById.hometownState}</Typography>
            <Typography variant="body1">num Of Books: {getAuthorById.numOfBooks}</Typography>
            <Typography variant="body1">
                    Books: 
                    </Typography>
                    <ul>
                    {getAuthorById.books.map((book, index) => (
                        <li key={index}>{book.title} </li>
                    ))}
                    </ul>
           
           
          </CardContent>
          <Button onClick={() => handleOpenEditModal(getAuthorById)}>Edit</Button>
        <Button onClick={() => handleOpenDeleteModal(getAuthorById)}>Delete</Button>
          
        </Card>
        
        {showEditModal && (
          <EditAuthorModal
          
            isOpen={showEditModal}
            author={editAuthor}
            handleClose={handleCloseModals}
            
          />
        )}

        {showDeleteModal && (
          <DeleteAuthorModal
            isOpen={showDeleteModal}
            handleClose={handleCloseModals}
            deleteAuthor={deleteAuthor}
            
          />
        )}
      
  
    <br/>
    <br/>
    <button onClick={() => navigate('/authors')}>Back to Authors</button>
        
    </div>
  );
}
}
export default Author;