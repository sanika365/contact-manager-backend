const { toHaveErrorMessage } = require("@testing-library/jest-dom/matchers");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchUser");
const User = require("../models/userModel");
const JWT_SECRET ="harryisgoodb$oy"
// Route 1-create user using: POST"/api/auth/createuser" no login requried
router.post(
  "/createUser",
  [
    body("name", "enter valid name").isLength({ min: 3 }),
    body("email", "enter valid email").isEmail(),
    body("password", "password must contain at least  5 charters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
   //If the are errors,return Bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }
    //Check whether the user with this email exists already
   try {
     
     let user = await User.findOne({ email: req.body.email });
     if (user) {
       return res.status(400).json({success, error: "sorry a user with this email already exists" })
     }
     const salt =  await bcrypt.genSalt(10);
      const secPass =  await bcrypt.hash(req.body.password,salt);
     user = await User.create({
       name: req.body.name,
       password: secPass,
       email: req.body.email,
     })
     const data = {
       user:{
          id:user.id
        }
     }
     const authtoken = jwt.sign(data, JWT_SECRET);
     success = true;
     res.json({success, authtoken });
   } catch (error) {
     console.error(error.message);
     res.status(500).send("some error occured");
   }
     
  }
);
//Route2 -authiticate a user using POST:"/api/auth/login" no login requred
router.post(
  "/login",
  [
    
    body("email", "enter valid email").isEmail(),
    body('password', 'password cannot be blank').exists(),
  ],
  async (req, res) => {
    let success = false;
    //If the are errors,return Bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "please try to login with correct credentials" });
      }
      
        const passwordCompare =  await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success=false
         return res
           .status(400)
           .json({success, error: "please try to login with correct credentials" });
       }
      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({success, authtoken });
    } catch (error) {
              console.error(error.message);
              res.status(500).send("Internal server error");
    }
  
  })
//Route3- get logged in user details  POST "api/auth/getuser".login requried
router.post(
  "/getuser", fetchuser,
 
  async (req, res) => {
    try {
      userId = req.user.id;
      const user = await User.findById(userId).select("password")
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  })
module.exports = router;
