const authorModel = require("../models/authorModel")
var validator = require("email-validator");
const jwt = require("jsonwebtoken");




createAuthors = async function (req, res) {
    try {
        let authorsData = req.body;
        //load the data in database
        let data = await authorModel.create(authorsData)
        return res.status(201).send({ status: true, data: data })
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


authorLogin = async function (req, res) {
    try {

        //get email and password  from req.body
        let { email, password } = req.body;

        //check if the data in request body is present or not ?
        if (!Object.keys(req.body).length) {
            return res.status(400).send({ status: false, msg: "Please Enter the email and password in Request Body" });
        }

        // check if email is present or not?
        if (!email) {
            return res.status(400).send({ status: false, msg: "Missing email" });
        }

        //check if password is present or not
        if (!password) {
            return res.status(400).send({ status: false, msg: "PassWord is Required" });
        }

        // find the object as per email & password
        let author = await authorModel.findOne({ email: email, password: password });

        if (!author) return res.status(400).send({ status: false, msg: "email or password is not corerct", });

        //create the Token 
        let token = jwt.sign(
            {
                authorId: author._id.toString(),
                name: author.fname + author.lname
            },
            "MSgroup-3"
        );
        res.setHeader("x-auth-token", token);
        res.status(201).send({ status: true, data: token });

    } catch (err) {
        return res.status(500).send({ status: false, msg: error.message })
    }
};

module.exports.createAuthors = createAuthors
module.exports.authorLogin = authorLogin



