import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';


import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
   await mongoose.connection.db.dropDatabase();
   await mongoose.connection.close();
});

describe('register', () => {

  beforeEach(async() => {await User.deleteMany()})

  test("register T1: Register new user with no already exisiting username or email in the DB -> should return: 200, 'user added succesfully'", async () => {
    const newUser = {
      body:{
        username: 'dave',
        email: 'dave@example.com',
        password: 'dave123',
        }
    };
    const response = await request(app).post("/api/register").send({
      username: newUser.body.username,
      email: newUser.body.email,
      password: newUser.body.password,
    });
        
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ data: { message: "User added successfully" }});
  });


  test("register T2: User already exists (email or username already in use) -> should return: 400, 'you are already registered'", async () => { 
      const ExistingUser = {
        body:{
          username: 'user',
          email: 'user@example.com',
          password: 'pass123',
          }
      };
      await User.create({username: ExistingUser.body.username,email: ExistingUser.body.email, password: ExistingUser.body.password, refreshToken: ""})

      const response = await request(app).post("/api/register").send({
        username: ExistingUser.body.username,
        email: ExistingUser.body.email,
        password: ExistingUser.body.password,
      });

      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ error: 'You are already registered' });
    })
    

  test("register T3: Register with a missing attribute (no username in the body) -> should return: 400, 'Missing attribute'", async () => {
      const newUser = {
        body:{
          email: 'antonio@example.com',
          password: 'antonio123',
          }
      };

      const response = await request(app).post("/api/register").send({
        email: newUser.body.email,
        password: newUser.body.password,
      });

      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ error: 'Missing attribute' });
  });

  test("register T4: Register with an empty attribute (password string is empty) -> should return: 400, 'Missing attribute'", async () => {
      const newUser = {
        body:{
          username: 'user',
          email: 'antonio@example.com',
          password: '',
          }
        };

      const response = await request(app).post("/api/register").send({
        email: newUser.body.email,
        password: newUser.body.password,
      });

      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ error: 'Missing attribute' });
  });


  test("register T5: Register with an invalid email format -> should return: 400, 'invalid email'", async () => {
    const newUser = {
      body:{
        username: 'user',
        email: 'antonio443example.com',
        password: 'mypass123',
        }
    };

    const response = await request(app).post("/api/register").send({
      username: newUser.body.username,
      email: newUser.body.email,
      password: newUser.body.password,
    });

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'Invalid email' });
  });
    
});




describe("registerAdmin", () => { 

  beforeEach(async() => {await User.deleteMany()})

  test("registerAdmin T1: Register new admin with no already exisiting username or email in the DB -> should return: 200, 'admin added succesfully'", async () => {
      const newUser = {
        body:{
          username: 'dave',
          email: 'dave@example.com',
          password: 'dave123',
          }
      };
      const response = await request(app).post("/api/admin").send({
        username: newUser.body.username,
        email: newUser.body.email,
        password: newUser.body.password,
      });
          
      expect(response.status).toEqual(200)
      expect(response.body).toEqual({ data: { message: "Admin added successfully" }});
  });


  test("registerAdmin T2: admin already exists (email or username already in use) -> should return: 400, 'you are already registered'", async () => { 
    const ExistingUser = {
      body:{
        username: 'user',
        email: 'user@example.com',
        password: 'pass123',
        }
    };
        await User.create({username: ExistingUser.body.username,email: ExistingUser.body.email, password: ExistingUser.body.password, refreshToken: ""})

        const response = await request(app).post("/api/admin").send({
          username: ExistingUser.body.username,
          email: ExistingUser.body.email,
          password: ExistingUser.body.password,
        });

        expect(response.status).toEqual(400)
        expect(response.body).toEqual({ error: 'You are already registered' });
    })
    

    test("registerAdmin T3: Register with a missing attribute (no username in the body) -> should return: 400, 'Missing attribute'", async () => {
        const newUser = {
          body:{
            email: 'antonio@example.com',
            password: 'antonio123',
            }
        };

        const response = await request(app).post("/api/admin").send({
          email: newUser.body.email,
          password: newUser.body.password,
        });

        expect(response.status).toEqual(400)
        expect(response.body).toEqual({ error: 'Missing attribute' });
    });


    test("registerAdmin T4: Register with an empty attribute (password string is empty) -> should return: 400, 'Missing attribute'", async () => {
        const newUser = {
          body:{
            username: 'user',
            email: 'antonio@example.com',
            password: '',
            }
        };

        const response = await request(app).post("/api/admin").send({
          email: newUser.body.email,
          password: newUser.body.password,
        });

        expect(response.status).toEqual(400)
        expect(response.body).toEqual({ error: 'Missing attribute' });
    });


    test("registerAdmin T5: Register with an invalid email format -> should return: 400, 'invalid email'", async () => {
        const newUser = {
          body:{
            username: 'user',
            email: 'antonio443example.com',
            password: 'mypass123',
            }
        };

        const response = await request(app).post("/api/admin").send({
          username: newUser.body.username,
          email: newUser.body.email,
          password: newUser.body.password,
        });

        expect(response.status).toEqual(400)
        expect(response.body).toEqual({ error: 'Invalid email' });
    });

    
})




