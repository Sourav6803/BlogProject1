const authorModel = require("../models/authorModel")
var validator = require("email-validator");
const jwt = require("jsonwebtoken");


exports.createAuthors = async function (req, res) {
    try {
        let authorsData = req.body;
        let { fname, lname, title, email, password, ...rest } = req.body

        //check if the data in request body is present or not ?
        if (!Object.keys(authorsData).length) {
            return res.status(400).send({ status: false, msg: "Please Enter the Data in Request Body" });
        }

        //check the First & Last Name is present in req.body or not ?
        if (!fname || !lname) {
            return res.status(400).send({ status: false, msg: "Missing Name" });
        }

        // check fname and lname is valid name or not?  (for this we used regular expression is here) 
        var regName = /^[a-zA-Z]+$/;

        if (!regName.test(fname)) {
            return res.status(400).send({ status: false, msg: "fname is invalid" });
        }
        if (!regName.test(lname)) {
            return res.status(400).send({ status: false, msg: "lname is invalid" });
        }

        // check if title is present or not?
        if (!title) {
            return res.status(400).send({ status: false, msg: "Missing Title" });
        }

        //check the title is valid or not ?
        if (!(["Mr", "Mrs", "Miss"].includes(title))) {
            return res.status(400).send({ status: false, msg: 'You Can enter Only [Mr, Mrs, Miss] in Title in this format ' });
        }

        // check if email is present or not?
        if (!email) {
            return res.status(400).send({ status: false, msg: "Missing email" });
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

        //check if password is present or not
        if (!password) {
            return res.status(400).send({ status: false, msg: "PassWord is Required" });
        }

        var passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/;
        if (!passwordReg.test(password)) {
            return res.status(400).send({ status: false, msg: "pass is invalid(Minimum 6 and maximum 15 characters, at least one uppercase letter, one lowercase letter, one number and one special character Ex. Abc@123,abC%98,@abD34,1999$Sour" });
        } 

        //load the data in database
        let data = await authorModel.create(authorsData)
        return res.status(201).send({ status: true, data: data })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

}


exports.authorLogin = async function (req, res) {
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
        // res.setHeader("x-auth-token", token);
        res.status(201).send({ status: true, data: token });
     
    }catch (err) {
        return res.status(500).send({ status: false, msg: error.message })
    }
};





