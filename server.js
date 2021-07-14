const express = require("express");
const connectDB = require('./config/db');
const path = require('path');


const app = express();

//connect databse
connectDB();

//init middleware
app.use(express.json())


//Define routes
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/post', require('./routes/api/post'));


// Serve static assets in production
if(process.env.NODE_ENV === 'production') {
    // Set the static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname,'client','build','index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=> console.log(`server started on port ${PORT}`));
