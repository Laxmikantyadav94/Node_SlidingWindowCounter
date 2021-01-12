//https://dev.to/ganeshmani/designing-a-scalable-api-rate-limiter-in-node-js-application-5hg3
//https://codeforgeek.com/building-api-rate-limiter-using-nodejs-redis/

const express = require('express');
const rateLimiter = require('./slidingWindowCounter');
const app = express();

const router = express.Router();

router.get('/',(req,res) => {
    res.send('<h1>API response</h1>')
})

app.use(rateLimiter);
app.use('/api',router);

app.listen(5000,() => {
    console.log('server is running on port 5000');
})