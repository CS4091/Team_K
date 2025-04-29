const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const app = express()
const port = 3001
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("./email")

const cors = require("cors");
app.use(cors());

app.use(express.json())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173', 'http://localhost:5173/map');
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
      club: req.body.club || "",
      pin: req.body.pin || false,
      likedBy: req.body.likedBy || [],
      dislikedBy: req.body.dislikedBy || []
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
      club: req.body.club,
      pin: req.body.pin,
      likedBy : req.body.likedBy,
      dislikedBy: req.body.dislikedBy
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(postId) },
      { $set: updatedPost },
      { returnDocument: "after" } // returns the updated document
    )
    if (!result) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post updated successfully", post: result });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Error updating post");
  }
})

app.post("/user/register", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('users');

    const { username, email, password } = req.body;

    if (!email.endsWith(".edu")) {
      return res.status(400).json({ message: "Only school emails are allowed for registration" });
    }
    const existingUser = await collection.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: "Username or email already exists", username: existingUser.username, userEmail: existingUser.email, userRoles: existingUser.roles });
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = Math.floor(Math.random() * 900) + 100
    await sendEmail(email, verificationToken)
    const newUser = {
      username,
      email,
      password: hashedPassword, // Add hashing later?
      createdAt: new Date(),
      roles: req.body.roles || ["student"],  // Default to "student" role for now
      verified: false,
      token: verificationToken
    };

    const result = await collection.insertOne(newUser);
    console.log("New user created with ID:", result.insertedId);
    return res.status(200).json({ message: "User registered successfully", username: newUser.username, userEmail: newUser.email, userRoles: newUser.roles});
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).send("Error registering user");
  }
});

app.post("/user/resend-verification", async (req, res) => {
  try {
    const collection = client.db("capstone-website").collection("users");
    const { email } = req.body;

    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const verificationToken = Math.floor(Math.random() * 900) + 100;
    await sendEmail(email, verificationToken);

    await collection.updateOne(
      { email },
      { $set: { token: verificationToken } }
    );

    res.status(200).json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).send("Error resending verification email");
  }
});

app.put("/user/verify", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('users');
    const { email, token } = req.body;
    const user = await collection.findOneAndUpdate({"email": email, "token": token}, {$set:{verified: true}}, {returnDocument: "after"})
    return res.status(200).json({ message: "Email verified successfully!", user: user });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).send("Error verifying email");
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
        userEmail: user.email,
        _id: user._id,
        verified: user.verified
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

app.post("/club/add", async (req, res) => {
  try {
    const { name, description, creator, president = "TBD", importantPeople = [] } = req.body
    const collection = client.db('capstone-website').collection('clubs')
    const newClub = {
      name,
      description,
      creator,
      president,
      importantPeople,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(newClub)
    res.status(201).json({ message: "Club added successfully", clubId: result.insertedId })
  } catch (error) {
    console.error("Error adding club:", error)
    res.status(500).send("Error adding club")
  }
})

app.get("/clubs/getAll", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('clubs')
    const clubses = await collection.find({}).toArray()

    res.status(200).json(clubses)
  } catch (error) {
    console.error("Error fetching clubses:", error)
    res.status(500).send("Error fetching clubses")
  }
})

app.get("/users/getAll", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('users')
    const users = await collection.find({}, {
      projection: { _id: 1, username: 1, email: 1 }
    }).toArray()

    res.status(200).json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).send("Error fetching users")
  }
})

app.put("/c/:clubId/update", async (req, res) => {
  try {
    const clubId = req.params.clubId
    const { president, newImportantPeople = [] } = req.body

    const db = client.db('capstone-website')
    const clubs = db.collection('clubs')
    const users = db.collection('users')

    const update = {}

    if (president) {
      update.$set = { president }
    
      await users.updateOne(
        { _id: new ObjectId(president._id) },
        { $addToSet: { roles: 'president' } }
      )
    }

    if (newImportantPeople.length > 0) {
      update.$addToSet = {
        importantPeople: { $each: newImportantPeople }
      }

      const userIds = newImportantPeople.map(p => new ObjectId(p._id))
      await users.updateMany(
        { _id: { $in: userIds } },
        { $addToSet: { roles: 'important' } }
      )
    }

    if (!update.$set && !update.$addToSet) {
      return res.status(400).send("No valid update fields provided")
    }
    const result = await clubs.findOneAndUpdate(
      { _id: new ObjectId(clubId) },
      update,
      { returnDocument: 'after' }
    )
    if (!result) {
      return res.status(404).send("Club not found")
    }

    res.status(200).json({ updatedClub: result })
  } catch (error) {
    console.error("Error updating club:", error)
    res.status(500).send("Error updating club")
  }
})

app.get("/both/getAll", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('clubs')
    const clubses = await collection.find({}).toArray()
    const collection2 = client.db('capstone-website').collection('classes')
    const classes = await collection2.find({}).toArray()
    const combinedObject = {
      classes: classes,
      clubs: clubses
    }

    res.status(200).json(combinedObject)
  } catch (error) {
    console.error("Error fetching clubses:", error)
    res.status(500).send("Error fetching clubses")
  }
})

app.get("/user/getAll", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('users');
    const users = await collection.find({}, { projection: { username: 1, email: 1, _id: 1 } }).toArray();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).send("Error fetching users");
  }
});

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

