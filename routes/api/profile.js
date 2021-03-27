const express = require('express');
const request = require('request');
const config = require('config');
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

  // @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id',async (req, res) => {
      try {
        const profile = await Profile.findOne({
          user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
  
        if (!profile) return res.status(400).json({ msg: 'Profile not found' });
  
        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        if(err.kind== 'ObjectId'){
        return res.status(400).json({ msg: 'Profile not found' });
        }
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
    try {
      // Remove user posts
     
       // Remove profile
      await  Profile.findOneAndRemove({ user: req.user.id }),
      // Remove user
      await  User.findOneAndRemove({ _id: req.user.id })
      
  
      res.json({ msg: 'User deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private

router.put(
    '/experience',
    [
    auth,
    [
    check('title', 'Title is required')
    .not()
    .isEmpty(),
    check('company', 'Company is required')
    .not()
    .isEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .not()
      .isEmpty()
    ]
],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {

            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp); // unshift take most recent is first

            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
  );


// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private


router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

  //Get remove index
const removeIndex = profile.experience
.map(item =>item.id)
.indexOf(req.params.exp_id);

profile.experience.splice(removeIndex, 1); //take something out

await profile.save();

res.json(profile);


  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private

router.put(
  '/education',
  [
  auth,
  [
  check('school', 'School is required')
  .not()
  .isEmpty(),
  check('degree', 'Degree is required')
  .not()
  .isEmpty(),
  check('feildofstudy', 'FeildOfstudy is required')
  .not()
  .isEmpty(),
  check('from', 'From date is required and needs to be from the past')
    .not()
    .isEmpty()
  ]
],

  async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      const {

          school,
          degree,
          feildofstudy,
          from,
          to,
          current,
          description
      } = req.body;

      const newEdu = {
          
        school,
        degree,
        feildofstudy,
          from,
          to,
          current,
          description
      }

      try {
          const profile = await Profile.findOne({ user: req.user.id });

          profile.education.unshift(newEdu); // unshift take most recent is first

          await profile.save();
          res.json(profile);
      } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
      }
  }
);


// @route    DELETE api/profile/experience/:edu_id
// @desc     Delete education from profile
// @access   Private


router.delete('/education/:edu_id', auth, async (req, res) => {
try {
  const profile = await Profile.findOne({ user: req.user.id });

//Get remove index
const removeIndex = profile.education
.map(item =>item.id)
.indexOf(req.params.edu_id);

profile.education.splice(removeIndex, 1); //take something out

await profile.save();

res.json(profile);


} catch (error) {
  console.error(error);
  return res.status(500).json({ msg: 'Server error' });
}
});

// @route    DELETE api/profile/giithub/:username
// @desc     Get username from profile
// @access   Private

router.get('/github/:username', (req, res)=>{
  try{

const options = {
  uri: `https://api.github.com/users/${
    req.params.username
  }/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId'
  )}&client_secret=${config.get('githubSecret')}`,
  method: 'GET',
  headers: {'user-agent': 'node.js'}
};

request(options, (error, response , body)=>{
  if(error) console.error(error);

  if(response.statusCode!== 200){
    res.status(404).json({msg: 'No Gitub profile found'});
  }

  res.json(JSON.parse(body));
});

  }
  catch(err){
    console.error(err.message);
    res.status(500).send('server Error');
  }
});

module.exports= router;