const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check , validationResult} = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { route } = require('./user');

//@route Get api/profile/me
//@desc GET current users profile
//@acess private

router.get('/me',auth,async(req,res)=> {
try{
    const profile = await Profile.findOne({user:req.user.id}).populate(
        'user',
        ['name', 'avatar']
        );

if(!profile){
    return res.status(400).json({msg:'There is no profile for this user'});
}

res.json(profile);
}catch(err){
    console.error(err.message);
    res.status(500).send('server error');
}


});

//@route  Post api/profile
//@desc  create and update user profile
//@acess private

router.post('/' , [ 
    auth, 
    [

    check('status', 'staus is required')
    .not()
    .isEmpty(),
    check('skills', 'Skills is required')
    .not()
    .isEmpty()
]
],

async(req,res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(404).json({errors: errors.array()});
    }
    
const{
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
} = req.body;


// Build profile object 

const profileFeilds = {};
profileFeilds.user = req.user.id;
if(company) profileFeilds.company = company;
if(website) profileFeilds.website = website;
if(location) profileFeilds.location = location;
if(bio) profileFeilds.bio = bio;
if(status) profileFeilds.status= status;
if(githubusername) profileFeilds.githubusername= githubusername;
if(skills) {
    profileFeilds.skills= skills.split(',').map(skill => skill.trim());
}




//Build social object

profileFeilds.social ={};
if (youtube) profileFeilds.social.youtube = youtube;
if (twitter) profileFeilds.social.twitter = twitter;
if (instagram) profileFeilds.social.instagram = instagram;
if (linkedin) profileFeilds.social.linkedin = linkedin;
if (facebook) profileFeilds.social.facebook = facebook;


try{

    let profile = await Profile.findOne({user: req.user.id});

    if(profile){

        //update
       profile = await Profile.findOneAndUpdate(
            {user: req.user.id},
            {$set: profileFeilds },
            {new: true}
            );

            return res.json(profile);
    }

    //Create Profile

    profile = new Profile(profileFeilds);
await profile.save();
res.json(profile);


}catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');

}
}
);

//@route GET api/profile
//@desc GET all profile
//@acess public
router.get('/', async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  

module.exports= router;