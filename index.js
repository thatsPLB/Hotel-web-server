const express =require('express')
const cors = require('cors');
const jwt =require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mz1e2wu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const roomCollection = client.db('Assignment-11').collection('Rooms')
    const bookingCollection = client.db('Assignment-11').collection('bookings');

    // auth related API
    app.post('/jwt', async(req,res)=>{
      const user = req.body
      console.log(user);
      const token = jwt.sign(user,'secret', {expiresIn: '1h'})
      res.send(token)
    })
    // rooms related API
    app.get('/Rooms',async(req, res)=>{
      const cursor = roomCollection.find()
      const result = await cursor.toArray()
      res.send(result);
    })

    app.get('/Rooms/:id', async(req, res) =>{
      const id = req.params.id
      const query = { _id: new ObjectId(id) }

      const options ={
        // Include only the 'title' and 'imgDB' fields in the returned documents
        projection: { name:1, rating:1, image:1, price:1, description:1,availability:1,size:1}
      };





      
      // bookings

      app.get('/bookings',async(req,res)=>{
        console.log(req.query.email);
        let query ={};
        if(req.query?.email){
          query ={email: req.query.email}
        }
        const result = await bookingCollection.find(query).toArray()
        res.send(result)
      })

      app.post('/bookings', async(req, res) =>{
        const booking = req.body;
        console.log(booking);
        const result = await bookingCollection.insertOne(booking);
        res.send(result)
      })
      app.patch('/bookings/:id',async(req,res) =>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id)}
        const updateBooking =req.body
        console.log(updateBooking);
        const updateDoc ={
          $set:{
            status: updateBooking.status
          },
        }
        const result = await bookingCollection.updateOne(filter,updateDoc)
        res.send(result);
      })

      app.delete('/bookings/:id',async(req,res)=>{
        const id = req.params.id;
        const query ={_id:new ObjectId(id)}
        const result = await bookingCollection.deleteOne(query)
        res.send(result)
      })


      const result = await roomCollection.findOne(query,options)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('site is running')
})

app.listen(port,()=>{
    console.log(`site in running on port ${port}`);
})