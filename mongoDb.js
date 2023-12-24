import { MongoClient } from "mongodb";
const url = 'mongodb+srv://fadyeldod:popaswqwq@products-db.zvizjty.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(url)

const runServer = async () => {
    // connect to db
    await client.connect()
    console.log("connected successfully");
    const db = client.db("products-test") // database name
    const collection = db.collection("products")// collection name

    // return all products
    const products = await collection.find({}).toArray();
    console.log('products: ', products);
    return products;
}

runServer()
