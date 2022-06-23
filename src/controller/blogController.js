const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel")
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;



exports.createBlogs = async function (req, res) {
    try {
        let blogsData = req.body

        //check if the data in request body is present or not ?
        if (!Object.keys(blogsData).length) {
            return res.status(400).send({ status: false, msg: "Please Enter the Data in Request Body" });
        }
        //check Title is Present or Not ?
        if (!blogsData.title) {
            return res.status(400).send({ status: false, msg: "Please Enter the Title" });
        }
        //check Body is Present or Not ?
        if (!blogsData.body) {
            return res.status(400).send({ status: false, msg: "Please Enter the Body of Blog" });
        }
        //check Id is Present Or Not in req.body
        if (!blogsData.authorId) {
            return res.status(400).send({ status: false, msg: "Id is Not Present" });
        }

        //check the author Id is Valid or Not ?
        if (!ObjectId.isValid(blogsData.authorId)) {
            return res.status(400).send({ status: false, msg: "Id is Invalid" });
        }

        //check if id is present in Db or Not ? 
        let user = await authorModel.findById(blogsData.authorId)
        if (!user) return res.status(404).send({ status: false, msg: "This Id is not present in Author DB" })

        //check if Category is present or not ?
        if (!blogsData.category) {
            return res.status(400).send({ status: false, msg: "Please Enter the Category of Blog" });
        }

        //check if isDeleted is TRUE/FALSE ?
        if (!(typeof blogsData.isDeleted === "boolean")) {
            return res.status(400).send({ status: false, msg: "isDeleted Must be TRUE OR FALSE" });
        }

        // if isPublised is true add the current Time&Date in publishedAt?
        if (blogsData.isPublished) {
            blogsData.publishedAt = new Date()
        }
        // if isDeleted is true add the current Time&Date in deletedAt?
        if (blogsData.isDeleted) {
            blogsData.deletedAt = new Date()
        }

        //add the data in DB
        let data = await blogModel.create(blogsData)
        return res.status(201).send({ status: true, data: data })
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

}

exports.getBlogs = async function (req, res) {
    try {
        let { tags, category, subcategory, authorId, ...rest } = req.query;
        if (rest.length >= 0) {
            return res.status(400).send({ status: false, msg: "BAD REQUEST" })
        }
        //check if any quer parm is present ?
        if (Object.keys(req.query).length !== 0) {

            //add the keyisDeleted &isPublished in req.query
            req.query.isDeleted = false
            req.query.isPublished = true

            //find data as per req.query para filter ?
            let data = await blogModel.find(req.query)

            //check if data is found or not ?
            if (data.length != 0) return res.status(200).send({ status: true, data: data })
            return res.status(400).send({ status: false, msg: "Bad Request" })
        }

        //return the data ony if isDeleted :false & isPublished:True
        let data = await blogModel.find({ isDeleted: false, isPublished: true })

        if (data.length != 0) return res.status(200).send({ status: true, data: data })

        return res.status(404).send({ status: false, msg: "No documents are found" })


    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

exports.updateBlogs = async function (req, res) {
    try {
        let blogId = req.params.blogId
        let data = req.body;
        let { title, body, authorId, tags, category, subcategory, isDeleted, deletedAt, isPublished, publishedAt } = req.body;


        //check Id is Present Or Not in req.body
        // if (!blogId) {
        //     return res.status(400).send({ status: false, msg: "Id is Not Present" });
        // }

        //check the author Id is Valid or Not ?
        if (!ObjectId.isValid(blogId)) {
            return res.status(400).send({ status: false, msg: "Id is Invalid" });
        }

        //check if id is present in Db or Not ? 
        let blog = await blogModel.findById(blogId)
        if (!blog) return res.status(404).send({ status: false, msg: "id is not present in DB" })

        //check if isDeleated Status is True
        if (blog.isDeleted) return res.status(404).send({ status: false, msg: "Blog is Deleted" })


        //check if body is empty or not ?
        if (!Object.keys(data).length) {
            return res.status(400).send({ status: false, msg: "Noting to Update in Request from Body" });
        }


        //check if Tag is present in body then push new tag
        if ("tags" in data) {
            if (!(Array.isArray(data.tags))) {
                data.tags = data.tags.split()
            }
            data.tags.map((data) => blog.tags.push(data))
            // blog.tags.push(data.tags)
            data.tags = blog.tags
        }

        // check if subcategory is present in body then push new subcategory
        if ("subcategory" in data) {
            if (!(Array.isArray(data.subcategory))) {
                data.subcategory = data.subcategory.split()
            }
            data.subcategory.map((data) => blog.subcategory.push(data))
            data.subcategory = blog.subcategory
        }

        //check ifPublished is trueor ot   
        if (data.isPublished == true) {
            data.publishedAt = new Date()
        }

        let updateDate = await blogModel.findByIdAndUpdate(blogId, data, { new: true })
        return res.status(200).send({ status: true, data: updateDate });
    }

    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
};

exports.deletedBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId;

        //check the author Id is Valid or Not ?
        if (!ObjectId.isValid(blogId)) {
            return res.status(400).send({ status: false, msg: "Id is Invalid" });
        }

        let blog = await blogModel.findById(blogId);
        //check if blog is present or not ?
        if (!blog) {
            return res.status(404).send({ status: false, msg: "No such user exists" });
        }

        //check if isDeleated Status is True
        if (blog.isDeleted) {
            return res.status(404).send({ status: false, msg: "Blog is already Deleted" })
        }
        //update the status of isDeleted to TRUE
        let updatedData = await blogModel.findOneAndUpdate({ _id: blogId }, { isDeleted: true }, { new: true });
        return res.status(200).send({ status: true, data: updatedData });

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
};

exports.deleteBlogWithQuery = async function (req, res) {
    try {

        let { tags, category, subcategory, authorId, isPublished, ...rest } = req.query;

        //check if unwanted query is passed
        if (rest.length >= 0) {
            return res.status(400).send({ status: false, msg: "BAD REQUEST" })
        }

        //check the author Id is Valid or Not ?
        if(authorId in req.query){
        if (!ObjectId.isValid(authorId)) {
            return res.status(400).send({ status: false, msg: "Id is Invalid" });
        }}

        req.query.isDeleted=false
        // return me the list of object, having author id which is given and isDeleated False
        let blog = await blogModel.find(req.query)
            .select("isDeleted");
        console.log(blog)

        //check if blog is availble as per provided author ID
        if (blog.length == 0) {
            return res.status(404).send({ status: false, msg: "no Blog is Available as per this filter query data" });
        }

        // x will contain all the blogid's having isDeleated :False related to passed author id
        let isDeletedFalseId = blog.map((data) => data._id.toString())



        let updatedData = [];  // vatiable for storing the updated data

        //loop for updating the data based on blog id
        for (id of isDeletedFalseId) {
            let x = await blogModel.findOneAndUpdate({ _id: id },
                { isDeleted: true, deletedAt: new Date() }, { new: true });
            updatedData.push(x)
        }

        //update the status of isDeleted to TRUE
        //let updatedData = await blogModel.updateMany(req.query, { isDeleted: true, deletedAt: new Date() }, { new: true });


        return res.status(200).send({ status: true, data: updatedData });

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


