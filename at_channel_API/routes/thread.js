const express = require('express')
const { Posts, Admins, Users } = require("../db.js")

// router

const router = express.Router()

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
// router.use(cors());


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


router.get("/:threadId", async (req, res) =>{

    thread = await Posts.findOne({
        where:{
            id: req.params.threadId,
            threadId: null
        }
    })
    if (!thread){
        return res.status(404).json({code:404, error: "There's no thread with this id"})
    }

    replies = await Posts.findAll({
        where:{
            threadId: thread.dataValues.id
        },
        order: [['isPinned', 'DESC'], ['createdAt', 'ASC']]
    })

    let repliesList = []

    for (let reply of replies){

            repliesList.push({
                id : reply.dataValues.id,
                reply: reply
            })
        }
    
    return res.status(200).json({ code:200, thread, replies: repliesList })

})

router.delete("/:threadId", async (req, res) =>{

    let yourApikey = req.headers.apikey
    if (!yourApikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(yourApikey, res, async()=>{
        
        thread = await Posts.findOne({
            where:{
                id: req.params.threadId,
                threadId: null
            }
        })
        if (!thread){
            return res.status(404).json({code:404, error: "There's no thread with this id"})
        }
        await thread.destroy()

        await Posts.destroy({
            where:{
                threadId: req.params.threadId
            }
        })

        return res.status(200).json({ code:200, notice: `Thread ${req.params.threadId} is deleted with all replies`})
    })

})

router.put("/:threadId/archive/:choice", async (req, res) =>{

    let yourApikey = req.headers.apikey
    if (!yourApikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(yourApikey, res, async()=>{
        
        const choice = req.params.choice === "true"
        
        if (req.params.choice != "false" && !choice){
            return res.status(400).json({code:400, error: "There must be boolean value"}) 
        }

        thread = await Posts.findOne({
            where:{
                id: req.params.threadId,
                threadId: null
            }
        })
        if (!thread){
            return res.status(404).json({code:404, error: "There's no thread with this id"})
        }

        thread.isArchived = choice
        await thread.save()

        let notice = `Thread ${req.params.threadId} at /${thread.dataValues.boardId}/ is archived`

        if (!choice){
            notice = `Thread ${req.params.threadId} at /${thread.dataValues.boardId}/ is no longer archived`
        }
        return res.status(200).json({ code:200, notice})

    })

})

router.put("/:threadId/pin/:choice", async (req, res) =>{

    let yourApikey = req.headers.apikey
    if (!yourApikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(yourApikey, res, async()=>{
        
        const choice = req.params.choice === "true"
        
        if (req.params.choice != "false" && !choice){
            return res.status(400).json({code:400, error: "There must be boolean value"}) 
        }

        thread = await Posts.findOne({
            where:{
                id: req.params.threadId,
                threadId: null
            }
        })
        if (!thread){
            return res.status(404).json({code:404, error: "There's no thread with this id"})
        }

        thread.isPinned = choice
        await thread.save()

        let notice = `Thread ${req.params.threadId} at /${thread.dataValues.boardId}/ is pinned`

        if (!choice){
            notice = `Thread ${req.params.threadId} at /${thread.dataValues.boardId}/ is no longer pinned`
        }
        return res.status(200).json({ code:200, notice})

    })

})

router.put("/:threadId/close/:choice", async (req, res) =>{

    let yourApikey = req.headers.apikey
    if (!yourApikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(yourApikey, res, async()=>{
        
        const choice = req.params.choice === "true"
        
        if (req.params.choice != "false" && !choice){
            return res.status(400).json({code:400, error: "There must be boolean value"}) 
        }

        thread = await Posts.findOne({
            where:{
                id: req.params.threadId,
                threadId: null
            }
        })
        if (!thread){
            return res.status(404).json({code:404, error: "There's no thread with this id"})
        }

        thread.isClosed = choice
        await thread.save()

        let notice = `Thread ${req.params.threadId} at /${thread.dataValues.boardId}/ is closed`

        if (!choice){
            notice = `Thread ${req.params.threadId} at /${thread.dataValues.boardId}/ is no longer closed`
        }
        return res.status(200).json({ code:200, notice})

    })

})

module.exports = router;