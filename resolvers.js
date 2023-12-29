import {GraphQLError} from 'graphql';
import { createClient } from 'redis';
const client = createClient();
client.connect().then(() => {});
import {
  books as booksCollection,
  authors as authorsCollection
} from './config/mongoCollections.js';

import {v4 as uuid} from 'uuid'; //for generating _id's
import { validate as isValidUUID } from 'uuid';





/* parentValue - References the type def that called it
    so for example when we execute numOfEmployees we can reference
    the parent's properties with the parentValue Paramater
*/

/* args - Used for passing any arguments in from the client
    for example, when we call 
    addEmployee(firstName: String!, lastName: String!, employerId: Int!): Employee
		
*/

export const resolvers = {
  Query: {
    getAuthorById: async (_, args) => {
      let exists = await client.exists(args._id);
      
      if (exists) { 
        //console.log("IN")
        const jsonredis=await client.get(args._id);
        const redisJson = JSON.parse(jsonredis)
        return redisJson;

      }
      if(!isValidUUID(args._id)){
        throw new GraphQLError(
          `${args._id} is not a Valid uuid`,
          {
            extensions: {code: 'INVALID_INPUT',http:{status:400}}
          }
        );

      }
      const authors = await authorsCollection();
      const author = await authors.findOne({_id: args._id});
      if (!author) {
        //can't find the employer
        throw new GraphQLError('Author Not Found', {
          extensions: {code: 'NOT_FOUND',http:{status:404}}
        });
      }
      const jsonstr = JSON.stringify(author);
      await client.set(args._id, jsonstr);
      
      const jsonredis=await client.get(args._id);
      const redisJson = JSON.parse(jsonredis)
      await client.del('authors');
      await client.del('books');
      return redisJson;
      
    },
    getBookById: async (_, args) => {
      let exists = await client.exists(args._id);
      if (exists) { 
        const jsonredis=await client.get(args._id);
        const redisJson = JSON.parse(jsonredis)
        return redisJson;

      }
      if(!isValidUUID(args._id)){
        throw new GraphQLError(
          `${args._id} is not a Valid uuid`,
          {
            extensions: {code: 'INVALID_INPUT',http:{status:400}}
          }
        );

      }
      const books = await booksCollection();
      const book = await books.findOne({_id: args._id});
      if (!book) {
        //can't find the employee
        throw new GraphQLError('Book Not Found', {
          extensions: {code: 'NOT_FOUND',http:{status:404}}
        });
      }
      const jsonstr = JSON.stringify(book);
      await client.set(args._id, jsonstr);
      const jsonredis=await client.get(args._id);
      const redisJson = JSON.parse(jsonredis)
      await client.del('books');
      await client.del('authors');
      return redisJson;
      
    },
    booksByGenre:async (_, args) => {
      args.genre = args.genre.trim();
      
      let exists = await client.exists("booksByGenre"+args.genre.toLowerCase());
      if (exists) { 
        const jsonredis=await client.get("booksByGenre"+args.genre.toLowerCase());
        const redisJson = JSON.parse(jsonredis)
        return redisJson;

      }
      if (args.genre.length === 0 ){
          //throw `Error: Genre cannot be an empty string or string with just spaces`;
          throw new GraphQLError('Genre cannot be an empty string or string with just spaces', {
            extensions: {code: 'INVALID_INPUT',http:{status:400}} 
          });}
      if (!isNaN(args.genre)){
        //throw `Error: Genre is not a valid value  as it only contains digits`;
        throw new GraphQLError('Genre is not a valid value as it only contains digits', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });

      }
      const books = await booksCollection();  
      const bookarr = await books.find({genres: {
        $regex: `^${args.genre}$`,
        $options: 'i'
      }}).toArray();
      if (!bookarr) {
        //can't find the employee
        throw new GraphQLError('Book Array Not Found', {
          extensions: {code: 'NOT_FOUND',http:{status:404}}
        });
      }
      const jsonstr = JSON.stringify(bookarr);
      await client.set("booksByGenre"+args.genre.toLowerCase(), jsonstr,'EX', 3600);
      const jsonredis=await client.get("booksByGenre"+args.genre.toLowerCase());
      const redisJson = JSON.parse(jsonredis)
      return redisJson;
    },
    booksByPriceRange:async (_, args) => {
      const books = await booksCollection();
      let min= args.min
      let max=args.max
      let exists = await client.exists(Number(min).toString()+'-'+Number(max).toString()+"booksByPriceRange");
      if (exists) { 
        const jsonredis=await client.get(Number(min).toString()+'-'+Number(max).toString()+"booksByPriceRange");
        const redisJson = JSON.parse(jsonredis)
        //console.log("kk9k")

        return redisJson;

      }
      if (min < 0) {
        throw new GraphQLError('min must be a float or whole number >= 0', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }
      if (max<=min) {
        throw new GraphQLError('max must be a float or whole number greater than the min value', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }
      const bookarr = await books.find({price:{ $gte: min, $lte: max }}).toArray();
      if (!bookarr) {
        //can't find the employee
        throw new GraphQLError('Book Array Not Found', {
          extensions: {code: 'NOT_FOUND',http:{status:404}}
        });
      }
      const jsonstr = JSON.stringify(bookarr);
      await client.set(Number(min).toString()+'-'+Number(max).toString()+"booksByPriceRange", jsonstr,'EX', 3600);
      const jsonredis=await client.get(Number(min).toString()+'-'+Number(max).toString()+"booksByPriceRange");
      const redisJson = JSON.parse(jsonredis)
      return redisJson;

    },
    searchAuthorsByName:async (_, args) => {
      let searchTerm=args.searchTerm.trim()
      
      let exists = await client.exists("searchAuthorsByName"+searchTerm.toLowerCase());
      if (exists) { 
        const jsonredis=await client.get("searchAuthorsByName"+searchTerm.toLowerCase());
        const redisJson = JSON.parse(jsonredis)
        return redisJson;

      }
      if (searchTerm.length === 0 ){
        //throw `Error: Genre cannot be an empty string or string with just spaces`;
        throw new GraphQLError('search term cannot be an empty string or string with just spaces', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}} 
        });}
      if (!isNaN(searchTerm)){
        //throw `Error: Genre is not a valid value  as it only contains digits`;
        throw new GraphQLError('search term is not a valid value as it only contains digits', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });

      }
      const authors = await authorsCollection();
      const regex = new RegExp(searchTerm, 'i');
      const authorarr = await authors.find({
        $or: [
        {first_name: {$regex: regex}},
        {last_name: {$regex: regex}}
      ]
      }).toArray();
      if (!authorarr) {
        //can't find the employer
        throw new GraphQLError('Author Not Found', {
          extensions: {code: 'NOT_FOUND',http:{status:404}}
        });
    }
    const jsonstr = JSON.stringify(authorarr);
    await client.set("searchAuthorsByName"+searchTerm.toLowerCase(), jsonstr,'EX', 3600);
    const jsonredis=await client.get("searchAuthorsByName"+searchTerm.toLowerCase());
    const redisJson = JSON.parse(jsonredis)
    return redisJson;
    
    },
    authors: async () => {
      let exists = await client.exists('authors');
      if (exists) { 
        const jsonredis=await client.get('authors');
        const redisJson = JSON.parse(jsonredis)
        return redisJson;

      }
      const authors = await authorsCollection();
      const allAuthors = await authors.find({}).toArray();
      if (!allAuthors) {
        //Could not get list
        throw new GraphQLError(`Internal Server Error`, {
          extensions: {code: 'INTERNAL_SERVER_ERROR',http:{status:500}}
        });
      }
      
      const jsonstr = JSON.stringify(allAuthors);
      await client.set('authors', jsonstr,'EX', 3600);
      const jsonredis=await client.get('authors');
      const redisJson = JSON.parse(jsonredis)
      return redisJson;
    },

    books: async () => {
      let exists = await client.exists('books');
      if (exists) { 
        const jsonredis=await client.get('books');
        const redisJson = JSON.parse(jsonredis)
        console.log("kkkjgjkgnk")
        return redisJson;
        

      }
      const books = await booksCollection();
      const allBooks = await books.find({}).toArray();
      if (!allBooks) {
        //Could not get list
        throw new GraphQLError(`Internal Server Error`, {
          extensions: {code: 'INTERNAL_SERVER_ERROR',http:{status:500}}
        });
      }
      const jsonstr = JSON.stringify(allBooks);
      await client.set('books', jsonstr,'EX', 3600);
      const jsonredis=await client.get('books');
      const redisJson = JSON.parse(jsonredis)
      return redisJson;
      
    }
  //query ends
  },


  Author: {
    numOfBooks: async (parentValue) => {
      //console.log(`parentValue in Author`, parentValue);
      const bookscoll = await booksCollection();
      const numOfBooks = await bookscoll.count({
        authorId: parentValue._id
      });
      return numOfBooks;
    },
    books: async (parentValue,args) => {
      const bookscol = await booksCollection();
      if(!args.limit){
        args.limit=0
      }
      if(args.limit<0){
        throw new GraphQLError('limit cannot be an int less than 0', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}} 
        });
      }
      const bookauthors = await bookscol
        .find({authorId: parentValue._id}).limit(args.limit)
        .toArray();
      return bookauthors;
    }
  },
  Book: {
    author: async (parentValue) => {
      //console.log(`parentValue in Employee`, parentValue);
      const authorcol = await authorsCollection();
      const author = await authorcol.findOne({_id: parentValue.authorId});
      return author;
    }
  },
  

  //MUTATION


  Mutation: {
    addAuthor: async (_, args) => {
      //check args
      const authors = await authorsCollection();
      function Check(argg){
        
        argg=argg.trim();
        if (argg.length === 0 ){
          
          throw new GraphQLError('Fields Cannot be an empty string or string with just spaces', {
            extensions: {code: 'INVALID_INPUT',http:{status:400}} 
          });
      }
      if (!isNaN(argg)){
        throw new GraphQLError('Not a valid value as this String only contains digits', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }
      return argg
      }
      args.first_name=Check(args.first_name)
      args.last_name=Check(args.last_name)
      args.date_of_birth=Check(args.date_of_birth)
      args.hometownCity=Check(args.hometownCity)
      args.hometownState=Check(args.hometownState)
      const regex = /[^A-Za-z]/g;
      
      if(regex.test(args.first_name)){
        throw new GraphQLError('first_name should only contain letters A-Z (all cases) and no numbers!', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}} 
        });

      }
      if(args.first_name.length>40){
        throw new GraphQLError('first_name should only contain 40 letters A-Z (all cases) and no numbers!', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}} 
        });

      }
      if(regex.test(args.last_name)){
        throw new GraphQLError('last_name should only contain letters A-Z (all cases) and no numbers!', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}} 
        });
      }
      if(args.last_name.length>40){
        throw new GraphQLError('last_name should only contain 40 letters A-Z (all cases) and no numbers!', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}} 
        });

      }
      const stateCodes = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
               "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
               "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
               "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
               "SD", "TN", "TX", "UT", "VT", "VA","WA","WV","WI","WY",
               // U.S. territories
               'AS', 'GU', 'MP', 'PR', 'VI', 'UM',
               // District of Columbia
               'DC'];


      if (!stateCodes.includes(args.hometownState.toUpperCase())){
        throw new GraphQLError('Should only be a two letter state should be a VALID state', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}} 
        });
      }
      let reg=/^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/;
      if(!reg.test(args.hometownCity)){
        throw new GraphQLError('Invalid City name', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }
      if(args.hometownCity.length>178){
        throw new GraphQLError('hometownCity should only contain 178 characters', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}} 
        });

      }
  let m=args.date_of_birth.split("/");
  let pattern_ = /[^0-9/]/g;
  
  if(m.length!==3){
    throw new GraphQLError('Invalid date format', {
      extensions: {code: 'INVALID_INPUT',http:{status:400}}
    });
  }
  let result_ = pattern_.test(m[0]);
  let result_1 = pattern_.test(m[1]);
  let result_2 = pattern_.test(m[2]);
  
  if(result_===true || result_1===true||result_2===true){
    throw new GraphQLError('Invalid date format', {
      extensions: {code: 'INVALID_INPUT',http:{status:400}}
    });
  }

