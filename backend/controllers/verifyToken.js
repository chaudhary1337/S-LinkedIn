const jwt = require('jsonwebtoken')
const People = require('../models/People')

// internal function needed to determine who is the one signed in
async function getWho (req, res){
    const token = req.header('auth-token')
    // console.log('auth-token-backend', token)
    if (!token) return res.status(401).send("not logged in!")

    try {
        const verified = jwt.verify(token, "TOKEN_SECRET")
        req.user = verified
        const person = await People.findOne({_id: req.user._id})
        if(person.isBoss) return res.status(200).json({isBoss: true, name: person.name, email: person.email})
        else return res.status(200).json({isBoss: false, name: person.name, email: person.email}) 
    } catch(error) {
        return res.status(400).send("invalid token!")
    }
}

async function userAuth (req, res, next){
    const token = req.header('auth-token')
    if (!token) return res.status(401).send("access denied. login!")

    try {
        const verified = jwt.verify(token, "TOKEN_SECRET")
        req.user = verified
        const person = await People.findOne({_id: req.user._id})
        if(person.isBoss)
            return res.status(400).send("bosses not allowed!")
        next()
    } catch(error) {
        return res.status(400).send("invalid token!")
    }
}

async function bossAuth (req, res, next){
    const token = req.header('auth-token')
    if (!token) return res.status(401).send("access denied. login!")

    try {
        const verified = jwt.verify(token, "TOKEN_SECRET")
        req.user = verified
        const person = await People.findOne({_id: req.user._id})
        if(!person.isBoss) 
            return res.status(400).send("users not allowed!")
        next()
    } catch(error) {
        return res.status(400).send("invalid token!")
    }
}

module.exports = { bossAuth, userAuth, getWho }
