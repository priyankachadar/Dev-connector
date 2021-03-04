const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check , validationResult} = require('express-validator');


const User = require('../../models/User');
//@route GET api/auth
//@desc test route
//@acess public

router.get('/', auth,async (req,res)=> {
try{
const user = await User.findById(req.user.id).select('-password');
res.json(user);
}catch(error){
console.error(err.message);
res.status(500).send('server error');
}
});

//@route POST api/user
//@desc Authentication user & get token
//@acess public

router.post('/',
[
check('email', "please include valid  email").isEmail(),
check(
    'password',
    'password is required'
).exists()

],

async(req,res)=> {
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(404).json({errors: errors.array()});
}

const {email , password} = req.body;

try{

    // See if user exists
let user= await User.findOne({email});

if(!user){

 return res
 .status(400)
 .json({errors: [{msg:'invalid credentials'}] });
}

// compare bcrypt password to user password
const isMatch = await bcrypt.compare(password, user.password);
if(!isMatch){
    return res
    .status(400)
    .json({errors: [{msg: 'Invalid Credentials'}]});
}

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

module.exports = router;