describe('login', () => { 

  beforeEach(async() => {await User.deleteMany()})

  test("login T1: Logging in with a missing attribute (no password in body) -> should return 400, 'Missing attribute'", async () => {
      const Userlogin = {
        body:{
          username: 'john',
          email: 'john@example.com',
          }
      };

      const response = await request(app).post("/api/login").send({
        username: Userlogin.body.username,
        email: Userlogin.body.email,
        password: Userlogin.body.password,
      });

      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ error: 'Missing attribute' });
      expect(response.cookie).toBeUndefined();
      expect(response.cookie).toBeUndefined();
  });


  test("login T2: Login with an invalid email format -> should return 400, with message 'invalid email'", async () => {
      const Userlogin = {
        body:{
          username: 'john',
          email: 'john5674example.com',
          password: 'johnny123',
          }
      };

      const response = await request(app).post("/api/login").send({
        username: Userlogin.body.username,
        email: Userlogin.body.email,
        password: Userlogin.body.password,
      });
    
      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ error: 'Invalid email' });
      expect(response.cookie).toBeUndefined();
      expect(response.cookie).toBeUndefined();
  });


  test("login T3: User does not exist in the DB (email not found) -> should return 400, with message 'please you need to register'", async () => {
      const Userlogin = {
        body:{
          username: 'john',
          email: 'john@example.com',
          password: 'johnny123',
          }
      };

      const response = await request(app).post("/api/login").send({
        username: Userlogin.body.username,
        email: Userlogin.body.email,
        password: Userlogin.body.password,
      });
   
      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ error: 'Email not found, you need to register first' });
      expect(response.cookie).toBeUndefined();
      expect(response.cookie).toBeUndefined();
  });


  test("login T4: User exists in the DB but entered wrong password -> should return 400, with message 'wrong credentials'", async () => {
    const Userlogin = {
      body:{
        username: 'john',
        email: 'john@example.com',
        password: 'johnny123',
        }
    };

    const hashedPassword = await bcrypt.hash(Userlogin.body.password, 12);
    await User.create({username: Userlogin.body.username,email: Userlogin.body.email, password: hashedPassword})

    const response = await request(app).post("/api/login").send({
      username: Userlogin.body.username,
      email: Userlogin.body.email,
      password: "wrong_pass",
    });

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'Wrong credentials' });
    expect(response.cookie).toBeUndefined();
    expect(response.cookie).toBeUndefined();
  });


  test("login T5: User exists in the DB and entered the correct password -> should return 200, data: accessToken, refreshToken", async () => {
      const Userlogin = {
        body:{
          username: 'john',
          email: 'john@example.com',
          password: 'johnny123',
          }
      };

      const hashedPassword = await bcrypt.hash(Userlogin.body.password, 12);
      await User.create({username: Userlogin.body.username, email: Userlogin.body.email, password: hashedPassword})

      const response = await request(app).post("/api/login").send({
        username: Userlogin.body.username,
        email: Userlogin.body.email,
        password: Userlogin.body.password,
      });


      expect(response.status).toEqual(200)

      var cookies = response.headers['set-cookie'][0]; //get the headers of the response
      var cookiesArray = cookies.split('; '); //transform to array
      cookiesArray.splice(4,1) //remove iat attribute 
      var returned_accessToken = cookiesArray[0]  //extract returned refresh Token
      returned_accessToken = returned_accessToken.slice(12)  //remove "accessToken"
      cookiesArray.splice(0, 1) //remove accessToken attribute
      cookies = cookiesArray.join('; ') //transform back to string
      //The purpose of the previous block of code is to remove accessToken attribute, because this parameter is being tested seperately,
      //and to remove the iat because the issue date is changing each time this test is ran, therefore the token changes.

      const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUxMDQzMTAsImV4cCI6MTcxNjY0MDMwOSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.Bchwgx5EfR-nhUli0MKxq3cabc7ZOx05jmFNYuUyKs8"
      const Decoded_accessToken = jwt.verify(accessToken, process.env.ACCESS_KEY); //decode the token 
      const accessemail = Decoded_accessToken.email;       //extract email
      const accessusername = Decoded_accessToken.username; //extract username
      const accessrole = Decoded_accessToken.role;         //extract role

      const Decoded_returned_accessToken = jwt.verify(returned_accessToken, process.env.ACCESS_KEY); //decode the token 
      const returned_accessEmail = Decoded_returned_accessToken.email;       //extract email
      const returned_accessUsername = Decoded_returned_accessToken.username; //extract username
      const returned_accessRole = Decoded_returned_accessToken.role;         //extract role

      expect(accessemail).toEqual(returned_accessEmail)       //compare extracted email to the email sent in the request
      expect(accessusername).toEqual(returned_accessUsername) //compare extracted username to the username sent in the request
      expect(accessrole).toEqual(returned_accessRole)
      expect(cookies).toEqual('Max-Age=3600; Domain=localhost; Path=/api; HttpOnly; Secure; SameSite=None')


      var cookies = response.headers['set-cookie'][1]; //get the headers of the response
      var cookiesArray = cookies.split('; '); //transform to array
      cookiesArray.splice(4,1) //remove iat attribute
      var returned_refreshToken = cookiesArray[0]      //extract returned refresh Token
      returned_refreshToken = returned_refreshToken.slice(13) //remove "refreshToken="
      cookiesArray.splice(0, 1) //remove accToken attribute
      cookies = cookiesArray.join('; ') //transform back to string
      //The purpose of the previous block of code is to remove accessToken attribute, because this parameter is being tested seperately,
      //and to remove the iat because the issue date is changing each time this test is ran, therefore the token changes.

      const refreshToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUxMDQzMTAsImV4cCI6MTcxNjY0MDMwOSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.Bchwgx5EfR-nhUli0MKxq3cabc7ZOx05jmFNYuUyKs8"
      const refreshTokenDecoded = jwt.verify(refreshToken, process.env.ACCESS_KEY); //decode the token 
      const refreshemail = refreshTokenDecoded.email;       //extract email
      const refreshusername = refreshTokenDecoded.username; //extract username
      const refreshrole = refreshTokenDecoded.role;         //extract role

      const Decoded_returned_refreshToken = jwt.verify(returned_refreshToken, process.env.ACCESS_KEY); //decode the token 
      const returned_refreshEmail = Decoded_returned_refreshToken.email;       //extract email
      const returned_refreshUsername = Decoded_returned_refreshToken.username; //extract username
      const returned_refreshRole = Decoded_returned_refreshToken.role;         //extract role

      expect(refreshemail).toEqual(returned_refreshEmail)       //compare extracted email to the email sent in the request
      expect(refreshusername).toEqual(returned_refreshUsername) //compare extracted username to the username sent in the request
      expect(refreshrole).toEqual(returned_refreshRole)
      expect(cookies).toEqual('Max-Age=604800; Domain=localhost; Path=/api; HttpOnly; Secure; SameSite=None')
      });
});