app.get("/club/:clubName", async (req, res) => {
  try {
    const name = req.params.clubName
    const collection = client.db('capstone-website').collection('clubs')
    const classData = await collection.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })

    if (!classData) {
      return res.status(404).json({ message: "Club not found" })
    }
    res.status(200).json(classData)
  } catch (error) {
    console.error("Error fetching club by name:", error)
    res.status(500).send("Error fetching club by name")
  }
})

app.get("/post/club/:clubName", async (req, res) => {
  try {
    const name = req.params.clubName
    const collection = client.db('capstone-website').collection('posts')
    const classData = await collection.find({ club: { $regex: new RegExp(`^${name}$`, 'i') } }).toArray()

    if (!classData) {
      return res.status(404).json({ message: "Posts for this club not found" })
    }
    res.status(200).json(classData)
  } catch (error) {
    console.error("Error fetching club by name:", error)
    res.status(500).send("Error fetching club by name")
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

app.get('/c/:cName', async (req, res) => {
  try {
    const cName = req.params.cName
    let type = 'club'
    let collection = client.db('capstone-website').collection('clubs')
    let data = await collection.findOne({ name: { $regex: new RegExp(`^${cName}$`, 'i') } })
    if(!data){
      type = 'class'
      collection = client.db('capstone-website').collection('classes')
      data = await collection.findOne({ name: { $regex: new RegExp(`^${cName}$`, 'i') } })
    }
    let posts = []
    collection = client.db('capstone-website').collection('posts')
    if(type == 'club') {
      posts = await collection.find({ club: { $regex: new RegExp(`^${data.name}$`, 'i') } }).toArray()
    } else{
      posts = await collection.find({ class: { $regex: new RegExp(`^${data.name}$`, 'i') } }).toArray()
    }
    
    let result = {data, posts}

    res.status(200).json(result)
  } catch (error) {
    console.error("Error fetching posts by club:", error)
    res.status(500).send("Error fetching posts by club")
  }
})


app.post("/event", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('events');

    const newEvent = {
      name: req.body.name || req.body.title || "",
      description: req.body.description || req.body.summary || "",
      pinId : req.body.id || 0,
      latlng : req.body.latlng || {},
      marker: req.body.marker || {},
      start: req.body.start || new Date(0),
      end: req.body.end || new Date(0),
      coordinator: req.body.coordinator || "",
      email: req.body.email || "",
      title: req.body.title || req.body.name || "",
      hostingGroup: req.body.hostingGroup || "",
      location: req.body.latlng || {},
      phone: req.body.phone || 0,
      summary: req.body.summary || req.body.description || ""
    }

    const result = await collection.insertOne(newEvent)

    res.status(201).json({ message: 'Post created successfully', postId: result.insertedId })
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).send('Error creating post')
  }
})

app.get("/event/getAll", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('events')
    const pins = await collection.find().toArray()

    res.status(200).json(pins)
  } catch (error) {
    console.error("Error fetching club by name:", error)
    res.status(500).send("Error fetching club by name")
  }
})




app.get("/event/:id", async (req, res) => {
  try {
    const eventId = new ObjectId(req.params.id)
    const event = await client.db("capstone-website").collection("events").findOne({ _id: eventId })
    if (!event) return res.status(404).json({ message: "Event not found" })
    res.status(200).json(event)
  } catch (error) {
    console.error("Error fetching event by ID:", error)
    res.status(500).send("Error fetching event")
  }
})

app.put("/event/:id", async (req, res) => {
  try {
    const eventId = new ObjectId(req.params.id)
    const updatedEvent = {
      title: req.body.title || "",
      location: req.body.location || "",
      summary: req.body.summary || "",
      hostingGroup: req.body.hostingGroup || "",
      coordinator: req.body.coordinator || "",
      email: req.body.email || "",
      phone: req.body.phone || "",
      link: req.body.link || "",
      image: req.body.image || "",
      start: new Date(req.body.start) || new Date(),
      end: new Date(req.body.end) || new Date()
    }
    const result = await client.db("capstone-website").collection("events").updateOne(
      { _id: eventId },
      { $set: updatedEvent }
    )
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Event not found" })
    }
    res.status(200).json({ message: "Event updated successfully" })
  } catch (error) {
    console.error("Error updating event:", error)
    res.status(500).send("Error updating event")
  }
})

app.delete("/event/:id", async (req, res) => {
  try {
    const eventId = new ObjectId(req.params.id)
    const result = await client.db("capstone-website").collection("events").deleteOne({ _id: eventId })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Event not found" })
    }
    res.status(200).json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting event:", error)
    res.status(500).send("Error deleting event")
  }
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

app.put('/c/:cName/announcement', async (req, res) => {
  try {
    const { announcement } = req.body;
    const cName = req.params.cName;
    const clubsCollection = client.db('capstone-website').collection('clubs');
    const classesCollection = client.db('capstone-website').collection('classes');

    let result = await clubsCollection.updateOne(
      { name: { $regex: new RegExp(`^${cName}$`, 'i') } },
      { $set: { announcement } }
    );

    if (result.matchedCount === 0) {
      result = await classesCollection.updateOne(
        { name: { $regex: new RegExp(`^${cName}$`, 'i') } },
        { $set: { announcement } }
      );
    }

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'the abyss cannot hold the announcement' });
    }

    return res.status(200).json({ message: 'announcement has been contained successfuly' });
  } catch (error) {
    console.error('error:', error);
    res.status(500).send('error');
  }
})
