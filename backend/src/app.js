const express = require('express');
require('dotenv').config();
const routes = require('./routes');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/v1', routes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
