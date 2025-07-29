require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const { User, Exercise} = require('./models/models')

const app = express();


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
}).then(()=> console.log('Connected to MondoDb'))
  .catch(err => console.error('MongoDb connection error', err))

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User({ username: req.body.username})
    const savedUser = await user.save()
    res.json({ username: savedUser.username, _id: savedUser._id})
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' })
  }
});

app.get('/api/users', async (req, res) => {
  const users = await User.find({}, '_id username')
  res.json(users)
});

app.post('/api/users/:_id/exercises/', async (req, res) => {
  try {

    const { description, duration, date } = req.body;
    const user = await User.findById(req.params._id);
  
    if (!user) return res.status(404).json({ error: 'User not found' });
  
    const exercise = new Exercise ({
      userId: user._id,
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    });
  
    const savedExercise = await exercise.save()
  
    res.json({
      _id: user._id,
      username: user.username,
      date: savedExercise.date.toDateString(),
      duration: savedExercise.duration,
      description: savedExercise.description
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to add exercise' })
  }

});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {

    const { from, to, limit } = req.query;
    const user = await User.findById(req.params._id);
  
    if (!user) return res.status(404).json({ error: 'User not found' });
  
    let query = { userId: user._id };
  
    if (from || to) {
      query.date = {}
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to)
    };
  
    let exerciseQuery = Exercise.find(query).select('description duration date');
  
    if (limit) exerciseQuery = exerciseQuery.limit(parseInt(limit));
  
    const log = await exerciseQuery.exec()
  
  
    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }))
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' })
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})




// What is cors
// What is v4 and uuidv4
// What is express.static and urlEncoded
// Why to use express.json()
// How does this line const { description, duration, date } = req.body; work
// What is <= and how does it work or if it's less or equal then what is toDate 

// Wtf is that $gte $lte
// Select method
// Limit method
// What is const log = await exerciseQuery.exec()