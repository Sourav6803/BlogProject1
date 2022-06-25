const express = require('express');
const router = express.Router();
const authorController =require("../controller/authorController")
const blogController =require("../controller/blogController")
const mw =require("../middleware/middlewareController")


// Api to Create Author.
router.post("/authors",authorController.createAuthors) // testing done

//Api to Create Blogs.
router.post("/blogs",mw.authentication,mw.authorization,blogController.createBlogs) //testing done

//Api to get Blogs.
router.get("/blogs",mw.authentication,blogController.getBlogs) //testing done

//Api to update blog as per blogId.
router.put("/blogs/:blogId",mw.authentication,mw.authorization,blogController.updateBlogs) //testing done

//Api to delete blog.
router.delete("/blogs/:blogId",mw.authentication,mw.authorization,blogController.deletedBlog) //testing done

//Api to delete the blog as per query.
router.delete("/blogs",mw.authentication,mw.authorization,blogController.deleteBlogWithQuery) //testing done

// Api For author login.
router.post("/login",authorController.authorLogin) //testing done

module.exports = router;