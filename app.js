const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const contacts = require('./routes/contacts');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/contacts', contacts);

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
