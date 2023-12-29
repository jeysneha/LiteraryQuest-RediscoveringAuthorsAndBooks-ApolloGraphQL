import React, {useState} from 'react';
import './App.css';
import {useMutation} from '@apollo/client';
import ReactModal from 'react-modal';

//Import the file where my query constants are defined
import queries from '../queries';

//For react-modal
ReactModal.setAppElement('#root');
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    border: '1px solid #28547a',
    borderRadius: '4px'
  }
};

function DeleteBookModal(props) {
  const [showDeleteModal, setShowDeleteModal] = useState(props.isOpen);
  const [book, setBook] = useState(props.deleteBook);

  const [removeBook] = useMutation(queries.REMOVE_BOOK, {
    update(cache) {
      cache.modify({
        fields: {
          books(existingBooks, { readField }) {
            return existingBooks.filter(
              bookRef => book._id !== readField('_id', bookRef),
            );
          },
        },
      });
    },
  });

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setBook(null);
    props.handleClose();
  };

  return (
    <div>
      {/*Delete Book Modal */}
      <ReactModal
        name='deleteModal'
        isOpen={showDeleteModal}
        contentLabel='Delete Book'
        style={customStyles}
      >
        {/*Here we set up the mutation, since I want the data on the page to update
				after I have added someone, I need to update the cache. If not then
				I need to refresh the page to see the data updated 

				See: https://www.apollographql.com/docs/react/essentials/mutations for more
				information on Mutations
			*/}
        <div>
          <p>
            Are you sure you want to delete {book.title}{' '}?
          </p>

          <form
            className='form'
            id='delete-book'
            onSubmit={(e) => {
              e.preventDefault();
              removeBook({
                variables: {
                  id: book._id
                }
              });
              setShowDeleteModal(false);

              alert('Book Deleted');
              props.handleClose();
            }}
          >
            <br />
            <br />
            <button className='button add-button' type='submit'>
              Delete Book
            </button>
          </form>
        </div>

        <br />
        <br />
        <button
          className='button cancel-button'
          onClick={handleCloseDeleteModal}
        >
          Cancel
        </button>
      </ReactModal>
    </div>
  );
}

export default DeleteBookModal;
