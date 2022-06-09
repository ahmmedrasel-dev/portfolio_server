import express from 'express';
const app = express();
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
const port = process.env.PORT || 5000


// Middleware
dotenv.config();
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt05l.mongodb.net/rasel-portfolio?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get('/', (req, res) => {
  res.send('Surver is running')
})

async function run() {
  try {
    await client.connect();
    const projectCollection = client.db('rasel-portfolio').collection('projects');

    app.get('/projects', async (req, res) => {
      const query = {};
      const result = await projectCollection.find().toArray();
      res.send(result);
    })

    app.get('/project/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const project = await projectCollection.findOne(query);
      res.send(project);
    })
  }
  finally {

  }
}

run().catch(console.dir)

app.listen(port, () => {
  console.log(`Server is runnnig from Port: ${port}`)
})