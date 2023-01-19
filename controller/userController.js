import bcrypt, { genSalt } from "bcrypt" ;

import User from "../schema/userSchema.js";
import generateToken from "../config/generateToken.js";

// register user in db (sign-up)
export const registerUser = async (req, res) => {
  try {

    const {name ,email ,password ,picture} = req.body ;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists!");
    }

    // const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password ,10) ; // 2nd arg is by-default is salt
    let user = { name: name ,email: email ,password: hashedPassword, picture:picture }

    const newUser = new User(user); //varifying schema of user
    if (newUser) {
      user = newUser ;
      await user.save();
      return res
        .status(200)
        .json({ user , token: generateToken(user._id) });
    } else {
      throw new Error("User schema diden't match");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// auth user (login)
export const authUser = async (req, res) => {
  try {
    const { email ,password } = req.body ;
    const user = await User.findOne({email}) ;

    if(user && (await user.matchPassword(password)) ){
      res.status(200).json({user,token: generateToken(user._id) }) ;
    }else{
      res.status(400) ;
      throw new Error("Invalid Email or Password") ;
    }

  } catch (error) {
    res.status(400).json({message : error.message}) ;
  }
};


//  /api/user/all ?`name=sameep & lastname=vishwakaram`      ===> query params
//  mongodb OR operator(performs OR operation in on a array of 2 or more expressrion)
//  regex Provides regular expression capabilities for pattern matching strings in queries
//  options are userd with regular expression ( "i" for upper-lower case sensitive )
//  https://www.mongodb.com/docs/manual/reference/operator/query/regex/
export const getUsers = async(req ,res) =>{
  try{
    const keyword = req.query.search ? { //searching users by their name or email using query params
      "$or": [                                    
        {name : { $regex: req.query.search ,$options:"<i>" } } ,
        {email : { $regex: req.query.search ,$options:"<i>" } }
      ]
    }:{} ;
    // console.log(keyword.$or);

    // find all users except the user ie. logged-in
    const users =  await User.find(keyword).find({_id : {$ne : req.user._id} })  ; // $ne -> not equals(mongodb operator)
    if(users){
      res.status(200).json({users}) ;
    }else{
      throw new Error("No users found") ;
    }
  }catch(error){
    res.status(400).json({message : error.message }) ;
  }
}
