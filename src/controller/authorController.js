const authorModel = require("../models/authorModel")
var validator = require("email-validator");
const jwt = require("jsonwebtoken");


exports.createAuthors = async function (req, res) {
    try {
        let authorsData = req.body;
        console.log(authorsData)
        console.log(req.body)
        console.log(Object.keys(authorsData).length)

        //check if the data in request body is present or not ?
        if (!Object.keys(authorsData).length) {
            return res.status(400).send({ status: false, msg: "Please Enter the Data in Request Body" });
        }

        //check the First & Last Name is present in req.body or not ?
        if (!req.body.fname || !req.body.lname) {
            return res.status(400).send({ status: false, msg: "Missing Name" });
        }

        //check the title is valid or not ?
        console.log(req.body.title)
        if (!(["Mr", "Mrs", "Miss"].includes(req.body.title))) {
            return res.status(400).send({ status: false, msg: "Title Not Matched" });
        }

        //check if email id is valid or not ?  --->used "email-validator"
        if (!(validator.validate(req.body.email))) {
            return res.status(400).send({ status: false, msg: "Email Id is Invalid" });
        }
        //check the email is unique 
        let emailFlag = await authorModel.findOne({ email: req.body.email })
        if (emailFlag) {
            return res.status(400).send({ status: false, msg: "E-mail is Already Present in DB" })
        }

        //check if password is present or not
        if (!req.body.password) {
            return res.status(400).send({ status: false, msg: "PassWord is Required" });
        }

        //load the data in database
        let data = await authorModel.create(authorsData)
        return res.status(201).send({ status: true, data: data })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

}


exports.authorLogin = async function (req, res) {

    let { email, password } = req.body;


    let author = await authorModel.findOne({ email: email, password: password });

    if (!author) return res.send({ status: false, msg: "authorname or the password is not corerct", });

    let token = jwt.sign(
        {
            authorId: author._id.toString(),
            name: author.fname + author.lname
        },
        "MSgroup-3"
    );

    res.setHeader("x-auth-token", token);
    res.send({ status: true, data: token });
};





