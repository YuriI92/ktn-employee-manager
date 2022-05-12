const express = require('express');
const db = require('./db/connection');
const routes = require('./routes/api');

const PORT = process.env.PORT || 3001;
const app = express();

// express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', routes);

db.connect(err => {
    if (err) throw err;
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });        
});
