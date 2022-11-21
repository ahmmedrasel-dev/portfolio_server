import express from 'express';
const app = express();
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
dotenv.config();
const port = process.env.PORT || 5000


// Middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt05l.mongodb.net/rasel-portfolio?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get('/', (req, res) => {
  res.send('Surver is running')
})

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Not Allow! Unauthorization Access!' })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decode) {
    if (error) {
      return res.status(403).send({ message: 'Not Allow! Forbidden Access!' })
    }

    req.decode = decode;
    next()
  })
}

async function run() {
  try {
    await client.connect();
    const userCollection = client.db('rasel-portfolio').collection('users');
    const projectCollection = client.db('rasel-portfolio').collection('projects');
    const blogCollection = client.db('rasel-portfolio').collection('blogs');
    app.get('/projects', async (req, res) => {
      const query = {};
      const result = await projectCollection.find().toArray();
      res.send(result);
    })

    app.post('/user/:email', async (req, res) => {
      const email = req.params.email;

      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '24h' })
      res.send(token);
    })


    // User Register Collection.
    app.post('/user', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
      res.send({ result, token });
    })

    // Add Blog Post
    app.post('/add-blog', verifyJWT, async (req, res) => {
      const blog = req.body;
      await blogCollection.insertOne(blog);
      res.send({ success: true, message: 'Post Create Successfully!' })
    })

    // Get All Blogs
    app.get('/blogs', verifyJWT, async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    })

    // Get All Blogs
    app.get('/allblogs', async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    })

    // Delete Single Blog.
    app.delete('/blog/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const reault = await blogCollection.deleteOne(query);
      res.send(reault)
    })


    app.get('/project/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const project = await projectCollection.findOne(query);
      res.send(project);
    })
  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir)

app.listen(port, () => {
  console.log(`Server is runnnig from Port: ${port}`)
})