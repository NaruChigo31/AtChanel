const express = require('express')
const { Boards, Users, Admins, Posts } = require("../db.js")
const fs = require("fs")
const { Op } = require("sequelize");

const multer = require("multer")
const path = require("path");
const { log } = require('console');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcrypt")


const allowedTypes = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",

  // GIF
  "image/gif",

  // Videos
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/mpeg",
  "video/3gpp",
  "video/x-matroska" // .mkv
];


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./public/uploads`)
  },
  filename: (req, file, cb) => {

    // TODO - maybe add up hashing to date
    const uniqueCode = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = file.originalname.split('.').pop()
    let newFileName = `${uniqueCode}.${extension}`
    cb(null, newFileName )
    // cb(null, file.originalname)
  }
})

const upload = multer({ 
    storage: storage,
    // limit 3 mb max
    limits: {fileSize: 3*1024*1024},
    fileFilter: function(req, file, cb) {
      checkFileType(file, cb);
    }
})


function checkFileType(file, cb) {

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Invalid file type. Only images and videos are allowed."))
    }
}


async function anonAuth(req, res, next) {
    
    let apikey = req.cookies.apikey;
    
    if (!apikey) {
        apikey = uuidv4();

        const user = await Users.create({
            apikey: apikey
        });

        res.cookie("apikey", apikey, {
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax",
            httpOnly: true
        });

        req.user = user;
        return next();
    }

    const user = await Users.findOne({
        where: { apikey }
    });

    if (!user) {
        const newKey = uuidv4();

        const newUser = await Users.create({
            apikey: newKey
        });

        res.cookie("apikey", newKey, {
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax",
            httpOnly: true
        });

        req.user = newUser;
        return next();
    }

    req.user = user;
    return next();
}



const spacesInText = [" ","\n","\t"]

const router = express.Router()

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// router.use(cors());

var cookieParser = require('cookie-parser');

router.use(cookieParser());



async function isAdminCheck(apikey, res, cb){
    let you = await Users.findOne({
        where:{ apikey: apikey }
    })
    if(!you){
        return res.status(403).json({code:403, error: "There's no such a dude in database"})
    } 
    let youAdmin = await Admins.findOne({
        where: {userId: you.dataValues.id}
    })
    if(!youAdmin){
        return res.status(404).json({code:404, error: "You're not admin"})
    }  
    cb()
}

function filterSpaces(field){
    return field.split("").filter((element) => !spacesInText.includes(element))
}

// just about boards

router.post("/", async (req, res) =>{
    let apikey = req.headers.apikey
    if (!apikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(apikey, res, async()=>{
        try{
            let { body } = req

            if (!body.tag){
                return res.status(400).json({ code:400, error:"Where is the tag?" })
            }
            if (!body.topic){
                return res.status(400).json({ code:400, error:"Where is the topic?" })
            }
            if (!body.description){
                return res.status(400).json({ code:400, error:"Where is the description?" })
            }

            const tag = body.tag.trim().toLowerCase()
            const topic = body.topic.trim()
            const description = body.description.trim()


            if(filterSpaces(tag).length < 1){
                return res.status(400).json({ code:400, error:"Tag is at least 1 symbol" })
            }
            
            else if (tag.trim().split(" ").length > 1){
                return res.status(400).json({ code:400, error:"Tag is 1 word only" })
            }
            else if (tag.trim().split(" ")[0].length > 5){
                return res.status(400).json({ code:400, error:"Tag is maximum 5 symbols" })
            }


            if(filterSpaces(topic).length < 1){
                return res.status(400).json({ code:400, error:"Where is the topic?" })
            }
            if(filterSpaces(topic).length < 1){
                return res.status(400).json({ code:400, error:"Where is the description?" })
            }

            let boardExists = await Boards.findOne({
                where:{
                    tag: tag
                }
            })

            if(boardExists){
                return res.status(201).json({ code:201,  message:`Board /${tag}/ - ${boardExists.dataValues.topic} already exists`})
            }

            let board = await Boards.create({
                tag: tag,
                topic: topic,
                description: description
            })
    
            return res.status(201).json({ code:201,  message:"yo, board is created", board: board })
            
        } catch(error) {
            console.error(error)
            return res.status(500).json({ code:500, error: "Oops, error ocured" })
        }
    })
})

router.get("/", async (req, res) =>{
    let boards = await Boards.findAll()
    
    if (boards.length <= 0){
        return res.status(404).json({code:404, error: "There's no boards"})
    }
    return res.status(200).json({code:200, boards})
})

router.get("/:tag", async (req, res)=>{

    let board = await Boards.findOne({
        where:{
            tag: req.params.tag 
        }
    })
    
    if (!board){
        return res.status(404).json({code:404, error: "There's no such a page"})
    }
    return res.status(200).json({code:200, board: board})
})

router.delete("/:tag", async (req, res) =>{
    let apikey = req.headers.apikey
    if (!apikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(apikey, res, async()=>{
        try{
            const tag = req.params.tag
            let board = await Boards.findOne({
                where:{
                    tag : tag
                }
            })
            if(!board){
                return res.status(404).json({ code: 404, error: "Oops, looks like there's no board found" })
            }
            const topic = board.dataValues.topic
            board.destroy()
        
            return res.status(204).json({ code:204, message:`yo, board /${tag}/ - ${topic} is deleted` })
        } catch(error){
            console.error(error)
            return res.status(500).json({ code:500, error: "Oops, error ocured" })
        }
    })

})

router.put("/:tag", async (req, res) =>{
    let apikey = req.headers.apikey
    if (!apikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(apikey, res, async()=>{
        try{
            const prevTag = req.params.tag
            // console.log(prevTag.length)
            let board = await Boards.findOne({
                where:{
                    tag : prevTag
                }
            })
            if(!board){
                return res.status(404).json({ code: 404, error: "Oops, looks like there's no board found" })
            }
    
            prevTopic = board.dataValues.topic

            let { body } = req
    
            if(body.topic){
                board.update({topic: body.topic})
            }
            if(body.description){
                board.update({description: body.description})
            }
            // updated at the end as used like id
            if(body.tag){
                board.update({tag: body.tag})
            }
            
            board.save()
            return res.status(200).json({ code:200, message:`yo, board is updated` })
        } catch(error){
            console.error(error)
            return res.status(500).json({ code:500, error: "Oops, error ocured" })
        }
    })

})


// about threads and posts on the board

router.post("/:tag/thread", upload.single("file"), anonAuth ,async (req, res) =>{

    let { body } = req

    // let yourApikey = req.headers.apikey

    // if (!yourApikey){
    //     return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    // } 

    // let user = await Users.findOne({
    //     where: {
    //         apikey: yourApikey
    //     }
    // })
    // if(!user){
    //     return res.status(404).json({ code: 404, error: "Oops, looks like there's no user found" })
    // }

    let user = req.user

    let board = await Boards.findOne({
        where: {
            tag: req.params.tag
        }
    })
    if(!board){
        return res.status(404).json({ code: 404, error: "Oops, looks like there's no board found" })
    }
    
    if(!req.file){
        return res.status(400).json({ code: 400, error: "You must include file in the thread op post" })
    }
    if(!body.title){
        return res.status(400).json({ code: 400, error: "Where's title" })
    }
    if(!body.text){
        return res.status(400).json({ code: 400, error: "Where's text" })
    }    

    console.log(req.file)
    console.log("flexflexflexflexflex")
    let fixedName = Buffer.from(req.file.originalname, "latin1").toString("utf8");

    try{

        let thread = await Posts.create({
            title: body.title,
            text: body.text,
            boardId: board.dataValues.id,
            threadId: null,
            postAnswerIDs: body.postAnswerIDs || null,
            userName: body.userName || null,
            fileOrigName: fixedName,
            fileSavedName: req.file.filename,
            isPinned: false,
            isSpoiler: body.isSpoiler || false,
            creatorId: user.dataValues.id
        })
        // console.log(thread)
        // fs.mkdir(`uploads/${thread.dataValues.id}`, {recursive:true}, function(err){
        //     if (err){
        //         console.error(err)
        //     }
        //     else{
        //         console.log("created")
        //     }
        // })
        return res.status(200).json({code:200, file: req.file, thread})

    } catch(error){

        console.error(error)

        return res.status(400).json({ error: error.message })
        // return res.status(500).json({ code:500, error: "Oops, error ocured" })
    }
})

router.post("/:tag/thread/:threadId/reply", upload.single("file"), anonAuth, async (req, res) =>{

    let { body } = req

    let user = req.user

    if(!user){
        return res.status(404).json({ code: 404, error: "Oops, looks like there's no user found" })
    }

    let board = await Boards.findOne({
        where: {
            tag: req.params.tag
        }
    })
    if(!board){
        return res.status(404).json({ code: 404, error: "Oops, looks like there's no board found" })
    }

    let thread = await Posts.findOne({
        where: {
            id: req.params.threadId
        }
    })
    if(!thread){
        return res.status(404).json({ code: 404, error: "Oops, looks like there's no thread found" })
    }
    if(thread.dataValues.isClosed){
        return res.status(404).json({ code: 404, error: "Oops, looks like this thread is closed" })
    }
    

    if(!body.text){
        return res.status(400).json({ code: 400, error: "Where's text" })
    }  
    
    let answerIDs = null

    if(body.postAnswerIDs){
        answerIDs = JSON.parse(body.postAnswerIDs)
    }

 
    try{

        let reply = await Posts.create({
            title: null,
            text: body.text,
            boardId: board.dataValues.id,
            threadId: req.params.threadId,
            postAnswersIDs: answerIDs || null,
            userName: body.userName || null,
            fileOrigName: req.file ? req.file.originalname : null,
            fileSavedName: req.file ? req.file.filename : null,
            // isPinned: false,
            isSpoiler: body.isSpoiler || false,
            creatorId: user.dataValues.id
        })

        return res.status(200).json({code:200, reply})

    } catch(error){
        console.error(error)
        return res.status(500).json({ code:500, error: "Oops, error ocured" })
    }
})

// router.get("/:tag/thread", async (req, res) =>{
        
//     let board = await Boards.findOne({
//         where:{
//             tag: req.params.tag 
//         }
//     })
//     if (!board){
//         return res.status(404).json({code:404, error: "There's no such a board"})
//     }
    

//     let page = Number(req.query.page) || 1
//     const limit = 10
//     const offset = (page-1)*limit

//     let threads = {}
//     let threadsFound
    
//     if(req.query.catalog){
//         threadsFound = await Posts.findAll({
//             where:{
//                 boardId: board.dataValues.id,
//                 isArchived: false,
//                 threadId: null
//             }
//         })
//         if(threadsFound.length < 1){
//             return res.status(404).json({code:404, error: "There's no threads on board"})
//         }

//         for (let thread of threadsFound){

//             let repliesCount = await Posts.count({
//                 where:{
//                     threadId: thread.dataValues.id
//                 }
//             })
//             let imagesCount = await Posts.count({
//                 where:{
//                     threadId: thread.dataValues.id,
//                     fileOrigName: {
//                         [Op.not]: null
//                     }
//                 }
//             })

//             threads[thread.dataValues.id] = {
//                 thread: thread,
//                 repliesCount: repliesCount,
//                 imagesCount: imagesCount
//             }
//         }

//     } else{
//         threadsFound = await Posts.findAll({
//             where:{
//                 boardId: board.dataValues.id,
//                 isArchived: false,
//                 threadId: null
//             },
//             offset: offset,
//             limit: limit
//         })
//         if(threadsFound.length < 1){
//             return res.status(404).json({code:404, error: "There's no threads on board"})
//         }

//         for (let thread of threadsFound){
//             let last5Replies = await Posts.findAll({
//                 where:{
//                     threadId: thread.dataValues.id
//                 },
//                 limit: 5,
//                 order: [['createdAt', 'DESC']]
//             })

//             let repliesCount = await Posts.count({
//                 where:{
//                     threadId: thread.dataValues.id
//                 }
//             })
//             let imagesCount = await Posts.count({
//                 where:{
//                     threadId: thread.dataValues.id,
//                     fileOrigName: {
//                         [Op.not]: null
//                     }
//                 }
//             })

//             threads[thread.dataValues.id] = {
//                 thread: thread,
//                 repliesCount: repliesCount,
//                 imagesCount: imagesCount,
//                 replies: last5Replies
//             }
//         }
//     }

//     const threadsUnarchivedCount = await Posts.count({
//         where:{
//             boardId: board.dataValues.id,
//             isArchived: false,
//             threadId: null
//         }
//     })

//     return res.status(200).json({ code:200, threads: threads, countUnarch: threadsUnarchivedCount })
// })

router.get("/:tag/thread/", async (req, res) =>{
        
    let board = await Boards.findOne({
        where:{
            tag: req.params.tag 
        }
    })
    if (!board){
        return res.status(404).json({code:404, error: "There's no such a board"})
    }

    

    let page = Number(req.query.page) || 1
    const limit = 10
    const offset = (page-1)*limit

    let threads = []
    let threadsFound
    let threadCountTotal
    
    if(req.query.status === "catalog"){
        threadsFound = await Posts.findAll({
            where:{
                boardId: board.dataValues.id,
                isArchived: false,
                threadId: null,
            },
            order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
        })


        threadCountTotal = threadsFound.length

        for (let thread of threadsFound){

            let repliesCount = await Posts.count({
                where:{
                    threadId: thread.dataValues.id
                }
            })
            let imagesCount = await Posts.count({
                where:{
                    threadId: thread.dataValues.id,
                    fileOrigName: {
                        [Op.not]: null
                    }
                }
            })

            threads.push({
                id : thread.dataValues.id,
                thread: thread,
                repliesCount: repliesCount,
                imagesCount: imagesCount
            })
        }

    } else if (req.query.status === "archived"){
        threadsFound = await Posts.findAll({
            where:{
                boardId: board.dataValues.id,
                isArchived: true,
                threadId: null,
            },
            order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
        })

        threadCountTotal = threadsFound.length

        for (let thread of threadsFound){

            threads.push({
                id : thread.dataValues.id,
                thread: thread
            })
        }

    } else{
        threadsFound = await Posts.findAll({
            where:{
                boardId: board.dataValues.id,
                isArchived: false,
                threadId: null
            },
            offset: offset,
            limit: limit,
            order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
        })
        console.log(threadsFound)


        threadCountTotal = await Posts.count({
            where:{
                boardId: board.dataValues.id,
                isArchived: false,
                threadId: null
            }
        })


        for (let thread of threadsFound){
            let last5Replies = await Posts.findAll({
                where:{
                    threadId: thread.dataValues.id
                },
                limit: 5,
                order: [['createdAt', 'DESC']]
            })

            let repliesCount = await Posts.count({
                where:{
                    threadId: thread.dataValues.id
                }
            })
            let imagesCount = await Posts.count({
                where:{
                    threadId: thread.dataValues.id,
                    fileOrigName: {
                        [Op.not]: null
                    }
                }
            })

            let lastRepliesList = []

            for(let reply of last5Replies){
                lastRepliesList.push(reply)
            }
            lastRepliesList.reverse()

            threads.push({
                id: thread.dataValues.id,
                thread: thread,
                repliesCount: repliesCount,
                imagesCount: imagesCount,
                replies: lastRepliesList
            })
        }
    }


    return res.status(200).json({ code:200, threads: threads, count: threadCountTotal })
})

module.exports = router;