const redis = require('redis');
const moment = require('moment');
const redisClient = redis.createClient();

module.exports = (req,res,next) => {
    
    redisClient.exists(req.headers.user,(err,reply) => {
        if(err){
            console.log("problem with redis");
            system.exit(0);
        }

        let currentTime = moment().unix();

        if(reply === 1) {
            //user exists
            redisClient.get(req.headers.user,(err,redisResponse) => {
                // console.log(redisResponse);
                let data = JSON.parse(redisResponse);
                let windowStartTimestamp  = moment().subtract(1,'minute').unix();

                let requestsWithinWindow = data.filter((item) => {
                    return item.requestTime > windowStartTimestamp;
                })

                console.log('requestsWithinWindow', requestsWithinWindow);

                let totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
                    return accumulator + entry.counter;
                  }, 0);
                
                if(totalWindowRequestsCount >= 5){

                    return res.status(429).json({ "error" : 1,"message" : "throttle limit exceeded" })

                }
                else{
                    let lastRequestLog = data[data.length - 1];
                    if(lastRequestLog.requestTime >windowStartTimestamp){
                        lastRequestLog.counter++;
                        data[data.length - 1] = lastRequestLog;
                    }else{
                        data.push({
                            requestTime : currentTime,
                            counter : 1
                        })
                    }
                  
                    redisClient.set(req.headers.user,JSON.stringify(data));

                    next();

                }
            })
        }
        else{
            let data = [];
            let requestData = {
                'requestTime' : currentTime,
                'counter' : 1
            }
            data.push(requestData);
            redisClient.set(req.headers.user,JSON.stringify(data));

            next(); 
        }
    })
}