const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");
//authentication

exports.authentication = function (req, res, next) {
    try {//check the token in request header
        //validate this token
        let token = req.headers["x-Auth-token"];
        if (!token) token = req.headers["x-auth-token"];
        let decodedToken;
        //If no token is present in the request header ,return error
        if (!token) return res.send({ status: false, msg: "token must be present" });

        try {
            decodedToken = jwt.verify(token, "MSgroup-3");
        }
        catch (err) {
            return res.status(400).send({ status: false, msg: "Please enter valid token in header body" })
        }
        console.log(token)
        next()
    } catch (err) {
        return res.ststus(500).send({ status: false, msg: err.message })
    }
};


exports.authorization = async function (req, res, next) {
    try {
        let token = req.headers["x-Auth-token"];
        if (!token) token = req.headers["x-auth-token"];

        try {
            decodedToken = jwt.verify(token, "MSgroup-3");
        }
        catch (err) {
            return res.status(400).send({ status: false, msg: "Please enter valid token in header body" })
        }

        // execute if req.body will contain authorID (When new Blog is Created)
        if (req.body.authorId) {
            if (decodedToken.authorId != (req.body.authorId)) {
                return res.status(404).send({ status: false, msg: "token auth id and req.body id is not matched" })
            }
            next()
        }

        // executes when we need to fetch the authorId from BlogID (when UPADTE API CAlls)
        if (req.params.blogId) {
            let blogId = req.params.blogId
            let authIdData = await blogModel.findById(blogId).select("authorId")
            if (decodedToken.authorId != authIdData.authorId) {
                return res.status(404).send({ status: false, msg: "token auth id and req.body id is not matched" })
            }
            next()
        }

        if(req.query.authorId){
            if (decodedToken.authorId != (req.query.authorId)) {
                return res.status(404).send({ status: false, msg: "token auth id and req.body id is not matched" })
            }
            next()
        }
        else{
            return res.status(400).send({status:false,mg:" Author id Must be Present ......."})
        }
    } catch (err) {
        return res.ststus(500).send({ status: false, msg: err.message })
    }
   
};
