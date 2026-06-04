const express = require('express')
const { Users, Admins } = require("../db.js")
const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcrypt")

const router = express.Router()

// https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded

router.use(express.json());
// to send data as json object
router.use(express.urlencoded({ extended: true }));
// to send data as strings and arrays
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


router.post("/", async (req, res) => {

    let apikey = uuidv4()
    try{
        let user = await Users.create({
            apikey: apikey,
        })
        res.cookie('apikey', user.apikey, {
          maxAge: 24 * 60 * 60 * 1000, // 1 day
          sameSite: "lax"
        })
        return res.status(201).json({ code:201, apikey: user.apikey })
    } catch(error) {
        console.error(error)
        return res.status(500).json({ code:500, error: "Oops, error ocured" })
    }

})

router.post("/admin", async (req, res) => {
    let { body } = req
    const name = body.name
    const password = body.password

    let yourApikey = req.headers.apikey
    
    if (!yourApikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(yourApikey, res, async()=>{
        
        // let password = crypto.randomBytes(10).toString("hex")
        try{
            if(!name){
                return res.status(400).json({ code:400, error:"Where is the name?" })
            }
            if(!password){
                return res.status(400).json({ code:400, error:"Where is the password, dude?" })
            }
            
            let apikey = uuidv4()
            const saltRounds = 10
            const salt = await bcrypt.genSalt(saltRounds)
            const passHashed = await bcrypt.hash(password, salt)

            let user = await Users.create({
                apikey: apikey
            })

            await Admins.create({
                userId: user.dataValues.id,
                name: name,
                password: passHashed
            })
            return res.status(201).json({ code:201, apikey: user.apikey, notice:"New admin has been added" })
        } catch(error) {
            console.error(error)
            return res.status(500).json({ code:500, error: "Oops, error ocured" })
        }
    })

})

router.delete("/admin/:id", async(req, res) =>{

    let yourApikey = req.headers.apikey
    if (!yourApikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(yourApikey, res, async()=>{
        const { id } = req.params
        let admin = await Admins.findOne({
            where:{
                id:id
            }
        })

        if(!admin){
            return res.status(404).json({ code: 404, error: "Oops, looks like there's no user found" })
        }

        let user = await Users.findOne({
            where:{
                id: admin.dataValues.userId
            }
        })
        
        let name = admin.dataValues.name
        admin.destroy()
        // user is deleted only after admin, due to foreign key configuration
        // user can't be deleted if it's id is in Admins userId
        user.destroy()
        return res.status(204).json({ code:204, notice: `${name} no longer is admin now`})
    })
})

router.post("/auth", async(req, res) => {
    const { body } = req
    const name = body.name
    const password = body.password

    if(!name){
        return res.status(400).json({ code:400, error:"Where is the name?" })
    }

    if(!password){
        return res.status(400).json({ code:400, error:"Where is the password, dude?" })
    }


    const admin = await Admins.findOne({
        where:{
            name:name
        }
    })

    const checkPass = await bcrypt.compare(password, admin.dataValues.password)

    if (!checkPass){
        return res.status(403).json({ code:403, error:"The password is wrong" })
    }

    const user = await Users.findOne({
        where:{
            id: admin.dataValues.userId
        }
    })


    if (user){
        return res.status(200).json({ code:200, apikey: user.apikey })
    } else{
        return res.status(404).json({ code: 404, error: "Oops, this user does not exist" })
    }
})

router.get("/", async(req, res) => {

    let yourApikey = req.headers.apikey
    if (!yourApikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    isAdminCheck(yourApikey, res, async()=>{

        let page = Number(req.query.page) || 1
        const limit = 15
        const offset = (page-1)*limit

        // `${page}` == "Nan" || !page 
        if(!Number.isInteger(page) || page < 1){
            return res.status(400).json({ code:400, error: "yo, what page are u at? It must be positive integer" })
        }

        let users

        if(req.query.all){
            users = await Users.findAll()
        } else{
            users = await Users.findAll({
                offset: offset, 
                limit: limit
            })
        }


        if(!users){
            return res.status(404).json({ code: 404, error: "Oops, looks like there's no user found" })
        }
    
        return res.status(200).json({ code:200, page, limit, users })

    })

})

router.get("/:id", async(req, res) => {

    let yourApikey = req.headers.apikey
    if (!yourApikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 

    isAdminCheck(yourApikey, res, async()=>{

        const { id } = req.params
        let user = await Users.findOne({
            where:{
                id:id
            }
        })
        if(!user){
            return res.status(404).json({ code: 404, error: "Oops, looks like there's no user found" })
        }
        
    
        return res.status(200).json({ code:200, apikey: user.apikey })

    })

})

router.delete("/:id", async (req, res) => {

    let yourApikey = req.headers.apikey
    if (!yourApikey){
        return res.status(403).json({code:403, error: "Yo, where is your apikey?"})
    } 
    
    isAdminCheck(yourApikey, res, async()=>{
        let user = await Users.findOne({
            where:{
                id: req.params.id
            }
        })
        
        if(!user){
            return res.status(404).json({ code: 404, error: "Oops, looks like there's no user found" })
        }

        let adminUser = await Admins.findOne({
            where:{
                userId: req.params.id
            }
        })

        // check if it's admin, so this deletion has to be declined
        if(adminUser){
            return res.status(403).json({ code: 403, error: "It's an admin, you need to first delete him from Admins table" })
        }


        try {

            let id = req.params.id
            user.destroy()

            return res.status(200).json({ code:200, message:`yo, user-${id} is deleted, F` })
        
        } catch (error) {
            console.error(error)
            return res.status(500).json({ code:500, error: "Oops, error ocured" })
        }
    
        
    })

})

module.exports = router