import {gql} from '@apollo/client';

//Queries
const GET_AUTHORS = gql`
query Query {
  authors {
    _id
    first_name
    last_name
    date_of_birth
    hometownCity
    hometownState
    numOfBooks
    books {
      _id
      title
    }
  }
}
`;

const GET_BOOKS = gql`
query Query {
  books {
    _id
    title
    genres
    publicationDate
    publisher
    summary
    isbn
    language
    pageCount
    price
    format
    author {
      _id
      first_name
      last_name
    }
  }
}
`;

const GET_AUTHOR_BY_ID = gql`
query Query($id: String!, $limit: Int) {
  getAuthorById(_id: $id) {
    _id
    first_name
    last_name
    date_of_birth
    hometownCity
    hometownState
    numOfBooks
    books(limit: $limit) {
      title
    }
  }
}
`;

const GET_BOOK_BY_ID = gql`
query Query($id: String!) {
  getBookById(_id: $id) {
    _id
    title
    genres
    publicationDate
    publisher
    summary
    isbn
    language
    pageCount
    price
    format
    author {
      _id
      first_name
      last_name
    }
  }
}
`;

const GET_BOOKS_BY_GENRE = gql`
query Query($genre: String!) {
  booksByGenre(genre: $genre) {
    _id
    title
    genres
    publicationDate
    publisher
    summary
    isbn
    language
    pageCount
    price
    format
    author {
      _id
      first_name
      last_name
    }
  }
}
`;

const GET_BOOKS_BY_PRICE_RANGE = gql`
query Query($min: Float!, $max: Float!) {
  booksByPriceRange(min: $min, max: $max) {
    _id
    title
    genres
    publicationDate
    publisher
    summary
    isbn
    language
    pageCount
    price
    format
    author {
      _id
      first_name
      last_name
    }
  }
}
`;

const GET_SEARCH_AUTHORS_BY_NAME = gql`
query Query($searchTerm: String!) {
  searchAuthorsByName(searchTerm: $searchTerm) {
    _id
    first_name
    last_name
    date_of_birth
    hometownCity
    hometownState
    numOfBooks
    books {
      _id
      title
    }
  }
}
`;

// Mutations
const ADD_AUTHOR = gql`
mutation AddAuthor($firstName: String!, $lastName: String!, $dateOfBirth: String!, $hometownCity: String!, $hometownState: String!) {
  addAuthor(first_name: $firstName, last_name: $lastName, date_of_birth: $dateOfBirth, hometownCity: $hometownCity, hometownState: $hometownState) {
    _id
    first_name
    last_name
    date_of_birth
    hometownCity
    hometownState
    numOfBooks
    books {
      _id
      title
    }
  }
}
`;

const EDIT_AUTHOR = gql`
mutation Mutation($id: String!, $firstName: String, $lastName: String, $dateOfBirth: String, $hometownCity: String, $hometownState: String) {
  editAuthor(_id: $id, first_name: $firstName, last_name: $lastName, date_of_birth: $dateOfBirth, hometownCity: $hometownCity, hometownState: $hometownState) {
    _id
    first_name
    last_name
    date_of_birth
    hometownCity
    hometownState
    numOfBooks
    books {
      _id
      title
    }
  }
}
`;

const REMOVE_AUTHOR = gql`
mutation Mutation($id: String!) {
  removeAuthor(_id: $id) {
    _id
  }
}
`;

const ADD_BOOK = gql`
mutation AddBook($title: String!, $genres: [String!]!, $publicationDate: String!, $publisher: String!, $summary: String!, $isbn: String!, $language: String!, $pageCount: Int!, $price: Float!, $format: [String!]!, $authorId: String!) {
  addBook(title: $title, genres: $genres, publicationDate: $publicationDate, publisher: $publisher, summary: $summary, isbn: $isbn, language: $language, pageCount: $pageCount, price: $price, format: $format, authorId: $authorId) {
    _id
    title
    genres
    publicationDate
    publisher
    summary
    isbn
    language
    pageCount
    price
    format
    author {
      _id
      first_name
      last_name
    }
  }
}
`;

const EDIT_BOOK = gql`
mutation EditBook($id: String!, $title: String, $genres: [String], $publicationDate: String, $publisher: String, $summary: String, $isbn: String, $language: String, $pageCount: Int, $price: Float, $format: [String], $authorId: String) {
  editBook(_id: $id, title: $title, genres: $genres, publicationDate: $publicationDate, publisher: $publisher, summary: $summary, isbn: $isbn, language: $language, pageCount: $pageCount, price: $price, format: $format, authorId: $authorId) {
    _id
    title
    genres
    publicationDate
    publisher
    summary
    isbn
    language
    pageCount
    price
    format
    author {
      _id
      first_name
      last_name
    }
  }
}
`;

const REMOVE_BOOK = gql`
mutation removeBook($id: String!) {
  removeBook(_id: $id) {
    _id
    title
  }
}
`;


export default {
  GET_AUTHORS,
  GET_BOOKS,
  GET_AUTHOR_BY_ID,
  GET_BOOK_BY_ID,
  GET_BOOKS_BY_GENRE,
  GET_BOOKS_BY_PRICE_RANGE,
  GET_SEARCH_AUTHORS_BY_NAME,
  ADD_AUTHOR,
  EDIT_AUTHOR,
  REMOVE_AUTHOR,
  ADD_BOOK,
  EDIT_BOOK,
  REMOVE_BOOK
};
