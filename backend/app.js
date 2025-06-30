const express = require('express');
require('dotenv').config();
const routes = require('./src/routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use('/api/v1', routes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