if(m[2].length!==4){
  throw new GraphQLError('Invalid date format', {
    extensions: {code: 'INVALID_INPUT',http:{status:400}}
  });
}
let year=Number(m[2])
let month=Number(m[0]);
if(month<1 || month>12){ throw new GraphQLError('Invalid date format', {
  extensions: {code: 'INVALID_INPUT',http:{status:400}}
});}
//let sl1=dateReleased.charAt(2)

let date=Number(m[1]);
if(month===1 ||month===3 ||month===5 ||month===7 ||month===8 ||month===10 || month===12){
if(date<1 || date>31){ throw new GraphQLError('Invalid date format', {
  extensions: {code: 'INVALID_INPUT',http:{status:400}}
});}
}
if(month===4 ||month===6 ||month===9||month===11){
  if(date<1 || date>30){ throw new GraphQLError('Invalid date format', {
    extensions: {code: 'INVALID_INPUT',http:{status:400}}
  });}
}
if(month===2 && year%4===0){
  if(date<1 || date>29){ throw new GraphQLError('Invalid date format', {
    extensions: {code: 'INVALID_INPUT',http:{status:400}}
  });}

}
if(month===2 && year%4!==0){
  if(date<1 || date>28){ throw new GraphQLError('Invalid date format', {
    extensions: {code: 'INVALID_INPUT',http:{status:400}}
  });}

}
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // Month is 0->indexed in JavaScript
const currentDay = currentDate.getDate();

