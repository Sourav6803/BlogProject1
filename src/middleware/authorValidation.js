const authorModel = require("../models/authorModel")
var validator = require("email-validator");
const jwt = require("jsonwebtoken");


async function authorValidation(req, res, next) {
    try {
        let authorsData = req.body;
        let { fname, lname, title, email, password, ...rest } = req.body
        //check if the data in request body is present or not ?
        if (!Object.keys(authorsData).length) {
            return res.status(400).send({ status: false, msg: "Please Enter the Data in Request Body" });
        }
        //check if any unwanted attribute in req body is present or not ?
        if (Object.keys(rest).length > 0) {
            return res.status(400).send({ status: false, msg: "Please Enter the Valid Attribute Field " });
        }
        //check the First & Last Name is present in req.body or not ?
        if (!fname || !lname) {
            return res.status(400).send({ status: false, msg: "Missing Name" });
        }
        // check if title is present or not?
        if (!title) {
            return res.status(400).send({ status: false, msg: "Missing Title" });
        }
        // check if email is present or not?
        if (!email) {
            return res.status(400).send({ status: false, msg: "Missing email" });
        }
        //check if password is present or not
        if (!password) {
            return res.status(400).send({ status: false, msg: "PassWord is Required" });
        }
        // check fname and lname is valid name or not?  (for this we used regular expression is here) 
        var regName = /^[a-zA-Z]+$/;
        if (!regName.test(fname)) {
            return res.status(400).send({ status: false, msg: "fname is invalid" });
        }
        if (!regName.test(lname)) {
            return res.status(400).send({ status: false, msg: "lname is invalid" });
        }
        //check the title is valid or not ?
        if (!(["Mr", "Mrs", "Miss"].includes(title))) {
            return res.status(400).send({ status: false, msg: 'You Can enter Only [Mr, Mrs, Miss] in Title in this format ' });
        }

        //check if email id is valid or not ?  --->used "email-validator"
        if (!(validator.validate(email))) {
            return res.status(400).send({ status: false, msg: "Email Id is Invalid" });
        }
        //check the email is unique 
        let emailFlag = await authorModel.findOne({ email: email })
        if (emailFlag) {
            return res.status(400).send({ status: false, msg: "E-mail is Already Present in DB" })
        }
        //check if password is valid or not ?
        var passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/;
        if (!passwordReg.test(password)) {
            return res.status(400).send({ status: false, msg: "pass is invalid(Minimum 6 and maximum 15 characters, at least one uppercase letter, one lowercase letter, one number and one special character Ex. Abc@123,abC%98,@abD34,1999$Sour" });
        }
        return next()
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

}

module.exports.authorValidation = authorValidation
