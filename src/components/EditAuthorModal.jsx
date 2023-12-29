import React, {useState} from 'react';
import './App.css';
import ReactModal from 'react-modal';
import {useQuery, useMutation} from '@apollo/client';
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
let first_name,last_name,date_of_birth,hometownCity,hometownState

function EditAuthorModal(props) {

  console.log("KK"+props.author)
  console.log(props.isOpen)
  const [showEditModal, setShowEditModal] = useState(props.isOpen);
  const [author, setAuthor] = useState(props.author);
  console.log(author)
  //const {loading, error, data} = useQuery(queries.GET_EMPLOYERS);
  const [editAuthor] = useMutation(queries.EDIT_AUTHOR, {
    onCompleted: () => {
            first_name.value = '';
            last_name.value = '';
            date_of_birth.value = '';
            hometownCity.value = '';
            hometownState.value = '';

      alert('Author Updated');
      setShowEditModal(false);
      props.handleClose();
    },
    onError: (error) => {
      alert(`Error updating author: ${error.networkError.result.errors[0].message}`);
    }
  });
  //const [errorMessage, setErrorMessage] = useState('');
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setAuthor(null);

    props.handleClose();
  };

  
  return (
    <div>
      
      <ReactModal
        name='editModal'
        isOpen={showEditModal}
        contentLabel='Edit Author'
        style={customStyles}
      >
        <form
          className='form'
          id='add-author'
          onSubmit={(e) => {
           console.log(hometownCity.value)
       
            e.preventDefault();
            editAuthor({
              variables: {
                id: props.author._id,
                firstName: first_name.value,
                lastName: last_name.value,
                dateOfBirth: date_of_birth.value,
                hometownCity: hometownCity.value,
                hometownState: hometownState.value,
                
              }
            });
            // first_name.value = '';
            // last_name.value = '';
            // date_of_birth.value = '';
            // hometownCity.value = '';
            // hometownState.value = '';
            
            // setShowEditModal(false);
         
            // alert('Author Updated');
            // props.handleClose();
          }}
          
        >
          <div className='form-group'>
              <label>
                Author first name:
                <input
                  ref={(node) => { first_name = node; }}
                  defaultValue={author.first_name}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
                Author last name:
                <input
                  ref={(node) => { last_name = node; }}
                  defaultValue={author.last_name}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
              date of birth:
                <input
                  ref={(node) => { date_of_birth = node; }}
                  defaultValue={author.date_of_birth}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
              home town City:
                <input
                  ref={(node) => { hometownCity = node; }}
                  defaultValue={author.hometownCity}
                />
              </label>
            </div>
            <br />
            <div className='form-group'>
              <label>
              home town State:
                <textarea
                  ref={(node) => { hometownState = node; }}
                  defaultValue={author.hometownState}
                />
              </label>
            </div>
            
            
            <br />
            <button className='button add-button' type='submit'>
              Update Author
            </button>

        </form>

        <button className='button cancel-button' onClick={handleCloseEditModal}>
          Cancel
        </button>
      </ReactModal>
    </div>
  );
}

export default EditAuthorModal;
