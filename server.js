// need to add package for PORT setup called dotenv and call it via config function
// pass ./config.env to pick the setup config from

require('dotenv').config({ path: './config.env' })

const express = require('express')

const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')

//Connect Db
connectDB()

const app = express()

app.use(express.json())

app.get('/', (req, res, next) => {
  res.send('Api running')
})

// Error Handler should be last piece of middleware
// Whenever we call next and we pass it some error, it automatically gets synced with the errorhandler middleware
app.use(errorHandler)
// debugger
//we want to redirect anything that comes to the middleware and that goes to /api/auth -> /routes/auth
app.use('/api/auth', require('./routes/auth'))
app.use('/api/private', require('./routes/private'))

const PORT = process.env.PORT || 5000
// back ticks help in recognizing props/params passed along with the comment.
const server = app.listen(PORT, () => console.log(`server running on port ${PORT}`))

process.on('unhandledRejection', (err, promise) => {
  console.log(`Logged Error: ${err}`)
  //close the server if exit code is 1 - this is a server response on failure as in cURL
  server.close(() => process.exit(1))
})