describe('logout', () => { 

  beforeEach(async() => {await User.deleteMany()})
  
    test("logout T1: Logging out without refreshToken -> should return 400, message: 'user not found'", async () => {
       const userLogout = {
        body:{},
        cookies: {accessToken: '',  refreshToken: ''}
       }

       const response = await request(app).get("/api/logout").set({refreshToken: userLogout.cookies.refreshToken});

      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ error: 'No refresh token in the cookies' });
    });


    test("logout T2: Cannot find refreshToken -> should return 400, message: 'user not found' ", async () => {
      const userLogout = {
       cookies: {refreshToken: 'exampleRefreshToken'}
      }

      const response = await request(app).get("/api/logout").set('Cookie', `refreshToken=${userLogout.cookies.refreshToken}`);

      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ error: 'The user is not in the database' });
   });


   test("logout T3: Found refreshToken -> should return 200, message: 'logged out'", async () => {
      const userLogout = {
      cookies: {refreshToken: 'exampleRefreshToken'}
      }

      const hashedPassword = await bcrypt.hash("mypass", 12);
      await User.create({username: 'user123',email: 'user1@example.com', password: hashedPassword, refreshToken: userLogout.cookies.refreshToken})
      const response = await request(app).get("/api/logout").set('Cookie', `refreshToken=${userLogout.cookies.refreshToken}`);

      expect(response.status).toEqual(200)
      expect(response.body).toEqual({data: {message: "User logged out"}});

      var cookies = response.headers['set-cookie'][0];
      var cookiesArray = cookies.split('; ');
      cookiesArray.splice(3,1)
      cookies = cookiesArray.join('; ')
      expect(cookies).toEqual('accessToken=; Max-Age=0; Path=/api; HttpOnly; Secure; SameSite=None')

      var cookies = response.headers['set-cookie'][1];
      cookiesArray = cookies.split('; ');
      cookiesArray.splice(3,1)
      cookies = cookiesArray.join('; ')
      expect(cookies).toEqual('refreshToken=; Max-Age=0; Path=/api; HttpOnly; Secure; SameSite=None')
 });

});


