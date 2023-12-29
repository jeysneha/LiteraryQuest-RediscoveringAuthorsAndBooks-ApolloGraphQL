import React, {useState} from 'react';
import './App.css';
import ReactModal from 'react-modal';
import {useQuery, useMutation} from '@apollo/client';

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
let title, genres, publicationDate, publisher, summary, isbn, language, pageCount, price, format, authorId

function EditBookModal(props) {
  console.log(props.book)
  console.log(props.isOpen)
  const [showEditModal, setShowEditModal] = useState(props.isOpen);
  const [book, setBook] = useState(props.book);
  console.log(book)
 
  const [editBook, { data, error }] = useMutation(queries.EDIT_BOOK, {
    onCompleted: () => {
            title.value = '';
            genres.value = '';
            publicationDate.value = '';
            publisher.value = '';
            summary.value = '';
            isbn.value = '';
            language.value = '';
            pageCount.value = '';
            price.value = '';
            format.value = '';
            authorId.value = '';
      alert('Book Updated');
      setShowEditModal(false);
      props.handleClose();
    },
    onError: (error) => {
      console.log(error.networkError.result.errors[0])
      alert(`Error updating book: ${error.networkError.result.errors[0].message}`);
    }
  });
 
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setBook(null);

    props.handleClose();
  };

  
  return (
    <div>
      
      <ReactModal
        name='editModal'
        isOpen={showEditModal}
        contentLabel='Edit Book'
        style={customStyles}
      >
        <form
          className='form'
          id='add-book'
          onSubmit={async (e) => {
           //console.log(title.value)
            //console.log(typeof(isbn.value));
            // console.log(lastName.value);
             console.log(parseInt(pageCount.value));
            e.preventDefault();
            try {
              await editBook({
              variables: {
                id: props.book._id,
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
          } catch (error) {
            console.log(error);
            alert(`Error updating book: ${error.message}`);
   }
}}
            // title.value = '';
            // genres.value = '';
            // publicationDate.value = '';
            // publisher.value = '';
            // summary.value = '';
            // isbn.value = '';
            // language.value = '';
            // pageCount.value = '';
            // price.value = '';
            // format.value = '';
            // authorId.value = '';
            
            // setShowEditModal(false);
         
            // alert('Book Updated');
            // props.handleClose();
          
          
        >
          <div className='form-group'>
              <label>
                Title:
                <input
                  ref={(node) => { title = node; }}
                  defaultValue={book.title}
                  autoFocus={true}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Genres (Enter comma separated words):
                <input
                  ref={(node) => { genres = node; }}
                  defaultValue={book.genres}

                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Publication Date:
                <input
                  ref={(node) => { publicationDate = node; }}
                  defaultValue={book.publicationDate}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Publisher:
                <input
                  ref={(node) => { publisher = node; }}
                  defaultValue={book.publisher}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Summary:
                <textarea
                  ref={(node) => { summary = node; }}
                  defaultValue={book.summary}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                ISBN:
                <input
                  ref={(node) => { isbn = node; }}
                  defaultValue={book.isbn}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Language:
                <input
                  ref={(node) => { language = node; }}
                  defaultValue={book.language}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Page Count:
                <input
                  type="number"
                  ref={(node) => { pageCount = node; }}
                  defaultValue={book.pageCount}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Price:
                <input
                  type='number' step='0.00000000000000001'
                  ref={(node) => { price = node; }}
                  defaultValue={book.price}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Format (Enter comma separated words):
                <input
                  ref={(node) => { format = node; }}
        
                defaultValue={book.format}

                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Author ID:
                <input
                  ref={(node) => { authorId = node; }}
                  defaultValue={book.author._id}
                />
              </label>
        </div>
            <br />
            <button className='button add-button' type='submit'>
              Update Book
            </button>

        </form>

        <button className='button cancel-button' onClick={handleCloseEditModal}>
          Cancel
        </button>
      </ReactModal>
    </div>
  );
}

export default EditBookModal;
