const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { signout, signup, signin,isSignedIn} = require('../controllers/auth')

router.post("/signup", [
    check("name", "Name should be atleast 3 characters").isLength({ min: 3 }),
    check("email", "email should be atleast 3 characters").isEmail(),
    check("password", "Password should be atleast 3 characters").isLength({min: 3})
], signup);

router.post("/signin", [
    check("email", "email should be atleast 3 characters").isEmail(),
    check("password", "Password is required").isLength({min: 3})
], signin);


router.get("/signout", signout);

router.get("/testroute",(req,res)=>{
    res.send("A protected route");
})


module.exports = router;