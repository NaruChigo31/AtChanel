const express = require('express')
const multer = require("multer")
const cors = require('cors');
const path = require("path")
const fs = require("fs")

const userRoute = require('./routes/user.js')
const boardRoute = require('./routes/board.js')
const threadRoute = require('./routes/thread.js')




const app = express()
const port = 8000

app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// router.use(express.static('public'))
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/static", express.static(path.join(__dirname, "static")));



app.use('/user', userRoute)
app.use('/board', boardRoute)
app.use('/thread', threadRoute)

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use((err, req, res, next) => {

    console.error(err)

    // my oen error code
    if(err === "INVALID_FILE_TYPE"){
        return res.status(400).json({
            error: "Invalid file type. Only images and videos are allowed."
        })
    }

    if (err instanceof multer.MulterError) {

        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: "File too large (max 3MB)"
            })
        }

        return res.status(400).json({
              error: err.message
        })
    }

    return res.status(500).json({
        error: err.message || "Internal server error"
    })
})



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