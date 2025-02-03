const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const app = express()
const port = 3001
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(express.json())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
  });

  


require('dotenv').config()
const mongoName = process.env.mongo_user
const mongoPass = process.env.mongo_password
const uri = `mongodb+srv://${mongoName}:${mongoPass}@capstone-cluster.a3zuc.mongodb.net/?retryWrites=true&w=majority&appName=capstone-cluster&ssl=true`;
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
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  } 
}
run().catch(console.dir);

app.get('/', async (req, res) => {
  try {
    const movies = await client.db('capstone-website').collection('posts').find({}).limit(10).toArray(); // Adjust limit if needed
    res.json(movies);
  } catch (error) {
    res.status(500).send('Error fetching movies');
  }
});

app.get('/post/:id', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id)
    const movies = await client.db('capstone-website').collection('posts').find({"_id" : id}).toArray(); // Adjust limit if needed
    res.json(movies);
  } catch (error) {
    res.status(500).send('Error fetching movies');
  }
});

app.post("/post", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('posts');

    const newPost = {
      username: req.body.username,
      title: req.body.title,
      text: req.body.text,
      votes: req.body.votes || 0,  // Default to 0 if votes is not provided
      date: req.body.date || new Date(),  // Default to the current date if not provided
      comments: req.body.comments || [],  // Default to an empty array if no comments
      class: req.body.class || "",
      club: req.body.club || ""
    }

    // Insert the new post into the 'post' collection
    const result = await collection.insertOne(newPost)

    console.log('New post created with ID:', result.insertedId)
    res.status(201).json({ message: 'Post created successfully', postId: result.insertedId })
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).send('Error creating post')
  }
})

app.put("/post/:postId", async (req, res) => {
  try{
    const collection = client.db('capstone-website').collection('posts');
    const postId = req.params.postId;

    const updatedPost = {
      username: req.body.username,
      title: req.body.title,
      text: req.body.text,
      votes: req.body.votes,
      date: req.body.date,
      comments: req.body.comments,
      class: req.body.class,
      club: req.body.club
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: updatedPost }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Error updating post");
  }
})

app.post("/user/register", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('users');

    const { username, email, password } = req.body;

    const existingUser = await collection.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: "Username or email already exists", username: existingUser.username, userEmail: existingUser.email, userRoles: existingUser.roles });
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      username,
      email,
      password: hashedPassword, // Add hashing later?
      createdAt: new Date(),
      roles: req.body.roles || ["student"]  // Default to "student" role for now
    };

    const result = await collection.insertOne(newUser);
    console.log("New user created with ID:", result.insertedId);
    return res.status(200).json({ message: "User registered successfully", username: newUser.username, userEmail: newUser.email, userRoles: newUser.roles});
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).send("Error registering user");
  }
});

app.post("/user/login", async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body

      const collection = client.db('capstone-website').collection('users')

      const user = await collection.findOne({
        $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
      })
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.status(200).json({
        message: "Login successful",
        username: user.username,
        userRoles: user.roles,
        userEmail: user.email
      })
    } catch (error) {
      console.error("Error during login:", error)
      res.status(500).send("Error during login")
    }
})
app.post("/class/add", async (req, res) => {
  try {
    const { name, department, number } = req.body
    const collection = client.db('capstone-website').collection('classes')
    const newClass = {
      name,
      department,
      number,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(newClass)
    res.status(201).json({ message: "Class added successfully", classId: result.insertedId })
  } catch (error) {
    console.error("Error adding class:", error)
    res.status(500).send("Error adding class")
  }
})

app.get("/class/getAll", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('classes')
    const classes = await collection.find({}).toArray()

    res.status(200).json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    res.status(500).send("Error fetching classes")
  }
})

app.delete("/post/:postId", async (req, res) => {
  try {
    // constants
    const collection = client.db('capstone-website').collection('posts');
    const postId = req.params.postId;

    //delete the post from "post" collection. Same concept from post
    const result = await collection.deleteOne({ _id: new ObjectId(postId)})

    // error message if post is not deleted (incremented deleted count)
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    //post deleted yay
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Error deleting post");
  }
});

app.get("/class/:className", async (req, res) => {
  try {
    const name = req.params.className
    const collection = client.db('capstone-website').collection('classes')
    const classData = await collection.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })

    if (!classData) {
      return res.status(404).json({ message: "Class not found" })
    }
    res.status(200).json(classData)
  } catch (error) {
    console.error("Error fetching class by name:", error)
    res.status(500).send("Error fetching class by name")
  }
})


app.get("/post/class/:className", async (req, res) => {
  try {
    const name = req.params.className
    const collection = client.db('capstone-website').collection('posts')
    const classData = await collection.find({ class: { $regex: new RegExp(`^${name}$`, 'i') } }).toArray()

    if (!classData) {
      return res.status(404).json({ message: "Posts for this class not found" })
    }
    res.status(200).json(classData)
  } catch (error) {
    console.error("Error fetching class by name:", error)
    res.status(500).send("Error fetching class by name")
  }
})

app.get('/posts/club/:clubName', async (req, res) => {
  try {
    const clubName = req.params.clubName
    const posts = await client.db('capstone-website').collection('posts').find({ club: clubName }).toArray()

    if (posts.length === 0) {
      return res.status(404).json({ message: `No posts found for club: ${clubName}` })
    }

    res.status(200).json(posts)
  } catch (error) {
    console.error("Error fetching posts by club:", error)
    res.status(500).send("Error fetching posts by club")
  }
})


app.get("/posts/getRecent", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('posts')
    const recentPosts = await collection
      .find({})
      .sort({ createdAt: -1 }) 
      .limit(10) 
      .toArray()

    if (recentPosts.length === 0) {
      return res.status(404).json({ message: "No posts found" })
    }

    res.status(200).json(recentPosts)
  } catch (error) {
    console.error("Error fetching recent posts:", error)
    res.status(500).send("Error fetching recent posts")
  }
})

app.get('/posts/user/:userName', async (req, res) => {
  try {
    const clubName = req.params.userName
    const posts = await client.db('capstone-website').collection('posts').find({ username: clubName }).toArray()

    if (posts.length === 0) {
      return res.status(404).json({ message: `No posts found for club: ${clubName}` })
    }

    res.status(200).json(posts)
  } catch (error) {
    console.error("Error fetching posts by club:", error)
    res.status(500).send("Error fetching posts by club")
  }
})

app.get('/search', async (req, res) => {
  const { query } = req.query; 
  const post = await client.db('capstone-website').collection('posts')
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required.' });
  }

  try {
    const posts = await post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } }, // Case-insensitive search in title
        { text: { $regex: query, $options: 'i' } },  // Case-insensitive search in text
      ],
    }).toArray();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
