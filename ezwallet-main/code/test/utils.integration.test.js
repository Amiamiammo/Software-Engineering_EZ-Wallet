import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import mongoose, { Model } from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
const express = require('express');

dotenv.config();


beforeAll(async () => {
    const dbName = "testingDatabaseUtils";
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

//All of these tokens have john as username and john@example.com as email
  const regularRefreshToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcxNzAxMTgwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.q51OEtzNl8fHdvb8J82VKSLeN9tz0K3028Hm5QC3WrQ'
  const regularAccessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcwNjU1NzQwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.aJlbQpH83EU9aqqiPzRhFFBYG3AEfskXlf4f45B1-EQ'
  
  const AdminRefreshToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcxNzAxMTgwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJBZG1pbiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIn0.G04v5BxNm4dilKLxua-fOGc3LBXwZnV90xecx29Wh20'
  const AdminAccessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcwNjU1NzQwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJBZG1pbiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIn0.NLynEsEwckG7ik0k3GQM7W4MypF48jO7PXKG5ZR0DPE'

  const RefreshToken_missingUsername = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcxNzA1NDA1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.gZumR0npDpmcE5PtfRfifhqFQNtV6G375UQOaKy_Ffs'
  const AccessToken_missingUsername = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.C3T0SebbHcHSwkc58_jTmj4STyyZUfXRK3jyr-QGDsc'

  const RefreshToken_missingEmail = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcxNzA1NDA1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.UAiTVgj6l4RcxR_eyTiXBpPjZzXS7_AZLOs9i3P4A4c'
  const AccessToken_missingEmail = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.Kvy8KTgbX7DrdNWkx17NEQJuVGXRIk1AEs9c5FdQJvQ'

  const RefreshToken_missingRole = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcxNzA1NDA1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.-Klg7UaZF0WRV9VJiAmqs4OUt5ktBwmZjBlHwmTdZpg'
  const AccessToken_missingRole = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.jFU-IiKnUmFHbRXBj7ifjTYyIkJg0YVnxFGLCasdosc'

  const AccessToken_username_mike = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoibWlrZSIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IlJlZ3VsYXIifQ.O0omVQ-xOAIyaDD9CvRBmPQFSE5fgRkzMTe188CmBr4'
  const AccessToken_email_mikegmail = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJtaWtlQGV4YW1wbGUuY29tIiwicm9sZSI6IlJlZ3VsYXIifQ.fC6gmN690HLuZNpdrzTahRR0bPG4XHO5K-NvblPJrYg'
  const AccessToken_role_Admin = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IkFkbWluIn0.Tw7PKsZ3BtNNKgC98vg4gJiXksMbXJ-0p0PTTKX3qso'
  const RefreshToken_email_mikegmail = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU5NzczNTUsImV4cCI6MTY5MDkwMjE1NSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoibWlrZSIsIkVtYWlsIjoibWlrZUBnbWFpbC5jb20iLCJSb2xlIjoiUmVndWxhciJ9.zRktwPtgJSFgAzp-9hzN1hrAkXODQbA6TOLod-zFAbg'

  const expired_Token_regular = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NzUxNTAwNTYsImV4cCI6MTY4MjgzOTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIkVtYWlsIjoianJvY2tldEBleGFtcGxlLmNvbSIsIlJvbGUiOiJSZWd1bGFyIn0.PpoAHBTnBNX_uccnYQ6dts_Xm2-nKNHEVRLsfNlFl38'
  const expired_Token_regular_Admin = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU5NzczNTUsImV4cCI6MTY4NTYzMTc1NSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obiIsIkVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsIlJvbGUiOiJBZG1pbiJ9.UzOaDd3n-qWZbymJbwMzYR_Ar4gUkO0wLu-Hu5g3Ihw';

describe("handleDateFilterParams", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})



describe("verifyAuth", () => { 
    let Req, Res, info
    beforeEach(async() => {
        Req = {
            cookies: {accessToken: '',
            refreshToken: regularAccessToken}
        };

        Res = {
            locals: {refreshedTokenMessage: "Some message"}
        };

        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
    })


    test("verifyAuth T1.1: accessToken is missing -> should return false flag and 'Unauthorized as cause' ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: "", refreshToken: regularRefreshToken}
        };

        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Unauthorized")
    });

    test("verifyAuth T1.2: refreshToken is missing -> should return false flag and 'Unauthorized as cause' ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: ''}
        };

        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Unauthorized")
    });


    test("verifyAuth T2: Both tokens are present, but the info.authType is not recognized -> should return false flag and 'Unauthorized' as cause  ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "non_exisiting_authType",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Unauthorized")
    });

    
    //All tests starting with T3 refer to both Tokens present and valid, authType is valid
    test("verifyAuth T3.1.1: Decoded Access Token is missing the username -> should return false flag and 'Unauthorized' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: AccessToken_missingUsername, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Token is missing information")
    });

    test("verifyAuth T3.1.2: Decoded Access Token is missing the email -> should return false flag and 'Unauthorized' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: AccessToken_missingEmail, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Token is missing information")
    });

    test("verifyAuth T3.1.3: Decoded Access Token is missing the role -> should return false flag and 'Unauthorized' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: AccessToken_missingRole, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Token is missing information")
    });


    test("verifyAuth T3.2.1: Decoded Refresh Token is missing the username -> should return false flag and 'Unauthorized' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: RefreshToken_missingUsername}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Token is missing information")
    });

    test("verifyAuth T3.2.2: Decoded Refresh Token is missing the email -> should return false flag and 'Unauthorized' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: RefreshToken_missingEmail}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Token is missing information")
    });

    test("verifyAuth T3.2.3: Decoded Refresh Token is missing the role -> should return false flag and 'Unauthorized' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: RefreshToken_missingRole}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Token is missing information")
    });

    //All tests starting with T3.3 refer to both tokens present, valid, have all the necessary attributes and authType is valid 
    test("verifyAuth T3.3.1: Decoded Refresh Token and decoded Access Token have different usernames -> should return false flag and 'Mismatched users' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: AccessToken_username_mike, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Mismatched users")
    });

    test("verifyAuth T3.3.2: Decoded Refresh Token and decoded Access Token have different emails -> should return false flag and 'Mismatched users' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: AccessToken_email_mikegmail, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Mismatched users")
    });

    test("verifyAuth T3.3.3: Decoded Refresh Token and decoded Access Token have different roles -> should return false flag and 'Mismatched users' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: AccessToken_role_Admin, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Mismatched users")
    });


    //All tests starting with T4 refer to both tokens present, valid, all attributes present, attributes for access and refresh token match, authType is valid
    test("verifyAuth T4.1: info.authType is Simple, accessToken and refreshToken are valid -> should return true flag and 'Authorized' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "Simple",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(true)
        expect(response.cause).toBe("Authorized")
    });

    
    test("verifyAuth T4.2.1: info.authType is User, tokens' username match that of info.username -> should return true flag and 'Authorized' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(true)
        expect(response.cause).toBe("Authorized")
    });


    test("verifyAuth T4.2.2: info.authType is User, but decodedAccessToken.username is different from info.username -> should return true flag and 'Authorized' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "User",
            username: "sarah43",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Unauthorized access, not a User")
    });


    test("verifyAuth T4.3: info.authType is Admin, but decodedAccessToken.role is not Admin -> should return true flag and 'Authorized' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "Admin",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Unauthorized access, not an Admin")
    });


    test("verifyAuth T4.4: info.authType is Group, but info.emails does not include decodedAccessToken.email -> should return true flag and 'Authorized' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "Group",
            username: "john",
            emails: ["sarah@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Unauthorized access, not in a group")
    });


    test("verifyAuth T4.5: info.authType is Group, and info.emails includes decodedAccessToken.email -> should return true flag and 'Authorized' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: regularAccessToken, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "Group",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(true)
        expect(response.cause).toBe("Authorized")
    });


    
    //All tests starting with T5 refer to both tokens present, refreshToken is valid, but accessToken is expired, authType is valid
    test("verifyAuth T5.1: info.authType is Simple -> should return true flag and 'Authorized' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: expired_Token_regular, refreshToken: regularRefreshToken}
        };
        const cookieMock = (name, value,  options) => {
            Res.cookieArgs = {name, value, options};
        }
        const Res = {
            cookie: cookieMock,
            locals: {refreshedTokenMessage: "Some message"}
        }
        info ={
            authType: "Simple",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(true)
        expect(response.cause).toBe("Authorized")
        expect(Res.cookieArgs).toEqual({
            name: 'accessToken',
            value: expect.any(String),
            options: {
                httpOnly: true,
                path: '/api',
                maxAge: 60*60*1000,
                sameSite: 'none',
                secure: true,
            }
        })
    });

    
    test("verifyAuth T5.2: info.authType is User, but refreshToken.username is different than info.username -> should return false flag and 'Unauthorized access' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: expired_Token_regular, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "User",
            username: "mike",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Unauthorized access")
    });


    test("verifyAuth T5.3.1: info.authType is Admin, but refreshToken.role is not 'Admin' -> should return false flag and 'Unauthorized access' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: expired_Token_regular, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "Admin",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Unauthorized access")
    });

    test("verifyAuth T5.3.2: info.authType is Admin, refreshToken.role is 'Admin' -> should return true flag and 'Authorized' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: expired_Token_regular, refreshToken: AdminRefreshToken}
        };
        const cookieMock = (name, value,  options) => {
            Res.cookieArgs = {name, value, options};
        }
        const Res = {
            cookie: cookieMock,
            locals: {refreshedTokenMessage: "Some message"}
        }
        info ={
            authType: "Admin",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(true)
        expect(response.cause).toBe("Authorized")
        expect(Res.cookieArgs).toEqual({
            name: 'accessToken',
            value: expect.any(String),
            options: {
                httpOnly: true,
                path: '/api',
                maxAge: 60*60*1000,
                sameSite: 'none',
                secure: true,
            }
        })
    });


    test("verifyAuth T5.4.1: info.authType is Group, but refreshToken.email is not included in info.emails -> should return false flag and 'Unauthorized access, not in a group' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: expired_Token_regular, refreshToken: regularRefreshToken}
        };
        info ={
            authType: "Group",
            username: "john",
            emails: ["sarah@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Unauthorized access, not in a group")
    });

    test("verifyAuth T5.4.2: info.authType is Group, refreshToken.email is included in info.emails -> should return true flag and 'Authorized' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: expired_Token_regular, refreshToken: regularRefreshToken}
        };
        const cookieMock = (name, value,  options) => {
            Res.cookieArgs = {name, value, options};
        }
        const Res = {
            cookie: cookieMock,
            locals: {refreshedTokenMessage: "Some message"}
        }
        info ={
            authType: "Group",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(true)
        expect(response.cause).toBe("Authorized")
        expect(Res.cookieArgs).toEqual({
            name: 'accessToken',
            value: expect.any(String),
            options: {
                httpOnly: true,
                path: '/api',
                maxAge: 60*60*1000,
                sameSite: 'none',
                secure: true,
            }
        })
    });


    test("verifyAuth T6: jwt.verify throwed an error because refresh token is expired -> should return false flag and 'perform login again' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: expired_Token_regular, refreshToken: expired_Token_regular}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("Perform login again")
    });


    test("verifyAuth T7: jwt.verify throwed an error, but not due to expiry -> should return false flag and 'JsonWebTokenError' as cause ", async() => {
        Req = {
            body:{},
            cookies: {accessToken: expired_Token_regular, refreshToken: "not_a_token"}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("JsonWebTokenError")
    });

    test("verifyAuth T8: jwt.verify throws an exception because of some random error -> should return false flag and 'err.name' as cause", async() => {
        Req = {
            body:{},
            cookies: {accessToken: 'not_a_token', refreshToken: "not_a_token"}
        };
        info ={
            authType: "User",
            username: "john",
            emails: ["john@example.com", "mike@example.com"]
        }
        const response = await verifyAuth(Req, Res, info)
        expect(response.flag).toBe(false)
        expect(response.cause).toBe("JsonWebTokenError")
    });

})



describe("handleAmountFilterParams", () => { 
    test('Dummy test, change it', () => {  
        expect(true).toBe(true);  
    });
})
