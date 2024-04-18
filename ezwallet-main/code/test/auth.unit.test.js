import request from 'supertest';
import * as moduleApi from '../controllers/utils';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { register, registerAdmin, login, logout } from '../controllers/auth';
import Cookies from 'js-cookie';
const bcrypt = require("bcryptjs")

jest.mock('jsonwebtoken')
jest.mock("bcryptjs")
jest.mock('../models/User.js');

describe('register', () => { 

  let mockReq;
  let mockRes;

    beforeEach(()=>{
      mockReq = {
          body:{
          username: 'user123',
          email: 'test@example.com',
          password: 'mypass123'
          }

      };

      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
      };
 });

    afterEach(()=>{
        jest.clearAllMocks();
    })

    test("register T1: Register new user with no already exisiting username or email in the DB -> should return: 200, 'user added succesfully'", async () => {
    
      jest.spyOn(User, "findOne").mockImplementation(()=>null)
      jest.spyOn(bcrypt, "hash").mockImplementation(()=>"hashedPassowrd")
      jest.spyOn(User, "create").mockImplementation(()=>({username:'test', email:'test@example.com', password:'hashedPassword'}))
      const regexMock = {
        test: jest.fn().mockReturnValue(true),
        exec: jest.fn().mockReturnValue(true),
      };

      await register(mockReq,mockRes) 

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json.mock.calls[0][0].data.message).toBe('User added successfully')
    });
    

  test("register T2: User already exists (email or username already in use) -> should return: 400, 'you are already registered'", async () => {

      jest.spyOn(User, "findOne").mockImplementation(() => true)
      const regexMock = {
        test: jest.fn().mockReturnValue(true),
        exec: jest.fn().mockReturnValue(true),
      };
      
      await register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json.mock.calls[0][0].error).toBe('You are already registered' );
  });


  test("register T3: Register with a missing attribute (no username in the body) -> should return: 400, 'Missing attribute'", async () => {
    mockReq = {
      body:{
        email: 'test@example.com',
        password: 'mypass123'}
      };
          
        await register(mockReq, mockRes)
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toBe('Missing attribute');
  });


  test("register T4: Register with an empty attribute (password string is empty) -> should return: 400, 'Missing attribute'", async () => {
    mockReq = {
      body:{
        username: 'user123',
        email: 'test@example.com',
        password: ''}
      };
          
          await register(mockReq, mockRes)
          expect(mockRes.status).toHaveBeenCalledWith(400)
          expect(mockRes.json.mock.calls[0][0].error).toBe('Missing attribute');
    });

 
  test("register T5: Register with an invalid email format -> should return: 400, 'invalid email'", async () => {
    mockReq = {
      body:{
        username: 'user123',
        email: 'invalidemail.com',
        password: 'mypass123'}
      };

        const regexMock = {
          test: jest.fn().mockReturnValue(false),
          exec: jest.fn().mockReturnValue(false),
        };

        await register(mockReq, mockRes)
        expect((mockRes.status)).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toBe('Invalid email');
    });


  test("register T6: findOne throws an exception -> should return: 500", async () => {
    jest.spyOn(User, "findOne").mockImplementation(() => {
      throw new Error('server crash');
    });
    jest.spyOn(bcrypt, "hash").mockImplementation(()=>"hashedPassowrd")
    jest.spyOn(User, "create").mockImplementation(()=>({username:'test', email:'test@example.com', password:'hashedPassword'}))
    const regexMock = {
      test: jest.fn().mockReturnValue(true),
      exec: jest.fn().mockReturnValue(true),
    };

    await register(mockReq,mockRes) 
    expect((mockRes.status)).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'server crash' });
    });

    })




 describe("registerAdmin", () => { 

  let mockReq;
  let mockRes;
    beforeEach(()=>{
      mockReq = {
          body:{
          username: 'user',
          email: 'test@example.com',
          password: 'mypass123'
          }
      };
      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
      };
    });

    afterEach(()=>{
        jest.clearAllMocks();
    })
  

    test("registerAdmin T1: Register new admin with no already exisiting username or email in the DB -> should return: 200, 'admin added succesfully'", async () => {
      jest.spyOn(User, "findOne").mockImplementation(()=>null)
      jest.spyOn(bcrypt, "hash").mockImplementation(()=>"hashedPassowrd")
      jest.spyOn(User, "create").mockImplementation(()=>({username:'test', email:'test@example.com', password:'hashedPassword', role: 'Admin'}))
      const regexMock = {
        test: jest.fn().mockReturnValue(true),
        exec: jest.fn().mockReturnValue(true),
      };
    

      await registerAdmin(mockReq, mockRes) 
      expect((mockRes.status)).toHaveBeenCalledWith(200)
      expect(mockRes.json.mock.calls[0][0].data.message).toBe('Admin added successfully')
    });


    test("registerAdmin T2: admin already exists (email or username already in use) -> should return: 400, 'you are already registered'", async () => {
  
      jest.spyOn(User, "findOne").mockImplementation(() => true)
      const regexMock = {
        test: jest.fn().mockReturnValue(true),
        exec: jest.fn().mockReturnValue(true),
      };
    
      await registerAdmin(mockReq, mockRes)
      expect((mockRes.status)).toHaveBeenCalledWith(400)
      expect(mockRes.json.mock.calls[0][0].error).toBe('You are already registered' );
    });


    test("registerAdmin T3: Register with a missing attribute (no username in the body) -> should return: 400, 'Missing attribute'", async () => {
      mockReq = {
        body:{
          email: 'test@example.com',
          password: 'mypass123'}
        };
            
            await registerAdmin(mockReq, mockRes)
            expect((mockRes.status)).toHaveBeenCalledWith(400)
            expect(mockRes.json.mock.calls[0][0].error).toBe('Missing attribute');
      });


    test("registerAdmin T4: Register with an empty attribute (password string is empty) -> should return: 400, 'Missing attribute'", async () => {
      mockReq = {
        body:{
          username: 'user123',
          email: 'test@example.com',
          password: ''}
        };
            
            await registerAdmin(mockReq, mockRes)
            expect((mockRes.status)).toHaveBeenCalledWith(400)
            expect(mockRes.json.mock.calls[0][0].error).toBe('Missing attribute');
      });


    test("registerAdmin T5: Register with an invalid email format -> should return: 400, 'invalid email'", async () => {
      mockReq = {
        body:{
          username: 'user123',
          email: 'invalidemail.com',
          password: 'mypass123'}
        };

          const regexMock = {
            test: jest.fn().mockReturnValue(false),
            exec: jest.fn().mockReturnValue(false),
          };
        

          await registerAdmin(mockReq, mockRes)
          expect((mockRes.status)).toHaveBeenCalledWith(400)
          expect(mockRes.json.mock.calls[0][0].error).toBe('Invalid email');
      });


    test("registerAdmin T6: findOne throws an exception -> should return: 500", async () => {
      jest.spyOn(User, "findOne").mockImplementation(() => {
        throw new Error('server crash');
      });
      jest.spyOn(bcrypt, "hash").mockImplementation(()=>"hashedPassowrd")
      jest.spyOn(User, "create").mockImplementation(()=>({username:'test', email:'test@example.com', password:'hashedPassword'}))
      const regexMock = {
        test: jest.fn().mockReturnValue(true),
        exec: jest.fn().mockReturnValue(true),
      };

      await registerAdmin(mockReq,mockRes) 
      expect((mockRes.status)).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'server crash' });
      });
 })





 describe('login', () => { 
  let mockReq;
  let mockRes;
    beforeEach(()=>{
      mockReq = {
        body:{
        email: 'test@example.com',
        password: 'mypass123',
        },
        cookies: {accessToken: 'exampleAccessToken',  refreshToken: 'exampleRefreshToken'} 
        };
      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          cookie: jest.fn().mockReturnThis()
      };
      });
      afterEach(()=>{
        jest.clearAllMocks();
      })


    test("login T1: Logging in with a missing attribute (no password in body) -> should return 400, 'Missing attribute'", async () => {
        mockReq = {
          body:{
          email: 'test@example.com',
          }};
        await login(mockReq, mockRes)
        expect((mockRes.status)).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toBe('Missing attribute')
        expect(mockRes.cookie).toHaveBeenCalledTimes(0);
        expect(mockRes.cookie).toHaveBeenCalledTimes(0);
    });


    test("login T2: Login with an invalid email format -> should return: 400, 'invalid email'", async () => {
      mockReq = {
        body:{
          email: 'invalidemail.com',
          password: 'mypass123'}
        };

          const regexMock = {
            test: jest.fn().mockReturnValue(false),
            exec: jest.fn().mockReturnValue(false),
          };

          await login(mockReq, mockRes)
          expect((mockRes.status)).toHaveBeenCalledWith(400)
          expect(mockRes.json.mock.calls[0][0].error).toBe('Invalid email');
          expect(mockRes.cookie).toHaveBeenCalledTimes(0);
          expect(mockRes.cookie).toHaveBeenCalledTimes(0);
      });


    test("login T3: User is not registered -> should return 400, 'please you need to register'", async () => {
      jest.spyOn(User, "findOne").mockImplementation(() => null)

      const regexMock = {
        test: jest.fn().mockReturnValue(true),
        exec: jest.fn().mockReturnValue(true),
      };

      await login(mockReq, mockRes)
      expect((mockRes.status)).toHaveBeenCalledWith(400)
      expect(mockRes.json.mock.calls[0][0].error).toBe('Email not found, you need to register first')
      expect(mockRes.cookie).toHaveBeenCalledTimes(0);
      expect(mockRes.cookie).toHaveBeenCalledTimes(0);
    });


    test("login T4: User is registered, entered wrong password -> should return 400, message: 'please you need to register'", async () => {
    
    jest.spyOn(User, "findOne").mockImplementation(() => true) //User exists
    jest.spyOn(bcrypt, "compare").mockImplementation(() => false) //Wrong password
    const regexMock = {
      test: jest.fn().mockReturnValue(true),
      exec: jest.fn().mockReturnValue(true),
    };

    await login(mockReq, mockRes)
    expect((mockRes.status)).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0].error).toBe('Wrong credentials')
    expect(mockRes.cookie).toHaveBeenCalledTimes(0);
    expect(mockRes.cookie).toHaveBeenCalledTimes(0);
    });

      
    test("login T5: User is registered, entered correct password -> should return 200, data: accessToken, refreshToken", async () => {
      let findOneMock;
      findOneMock = jest.spyOn(User, 'findOne');
      findOneMock.mockResolvedValue({
        save: jest.fn().mockResolvedValue({}),
      });
      const regexMock = {
        test: jest.fn().mockReturnValue(true),
        exec: jest.fn().mockReturnValue(true),
      };

      const accessToken = 'exampleaccessToken'
      const refreshToken = 'examplerefreshToken'
      jest.spyOn(bcrypt, "compare").mockImplementation(() => true) //correct password
      jest.spyOn(jwt, 'sign').mockReturnValueOnce(accessToken)
      jest.spyOn(jwt, 'sign').mockReturnValueOnce(refreshToken)

      await login(mockReq, mockRes)
      expect((mockRes.status)).toHaveBeenCalledWith(200)
      expect(mockRes.json.mock.calls[0][0].data.accessToken).toBe('exampleaccessToken')
      expect(mockRes.json.mock.calls[0][0].data.refreshToken).toBe('examplerefreshToken')
      expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', accessToken, {httpOnly: true,domain: 'localhost',path: '/api',maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true,});
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', refreshToken, {httpOnly: true,domain: 'localhost',path: '/api',maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true,});

    });

    test("login T6: findOne throws an exception -> should return: 500", async () => {
      jest.spyOn(jwt, "sign").mockImplementation(() => {
        throw new Error('server crash');
      });
      
      jest.spyOn(bcrypt, "hash").mockImplementation(()=>"hashedPassowrd")
      const regexMock = {
        test: jest.fn().mockReturnValue(true),
        exec: jest.fn().mockReturnValue(true),
      };

      await login(mockReq,mockRes) 
      expect((mockRes.status)).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'server crash' });
      });
 });




 describe('logout', () => { 
  let mockReq, mockRes, mockUser, findOneMock;
    beforeEach(()=>{
      mockReq = {
          body:{},
          cookies: {accessToken: 'exampleAccessToken',  refreshToken: 'exampleRefreshToken'} 
      };
      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          cookie: jest.fn().mockReturnThis()
      };

 });
  afterEach(()=>{
    jest.clearAllMocks();
  })

     test("logout T1: Logging out without refreshToken -> should return 400, message: 'No refresh token in the cookies' ", async () => {
      mockReq = {
        body:{},
        cookies: {accessToken: '',  refreshToken: ''} 
        };
        await logout(mockReq, mockRes)
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toBe("No refresh token in the cookies")
        expect(mockRes.cookie).toHaveBeenCalledTimes(0);
        expect(mockRes.cookie).toHaveBeenCalledTimes(0);
      });


    test("logout T2: Cannot find refreshToken -> should return 400, message: 'user not found' ", async () => {
        jest.spyOn(User, "findOne").mockImplementation(() => false) //refreshToken not found
        await logout(mockReq, mockRes)
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toBe("The user is not in the database")
        expect(mockRes.cookie).toHaveBeenCalledTimes(0);
        expect(mockRes.cookie).toHaveBeenCalledTimes(0);
      });


    test("logout T3: Found refreshToken -> should return 200, message: 'logged out' ", async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({
        refreshToken: 'exampleRefreshToken',
        save: jest.fn().mockResolvedValue({}),
      });
      await logout(mockReq, mockRes)
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json.mock.calls[0][0].data.message).toBe("User logged out")
      expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', '', {httpOnly: true,path: '/api',maxAge: 0, sameSite: 'none', secure: true,});
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', '', {httpOnly: true,path: '/api',maxAge: 0, sameSite: 'none', secure: true,});
    });

    test("logout T4: user.save throws an exception -> should return 500", async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({
        refreshToken: 'exampleRefreshToken',
        save: jest.fn().mockImplementation(() => {throw new Error('Database error');}),
      });
      
      await logout(mockReq, mockRes)
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
      expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', '', {httpOnly: true,path: '/api',maxAge: 0, sameSite: 'none', secure: true,});
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', '', {httpOnly: true,path: '/api',maxAge: 0, sameSite: 'none', secure: true,});
    });

 });
