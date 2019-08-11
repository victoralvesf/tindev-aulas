const axios = require('axios');
const Dev = require('../models/Dev');

module.exports = {

    async index(req, res) {
        const { user } = req.headers;

        const loggedDev = await Dev.findById(user);

        const users = await Dev.find({
            $and: [
                { _id: { $ne: user }},
                { _id: { $nin: loggedDev.likes} },
                { _id: { $nin: loggedDev.dislikes} },
            ],
        })

        return res.json(users);
    },

    async store(req, res){
        const { username } = req.body;

        const userExists = await Dev.findOne({ user: username });

        if (userExists){
            return res.json(userExists);
        } 
            
        const response = await axios.get(`https://api.github.com/users/${username}`)
            .catch(function (error){
                if(error.response){
                    console.log(JSON.stringify(error))
                    return res.status(404).json({
                        status: "Error",
                        message: "User not found on github"
                    });
                }
            });

        const { name, bio, avatar_url: avatar } = response.data;

        if(name) {
            const dev = await Dev.create({
                name,
                user: username,
                bio,
                avatar
            })

            return res.json(dev);
        } else {
            return res.status(400).json({
                status: "Error",
                message: "Username from github must have a value"
            });
        }
        
    }
};