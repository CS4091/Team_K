const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const app = express()
const port = 3001
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendEmail = require("./email")

app.use(express.json())
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers')
  next()
})

require('dotenv').config()
const mongoName = process.env.mongo_user
const mongoPass = process.env.mongo_password
const uri = `mongodb+srv://${mongoName}:${mongoPass}@capstone-cluster.a3zuc.mongodb.net/?retryWrites=true&w=majority&appName=capstone-cluster&ssl=true`
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

async function run() {
  try {
    await client.connect()
  } catch (error) {
    console.error("Failed to connect to MongoDB", error)
  }
}
run().catch(console.dir)


// ---------------------- CALENDAR EVENT ROUTES ----------------------

app.post("/event", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('events')
    const newEvent = {
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
    const result = await collection.insertOne(newEvent)
    res.status(201).json({ message: 'Event created successfully', eventId: result.insertedId })
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).send("Error creating event")
  }
})

app.get("/event/getAll", async (req, res) => {
  try {
    const collection = client.db('capstone-website').collection('events')
    const events = await collection.find().toArray()
    res.status(200).json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    res.status(500).send("Error fetching events")
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

// ---------------------- CONTINUE WITH EXISTING ROUTES BELOW THIS ----------------------

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



app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
