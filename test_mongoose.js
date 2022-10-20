require('dotenv').config();

const mongoose = require('mongoose');
const Person = require('./Model/Person');



async function main(){

    mongoose.connect(process.env.DB_URI);
    
    const person = await Person.create({first_name: "Tristan", last_name: "Hascoët", age: 22});
    console.log(person);

    mongoose.disconnect();
}

main();