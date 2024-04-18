import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import { Group, User } from '../models/User.js';
import { response } from 'express';
import { resolvePlugin } from '@babel/core';



dotenv.config();

beforeAll(async () => {
    const dbName = "testingDatabaseController";
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

const regularRefreshToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcxNzAxMTgwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.q51OEtzNl8fHdvb8J82VKSLeN9tz0K3028Hm5QC3WrQ'
const regularAccessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcwNjU1NzQwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.aJlbQpH83EU9aqqiPzRhFFBYG3AEfskXlf4f45B1-EQ'

const AdminRefreshToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcxNzAxMTgwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJBZG1pbiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIn0.G04v5BxNm4dilKLxua-fOGc3LBXwZnV90xecx29Wh20'
const AdminAccessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcwNjU1NzQwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJBZG1pbiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIn0.NLynEsEwckG7ik0k3GQM7W4MypF48jO7PXKG5ZR0DPE'

const regularRefreshTokenSarah89 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODYxODcwOTMsImV4cCI6MTcxNzcyMzA5MywiYXVkIjoiIiwic3ViIjoic2FyYWg4OUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InNhcmFoODkiLCJlbWFpbCI6InNhcmFoODlAZ21haWwuY29tIiwicm9sZSI6IlJlZ3VsYXIifQ.kBll5isZ_SBun1kqLiWPJWz8Os_cqAhzXy3lEdGcfQI';
const regularAccessTokenSarah89 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODYxODcwOTMsImV4cCI6MTcwNzI2ODY5MywiYXVkIjoiIiwic3ViIjoic2FyYWg4OUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InNhcmFoODkiLCJlbWFpbCI6InNhcmFoODlAZ21haWwuY29tIiwicm9sZSI6IlJlZ3VsYXIifQ.fEIdVXqWqCd7lIT0nuMq8GWDGQCutCoi_LuMoDXmbt0';

const RefreshToken_missingUsername = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcxNzA1NDA1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.gZumR0npDpmcE5PtfRfifhqFQNtV6G375UQOaKy_Ffs'
const AccessToken_missingUsername = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.C3T0SebbHcHSwkc58_jTmj4STyyZUfXRK3jyr-QGDsc'

const RefreshToken_missingEmail = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcxNzA1NDA1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.UAiTVgj6l4RcxR_eyTiXBpPjZzXS7_AZLOs9i3P4A4c'
const AccessToken_missingEmail = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.Kvy8KTgbX7DrdNWkx17NEQJuVGXRIk1AEs9c5FdQJvQ'

const RefreshToken_missingRole = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcxNzA1NDA1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.-Klg7UaZF0WRV9VJiAmqs4OUt5ktBwmZjBlHwmTdZpg'
const AccessToken_missingRole = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.jFU-IiKnUmFHbRXBj7ifjTYyIkJg0YVnxFGLCasdosc'

const AccessToken_username_mike = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoibWlrZSIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IlJlZ3VsYXIifQ.O0omVQ-xOAIyaDD9CvRBmPQFSE5fgRkzMTe188CmBr4'
const AccessToken_email_mikegmail = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJtaWtlQGV4YW1wbGUuY29tIiwicm9sZSI6IlJlZ3VsYXIifQ.fC6gmN690HLuZNpdrzTahRR0bPG4XHO5K-NvblPJrYg'
const AccessToken_role_Admin = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU1MTgwNTYsImV4cCI6MTcwNjU5OTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IkFkbWluIn0.Tw7PKsZ3BtNNKgC98vg4gJiXksMbXJ-0p0PTTKX3qso'

const expired_Token_regular = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NzUxNTAwNTYsImV4cCI6MTY4MjgzOTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIkVtYWlsIjoianJvY2tldEBleGFtcGxlLmNvbSIsIlJvbGUiOiJSZWd1bGFyIn0.PpoAHBTnBNX_uccnYQ6dts_Xm2-nKNHEVRLsfNlFl38'
const expired_Token_regular_Admin = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU5NzczNTUsImV4cCI6MTY4NTYzMTc1NSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obiIsIkVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsIlJvbGUiOiJBZG1pbiJ9.UzOaDd3n-qWZbymJbwMzYR_Ar4gUkO0wLu-Hu5g3Ihw';

const valid_id1 = '6479e86b52b2827ceb04d3f1';
const valid_id2 = '7479e86b52b2827ceb04d3f1';
const valid_id3 = '8479e86b52b2827ceb04d3f1';

describe("createCategory", () => {
    let Req
    beforeEach(async () => {
        Req = {
            body: { type: "utilities", color: "#fcbe44" },
            params: {},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
    })

    test("createCategory T1: Verification not passed -> should return 401 with error 'Unauthorized access'", async () => {

        const Req = {
            body: { type: "utilities", color: "#fcbe44" },
            cookies: {
                accessToken: '',
                refreshToken: regularRefreshToken
            }
        };

        const response = await request(app).post("/api/categories").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });


    test("createCategory T2: Authorization passed, but type parameter is missing -> should return 400 with error 'Missing 'type' parameter'", async () => {

        const Req = {
            body: { color: "#fcbe44" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };

        const response = await request(app).post("/api/categories").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing 'type' parameter")
    });


    test("createCategory T2.1: Authorization passed, but type parameter is an empty string -> should return 400 with error 'Missing 'type' parameter'", async () => {

        const Req = {
            body: { type: "", color: "#fcbe44" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };

        const response = await request(app).post("/api/categories").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing 'type' parameter")
    });


    test("createCategory T3: Authorization passed, but color parameter is missing -> should return 400 with error 'Missing 'color' parameter'", async () => {

        const Req = {
            body: { type: "groceries", },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };

        const response = await request(app).post("/api/categories").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing 'color' parameter")
    });


    test("createCategory T3.1: Authorization passed, but color parameter is an empty string -> should return 400 with error 'Missing 'color' parameter'", async () => {

        const Req = {
            body: { type: "groceries", color: "" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };

        const response = await request(app).post("/api/categories").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing 'color' parameter")
    });


    test("createCategory T4: All previous checks passed, but category is already in the DB -> should return 400 with error 'Category already found in the database'", async () => {

        const Req = {
            body: { type: "groceries", color: "#fcbe44" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };
        await categories.create({ type: Req.body.type, color: Req.body.color })
        const response = await request(app).post("/api/categories").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Category already found in the database")
    });


    test("createCategory T5: All previous checks passed, category is not in the DB -> should return 200 with data and res.locals.refreshedTokenMessage", async () => {

        const Req = {
            body: { type: "groceries", color: "#fcbe44" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };

        const response = await request(app).post("/api/categories").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(200)
        expect(response.body.data.type).toEqual(Req.body.type)
        expect(response.body.data.color).toEqual(Req.body.color)

    });

    test("createCategory T6: All previous checks passed, access token is expired -> should return 200 with data and res.locals.refreshedTokenMessage", async () => {

        const Req = {
            body: { type: "groceries", color: "#fcbe44" },
            cookies: {
                accessToken: expired_Token_regular,
                refreshToken: AdminRefreshToken
            }
        };

        const response = await request(app).post("/api/categories").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(200)
        expect(response.body.data.type).toEqual(Req.body.type)
        expect(response.body.data.color).toEqual(Req.body.color)
        expect(response.body.refreshedTokenMessage).toEqual("Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls")

    });
})

describe("updateCategory", () => {

    let Req
    beforeEach(async () => {
        Req = {
            body: { type: "utilities", color: "#fcbe44" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
    })

    test("updateCategory T1: Verification not passed -> should return 401 with error 'Unauthorized access'", async () => {

        const Req = {
            body: { type: "utilities", color: "Yellow" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: '',
                refreshToken: AdminAccessToken
            }
        };

        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });


    test("updateCategory T3: Previous 2 checks passed, but newType parameter is missing -> should return 400 with error 'Missing new 'type' parameter'", async () => {

        const Req = {
            body: { color: "Yellow" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminAccessToken
            }
        };
        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing new 'type' parameter")
    });


    test("updateCategory T3.1: Previous 2 checks passed, but newType parameter is an empty string -> should return 400 with error 'Missing new 'type' parameter'", async () => {

        const Req = {
            body: { type: "", color: "Yellow" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminAccessToken
            }
        };
        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing new 'type' parameter")
    });


    test("updateCategory T4: Previous 3 checks passed, but color parameter is missing -> should return 400 with error 'Missing 'color' parameter'", async () => {

        const Req = {
            body: { type: "utilities", },
            params: {name: 'groceries'},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminAccessToken
            }
        };
        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing 'color' parameter")
    });


    test("updateCategory T4.1: Previous 3 checks passed, but color parameter is an empty string -> should return 400 with error 'Missing 'color' parameter'", async () => {

        const Req = {
            body: { type: "utilities", color: "" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminAccessToken
            }
        };
        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing 'color' parameter")
    });


    test("updateCategory T5.1: Previous 4 checks passed, but the new category already exists in the DB -> should return 400 with error 'New category already found in the database'", async () => {

        const Req = {
            body: { type: "utilities", color: "#fcbe44" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminAccessToken
            }
        };
        await categories.create({ type: Req.body.type, color: Req.body.color })

        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("New category already found in the database")
    });

    test("updateCategory T5.2: Previous 4 checks passed, new category not in db -> should return 200", async () => {

        const Req = {
            body: { type: "new one", color: "#fcbe44" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminAccessToken
            }
        };

        await categories.create({type: Req.params.name, color: "color"})

        const transaction_in_DB = [
            { username: 'john', type: 'utilities', amount: 80 },
            { username: 'sarah89', type: 'groceries', amount: 110 },
            { username: 'john', type: 'groceries', amount: 60 }
        ]
        await transactions.create(transaction_in_DB[0])
        await transactions.create(transaction_in_DB[1])
        await transactions.create(transaction_in_DB[2])

        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(200)
        expect(response.body.data.message).toEqual("Category edited successfully")
        expect(response.body.data.count).toEqual(2)
    });

    test("updateCategory T5.3: Previous 4 checks passed, new category in db but equal to oldcategory -> should return 200", async () => {

        const Req = {
            body: { type: "groceries", color: "#fcbe44" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminAccessToken
            }
        };

        await categories.create({type: Req.params.name, color: "color"})


        const transaction_in_DB = [
            { username: 'john', type: 'utilities', amount: 80 },
            { username: 'sarah89', type: 'groceries', amount: 110 },
            { username: 'john', type: 'groceries', amount: 60 }
        ]
        await transactions.create(transaction_in_DB[0])
        await transactions.create(transaction_in_DB[1])
        await transactions.create(transaction_in_DB[2])

        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        
        const categoryUpdated = await categories.findOne({type: Req.params.name})

        expect(response.status).toEqual(200)
        expect(response.body.data.message).toEqual("Category edited successfully")
        expect(response.body.data.count).toEqual(0)

        expect(categoryUpdated.color).toEqual("#fcbe44")
        expect(categoryUpdated.type).toEqual(Req.params.name)
    });


    test("updateCategory T6: Previous 5 checks passed, but no match in the DB -> should return 400 with error 'Old category not found in the database'", async () => {

        const Req = {
            body: { type: "utilities", color: "#fcbe44" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminAccessToken
            }
        };

        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Old category not found in the database")
    });


    test("updateCategory T7: Previous 6 checks passed, .updateMany worked -> should return 200 with error 'Category edited successfully'", async () => {

        const Req = {
            body: { type: "utilities", color: "#fcbe44" },
            params: {name: 'groceries'},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminAccessToken
            }
        };
        await categories.create({ type: Req.params.name, color: Req.body.color })
        await transactions.create({ username: "mike44", type: Req.params.name, amount: 45 })
        await transactions.create({ username: "john23", type: Req.params.name, amount: 93 })

        const response = await request(app).patch(`/api/categories/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body);

        expect(response.status).toEqual(200)
        expect(response.body.data.message).toEqual("Category edited successfully")
        expect(response.body.data.count).toEqual(2) //because there are 2 transactions with the same type as the old type (line 328 and 329)
    });
})




describe("deleteCategory", () => {
    let Req;
    beforeEach(async () => {
        Req = {
            body: {},
            params: {},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
        await Group.deleteMany()


        const transactions_in_DB = [
            { username: "sarah89", type: "utilities", amount: 100, date: "2023" },
            { username: "john", type: "food", amount: 100, date: "2023" },
            { username: "john", type: "food", amount: 101, date: "2023" },
            { username: "john", type: "food", amount: 102, date: "2023" },
            { username: "sarah89", type: "food", amount: 100, date: "2023" },
            { username: "sarah89", type: "food", amount: 101, date: "2023" },
        ]

        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
            { type: "food", color: "#47D63E" },
            { type: "fuel", color: "#6F94DA" }
        ]

        const user_in_DB = [
            { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularRefreshToken, role: 'Regular' },
            { username: 'admin', email: 'admin@gmail.com', password: 'randomPass', refreshToken: AdminRefreshToken, role: 'Admin' },
            { username: 'sarah89', email: 'sarah89@gmail.com', password: 'randomPass', refreshToken: regularRefreshTokenSarah89, role: 'Regular' }
        ]



        const insUser = await User.insertMany(user_in_DB);

        const group_in_DB = [
            { name: "group1", members: [{ email: insUser[0].email, user: insUser[0]._id }, { email: insUser[2].email, user: insUser[2]._id }] },
            { name: "group2", members: [{ email: insUser[1].email, user: insUser[1]._id }] }
        ]

        await Group.insertMany(group_in_DB);

        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await categories.create(categories_in_DB[2])

        await transactions.insertMany(transactions_in_DB)
    });

    test("deleteCategory T1: Authorization failed, not an Admin -> should return 401 with error 'Unauthorized access' ", async () => {

        const Req = {
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });

    test("deleteCategory T2.1: Missing attributes -> should return 400", async () => {

        const Req = {
            body: {}, 
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`).send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing attributes")
    });

    test("deleteCategory T2.2: Missing attributes -> should return 400", async () => {

        const Req = {
            body: {types: []}, 
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`).send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing attributes")
    });

    test("deleteCategory T3: Missing attributes, empty string -> should return 400", async () => {

        const Req = {
            body: {types: ["food", " "]}, 
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`).send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing attributes, empty string")
    });

    test("deleteCategory T4: Not enough categories in the db -> should return 400", async () => {

        const Req = {
            body: {types: ["food", "fuel"]}, 
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        await categories.deleteMany({ type: { $nin: ["utilities"] } });
        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`).send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Not enough categories in the database")
    });

    test("deleteCategory T5: Category does not exist -> should return 400", async () => {

        const Req = {
            body: {types: ["food", "fuel", "none"]}, 
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`).send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Category does not exist")
    });

    test("deleteCategory T6.1: N < T -> should return 400", async () => {

        const Req = {
            body: {types: ["food", "fuel", "utilities", "none1", "none2"]}, 
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`).send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Category does not exist")
    });

    test("deleteCategory T6.2: N < T with duplicates -> should return 200", async () => {

        const Req = {
            body: {types: ["food", "fuel", "utilities", "fuel", "fuel"]}, 
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`).send(Req.body)
        const updatedTransactions = await transactions.find({});

        const categoriesUpdated = await categories.find({});

        expect(response.status).toEqual(200)
        expect(response.body.data.message).toEqual("Categories deleted")
        expect(response.body.data.count).toEqual(5)
        expect(categoriesUpdated.length).toEqual(1)
    });

    test("deleteCategory T7: N = T -> should return 200", async () => {

        const Req = {
            body: {types: ["food", "fuel", "utilities"]}, 
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`).send(Req.body)

        const updatedTransactions = await transactions.find({});

        const categoriesUpdated = await categories.find({});

        expect(response.status).toEqual(200)
        expect(response.body.data.message).toEqual("Categories deleted")
        expect(response.body.data.count).toEqual(5)
        expect(categoriesUpdated.length).toEqual(1)
    });

    test("deleteCategory T8: N > T -> should return 200", async () => {

        const Req = {
            body: {types: ["food", "utilities"]}, 
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).delete(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`).send(Req.body)

        const updatedTransactions = await transactions.find({});

        expect(response.status).toEqual(200)
        expect(response.body.data.message).toEqual("Categories deleted")
        expect(response.body.data.count).toEqual(6)
    });
})




describe("getCategories", () => {
    let Req
    beforeEach(async () => {
        Req = {
            body: { type: "utilities", color: "#fcbe44" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
    })


    test("getCategories T1: Authorization failed -> should return 401 with error 'Unauthorized access'", async () => {

        const Req = {
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: ''
            }
        }

        const response = await request(app).get(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });


    test("getCategories T2: Authorization passed, categories.find worked -> should return 200 with all filtered categories", async () => {

        const Req = {
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
            { type: "food", color: "#47D63E" },
            { type: "fuel", color: "#6F94DA" }
        ]
        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await categories.create(categories_in_DB[2])

        const response = await request(app).get(`/api/categories`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200)
        expect(response.body.data).toEqual(categories_in_DB)
    });
})




describe("createTransaction", () => {
    let Req
    beforeEach(async () => {
        Req = {
            body: { username: "john", type: "utilities", amount: 110 },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
    })

    test("createTransaction T1: Authorization failed -> should return 401 with error 'Unauthorized access' ", async () => {
        const Req = {
            body: { username: "mike76", type: "utilities", amount: 110 },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: ''
            }
        }
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });


    test("createTransaction T2.1.1: Username parameter is missing -> should return 400 with error 'Missing body param(s)' ", async () => {
        const Req = {
            body: { type: "utilities", amount: 110 },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing body param(s)")
    });


    test("createTransaction T2.1.2: Authorization passed, but username parameter is an empty string -> should return 400 with error 'Missing body param(s)' ", async () => {
        const Req = {
            body: { username: "", type: "utilities", amount: 110 },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing body param(s)")
    });


    test("createTransaction T2.2.1: Authorization passed, but type parameter is missing -> should return 400 with error 'Missing body param(s)' ", async () => {
        const Req = {
            body: { username: "john", amount: 110 },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing body param(s)")
    });


    test("createTransaction T2.2.2: Authorization passed, but type parameter is an empty string -> should return 400 with error 'Missing body param(s)' ", async () => {
        const Req = {
            body: { username: "john", type: "", amount: 110 },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing body param(s)")
    });


    test("createTransaction T2.3.1: Authorization passed, but amount parameter is missing -> should return 400 with error 'Missing body param(s)' ", async () => {
        const Req = {
            body: { username: "john", type: "utilities" },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing body param(s)")
    });


    test("createTransaction T2.3.2: Authorization passed, but type amount is an empty string -> should return 400 with error 'Missing body param(s)' ", async () => {
        const Req = {
            body: { username: "john", type: "utilities", amount: "" },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing body param(s)")
    });


    test("createTransaction T3.1: All previous checks passed, but category doesn't exist in the DB -> should return 400 with error 'Category does not exist' ", async () => {
        const Req = {
            body: { username: "john", amount: 110, type: "utilities" },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Category does not exist")
    });


    test("createTransaction T3.2: Username (in body) doesn't exist in the DB -> should return 400 with error 'User body does not exist' ", async () => {
        const Req = {
            body: { username: "john", amount: 110, type: "utilities" },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
        ]
        await categories.create(categories_in_DB[0])
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("User body does not exist")
    });

    test("createTransaction T3.3: Username (in params) doesn't exist in the DB -> should return 400 with error 'User param does not exist'  ", async () => {
        const Req = {
            body: { username: "john", amount: 110, type: "utilities" },
            params: {username: "sarah89"},
            cookies: {
                accessToken: regularAccessTokenSarah89,
                refreshToken: regularRefreshTokenSarah89
            }
        }
        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
        ]
        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' };

        await categories.create(categories_in_DB[0])
        await User.create(user_in_DB)
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("User param does not exist")
    });


    test("createTransaction T3.3: Route username and body username do not match -> should return 400 with error 'Route username and body username do not match' ", async () => {
        const Req = {
            body: { username: "mike76", amount: 110, type: "utilities" },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
        ]
        const user_in_DB = [{ username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' },
        { username: 'mike76', email: 'mike@gmail.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }]
        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await User.create(user_in_DB)
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Route username and body username do not match")
    });


    test("createTransaction T3.4: Amount is not a floating point number -> should return 400 with error 'The amount is not a floating point number' ", async () => {
        const Req = {
            body: { username: "john", amount: "rr500dsdsa", type: "utilities" },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
        ]
        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await categories.create(categories_in_DB[0])
        await User.create(user_in_DB)
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("The amount is not a floating point number")
    });


    test("createTransaction T3.5: All previous checks passed -> should return 200 with data and res.locals.refreshedTokenMessage ", async () => {
        const Req = {
            body: { username: "john", amount: 110, type: "utilities" },
            params: {username: "john"},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        }
        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
        ]
        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await categories.create(categories_in_DB[0])
        await User.create(user_in_DB)
        const response = await request(app).post(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(200)
        expect(response.body.data.username).toEqual(Req.body.username)
        expect(response.body.data.amount).toEqual(Req.body.amount)
        expect(response.body.data.type).toEqual(Req.body.type)

    });


})




describe("getAllTransactions", () => {

    let Req
    beforeEach(async () => {
        Req = {
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
    })

    test("getAllTransactions T1: Authorization failed due to not being an admin -> should return 401 with error 'Unauthorized access' ", async () => {

        const Req = {
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        const response = await request(app).get(`/api/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });


    test("getAllTransactions T2: Authorization passed  -> should return 200 with data and res.locals.refreshedTokenMessage 'Unauthorized access' ", async () => {

        const Req = {
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };

        const transactions_in_DB = [
            { username: "mike44", type: "utilities", amount: 80, date: "2021" },
            { username: "john23", type: "food", amount: 45, date: "2022" },
            { username: "sarah89", type: "fuel", amount: 100, date: "2023" },
        ]

        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
            { type: "food", color: "#47D63E" },
            { type: "fuel", color: "#6F94DA" }
        ]
        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await categories.create(categories_in_DB[2])

        await transactions.insertMany(transactions_in_DB)

        const response = await request(app).get(`/api/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200)

        expect(response.body.data[0].username).toEqual("mike44")
        expect(response.body.data[0].type).toEqual("utilities")
        expect(response.body.data[0].amount).toEqual(80)


        expect(response.body.data[1].username).toEqual("john23")
        expect(response.body.data[1].type).toEqual("food")
        expect(response.body.data[1].amount).toEqual(45)

        expect(response.body.data[2].username).toEqual("sarah89")
        expect(response.body.data[2].type).toEqual("fuel")
        expect(response.body.data[2].amount).toEqual(100)
    });
})




describe("getTransactionsByUser", () => {

    let Req
    beforeEach(async () => {
        Req = {
            params: { username: 'john' },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
    })

    //All tests starting with T1 refer to user route
    test("getTransactionsByUser T1.1: username is not found in the DB -> should return 400 with error 'User not found' ", async () => {

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions`).set(
            'Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`
        );

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("User not found")
    });

    test("getTransactionsByUser T1.2.1: username found in the DB, but no transactions is associated to it -> should return 200 with empty data ", async () => {
        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await User.create(user_in_DB)
        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
            { type: "food", color: "#47D63E" },
            { type: "fuel", color: "#6F94DA" }
        ]
        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await categories.create(categories_in_DB[2])

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions`).set(
            'Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`
        );

        expect(response.status).toEqual(200)
        expect(response.body.data).toEqual([])
    });

    test("getTransactionsByUser T1.2.2: username found in the DB, has some transactions -> should return 200 with the list of transactions ", async () => {
        Req = {
            params: { username: 'john' },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await User.create(user_in_DB)

        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
            { type: "food", color: "#47D63E" },
            { type: "fuel", color: "#6F94DA" }
        ]
        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await categories.create(categories_in_DB[2])

        const transaction_in_DB = [
            { username: 'john', type: 'utilities', amount: 80 },
            { username: 'mike', type: 'fuel', amount: 110 },
            { username: 'john', type: 'food', amount: 60 }
        ]
        await transactions.create(transaction_in_DB[0])
        await transactions.create(transaction_in_DB[1])
        await transactions.create(transaction_in_DB[2])

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions`).set(
            'Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`
        );

        expect(response.status).toEqual(200)
        expect(response.body.data[0].username).toEqual(transaction_in_DB[0].username)
        expect(response.body.data[0].amount).toEqual(transaction_in_DB[0].amount)
        expect(response.body.data[0].type).toEqual(transaction_in_DB[0].type)

        expect(response.body.data[1].username).toEqual(transaction_in_DB[2].username)
        expect(response.body.data[1].amount).toEqual(transaction_in_DB[2].amount)
        expect(response.body.data[1].type).toEqual(transaction_in_DB[2].type)
    });

    test("getTransactionsByUser T1.3: Authentication failed -> should return 401 with error 'Unauthorized access' and cause 'Unauthorized access' ", async () => {
        Req = {
            params: { username: 'mike' },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };
        const response = await request(app).get(`/api/users/${Req.params.username}/transactions`).set(
            'Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`
        );

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
        expect(response.body.cause).toEqual("Unauthorized access")

    });

    //All tests starting with T2 refer to admin route
    test("getTransactionsByUser T2.1: Not admin -> should return 401 with error 'Unauthorized access' and cause 'Unauthorized access' ", async () => {

        const response = await request(app).get(`/api/transactions/users/${Req.params.username}`).set(
            'Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`
        );

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
        expect(response.body.cause).toEqual("Unauthorized access")
    });

    //All tests starting with T2.2 refer to admin route and an admin is calling the API
    test("getTransactionsByUser T2.2.1: username not found in DB -> should return 400 with error 'User not found' ", async () => {
        Req = {
            params: { username: 'john' },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };
        const response = await request(app).get(`/api/transactions/users/${Req.params.username}`).set(
            'Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`
        );

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("User not found")
    });

    test("getTransactionsByUser T2.2.2: username found in the DB, but no transactions is associated to it -> should return 200 with empty data ", async () => {
        Req = {
            params: { username: 'john' },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };
        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await User.create(user_in_DB)
        const response = await request(app).get(`/api/transactions/users/${Req.params.username}`).set(
            'Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`
        );

        expect(response.status).toEqual(200)
        expect(response.body.data).toEqual([])
    });

    test("getTransactionsByUser T2.2.3: username found in the DB, has transactions associated to it -> should return 200 with list of transactions ", async () => {
        Req = {
            params:{username: 'john'},
            cookies: {accessToken: AdminAccessToken,
            refreshToken: AdminRefreshToken}
        };
        const user_in_DB = {username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular'}
        await User.create(user_in_DB)

        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
            { type: "food", color: "#47D63E" },
            { type: "fuel", color: "#6F94DA" }
        ]
        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await categories.create(categories_in_DB[2])

        const transaction_in_DB = [
                    {username: 'john', type: 'utilities', amount: 80},
                    {username: 'mike', type: 'fuel', amount: 110},
                    {username: 'john', type: 'food', amount: 60},
                ]
        await transactions.create(transaction_in_DB[0])
        await transactions.create(transaction_in_DB[1])
        await transactions.create(transaction_in_DB[2])

        const response = await request(app).get(`/api/transactions/users/${Req.params.username}`).set(
            'Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`
          );

        expect(response.status).toEqual(200)
        expect(response.body.data[0].username).toEqual(transaction_in_DB[0].username)
        expect(response.body.data[0].amount).toEqual(transaction_in_DB[0].amount)
        expect(response.body.data[0].type).toEqual(transaction_in_DB[0].type)

        expect(response.body.data[1].username).toEqual(transaction_in_DB[2].username)
        expect(response.body.data[1].amount).toEqual(transaction_in_DB[2].amount)
        expect(response.body.data[1].type).toEqual(transaction_in_DB[2].type)
    });
})




describe("getTransactionsByUserByCategory", () => {

    let Req;
    beforeEach(async () => {
        Req = {
            body: {},
            params: { category: "groceries", username: "john" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()


        const transactions_in_DB = [
            { username: "sarah89", type: "fuel", amount: 100, date: "2023" },
            { username: "john", type: "food", amount: 100, date: "2023" },
            { username: "john", type: "food", amount: 101, date: "2023" },
            { username: "john", type: "food", amount: 102, date: "2023" }
        ]

        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
            { type: "food", color: "#47D63E" },
            { type: "fuel", color: "#6F94DA" }
        ]

        const user_in_DB = [
            { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularRefreshToken, role: 'Regular' },
            { username: 'admin', email: 'admin@gmail.com', password: 'randomPass', refreshToken: AdminRefreshToken, role: 'Admin' }
        ]

        await User.insertMany(user_in_DB);

        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await categories.create(categories_in_DB[2])

        await transactions.insertMany(transactions_in_DB)
    });

    test("getTransactionsByUserByCategory T1: Authorization failed, trying to use admin route being a user -> should return 401 with error 'Unauthorized access' ", async () => {

        const Req = {
            params: { category: "groceries", username: "john" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/users/${Req.params.username}/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });

    test("getTransactionsByUserByCategory T2: Authorization failed, trying to use user route being not the right user (wrong route) -> should return 401 ", async () => {

        const Req = {
            params: { category: "groceries", username: "not_john" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });

    test("getTransactionsByUserByCategory T3: (user route) User not in db -> should return 400 ", async () => {

        const Req = {
            params: { category: "groceries", username: "john" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        await User.deleteOne({ username: "john" });

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("User not found")
    });

    test("getTransactionsByUserByCategory T4: (user route) User in db, category not in db -> should return 400 ", async () => {

        const Req = {
            params: { category: "notexisting", username: "john" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Category not found")
    });

    test("getTransactionsByUserByCategory T5.1: (user route) Return list of transactions by user by category -> should return 200 ", async () => {

        const Req = {
            params: { category: "food", username: "john" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(3);

        for (const tempData of response.body.data) {
            expect(tempData.username).toEqual("john");
            expect(tempData.type).toEqual("food");
        }
    });

    test("getTransactionsByUserByCategory T5.2: (user route) Return list of transactions by user by category -> should return 200 with no transactions", async () => {

        const Req = {
            params: { category: "fuel", username: "john" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(0);
    });

    test("getTransactionsByUserByCategory T6: (Admin route) User not in db -> should return 400 ", async () => {

        const Req = {
            params: { category: "groceries", username: "john" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        await User.deleteOne({ username: "john" });

        const response = await request(app).get(`/api/transactions/users/${Req.params.username}/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("User not found")
    });

    test("getTransactionsByUserByCategory T7: (admin route) User in db, category not in db -> should return 400 ", async () => {

        const Req = {
            params: { category: "notexisting", username: "john" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/users/${Req.params.username}/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Category not found")
    });

    test("getTransactionsByUserByCategory T8: (admin route) Return list of transactions by user by category -> should return 200 ", async () => {

        const Req = {
            params: { category: "food", username: "john" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/users/${Req.params.username}/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(3);

        for (const tempData of response.body.data) {
            expect(tempData.username).toEqual("john");
            expect(tempData.type).toEqual("food");
        }
    });

    test("getTransactionsByUserByCategory T9.1: (user route) Access and refresh token expired, refreshed token message -> should return 200 ", async () => {

        const Req = {
            params: { category: "food", username: "john" },
            cookies: {
                accessToken: expired_Token_regular,
                refreshToken: expired_Token_regular
            },
        };

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401);
    });

    test("getTransactionsByUserByCategory T9.2: (user route) Access token expired, Return list of transactions by user by category -> should return 200 ", async () => {

        const Req = {
            params: { category: "food", username: "john" },
            cookies: {
                accessToken: expired_Token_regular,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/users/${Req.params.username}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(3);
        expect(response.body.refreshedTokenMessage).toEqual("Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls");

        for (const tempData of response.body.data) {
            expect(tempData.username).toEqual("john");
            expect(tempData.type).toEqual("food");
        }
    });


})




describe("getTransactionsByGroup", () => {
    let Req;
    beforeEach(async () => {
        Req = {
            body: {},
            params: {},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
        await Group.deleteMany()


        const transactions_in_DB = [
            { username: "sarah89", type: "fuel", amount: 100, date: "2023" },
            { username: "john", type: "food", amount: 100, date: "2023" },
            { username: "john", type: "food", amount: 101, date: "2023" },
            { username: "john", type: "food", amount: 102, date: "2023" }
        ]

        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
            { type: "food", color: "#47D63E" },
            { type: "fuel", color: "#6F94DA" }
        ]

        const user_in_DB = [
            { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularRefreshToken, role: 'Regular' },
            { username: 'admin', email: 'admin@gmail.com', password: 'randomPass', refreshToken: AdminRefreshToken, role: 'Admin' },
            { username: 'sarah89', email: 'sarah89@gmail.com', password: 'randomPass', refreshToken: regularRefreshTokenSarah89, role: 'Regular' }
        ]



        const insUser = await User.insertMany(user_in_DB);

        const group_in_DB = [
            { name: "group1", members: [{ email: insUser[0].email, user: insUser[0]._id }, { email: insUser[2].email, user: insUser[2]._id }] },
            { name: "group2", members: [{ email: insUser[1].email, user: insUser[1]._id }] }
        ]

        await Group.insertMany(group_in_DB);

        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await categories.create(categories_in_DB[2])

        await transactions.insertMany(transactions_in_DB)
    });

    test("getTransactionsByGroup T1: Group not found in the db -> should return 400 ", async () => {

        const Req = {
            params: { name: "group_none" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/groups/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Group not found")
    });

    test("getTransactionsByGroup T2: Authorization failed, trying to use admin route being a user -> should return 401 with error 'Unauthorized access' ", async () => {

        const Req = {
            params: { name: "group1" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/groups/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });

    test("getTransactionsByGroup T3: Authorization failed, trying to ask for transaction of group which the user doesn't belong to -> should return 401 with error 'Unauthorized access' ", async () => {

        const Req = {
            params: { name: "group2" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/groups/${Req.params.name}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });

    test("getTransactionsByGroup T4: Admin asks for transaction of the group -> should return 200 ", async () => {

        const Req = {
            params: { name: "group1" },
            cookies: {
                accessToken: AdminAccessToken,  // an admin can also be a regular user
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/groups/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200)
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(4);
    });

    test("getTransactionsByGroup T4: Admin asks for transaction of the group -> should return 200 ", async () => {

        const Req = {
            params: { name: "group1" },
            cookies: {
                accessToken: AdminAccessToken,  // an admin can also be a regular user
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/groups/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200)
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(4);
    });

    test("getTransactionsByGroup T5: User asks for transaction of the group he/she belongs to -> should return 200 ", async () => {

        const Req = {
            params: { name: "group1" },
            cookies: {
                accessToken: regularAccessTokenSarah89,  // an admin can also be a regular user
                refreshToken: regularRefreshTokenSarah89
            },
        };

        const response = await request(app).get(`/api/groups/${Req.params.name}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200)
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(4);
    });
})




describe("getTransactionsByGroupByCategory", () => {

    let Req;
    beforeEach(async () => {
        Req = {
            body: {},
            params: { name: "group_none", category: "food" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
        await Group.deleteMany()


        const transactions_in_DB = [
            { username: "sarah89", type: "fuel", amount: 100, date: "2023" },
            { username: "john", type: "food", amount: 100, date: "2023" },
            { username: "john", type: "food", amount: 101, date: "2023" },
            { username: "john", type: "food", amount: 102, date: "2023" },
            { username: "sarah89", type: "food", amount: 100, date: "2023" },
            { username: "sarah89", type: "food", amount: 101, date: "2023" },
        ]

        const categories_in_DB = [
            { type: "utilities", color: "#fcbe44" },
            { type: "food", color: "#47D63E" },
            { type: "fuel", color: "#6F94DA" }
        ]

        const user_in_DB = [
            { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularRefreshToken, role: 'Regular' },
            { username: 'admin', email: 'admin@gmail.com', password: 'randomPass', refreshToken: AdminRefreshToken, role: 'Admin' },
            { username: 'sarah89', email: 'sarah89@gmail.com', password: 'randomPass', refreshToken: regularRefreshTokenSarah89, role: 'Regular' }
        ]



        const insUser = await User.insertMany(user_in_DB);

        const group_in_DB = [
            { name: "group1", members: [{ email: insUser[0].email, user: insUser[0]._id }, { email: insUser[2].email, user: insUser[2]._id }] },
            { name: "group2", members: [{ email: insUser[1].email, user: insUser[1]._id }] }
        ]

        await Group.insertMany(group_in_DB);

        await categories.create(categories_in_DB[0])
        await categories.create(categories_in_DB[1])
        await categories.create(categories_in_DB[2])

        await transactions.insertMany(transactions_in_DB)
    });

    test("getTransactionsByGroupByCategory T1: Group not found in the db -> should return 400 ", async () => {

        const Req = {
            params: { name: "group_none", category: "food" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/groups/${Req.params.name}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Group not found")
    });

    test("getTransactionsByGroupByCategory T2: Authorization failed, trying to use admin route being a user -> should return 401 with error 'Unauthorized access' ", async () => {

        const Req = {
            params: { name: "group1", category: "food" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/groups/${Req.params.name}/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });

    test("getTransactionsByGroupByCategory T3: Authorization failed, trying to ask for transaction of group which the user doesn't belong to -> should return 401 with error 'Unauthorized access' ", async () => {

        const Req = {
            params: { name: "group2", category: "food" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/groups/${Req.params.name}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });


    test("getTransactionsByGroupByCategory T4: Category not found in db -> should return 400", async () => {

        const Req = {
            params: { name: "group1", category: "none" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/groups/${Req.params.name}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Category not found")
    });

    test("getTransactionsByGroupByCategory T5: User asks for transactions -> should return 200", async () => {

        const Req = {
            params: { name: "group1", category: "food" },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            },
        };

        const response = await request(app).get(`/api/groups/${Req.params.name}/transactions/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200)
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(5);
    });

    test("getTransactionsByGroupByCategory T6: (admin) Category not found in db -> should return 400", async () => {

        const Req = {
            params: { name: "group1", category: "none" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/groups/${Req.params.name}/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Category not found")
    });

    test("getTransactionsByGroupByCategory T7: Admin asks for transactions -> should return 200", async () => {

        const Req = {
            params: { name: "group1", category: "food" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            },
        };

        const response = await request(app).get(`/api/transactions/groups/${Req.params.name}/category/${Req.params.category}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)

        expect(response.status).toEqual(200)
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(5);
    });



})




describe("deleteTransaction", () => {

    let Req;
    beforeEach(async () => {
        Req = {
            body: { _id: "6hjkohgfc8nvu786" },
            params: {username: 'mike'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
    })

    test("deleteTransaction T1: User authentication failed -> should return 401 with message 'Unauthorized access'", async () => {

        const Req = {
            body: { _id: "6hjkohgfc8nvu786" },
            params: {username: 'mike'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: ''
            }
        };
        const response = await request(app).delete(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });


    //All tests starting with T2 refer to passed authentication
    test("deleteTransaction T2.1.1: _id is missing from the body of the request -> should return 400 with message 'Missing _id in the request body'", async () => {

        const Req = {
            body: {},
            params: {username: 'john'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };
        const req_params = "john"
        const response = await request(app).delete(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing _id in the request body")
    });

    test("deleteTransaction T2.1.2: _id is an empty string -> should return 400 with message 'Missing _id in the request body'", async () => {

        const Req = {
            body: { _id: '' },
            params: {username: 'john'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };
        const response = await request(app).delete(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Missing _id in the request body")
    });

    test("deleteTransaction T2.2.1: username doesn't exist in the DB -> should return 400 with message 'User not found'", async () => {

        const Req = {
            body: { _id: '6hjkohgfc8nvu786' },
            params: {username: 'john'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };
        const response = await request(app).delete(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("User not found")
    });

    test("deleteTransaction T2.2.2: _id is not valid -> should return 400 with message 'Transaction not found, _id not valid' ", async () => {

        const Req = {
            body: { _id: 'invalid_ID' },
            params: {username: 'john'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };
        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await User.create(user_in_DB)

        const response = await request(app).delete(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Transaction not found, _id not valid")
    });

    //All tests starting with T2.3 refer to passed verification, request body is correct, username exists in the DB
    test("deleteTransaction T2.3.1: _id doesn't exist in the transaction DB -> should return 400 with message 'Transaction not found'", async () => {

        const Req = {
            body: { _id: valid_id1 },
            params: {username: 'john'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };
        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await User.create(user_in_DB)

        const response = await request(app).delete(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Transaction not found")
    });


    test("deleteTransaction T2.3.2: found transaction in the DB corresponding to _id, but this transaction has a username different than the username in the req params  -> should return 400 with message 'Transaction not found'", async () => {

        const Req = {
            body: { _id: "6479e86b52b2827ceb04d3f1" },
            params: {username: 'john'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };
        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await User.create(user_in_DB)
        const transaction_in_DB = { username: 'mike', type: 'utilities', amount: 45, date: '2-6-2023' }
        await transactions.create(transaction_in_DB)

        const response = await request(app).delete(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Transaction not found")
    });

    test("deleteTransaction T2.3.3: found transaction in the DB corresponding to _id-> should return 200 with message 'Transaction deleted'", async () => {

        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await User.create(user_in_DB)
        const transaction_in_DB = { username: 'john', type: 'utilities', amount: 45, date: '2-6-2023' }
        await transactions.create(transaction_in_DB)
        const matched_transaction = await transactions.findOne({ username: 'john' })
        const matched_user = await User.findOne({ username: 'john' })


        const Req = {
            body: { _id: matched_transaction._id },
            params: {username: 'john'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        const response = await request(app).delete(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(200)
        expect(response.body.data.message).toEqual("Transaction deleted")
    })

    test("deleteTransaction T2.3.4: found transaction in the DB corresponding to _id -> should return 200 with message 'Transaction deleted'", async () => {

        const user_in_DB = { username: 'john', email: 'john@example.com', password: 'randomPass', refreshToken: regularAccessToken, role: 'Regular' }
        await User.create(user_in_DB)
        const transaction_in_DB = { username: 'john', type: 'utilities', amount: 45, date: '2-6-2023' }
        await transactions.create(transaction_in_DB)
        const matched_transaction = await transactions.findOne({ username: 'john' })
        const matched_user = await User.findOne({ username: 'john' })


        const Req = {
            body: { _id: matched_transaction._id },
            params: {username: 'john'},
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };
        const response = await request(app).delete(`/api/users/${Req.params.username}/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(200)
        expect(response.body.data.message).toEqual("Transaction deleted")
    });

})




describe("deleteTransactions", () => {

    let Req
    beforeEach(async () => {
        Req = {
            body: { _ids: ["6hjkohgfc8nvu786", "4rcnsmdkp0wdb357", "wgfnch41wue8jei5"] },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
    })

    test("deleteTransactions T1: User authentication failed -> should return 401 with message 'Unauthorized access'", async () => {

        const Req = {
            body: { _ids: ["6hjkohgfc8nvu786", "4rcnsmdkp0wdb357", "wgfnch41wue8jei5"] },
            cookies: {
                accessToken: regularAccessToken,
                refreshToken: regularRefreshToken
            }
        };
        const response = await request(app).delete(`/api/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(401)
        expect(response.body.error).toEqual("Unauthorized access")
    });

    //All tests starting with T2 refer to passed authentication
    test("deleteTransactions T2.1.1: missing _ids attribute in body request -> should return 400 with message 'Invalid request body. Missing _ids array' ", async () => {

        const Req = {
            body: {},
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };
        const response = await request(app).delete(`/api/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Invalid request body. Missing _ids array")
    });

    test("deleteTransactions T2.1.2: _ids attribute is not an array -> should return 400 with message 'Invalid request body. Missing _ids array'  ", async () => {

        const Req = {
            body: { _ids: "not_an_array" },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };
        const response = await request(app).delete(`/api/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Invalid request body. Missing _ids array")
    });

    test("deleteTransactions T2.1.3: _ids attribute has an empty element -> should return 400 with message 'Invalid transaction ID'  ", async () => {

        const Req = {
            body: { _ids: [valid_id1, "7479e86b52b2827ceb04d3f1", " "] },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };
        const response = await request(app).delete(`/api/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Invalid transaction ID")
    });

    test("deleteTransactions T2.1.4: _ids attribute has an invalid element -> should return 400 with message 'Transaction not found, _id not valid'  ", async () => {

        const Req = {
            body: { _ids: ["invalid_ID", "7479e86b52b2827ceb04d3f1", "8479e86b52b2827ceb04d3f1"] },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };
        const response = await request(app).delete(`/api/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Transaction not found, _id not valid")
    });


    //All tests starting with T2.2 refer to passed authentication and _ids attribute is correct
    test("deleteTransactions T2.2.1: Could not find transactions corresponding to all ids in DB-> should return 400 with message 'Invalid request body. Missing or invalid _ids array'  ", async () => {

        const Req = {
            body: { _ids: ["6479ee1fa787bdbdc59c95b6", "6479ee1fa787bdbdc59c95b4", "6479efd69325a7307fd45047"] },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };
        const response = await request(app).delete(`/api/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(400)
        expect(response.body.error).toEqual("Invalid request body. Missing or invalid _ids array")
    });

    test("deleteTransactions T2.2.2: Found transactions corresponding to all ids in DB -> should return 400 with message 'Invalid request body. Missing or invalid _ids array' ", async () => {


        const transaction_in_DB = [
            { username: 'john', type: 'utilities', amount: 80 },
            { username: 'mike', type: 'fuel', amount: 110 },
            { username: 'sarah', type: 'food', amount: 60 },
        ]
        await transactions.create(transaction_in_DB[0])
        await transactions.create(transaction_in_DB[1])
        await transactions.create(transaction_in_DB[2])

        const first_found_transaction = await transactions.findOne({ username: 'john' })
        const second_found_transaction = await transactions.findOne({ username: 'mike' })
        const third_found_transaction = await transactions.findOne({ username: 'sarah' })

        const Req = {
            body: { _ids: [first_found_transaction._id, second_found_transaction._id, third_found_transaction._id] },
            cookies: {
                accessToken: AdminAccessToken,
                refreshToken: AdminRefreshToken
            }
        };

        const response = await request(app).delete(`/api/transactions`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
            .send(Req.body)

        expect(response.status).toEqual(200)
        expect(response.body.data.message).toEqual("Transactions deleted")
    });

})
