const express = require('express')
const cors = require('cors');
const path = require("path")
const fs = require("fs")

const userRoute = require('./routes/user.js')
const boardRoute = require('./routes/board.js')
const threadRoute = require('./routes/thread.js')


const app = express()
const port = 8000

app.use(express.urlencoded({ extended: true }));
app.use(cors());
// router.use(express.static('public'))
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/static", express.static(path.join(__dirname, "static")));


app.use('/user', userRoute)
app.use('/board', boardRoute)
app.use('/thread', threadRoute)


app.get("/getMenuGif",(req, res)=>{
    let gifs = fs.readdirSync('./static/mainGifs')
    let rdIdx = Math.floor(Math.random() * gifs.length)
    let gif = gifs[rdIdx]
    return res.status(200).json(`static/mainGifs/${gif}`) 
})
app.use(express.json());



app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})

// module.exports = isAdminCheck

// export {isAdminCheck}