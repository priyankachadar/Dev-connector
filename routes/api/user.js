const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check , validationResult} = require('express-validator');

// User models
const User = require('../../models/User');

//@route POST api/user
//@desc test route
//@acess public

router.post('/',
[
check('name', "Name is required") // express validator
.not()
.isEmpty(),
check('email', "please include valid  email").isEmail(),
check(
    'password',
    'Please enter a password with 6 or more characters'
).isLength({min:6})

],

async(req,res)=> {
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(404).json({errors: errors.array()});
}

const {name, email , password} = req.body;

try{

    // See if user exists
let user= await User.findOne({email});

if(user){

 return res.status(400).json({errors: [{msg:'user already exists'}] });
}


// Get users gravatar

const avatar = gravatar.url(email,{

s:'200',
r:'pg',
d:'mm'

})


user = new User({

name,
email,
avatar,
password

});

// encrypted password

const salt= await bcrypt.genSalt(10);

user.password = await bcrypt.hash(password, salt);

await user.save();

// return jsonwebtoken


const payload={
    user:{
        id: user.id
    }
}



jwt.sign(
    payload,
    config.get('jwtSecret'),
    {expiresIn: 36000},
    (err, token)=> {

        if(err) throw err;
        res.json({ token});
    }
    );



}catch(err){
    console.log(err.message);
    res.status(500).send('Server error');
}


});

module.exports= router;