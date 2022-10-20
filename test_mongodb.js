require('dotenv').config();

const { MongoClient } = require('mongodb');

async function main(){

    const uri = process.env.DB_URI;

    const client = new MongoClient(uri);
    try{
        await client.connect();

        await addPeople(client, {first_name: "sam", last_name: "liprandi", age: 22});

    } catch(e){
        console.error(e);
    } finally{
        client.close();
    }
}

main().catch(console.error);

async function addPeople(client, person){
    
    const result = await client.db("Test").collection("People").insertOne(person);

    console.log(`Person added with the id ${result.insertedId}`);
}