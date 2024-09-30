const mongoose = require('mongoose')

const connectToDb = ()=>{
    mongoose.connect(process.env.MONGO_URI).then(()=>{console.log('Connected to Database')})
    .catch((err)=>{console.log('Connection to Database failed')});
}

module.exports = {
    connectToDb
}