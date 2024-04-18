import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';


/**
- Request Parameters: None
- Request Body Content: An object having attributes `username`, `email` and `password`
  - Example: `{username: "Mario", email: "mario.red@email.com", password: "securePass"}`
- Response `data` Content: A message confirming successful insertion
  - Example: `res.status(200).json({data: {message: "User added successfully"}})`
- Returns a 400 error if the request body does not contain all the necessary attributes -> OK
- Returns a 400 error if at least one of the parameters in the request body is an empty string -> OK
- Returns a 400 error if the email in the request body is not in a valid email format -> ok
- Returns a 400 error if the username in the request body identifies an already existing user -> ok
- Returns a 400 error if the email in the request body identifies an already existing user -> ok
 */
export const register = async (req, res) => {
  
    try {
      let { username, email, password } = req.body;

      username = username ? username.trim() : username;
      email =  email ? email.trim() : email;
      password =  password ? password.trim() : password;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing attribute" });    //Testing if all attribute exist and are not empty
    } 

    let regex = new RegExp(/[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}/);
    const validEmail = email.match(regex);
      if (!validEmail) {
        return res.status(400).json({ error: "Invalid email" });    //Testing email format
    } 
   
      const existingUser = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] }); //Searching for already exisiting users with same email or username
      if (existingUser) { 
        return res.status(400).json({ error: "You are already registered" });
    }
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });
      res.status(200).json({ data: { message: "User added successfully" }});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  
  
  
  
  

/**
#### `registerAdmin`

- Request Parameters: None
- Request Body Content: An object having attributes `username`, `email` and `password`
  - Example: `{username: "admin", email: "admin@email.com", password: "securePass"}`
- Response `data` Content: A message confirming successful insertion
  - Example: `res.status(200).json({data: {message: "User added successfully"}})`
- Returns a 400 error if the request body does not contain all the necessary attributes -> ok
- Returns a 400 error if at least one of the parameters in the request body is an empty string -> ok
- Returns a 400 error if the email in the request body is not in a valid email format -> ok
- Returns a 400 error if the username in the request body identifies an already existing user -> ok
- Returns a 400 error if the email in the request body identifies an already existing user -> ok
 */
export const registerAdmin = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        username = username ? username.trim() : username;
        email =  email ? email.trim() : email;
        password =  password ? password.trim() : password;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing attribute" });    //Testing if all attribute exist and are not empty
        } 
  
        let regex = new RegExp(/[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}/);
        const validEmail = regex.test(email);
        if (!validEmail) {
            return res.status(400).json({ error: "Invalid email" });    //Testing email format
        } 

        const existingUser = await User.findOne({$or: [{ email: req.body.email }, { username: req.body.username }]})
        if (existingUser) { 
            return res.status(400).json({ error: "You are already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "Admin"
        });
        res.status(200).json({ data: { message: "Admin added successfully" }});
    } catch (err) {
        res.status(500).json({error : err.message});
    }

}

/**
#### `login`

- Request Parameters: None
- Request Body Content: An object having attributes `email` and `password`
  - Example: `{email: "mario.red@email.com", password: "securePass"}`
- Response `data` Content: An object with the created accessToken and refreshToken
  - Example: `res.status(200).json({data: {accessToken: accessToken, refreshToken: refreshToken}})`
- Returns a 400 error if the request body does not contain all the necessary attributes -> OK
- Returns a 400 error if at least one of the parameters in the request body is an empty string -> OK
- Returns a 400 error if the email in the request body is not in a valid email format -> OK
- Returns a 400 error if the email in the request body does not identify a user in the database
- Returns a 400 error if the supplied password does not match with the one in the database -> OK
 */
export const login = async (req, res) => {
    let { email, password } = req.body;

    email = email ? email.trim() : email;
    password =  password ? password.trim() : password;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing attribute" });    //Testing if all attribute exist and are not empty
    }

    let regex = new RegExp(/[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}/);
    const validEmail = regex.test(email);
    if (!validEmail) {
        return res.status(400).json({ error: "Invalid email" });    //Testing email format
    } 

    const cookie = req.cookies
    const existingUser = await User.findOne({ email: email })
    if (!existingUser) {
        return res.status(400).json({ error: "Email not found, you need to register first" });
    }
    try {
        const match = await bcrypt.compare(password, existingUser.password)  
        if (!match) return res.status(400).json({ error: "Wrong credentials" });

        //CREATE ACCESSTOKEN
        const accessToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role},
            process.env.ACCESS_KEY,
            { expiresIn: '1h'}
        )
        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role},
            process.env.ACCESS_KEY,
            { expiresIn: '7d' }
        )
        //SAVE REFRESH TOKEN TO DB
        existingUser.refreshToken = refreshToken
        const savedUser = await existingUser.save();
        res.cookie("accessToken", accessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true }) 
        res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: "localhost", path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })
        res.status(200).json({ data: { accessToken: accessToken, refreshToken: refreshToken } })
    } catch (err) {
        res.status(500).json({error : err.message});
    }
}



/**
#### `logout`

- Request Parameters: None
- Request Body Content: None
- Response `data` Content: A message confirming successful logout
  - Example: `res.status(200).json({data: {message: "User logged out"}})`
- Returns a 400 error if the request does not have a refresh token in the cookies -> OK
- Returns a 400 error if the refresh token in the request's cookies does not represent a user in the database -> OK
 */

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        return res.status(400).json({ error: "No refresh token in the cookies" });
    }

    const user = await User.findOne({ refreshToken: refreshToken })
    if (!user) return res.status(400).json({ error: "The user is not in the database" });
    try {
        user.refreshToken = null
        res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        const savedUser = await user.save();
        res.status(200).json({data: {message: "User logged out"}});
    } catch (err) {
        res.status(500).json({error : err.message});
    }
}
    
