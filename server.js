var express = require('express')
var bodyParser = require('body-parser')

var app = express()
var http = require("http").Server(app)
var io = require("socket.io")(http)
var mongoose = require("mongoose")

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

mongoose.Promise = Promise

var dbUrl = "mongodb+srv://user:user@cluster0.xns68.mongodb.net/chat?retryWrites=true&w=majority"


var Message = mongoose.model('Message', {
    name: String,
    message: String
})


app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) =>{
      res.send(messages)
    })
})

app.post('/messages', (req, res) => {
    var message = new Message(req.body)
    message.save()
    .then(() => {
        return Message.findOne({message:'badword'})
    })
    .then(censored => {
        if(censored)
        {
            console.log('censored words found', censored)
            return Message.deleteOne({_id:censored.id})
        }
        io.emit("message",req.body)
        res.sendStatus(200)
    })
    .catch((err) => {
        res.sendStatus(500)
        return console.error(err)
    })
})

app.get("/clear", (req, res) =>{
    Message.deleteMany({}, (err) => {
                    console.log("Messages cleared",err)
                })
})

io.on('connection', (socket) => {
    console.log("A user connected")
})

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    console.log('mongodb connected', err)
})

var server = http.listen(3000, () => {
    console.log("Server is Listening", server.address().port)
})