require('dotenv').config();

const { MongoClient } = require('mongodb');

async function main(){

    const uri = process.env.DB_URI;

    const client = new MongoClient(uri);
    try{
        await client.connect();

        client.db("db1").collection("People").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
        });

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