import React, {useState} from 'react';
import './App.css';
import {useQuery} from '@apollo/client';
import queries from '../queries';
import {Link} from 'react-router-dom';
import Add from './Add';
import DeleteAuthorModal from './DeleteAuthorModal';
import EditAuthorModal from './EditAuthorModal';
import { Grid, Card, CardContent, Typography, Button } from '@mui/material';
function Authors() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editAuthor, setEditAuthor] = useState(null);
  const [deleteAuthor, setDeleteAuthor] = useState(null);

  const {loading, error, data} = useQuery(queries.GET_AUTHORS, {
    fetchPolicy: 'cache-and-network'
  });
//console.log(data.authors)
  const handleOpenEditModal = (author) => {
    setShowEditModal(true);
    setEditAuthor(author);
  };

  const handleOpenDeleteModal = (author) => {
    setShowDeleteModal(true);
    setDeleteAuthor(author);
  };
  const closeAddFormState = () => {
    setShowAddForm(false);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  if (data)  {
    const {authors} = data;
    return (
      <div>
        <Button className='button' onClick={() => setShowAddForm(!showAddForm)}>
          Create Author
        </Button>
        {showAddForm && (
          <Add type='author' closeAddFormState={closeAddFormState} />
        )}
        <br />
        <br />
        <Grid container spacing={2} style={{ marginTop: 20 }}>
        {authors.map((author) => <Grid item xs={12} sm={6} md={4} key={author._id}>
            <Card variant='outlined' sx={{ borderRadius: 5 }}>
              <Link to={`/authors/${author._id}`} >
              
                <CardContent>
                  
                  <Typography variant="body2" >
                    Author First Name: {author.first_name}
                  </Typography>
                  <Typography variant="body2" >
                    Author Last Name: {author.last_name}
                  </Typography>
                  <Typography variant="body2">
                  date_of_birth: {author.date_of_birth}
                  </Typography>
                  <Typography variant="body2">
                  numOfBooks: {author.numOfBooks}
                  </Typography>
                  <Typography variant="body2">
                  hometownCity: {author.hometownCity}
                  </Typography>
                </CardContent>
              </Link>
              <Button onClick={() => handleOpenEditModal(author)}>Edit</Button>
              <Button onClick={() => handleOpenDeleteModal(author)}>Delete</Button>
            </Card>
          </Grid>
        ) }
      </Grid>
        {console.log(editAuthor)}
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
      </div>
    );
  
  } else if (loading) {
    return <div>Loading</div>;
  } else if (error) {
    return <div>{error.message}</div>;
  }
}

export default Authors;
