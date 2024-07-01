const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 5000;
const secretKey = 'your_secret_key';

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/feedbackSystem', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String
});

const feedbackSchema = new mongoose.Schema({
    studentEmail: String,
    facultyName: String,
    subject: String,
    rating: Number,
    comments: String
});

const facultySchema = new mongoose.Schema({
    name: String
});

const subjectSchema = new mongoose.Schema({
    name: String
});

const User = mongoose.model('User', userSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Faculty = mongoose.model('Faculty', facultySchema);
const Subject = mongoose.model('Subject', subjectSchema);

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password === password) {
        const token = jwt.sign({ email: user.email, role: user.role }, secretKey, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});

app.post('/feedback', async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    try {
        const decoded = jwt.verify(token, secretKey);
        const feedback = new Feedback({ ...req.body, studentEmail: decoded.email });
        await feedback.save();
        res.json({ message: 'Feedback submitted successfully' });
    } catch {
        res.status(401).json({ error: 'Unauthorized' });
    }
});


app.get('/feedbacks', async (req, res) => {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
});

app.get('/faculty-ratings', async (req, res) => {
    const aggregation = await Feedback.aggregate([
        { $group: { _id: '$facultyName', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json(aggregation);
});


app.get('/faculties', async (req, res) => {
    const faculties = await Faculty.find();
    res.json(faculties);
});

app.get('/subjects', async (req, res) => {
    const subjects = await Subject.find();
    res.json(subjects);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

