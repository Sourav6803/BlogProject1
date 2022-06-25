const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");
const ObjectId = require('mongoose').Types.ObjectId;
//authentication

exports.authentication = async function (req, res, next) {
    try {
        //check the token in request header
        //validate this token
        let token = req.headers["X-Auth-Token"];
        if (!token) token = req.headers["x-auth-token"];
        console.log(token)
        //If no token is present in the request header ,return error
        if (!token) return res.status(400).send({ status: false, msg: "token must be present" });
        // let decodedToken;
        //it verify the token
        try {
            decodedToken = jwt.verify(token, "MSgroup-3");
        } catch (err) {
            return res.status(400).send({ status: false, msg: err.message + " Please enter valid token in header body" })
        }
        next()
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
};


exports.authorization = async function (req, res, next) {
    try {
        let token = req.headers["X-Auth-Token"];
        if (!token) token = req.headers["x-auth-token"];

        // //it verify the token
        // let decodedToken = await jwt.verify(token, "MSgroup-3"); -----Dought( error catches in catch block 500)
        // if(!decodedToken){
        //     return res.status(400).send({ status: false, msg: "Please enter valid token in header body" })
        // }

        let decodedToken;
        //it verify the token
        try {
            decodedToken = jwt.verify(token, "MSgroup-3");
        } catch (err) {
            return res.status(400).send({ status: false, msg: err.message + " Please enter valid token in header body" })
        }


        console.log(req.body.authorId)
        console.log(decodedToken)

        // execute if req.body will contain authorID (When new Blog is Created)
        if (req.body.authorId) {
            console.log(req.body.authorId)
            if (decodedToken.authorId != (req.body.authorId)) {
                return res.status(404).send({ status: false, msg: "token auth id and req.body id is not matched" })
            }
            return next()
        }
        // executes when we need to fetch the authorId from BlogID (when UPADTE API CAlls)
        if (req.params.blogId) {
            let blogId = req.params.blogId
            //check the author Id is Valid or Not ?
            if (!ObjectId.isValid(blogId)) {
                return res.status(400).send({ status: false, msg: "Blog Id in url: is Invalid" });
            }
            let authIdData = await blogModel.findById(blogId).select("authorId")
    
            if(!authIdData){
                return res.status(400).send({ status: false, msg: "Blog Id is Invalid" });
            }
            
            if (decodedToken.authorId != authIdData.authorId) {
                return res.status(404).send({ status: false, msg: "token auth id and req.body id is not matched" })
            }
            return next()
        }
        //executes when we need authorID from query params, (when UPDATE with Query Param filter)
        if (req.query.authorId) {
            if (decodedToken.authorId != (req.query.authorId)) {
                return res.status(404).send({ status: false, msg: "token auth id and req.body id is not matched" })
            }
            return next()
        }
        //if no Author Id is Found from client Api ,Side
        else {
            return res.status(400).send({ status: false, mg: " Author id Must be Present ......." })
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
};