// Calculating the age
let age = currentYear - year;

// Adjust the age based on the birthdate's month and day
if (currentMonth < month || (currentMonth === month && currentDay < date)) {
  age--;
}
if(age<4){
  throw new GraphQLError('Invalid date format', {
    extensions: {code: 'INVALID_INPUT',http:{status:400}}
  });
}

      const newAuthor = {
        _id: uuid(),
        first_name: args.first_name,
        last_name: args.last_name,
        date_of_birth:args.date_of_birth,
        hometownCity:args.hometownCity,
        hometownState:args.hometownState,
        books:[]
      };

        
      let insertAuthor = await authors.insertOne(newAuthor);
      if (!insertAuthor.acknowledged || !insertAuthor.insertedId) {
        throw new GraphQLError(`Could not Add Author`, {
          extensions: {code: 'INTERNAL_SERVER_ERROR',http:{status:500}}
        });
      }
      
      const jsonstr = JSON.stringify(newAuthor);
      await client.set(insertAuthor.insertedId.toString(), jsonstr);
      const jsonredis=await client.get(insertAuthor.insertedId.toString());
      const redisJson = JSON.parse(jsonredis)
      await client.del('authors');
      await client.del('books');
      return redisJson;
      
    },
    editAuthor: async (_, args) => {
      
      const optionalFields = ["first_name", "last_name", "date_of_birth", "hometownCity", "hometownState"];

      // Check if at least one optional field is provided
      const hasOptionalField = optionalFields.some(field => args[field] !== undefined);

      if (!hasOptionalField) {
        throw new GraphQLError('At least one optional field must be provided for Author edit', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}});
        
      }

      const authors = await authorsCollection();
      function Check(argg){
        
        argg=argg.trim();
        if (argg.length === 0 ){
          
          throw new GraphQLError('Fields Cannot be an empty string or string with just spaces', {
            extensions: {code: 'INVALID_INPUT',http:{status:400}} 
          });
      }
      if (!isNaN(argg)){
        throw new GraphQLError('Not a valid value as this String only contains digits', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }
      return argg
      }
      if(!isValidUUID(args._id)){
        throw new GraphQLError(
          `${args._id} is not a Valid uuid`,
          {
            extensions: {code: 'INVALID_INPUT',http:{status:400}}
          }
        );

      }
      const AuthorU = await authors.findOne({_id: args._id});

      if(AuthorU){
        if(args.first_name){
          args.first_name=Check(args.first_name)
          const regex = /[^A-Za-z]/g;
              if(regex.test(args.first_name)){
              throw new GraphQLError('first_name should only contain letters A-Z (all cases) and no numbers!', {
                extensions: {code: 'INVALID_INPUT',http:{status:400}} 
              });
            }
            if(args.first_name.length>40){
              throw new GraphQLError('first_name should only contain 40 letters A-Z (all cases) and no numbers!', {
                extensions: {code: 'INVALID_INPUT',http:{status:400}} 
              });
      
            }
            
              AuthorU.first_name=args.first_name
        }
        if(args.last_name){
          args.last_name=Check(args.last_name)
          const regex = /[^A-Za-z]/g;
              if(regex.test(args.last_name)){
                throw new GraphQLError('last_name should only contain letters A-Z (all cases) and no numbers!', {
                  extensions: {code: 'INVALID_INPUT',http:{status:400}} 
                });
              }
              if(args.last_name.length>40){
                throw new GraphQLError('last_name should only contain 40 letters A-Z (all cases) and no numbers!', {
                  extensions: {code: 'INVALID_INPUT',http:{status:400}} 
                });
        
              }
        
              AuthorU.last_name=args.last_name
        }
        if(args.date_of_birth){
          args.date_of_birth=Check(args.date_of_birth)
              let m=args.date_of_birth.split("/");
              let pattern_ = /[^0-9/]/g;
              
              if(m.length!==3){
                throw new GraphQLError('Invalid date format', {
                  extensions: {code: 'INVALID_INPUT',http:{status:400}}
                });
                
              }
              let result_ = pattern_.test(m[0]);
              let result_1 = pattern_.test(m[1]);
              let result_2 = pattern_.test(m[2]);
              
              if(result_===true || result_1===true||result_2===true){
                throw new GraphQLError('Invalid date format', {
                  extensions: {code: 'INVALID_INPUT',http:{status:400}}
                });
                
              }
            
            if(m[2].length!==4){
              throw new GraphQLError('Invalid date format', {
                extensions: {code: 'INVALID_INPUT',http:{status:400}}
              });
              
            }
            let year=Number(m[2])
            let month=Number(m[0]);
            if(month<1 || month>12){ throw new GraphQLError('Invalid date format', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });}
            //let sl1=dateReleased.charAt(2)
            
            let date=Number(m[1]);
            if(month===1 ||month===3 ||month===5 ||month===7 ||month===8 ||month===10 || month===12){
            if(date<1 || date>31){ throw new GraphQLError('Invalid date format', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });}
            }
            if(month===4 ||month===6 ||month===9||month===11){
              if(date<1 || date>30){ throw new GraphQLError('Invalid date format', {
                extensions: {code: 'INVALID_INPUT',http:{status:400}}
              });}
            }
            if(month===2 && year%4===0){
              if(date<1 || date>29){ throw new GraphQLError('Invalid date format', {
                extensions: {code: 'INVALID_INPUT',http:{status:400}}
              });}
            
            }
            if(month===2 && year%4!==0){
              if(date<1 || date>28){ throw new GraphQLError('Invalid date format', {
                extensions: {code: 'INVALID_INPUT',http:{status:400}}
              });}
            
            }
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1; // Month is 0-indexed in JavaScript
            const currentDay = currentDate.getDate();
            
            // Calculate the age
            let age = currentYear - year;
            
            // Adjust the age based on the birthdate's month and day
            if (currentMonth < month || (currentMonth === month && currentDay < date)) {
              age--;
            }
            if(age<3){
              throw new GraphQLError('Invalid date format', {
                extensions: {code: 'INVALID_INPUT',http:{status:400}}
              });
            }
          
     
            AuthorU.date_of_birth=args.date_of_birth

        }
        if(args.hometownCity){
          args.hometownCity=Check(args.hometownCity)
          
          let regex=/^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/;
          if(!regex.test(args.hometownCity)){
            throw new GraphQLError('Invalid City name', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });
          }
          if(args.hometownCity.length>178){
            throw new GraphQLError('hometownCity should only contain 178 characters', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}} 
            });
    
          }

          AuthorU.hometownCity=args.hometownCity
        }
        if(args.hometownState){
          args.hometownState=Check(args.hometownState)
              const stateCodes = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
              "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
              "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
              "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
              "SD", "TN", "TX", "UT", "VT", "VA","WA","WV","WI","WY",
              // U.S. territories
              'AS', 'GU', 'MP', 'PR', 'VI', 'UM',
              // District of Columbia
              'DC'];


            if (!stateCodes.includes(args.hometownState.toUpperCase())){
              throw new GraphQLError('hometownState Should only be a two letter state code of a VALID state', {
                extensions: {code: 'INVALID_INPUT',http:{status:400}} 
              });
            }
 
          AuthorU.hometownState=args.hometownState

        }
        
        await authors.updateOne({_id: args._id}, {$set: AuthorU});
        const nwauth = await authors.findOne({_id: args._id});
        const check=await client.get(args._id)
        if(JSON.parse(check)){
        const jsonstr = JSON.stringify(nwauth);
        await client.set(args._id, jsonstr);
        const jsonredis=await client.get(args._id);
        const redisJson = JSON.parse(jsonredis)
        await client.del('authors');
        await client.del('books');
        return redisJson;}
        await client.del('authors');
        await client.del('books');
        return nwauth
      }
      else {
        throw new GraphQLError(
          `Could not update author with _id of ${args._id} because its not available`,
          {
            extensions: {code: 'NOT_FOUND',http:{status:404}}
          }
        );
      }

    },
    removeAuthor: async (_, args) => {
      const books=await booksCollection();
      const authors = await authorsCollection();
      if(!isValidUUID(args._id)){
        throw new GraphQLError(
          `${args._id} is not a Valid uuid`,
          {
            extensions: {code: 'INVALID_INPUT',http:{status:400}}
          }
        );

      }
      
      const deletedAuthor = await authors.findOneAndDelete({_id: args._id});
      if (!deletedAuthor) {
        throw new GraphQLError(
          `Could not delete author with _id of ${args._id}`,
          {
            extensions: {code: 'NOT_FOUND',http:{status:404}}
          }
        );
      }
      if(deletedAuthor.books.length!==0){
        for(let i of deletedAuthor.books){
          //console.log("in")
          await books.deleteOne({_id:i})
          await client.del(i);
        }
      }
      
      await client.del(args._id);
      await client.del('authors');
      await client.del('books');
      //console.log(deletedAuthor)
      return deletedAuthor;


    },
    
    addBook: async (_, args) => {
      const authors=await authorsCollection();
      const books=await booksCollection();
      if(!isValidUUID(args.authorId)){
        throw new GraphQLError(
          `${args.authorId} is not a Valid uuid`,
          {
            extensions: {code: 'BAD_USER_INPUT',http:{status:400}}
          }
        );

      }
      let author = await  authors.findOne({_id: args.authorId});
      if (!author) {
        throw new GraphQLError(
          `Could not Find Author with an ID of ${args.authorId}`,
          {
            extensions: {code: 'BAD_USER_INPUT',http:{status:400}}
          }
        );
      }
      function Check(argg){
        
        argg=argg.trim();
        if (argg.length === 0 ){
          
          throw new GraphQLError('Field/Element_in_a_Field -> Cannot be an empty string or string with just spaces', {
            extensions: {code: 'INVALID_INPUT',http:{status:400}} 
          });
      }
      if (!isNaN(argg)){
        throw new GraphQLError('Not a valid value/format as this String Field/Element_in_a_Field -> only contains digits', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }
      return argg
      }
      //args.title=Check(args.title);
      args.title=args.title.trim();
        if (args.title.length === 0 ){
          
          throw new GraphQLError('Field/Element_in_a_Field -> Cannot be an empty string or string with just spaces', {
            extensions: {code: 'INVALID_STRING',http:{status:400}} 
          });
      }
      const regext=/^(?=.*[a-zA-Z\d])[\w\d\s\S]*$/

      if(!regext.test(args.title)){
        throw new GraphQLError('Not a valid Title String', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }


      args.publicationDate=Check(args.publicationDate);

      args.publisher=Check(args.publisher);
      const regexpu=/^(?=.*[a-zA-Z])[\w\d\s\S]*$/
      if(!regexpu.test(args.publisher)){
        throw new GraphQLError('Not a valid Publisher String', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }
      args.summary=Check(args.summary);
      const regexsum=/^(?=.*[a-zA-Z])[\w\d\s\S]*$/
      if(!regexsum.test(args.summary)){
        throw new GraphQLError('Not a valid Summary String', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }
      if(args.summary.length<4){
        throw new GraphQLError('Not a valid Summary String', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });

      }
      //args.isbn=Check(args.isbn)
      args.language=Check(args.language)


      //console.log(args.genres)
      if(!Array.isArray(args.genres)){
        throw new GraphQLError('Not a valid array of Strings', {
          extensions: {code: 'INVALID_ARRAY',http:{status:400}}
        });

      }
      if(!Array.isArray(args.format)){
        throw new GraphQLError('Not a valid array of Strings', {
          extensions: {code: 'INVALID_ARRAY',http:{status:400}}
        });

      }
      for(let i=0;i<args.genres.length;i++){
        args.genres[i]=Check(args.genres[i])
        args.genres[i]=args.genres[i].trim()
        let regex=/.*[A-Za-z].*/
        if(!regex.test(args.genres[i])){
          throw new GraphQLError('Not a valid String', {
            extensions: {code: 'INVALID_INPUT_INSIDE_ARRAY_GENRES',http:{status:400}}
          });
  

        }

      }
      
      for(let i=0;i<args.format.length;i++){
        args.format[i]=Check(args.format[i])
        args.format[i]=args.format[i].trim()
        let regex=/.*[A-Za-z].*/
        if(!regex.test(args.format[i])){
          throw new GraphQLError('Not a valid String', {
            extensions: {code: 'INVALID_INPUT_INSIDE_ARRAY_format',http:{status:400}}
          });
  

        }

      }
      //

      let m=args.publicationDate.split("/");
      let pattern_ = /[^0-9/]/g;
      
      if(m.length!==3){
        throw new GraphQLError('Invalid date format', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
        
      }
      let result_ = pattern_.test(m[0]);
      let result_1 = pattern_.test(m[1]);
      let result_2 = pattern_.test(m[2]);
      
      if(result_===true || result_1===true||result_2===true){
        throw new GraphQLError('Invalid date format', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });
      }
    
    if(m[2].length!==4){
      throw new GraphQLError('Invalid date format', {
        extensions: {code: 'INVALID_INPUT',http:{status:400}}
      });
    }
    let year=Number(m[2])
    let month=Number(m[0]);
    if(month<1 || month>12){ throw new GraphQLError('Invalid date format', {
      extensions: {code: 'INVALID_INPUT',http:{status:400}}
    });}
    
    
    let date=Number(m[1]);
    if(month===1 ||month===3 ||month===5 ||month===7 ||month===8 ||month===10 || month===12){
    if(date<1 || date>31){ throw new GraphQLError('Invalid date format', {
      extensions: {code: 'INVALID_INPUT',http:{status:400}}
    });}
    }
    if(month===4 ||month===6 ||month===9||month===11){
      if(date<1 || date>30){ throw new GraphQLError('Invalid date format', {
        extensions: {code: 'INVALID_INPUT',http:{status:400}}
      });}
    }
    if(month===2 && year%4===0){
      if(date<1 || date>29){ throw new GraphQLError('Invalid date format', {
        extensions: {code: 'INVALID_INPUT',http:{status:400}}
      });}
    
    }
    if(month===2 && year%4!==0){
      if(date<1 || date>28){ throw new GraphQLError('Invalid date format', {
        extensions: {code: 'INVALID_INPUT',http:{status:400}}
      });}
    
    }
    //Compare author.date_of_birth with the args.publicationDate
    //args.publicationDate should be a higher date than author.date_of_birth
    let authorDateOfBirth = new Date(author.date_of_birth);
    let _Publidate = new Date(Number(m[2]), Number(m[0]) - 1, Number(m[1]));
    if (_Publidate <= authorDateOfBirth) {
      throw new GraphQLError('Publication date should be after the author\'s date of birth.', {
        extensions: {code: 'INVALID_DATE',http:{status:400}}
      }); 
    }
    
    const currentDate = new Date();
    if (_Publidate > currentDate) {
      throw new GraphQLError('Publication date should not be after the current date.', {
        extensions: {code: 'INVALID_DATE',http:{status:400}}
      }); 
    }
    

    if (args.price <= 0  ||args.price === 0) {
      throw new GraphQLError('Price must be a float or whole number > 0', {
        extensions: {code: 'INVALID_PRICE_VALUE',http:{status:400}}
      });
    }
    if(args.pageCount<=0 || args.pageCount===0){
      
      throw new GraphQLError('PageCount must be a float or whole number > 0', {
        extensions: {code: 'INVALID_PAGECOUNT_VALUE',http:{status:400}}
      });

    }

    //isbn
    args.isbn = args.isbn.trim().replace(/-/g, ''); 

    if (args.isbn.length === 0) {
        throw new GraphQLError('Fields Cannot be an empty string or string with just spaces', {
            extensions: {code: 'INVALID_INPUT', http: {status: 400}}
        });
    }
    
    if (args.isbn.length !== 10 && args.isbn.length !== 13) {
        throw new GraphQLError('ISBN must be either 10 or 13 digits', {
            extensions: {code: 'INVALID_ISBN_LENGTH', http: {status: 400}}
        });
    }
    
    let isValidISBN = false;
    
    // ISBN-10 
    if (args.isbn.length === 10) {
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            if (args.isbn[i] < '0' || args.isbn[i] > '9') return false; // Ensure characters are digits
            sum += (10 - i) * parseInt(args.isbn[i]);
        }
        if (args.isbn[9] === 'X') {
            sum += 10;
        } else if (args.isbn[9] >= '0' && args.isbn[9] <= '9') {
            sum += parseInt(args.isbn[9]);
        } else {
            return false;
        }
        isValidISBN = (sum % 11 === 0);
    }
    
    // ISBN-13 
    if (args.isbn.length === 13) {
        let sum = 0;
        for (let i = 0; i < 13; i++) {
            if (args.isbn[i] < '0' || args.isbn[i] > '9') return false; 
            sum += (i % 2 === 0 ? 1 : 3) * parseInt(args.isbn[i]);
        }
        isValidISBN = (sum % 10 === 0);
    }
    
    if (!isValidISBN) {
        throw new GraphQLError('It should accept either a ISBN-10 or ISBN-13 format', {
            extensions: {code: 'INVALID_ISBN_VALUE', http: {status: 400}}
        });
    }

      const newBook = {
        _id: uuid(), 
        title: args.title,
        genres: args.genres,
        publicationDate: args.publicationDate,
        publisher: args.publisher,
        summary: args.summary,
        isbn: args.isbn,
        language: args.language,
        pageCount: args.pageCount,
        price: args.price,
        format: args.format,
        authorId: args.authorId,
      };
      let insertBook = await books.insertOne(newBook);
      if (!insertBook.acknowledged || !insertBook.insertedId) {
        throw new GraphQLError(`Could not Add Book`, {
          extensions: {code: 'INTERNAL_SERVER_ERROR',http:{status:500}}
        });
      }
      await authors.updateOne({_id: args.authorId},{$push: {books:insertBook.insertedId}},)
      let updateAuth=await authors.findOne({_id: args.authorId})
      const check=await client.get(args.authorId)
      if(JSON.parse(check)){
        //console.log("in")
        const jsonstr = JSON.stringify(updateAuth);
        await client.set(args.authorId, jsonstr);
        }


      const jsonstr = JSON.stringify(newBook);
      await client.set(insertBook.insertedId.toString(), jsonstr);
      const jsonredis=await client.get(insertBook.insertedId.toString());
      const redisJson = JSON.parse(jsonredis)
      await client.del('books');
      await client.del('authors');
     
      console.log(redisJson)
      return redisJson;
    },
      
      
    removeBook: async (_, args) => {
      const authors=await authorsCollection();
      const books = await booksCollection();
      if(!isValidUUID(args._id)){
        throw new GraphQLError(
          `${args._id} is not a Valid uuid`,
          {
            extensions: {code: 'BAD_USER_INPUT',http:{status:400}}
          }
        );

      }
      
      const deletedBook = await books.findOneAndDelete({_id: args._id});
      if (!deletedBook) {
        throw new GraphQLError(
          `Could not delete book with _id of ${args._id}`,
          {
            extensions: {code: 'NOT_FOUND',http:{status:404}}
          }
        );
      }
      //console.log(deletedBook.authorId)
      await authors.updateOne({_id: deletedBook.authorId},{$pull: {books:args._id}},)
      let updateAuth=await authors.findOne({_id: deletedBook.authorId})
      //console.log(updateAuth)
      const check=await client.get(deletedBook.authorId)
      if(JSON.parse(check)){
        const jsonstr = JSON.stringify(updateAuth);
        await client.set(deletedBook.authorId, jsonstr);
        }
      
          await client.del(args._id);
          await client.del('books');
          await client.del('authors');
      return deletedBook;
    
    },
    editBook: async (_, args) => {
      const optionalFields = ["title", "genres", "publicationDate", "publisher", "summary", "isbn", "language", "pageCount", "price", "format","authorId"];

      // Check if at least one optional field is provided
      const hasOptionalField = optionalFields.some(field => args[field] !== undefined);

      if (!hasOptionalField) {
        throw new GraphQLError('At least one optional field must be provided for book edit', {
          extensions: {code: 'BAD_REQUEST',http:{status:400}}});
        
      }
      const books = await booksCollection();
      const authors=await authorsCollection();
      function Check(argg){
        
            argg=argg.trim();
            if (argg.length === 0 ){
              
              throw new GraphQLError('Fields Cannot be an empty string or string with just spaces', {
                extensions: {code: 'INVALID_INPUT',http:{status:400}} 
              });
          }
          if (!isNaN(argg)){
            throw new GraphQLError('Not a valid value as this String only contains digits', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });
          }
          return argg
      }
      if(!isValidUUID(args._id)){
        throw new GraphQLError(
          `${args._id} is not a Valid uuid`,
          {
            extensions: {code: 'BAD_USER_INPUT',http:{status:400}}
          }
        );

      }
      const BookU = await books.findOne({_id: args._id});

      if(BookU){
        if(args.authorId){
          if(!isValidUUID(args.authorId)){
            throw new GraphQLError(
              `${args.authorId} is not a Valid uuid`,
              {
                extensions: {code: 'BAD_USER_INPUT',http:{status:400}}
              }
            );
    
          }
          let author = await  authors.findOne({_id: args.authorId});
          if (!author) {
            throw new GraphQLError(
              `Could not Find Author with an ID of ${args.authorId}`,
              {
                extensions: {code: 'BAD_USER_INPUT',http:{status:400}}
              }
            );
          }
          await authors.updateOne({_id:BookU.authorId},{$pull: {books:args._id}},)
          let updateOAuth=await authors.findOne({_id: BookU.authorId})
          const checkO=await client.get(BookU.authorId)
          if(JSON.parse(checkO)){
            //ask SHOULD I DELETE OR UPDATE
            await client.del(BookU.authorId)
            //const jsonstr = JSON.stringify(updateOAuth);
            //await client.set(BookU.authorId, jsonstr);
            }
          await authors.updateOne({_id: args.authorId},{$push: {books:args._id}},)
          let updateAuth=await authors.findOne({_id: args.authorId})
          const check=await client.get(args.authorId)
          if(JSON.parse(check)){
            //ask SHOULD I DELETE OR UPDATE
            await client.del(args.authorId)
            //const jsonstr = JSON.stringify(updateAuth);
            //await client.set(args.authorId, jsonstr);
            }
   

          BookU.authorId=args.authorId
        }
        if(args.title){
         args.title=args.title.trim();
         if (args.title.length === 0 ){
              
              throw new GraphQLError('Field/Element in a Field Cannot be an empty string or string with just spaces', {
                extensions: {code: 'INVALID_STRING',http:{status:400}} 
              });
          }
          const regext=/^(?=.*[a-zA-Z\d])[\w\d\s\S]*$/

          if(!regext.test(args.title)){
            throw new GraphQLError('Not a valid Title String', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });
          }

          BookU.title=args.title

        }
        if(args.genres){
          if(!Array.isArray(args.genres)){
            throw new GraphQLError('Not a valid array of Strings', {
              extensions: {code: 'INVALID_ARRAY',http:{status:400}}
            });
    
          }
          for(let i=0;i<args.genres.length;i++){
            args.genres[i]=Check(args.genres[i])
            args.genres[i]=args.genres[i].trim()
            let regex=/.*[A-Za-z].*/
            if(!regex.test(args.genres[i])){
              throw new GraphQLError('Not a valid String', {
                extensions: {code: 'INVALID_INPUT_INSIDE_ARRAY_GENRES',http:{status:400}}
              });
      
    
            }
    
          }
        
        
      

      BookU.genres=args.genres
          
        }
        if(args.publicationDate){
          //const books = await booksCollection();
          const authors=await authorsCollection();
          args.publicationDate=Check(args.publicationDate);
          let m=args.publicationDate.split("/");
          let pattern_ = /[^0-9/]/g;
          
          if(m.length!==3){
            throw new GraphQLError('Invalid date format', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });
            
          }
          let result_ = pattern_.test(m[0]);
          let result_1 = pattern_.test(m[1]);
          let result_2 = pattern_.test(m[2]);
          
          if(result_===true || result_1===true||result_2===true){
            throw new GraphQLError('Invalid date format', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });
          }
        
        if(m[2].length!==4){
          throw new GraphQLError('Invalid date format', {
            extensions: {code: 'INVALID_INPUT',http:{status:400}}
          });
        }
        let year=Number(m[2])
        let month=Number(m[0]);
        if(month<1 || month>12){ throw new GraphQLError('Invalid date format', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });}
        
        
        let date=Number(m[1]);
        if(month===1 ||month===3 ||month===5 ||month===7 ||month===8 ||month===10 || month===12){
        if(date<1 || date>31){ throw new GraphQLError('Invalid date format', {
          extensions: {code: 'INVALID_INPUT',http:{status:400}}
        });}
        }
        if(month===4 ||month===6 ||month===9||month===11){
          if(date<1 || date>30){ throw new GraphQLError('Invalid date format', {
            extensions: {code: 'INVALID_INPUT',http:{status:400}}
          });}
        }
        if(month===2 && year%4===0){
          if(date<1 || date>29){ throw new GraphQLError('Invalid date format', {
            extensions: {code: 'INVALID_INPUT',http:{status:400}}
          });}
        
        }
        if(month===2 && year%4!==0){
          if(date<1 || date>28){ throw new GraphQLError('Invalid date format', {
            extensions: {code: 'INVALID_INPUT',http:{status:400}}
          });}
        
        }
        //Compare author.date_of_birth with the args.publicationDate
        //args.publicationDate should be a higher date than author.date_of_birth
        let author=await authors.findOne({_id:BookU.authorId})
        let authorDateOfBirth = new Date(author.date_of_birth);
        let _Publidate = new Date(Number(m[2]), Number(m[0]) - 1, Number(m[1]));
        console.log(authorDateOfBirth)
        console.log(_Publidate)
        if (_Publidate <= authorDateOfBirth) {
          throw new GraphQLError('Publication date should be after the author\'s date of birth.', {
            extensions: {code: 'INVALID_DATE',http:{status:400}}
          }); 
        }
        const currentDate = new Date();
          if (_Publidate > currentDate) {
            throw new GraphQLError('Publication date should not be after the current date.', {
              extensions: {code: 'INVALID_DATE',http:{status:400}}
            }); 
          }

        BookU.publicationDate=args.publicationDate
        }
        if(args.publisher){
          args.publisher=Check(args.publisher);
          
          const regexpu=/^(?=.*[a-zA-Z])[\w\d\s\S]*$/
          if(!regexpu.test(args.publisher)){
            throw new GraphQLError('Not a valid Publisher String', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });
          }

          BookU.publisher=args.publisher
        }
        if(args.summary){
          
          args.summary=Check(args.summary);
          const regexsum=/^(?=.*[a-zA-Z])[\w\d\s\S]*$/
          if(!regexsum.test(args.summary)){
            throw new GraphQLError('Not a valid Summary String', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });
          }
          if(args.summary.length<4){
            throw new GraphQLError('Not a valid Summary String', {
              extensions: {code: 'INVALID_INPUT',http:{status:400}}
            });
    
          }

          BookU.summary=args.summary;
          
        }
        if(args.isbn){
          
          args.isbn = args.isbn.trim().replace(/-/g, ''); 

          if (args.isbn.length === 0) {
              throw new GraphQLError('Fields Cannot be an empty string or string with just spaces', {
                  extensions: {code: 'INVALID_INPUT', http: {status: 400}}
              });
          }
          
          if (args.isbn.length !== 10 && args.isbn.length !== 13) {
              throw new GraphQLError('ISBN must be either 10 or 13 digits', {
                  extensions: {code: 'INVALID_ISBN_LENGTH', http: {status: 400}}
              });
          }
          
          let isValidISBN = false;
          
          // ISBN-10 
          if (args.isbn.length === 10) {
              let sum = 0;
              for (let i = 0; i < 9; i++) {
                  if (args.isbn[i] < '0' || args.isbn[i] > '9') return false; // Ensure characters are digits
                  sum += (10 - i) * parseInt(args.isbn[i]);
              }
              if (args.isbn[9] === 'X') {
                  sum += 10;
              } else if (args.isbn[9] >= '0' && args.isbn[9] <= '9') {
                  sum += parseInt(args.isbn[9]);
              } else {
                  return false;
              }
              isValidISBN = (sum % 11 === 0);
          }
          
          // ISBN-13 
          if (args.isbn.length === 13) {
              let sum = 0;
              for (let i = 0; i < 13; i++) {
                  if (args.isbn[i] < '0' || args.isbn[i] > '9') return false; 
                  sum += (i % 2 === 0 ? 1 : 3) * parseInt(args.isbn[i]);
              }
              isValidISBN = (sum % 10 === 0);
          }
          
          if (!isValidISBN) {
              throw new GraphQLError('It should accept either a ISBN-10 or ISBN-13 format', {
                  extensions: {code: 'INVALID_ISBN_VALUE', http: {status: 400}}
              });
          }
          
         
          BookU.isbn=args.isbn
          
        }
        if(args.language){
        
          args.language=Check(args.language)

          BookU.language=args.language
        }
        if(args.pageCount || args.pageCount===0){
          
          if(args.pageCount<=0){
            console.log("IN JY")
            throw new GraphQLError('PageCount must be  whole number > 0', {
              extensions: {code: 'INVALID_PAGECOUNT_VALUE',http:{status:400}}
            });
      
          }

          BookU.pageCount=args.pageCount
        }
        if(args.price ||args.price === 0){
          if (args.price <= 0) {
            throw new GraphQLError('Price must be a float or whole number > 0', {
              extensions: {code: 'INVALID_PRICE_VALUE',http:{status:400}}
            });
          }
 
          BookU.price=args.price
        }
        if(args.format){
          if(!Array.isArray(args.format)){
            throw new GraphQLError('Not a valid array of Strings', {
              extensions: {code: 'INVALID_ARRAY',http:{status:400}}
            });
    
          }
          for(let i=0;i<args.format.length;i++){
            args.format[i]=Check(args.format[i])
            args.format[i]=args.format[i].trim()
            let regex=/.*[A-Za-z].*/
            if(!regex.test(args.format[i])){
              throw new GraphQLError('Not a valid String', {
                extensions: {code: 'INVALID_INPUT_INSIDE_ARRAY_format',http:{status:400}}
              });
      
    
            }
    
          }
          
          BookU.format=args.format
        }

        await books.updateOne({_id: args._id}, {$set: BookU});
        const nwbook = await books.findOne({_id: args._id});

        const check=await client.get(args._id)
        if(JSON.parse(check)){
        const jsonstr = JSON.stringify(nwbook);
        await client.set(args._id, jsonstr);
        const jsonredis=await client.get(args._id);
        const redisJson = JSON.parse(jsonredis)
        await client.del('books');
        await client.del('authors');
        return redisJson;
      }
        console.log(nwbook)
        await client.del('books');
        await client.del('authors');
        console.log(nwbook)
        return nwbook;

      }
      else {
        throw new GraphQLError(
          `Could not update book with _id of ${args._id}`,
          {
            extensions: {code: 'NOT_FOUND',http:{status:404}}
          }
        );
      }

    }

  }
};
