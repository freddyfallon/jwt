const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const secretKey = 'mySuperSecretKey' // NEVER DO THIS EVER

const jwtVerify = token => {
  try {
    return jwt.verify(token, secretKey)
  } catch (err) {
    console.log('Failed: ', err.message)
  }
}

const jwtMiddleware = (req, res, next) => {
  const authHeader = req.get('Authorization') || ''
  const authToken = authHeader.slice('Bearer '.length)
  if (jwtVerify(authToken)) {
    next()
  }
  res.status(403).send({ error: 'Unauthorized' })
}

const users = [{ id: 1, username: 'freddy', password: 'coolpassword' }] // NEVER DO THIS EITHER

const app = express()

const port = 8888

app.use(bodyParser.json())
app.use(cors())

app.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send('Username and password needed')
    return
  }
  const user = users.find(
    user =>
      user.username === req.body.username && user.password === req.body.password
  )

  if (!user) {
    res.status(401).send('User not found')
    return
  }

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username
    },
    'mySuperSecretKey',
    { expiresIn: '3 hours' }
  )

  res.status(200).send({ access_token: token })
})

app.get('/resource', (_, res) => {
  res.status(200).send('Public resource: you can see this')
})

app.get('/resource/secret', jwtMiddleware, (_, res) => {
  res.status(200).send('Secret resource: you should be logged in to see this')
})

app.get('*', (_, res) => {
  res.sendStatus(404)
})

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
})
