const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        //!Change: Additional properties not required
        const conn = await mongoose.connect(process.env.DB_STRING)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

module.exports = connectDB