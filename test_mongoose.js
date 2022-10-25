require('dotenv').config();

const mongoose = require('mongoose');
const Person = require('./Model/Person');



async function main(){

    mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
    
    const person = await Person.create({first_name: "Nathan", last_name: "Breuil", age: 22});
    console.log(person);

    mongoose.disconnect();
}

main();