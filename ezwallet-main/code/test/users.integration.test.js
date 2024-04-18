import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();
beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoose.connection.db.dropDatabase();
});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

const regularRefreshToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcxNzAxMTgwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.q51OEtzNl8fHdvb8J82VKSLeN9tz0K3028Hm5QC3WrQ'
const regularAccessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcwNjU1NzQwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJSZWd1bGFyIiwiaWQiOiI2NDcwOWFhNWJmZjE3MDhhZmIwNzk4YmMifQ.aJlbQpH83EU9aqqiPzRhFFBYG3AEfskXlf4f45B1-EQ'

const AdminRefreshToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcxNzAxMTgwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJBZG1pbiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIn0.G04v5BxNm4dilKLxua-fOGc3LBXwZnV90xecx29Wh20'
const AdminAccessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzU4MDYsImV4cCI6MTcwNjU1NzQwNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInJvbGUiOiJBZG1pbiIsImlkIjoiNjQ3MDlhYTViZmYxNzA4YWZiMDc5OGJjIn0.NLynEsEwckG7ik0k3GQM7W4MypF48jO7PXKG5ZR0DPE'

const expired_Token_regular = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NzUxNTAwNTYsImV4cCI6MTY4MjgzOTY1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIkVtYWlsIjoianJvY2tldEBleGFtcGxlLmNvbSIsIlJvbGUiOiJSZWd1bGFyIn0.PpoAHBTnBNX_uccnYQ6dts_Xm2-nKNHEVRLsfNlFl38'
const expired_Token_regular_Admin = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU5NzczNTUsImV4cCI6MTY4NTYzMTc1NSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obiIsIkVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsIlJvbGUiOiJBZG1pbiJ9.UzOaDd3n-qWZbymJbwMzYR_Ar4gUkO0wLu-Hu5g3Ihw';

describe("getUsers", () => {
  let Req
    beforeEach(async() => {
        Req = {
            cookies: {accessToken: regularAccessToken,
            refreshToken: regularRefreshToken}
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
        await Group.deleteMany()

    })
  
  test("T1: Verification failed because it is being called by a non admin -> should return 401 with error 'Unauthorized'", async () =>{
      
      const response = await request(app).get("/api/users").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(401)
      expect(response.body.error).toEqual("Unauthorized access, not an Admin")
    })

  test("T2: Verification passed -> should return 200 with the data for all users", async () =>{
    Req = {
      cookies: {accessToken: AdminAccessToken, 
      refreshToken: AdminRefreshToken} 
    };
    const Users_in_DB = [
      {username: "mike", email: "mike@example.com", password: "pass123", role: "Regular"},
      {username: "john", email: "john@example.com", password: 'king_john', role: 'Admin'},
      {username: "sarah", email: "sarah4@gamil.com", password: "sarah11", role: 'Regular'}
    ]
    const expected_ret_data = [
      { username: 'john', email: 'john@example.com', role: 'Admin' },
      { username: 'mike', email: 'mike@example.com', role: 'Regular' },
      { username: 'sarah', email: 'sarah4@gamil.com', role: 'Regular' },
    ]
    await User.create(Users_in_DB)
    const response = await request(app).get("/api/users").set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    expect(response.status).toEqual(200)
    expect(response.body.data).toEqual(expected_ret_data)  
  })






})




describe("getUser", () => {

  let Req
    beforeEach(async() => {
        Req = {
            cookies: {accessToken: regularAccessToken,
            refreshToken: regularRefreshToken}
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
        await Group.deleteMany()

    })


    test("T1: Regular user looking for another user -> should return 401 with the error 'Unauthorized'", async () => {
      Req = {
        params: {username: "mike"},
        cookies: {accessToken: regularAccessToken, //regularAccessToken has username=john
        refreshToken: regularRefreshToken} //regularRefreshToken has username=john
      }
      const response = await request(app).get(`/api/users/${Req.params.username}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(401)
      expect(response.body.error).toEqual("Unauthorized access, not an Admin")

    })


    test("T2: Regular user looking for himself, couldn't find match in the DB-> should return 400 with the error 'User not found' ", async () => {
      Req = {
        params: {username: "john"},
        cookies: {accessToken: regularAccessToken, //regularAccessToken has username=john
        refreshToken: regularRefreshToken} //regularRefreshToken has username=john
      }
      const req_params = "john"; 
      const response = await request(app).get(`/api/users/${Req.params.username}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(400)
      expect(response.body.error).toEqual("User not found")
    })


    test("T3: Regular user looking for himself, found his match in the DB-> should return 200 with the user's data  ", async () => {
      Req = {
        params: {username: "john"},
        cookies: {accessToken: regularAccessToken, //regularAccessToken has username=john
        refreshToken: regularRefreshToken} //regularRefreshToken has username=john
      }
      const user_in_DB = {username: "john", email: "john@example.com", password: "pass123", refreshToken: regularRefreshToken, role: "Regular"}
      const expected_ret_data = {username: "john", email: "john@example.com", role: "Regular"} //removed password and refreshToken attributes

      await User.create(user_in_DB)
      const response = await request(app).get(`/api/users/${Req.params.username}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(200)
      expect(response.body.data).toEqual(expected_ret_data)  
    })


    test("T4: Admin looking for another user, no match in the DB -> should return 400 with error message 'User not found'  ", async () => {
      Req = {
        params: {username: "mike"},
        cookies: {accessToken: AdminAccessToken, //AdminAccessToken has username=john
        refreshToken: AdminRefreshToken} //AdminRefreshToken has username=john
      }

      const response = await request(app).get(`/api/users/${Req.params.username}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(400)
      expect(response.body.error).toEqual("User not found")
    })


    test("T5: Admin looking for another user, found in the DB -> should return 200 with found user's data   ", async () => {
      Req = {
        params: {username: "mike"},
        cookies: {accessToken: AdminAccessToken, //AdminAccessToken has username=john
        refreshToken: AdminRefreshToken} //AdminRefreshToken has username=john
      }
      const user_in_DB = {username: "mike", email: "mike@example.com", password: "pass123", refreshToken: regularRefreshToken, role: "Regular"}
      const expected_ret_data = {username: "mike", email: "mike@example.com", role: "Regular"} //removed password and refreshToken attributes

      await User.create(user_in_DB)
      const response = await request(app).get(`/api/users/${Req.params.username}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(200)
      expect(response.body.data).toEqual(expected_ret_data)  
    })



 })




describe("createGroup", () => { 
  
  let Req
  beforeEach(async() => {
      Req = {
        body: {
          name: 'utilities',
          memberEmails: [
          "david@example.com",
          "sarah@example.com",
          "mike@example.com",]
        },
          cookies: {
          accessToken: regularAccessToken,
          refreshToken: regularRefreshToken
        }
      };

      await User.deleteMany()
      await categories.deleteMany()
      await transactions.deleteMany()
      await Group.deleteMany()
  })


  test("createGroup T1: Verification for 'Simple' failed -> should return 401 with the error 'Unauthorized'", async () => {
    Req = {
      body: {
        name: 'utilities',
        memberEmails: [
        "david@example.com",
        "sarah@example.com",
        "mike@example.com",]
      },
        cookies: {
        accessToken: '',
        refreshToken: regularRefreshToken
      }
    };
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(401)
    expect(response.body.error).toEqual("Unauthorized")
    
  })


  test("createGroup T2.1.1: Verification for 'Simple' passed, but name parameter is missing -> should return 400 with the error 'Missing attribute'", async () => {
    Req = {
      body: {
        memberEmails: [
        "david@example.com",
        "sarah@example.com",
        "mike@example.com",]
      },
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Missing attribute")
  })


  test("createGroup T2.1.2: Name parameter is empty -> should return 400 with the error 'Missing attribute'", async () => {
    Req = {
      body: {
        name: "",
        memberEmails: [
        "david@example.com",
        "sarah@example.com",
        "mike@example.com",]
      },
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Missing attribute")
  })


  test("createGroup T2.1.3: Name parameter is just a space -> should return 400 with the error 'Group name cannot be empty'", async () => {
    Req = {
      body: {
        name: " ",
        memberEmails: [
        "david@example.com",
        "sarah@example.com",
        "mike@example.com",]
      },
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Group name cannot be empty")
  })


  test("createGroup T2.2.1: memberEmails parameter is empty -> should return 400 with the error 'Missing attribute'", async () => {
    Req = {
      body: {
        name: "utilities",
        memberEmails: []},
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Missing attribute")
  })

  test("createGroup T2.2.2: memberEmails parameter is empty -> should return 400 with the error 'At least one email is empty'", async () => {
    Req = {
      body: {
        name: "utilities",
        memberEmails: [
          "",
        ]},
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("At least one email is empty")
  })

    // All tests starting with T2.3 refer to authorization passed, and all attributes of the request are correct
  test("createGroup T2.3.1: Group name already exists in the DB -> should return 400 with the error 'Group name already existing'", async () => {
    Req = {
      body: {
        name: "bills",
        memberEmails: [
          "",
        ]},
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const group_in_DB = {
      name: Req.body.name, 
      members: [
         {email: 'sarah@example.com'},
         {email: 'mike@example.com'}
        ]
    }
    await Group.create(group_in_DB);
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Group name already existing")
  })

  test("createGroup T2.3.2: One member emails has an invalid format -> should return 400 with the error 'Invalid email: invalid_email.com'", async () => {
    Req = {
      body: {
        name: "utilities",
        memberEmails: [
          "david@example.com",
          "sarah@example.com",
          "invalid_email.com"
        ]},
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Invalid email: invalid_email.com")
  })

  //All tests starting with T2.4 refer to authentication passed, and all emails are valid
  test("createGroup T2.4.1: All emails already exist in another group -> should return 400 with the error 'All the provided emails represent users that are already in a group or do not exist in the database'", async () => {
    Req = {
      body: {
        name: "utilities",
        memberEmails: [
          "david@example.com",
          "sarah@example.com",
          "mike@example.com"
        ]},
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const group_in_DB = {
      name: "groceries", 
      members: [
         {email: 'david@example.com'},
         {email: 'sarah@example.com'},
         {email: 'mike@example.com'}
        ]
    }
    const Users_in_DB = [
          {username: "david", email: Req.body.memberEmails[0], password: "pass123", role: "Regular"},
          {username: "sarah", email: Req.body.memberEmails[1], password: 'sarah11', role: 'Admin'},
          {username: "mike", email: Req.body.memberEmails[2], password: "king_mike", role: 'Regular'}
        ]
    await Group.create(group_in_DB);
    await User.create(Users_in_DB)
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("All the provided emails represent users that are already in a group or do not exist in the database")
  })


  test("createGroup T2.4.2: None of the emails already exists in another group, but the user who called the API is already in a group -> should return 400 with the error 'Calling user already in a group'", async () => {
    Req = {
      body: {
        name: "utilities",
        memberEmails: [
          "david@example.com",
          "sarah@example.com",
          "mike@example.com"
        ]},
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const group_in_DB = {
      name: "fuel", 
      members: [
         {email: 'john@example.com'},
         {email: 'oliver@example.com'},
         {email: 'martin@example.com'}
        ]
    }
    const Users_in_DB = [
      {username: "david", email: Req.body.memberEmails[0], password: "pass123", role: "Regular"},
      {username: "sarah", email: Req.body.memberEmails[1], password: 'sarah11', role: 'Admin'},
      {username: "mike", email: Req.body.memberEmails[2], password: "king_mike", role: 'Regular'},
      {username: "john", email: 'john@example.com', password: "johnny32", role: 'Regular', refreshToken: regularRefreshToken}
    ]
    await Group.create(group_in_DB);
    await User.create(Users_in_DB);
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Calling user already in a group")
  })

  


  test("createGroup T2.4.3: 1 of the emails already exists in another group, but the user who called the API is already in a group -> should return 400 with the error 'Calling user already in a group'", async () => {
    Req = {
      body: {
        name: "utilities",
        memberEmails: [
          "david@example.com",
          "sarah@example.com",
          "mike@example.com"
        ]},
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const group_in_DB = {
      name: "fuel", 
      members: [
         {email: 'lorenzo@example.com'},
         {email: 'sarah@example.com'},
         {email: 'martin@example.com'}
        ]
    }
    const Users_in_DB = [
      {username: "david", email: Req.body.memberEmails[0], password: "pass123", role: "Regular"},
      {username: "sarah", email: Req.body.memberEmails[1], password: 'sarah11', role: 'Admin'},
      {username: "mike", email: Req.body.memberEmails[2], password: "king_mike", role: 'Regular'},
      {username: "john", email: 'john@example.com', password: "johnny32", role: 'Regular', refreshToken: regularRefreshToken}
    ]
    await Group.create(group_in_DB);
    await User.create(Users_in_DB);
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    const expected_data_return = { 
      members: [ //removed sarah because she already is in another group
        {email: Req.body.memberEmails[0]},
        {email: Req.body.memberEmails[2]},
        {email: 'john@example.com'}
      ],
      name: Req.body.name
    }
    expect(response.status).toEqual(200)
 
    expect(response.body.data.group.members).toEqual(expected_data_return.members)  
    expect(response.body.data.group.name).toEqual(expected_data_return.name)  

  })


  test("createGroup T2.4.4: None of the emails already exists in another group, and the user who called the API is also not in a group -> should return 200 with the data", async () => {
    Req = {
      body: {
        name: "utilities",
        memberEmails: [
          "david@example.com",
          "sarah@example.com",
          "mike@example.com"
        ]},
        cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };
    const group_in_DB = {
      name: "fuel", 
      members: [
         {email: 'lorenzo@example.com'},
         {email: 'oliver@example.com'},
         {email: 'martin@example.com'}
        ]
    }
    const Users_in_DB = [
      {username: "david", email: Req.body.memberEmails[0], password: "pass123", role: "Regular"},
      {username: "sarah", email: Req.body.memberEmails[1], password: 'sarah11', role: 'Admin'},
      {username: "mike", email: Req.body.memberEmails[2], password: "king_mike", role: 'Regular'},
      {username: "john", email: 'john@example.com', password: "johnny32", role: 'Regular', refreshToken: regularRefreshToken}
    ]
    await Group.create(group_in_DB);
    await User.create(Users_in_DB);
    const response = await request(app).post(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    const expected_data_return = {
      members: [
        {email: Req.body.memberEmails[0]},
        {email: Req.body.memberEmails[1]},
        {email: Req.body.memberEmails[2]},
        {email: 'john@example.com'}
      ],
      name: Req.body.name
    }
    expect(response.status).toEqual(200)
    expect(response.body.data.group.members).toEqual(expected_data_return.members)  
    expect(response.body.data.group.name).toEqual(expected_data_return.name)  

  })

})




// Assuming you're using a testing framework like Jest

// Import necessary dependencies and modules


describe("getGroups", () => {
  let req;

  beforeEach(async () => {
    req = {
      cookies: {
        accessToken: regularAccessToken,
        refreshToken: regularRefreshToken
      }
    };

    await User.deleteMany();
    await Group.deleteMany();
  });

  test("T1: Verification failed because it is being called by a non-admin -> should return 401 with error 'Unauthorized'", async () => {
    const response = await request(app)
      .get("/api/groups")
      .set("Cookie", `accessToken=${req.cookies.accessToken}; refreshToken=${req.cookies.refreshToken}`);

    expect(response.status).toEqual(401);
    expect(response.body.error).toEqual("Unauthorized access, not an Admin");
  });

  test("T2: Verification passed -> should return 200 with the data for all groups", async () => {
    req = {
      cookies: {
        accessToken: AdminAccessToken, // Replace with the actual admin access token
        refreshToken: AdminRefreshToken // Replace with the actual admin refresh token
      }
    };
  
    const groupsInDB = [
      { name: "Group A", members: [] },
      { name: "Group B", members: [] },
      { name: "Group C", members: [] }
    ];
  
    const expectedRetData = [
      { name: "Group A", members: [] },
      { name: "Group B", members: [] },
      { name: "Group C", members: [] }
    ];
  
    await Group.create(groupsInDB);
  
    const response = await request(app)
      .get("/api/groups")
      .set("Cookie", `accessToken=${req.cookies.accessToken}; refreshToken=${req.cookies.refreshToken}`);
  
    expect(response.status).toEqual(200);
    expect(response.body.data).toContainEqual(expect.objectContaining({ name: "Group A", members: [] }));
    expect(response.body.data).toContainEqual(expect.objectContaining({ name: "Group B", members: [] }));
    expect(response.body.data).toContainEqual(expect.objectContaining({ name: "Group C", members: [] }));
  });
  });





describe("getGroup", () => {

  let Req
    beforeEach(async() => {
        Req = {
            params: {name: "GroupName"},
            cookies: {accessToken: regularAccessToken,
            refreshToken: regularRefreshToken}
        };

        await User.deleteMany()
        await categories.deleteMany()
        await transactions.deleteMany()
        await Group.deleteMany()

    })

    test("T1: Group name not associated to any group in the DB -> should return 400 with error 'Group name does not exist' ", async () => {
      Req = {
        params: {name: "GroupName"},
        cookies: {accessToken: regularAccessToken,
        refreshToken: regularRefreshToken}
      };
        
      const response = await request(app).get(`/api/groups/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(400)
      expect(response.body.error).toEqual("Group name does not exist")  
    })

      //All tests starting with T2 refer to cases where the group was found in the DB
    test("T2.1: User is in the group -> should return 200 with the found Group ", async () => {
      Req = {
        params: {name: "utilities"},
        cookies: {accessToken: regularAccessToken,
        refreshToken: regularRefreshToken}
      };
      const group_in_DB = {
        name: 'utilities', 
        members: [
           {email: 'john@example.com'},
           {email: 'mike@example.com'}
          ]
      }
      await Group.create(group_in_DB)

      const response = await request(app).get(`/api/groups/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(200)
      expect(response.body.data.group).toEqual(group_in_DB)
    })

    test("T2.2: User is not in the group, and not an Admin -> should return 400 with error 'Group name does not exist' ", async () => {
      Req = {
        params: {name: "groceries"},
        cookies: {accessToken: regularAccessToken,
        refreshToken: regularRefreshToken}
      };
      const group_in_DB = {
        name: 'groceries', 
        members: [
           {email: 'sarah@example.com'}, //Tokens have john@example.com as an email, so the user is not in the group
           {email: 'mike@example.com'}
          ]
      }
      await Group.create(group_in_DB)

      const response = await request(app).get(`/api/groups/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(401)
      expect(response.body.error).toEqual("Unauthorized access, not an Admin")
    })

    test("T2.3: User is not in the group, but Admin -> should return 200 with the found Group ", async () => {
      Req = {
        params: {name: "fuel"},
        cookies: {accessToken: AdminAccessToken,
        refreshToken: AdminRefreshToken}
      };
      const group_in_DB = {
        name: 'fuel', 
        members: [
           {email: 'sarah@example.com'},
           {email: 'mike@example.com'}
          ]
      }
      await Group.create(group_in_DB)

      const response = await request(app).get(`/api/groups/${Req.params.name}`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
      expect(response.status).toEqual(200)
      expect(response.body.data.group).toEqual(group_in_DB)
    })

  
 })




describe("addToGroup", () => {

  let Req
  beforeEach(async() => {
      Req = {
        body: {
          emails: [
            "john@example.com",
            "sarah@example.com",
          ]
        },
        params: {
          name: "groupName",
        },
        cookies: {
          accessToken: regularAccessToken, refreshToken: regularRefreshToken,
        },
      };

      await User.deleteMany()
      await categories.deleteMany()
      await transactions.deleteMany()
      await Group.deleteMany()
  })

  // T1 tests : User route
  test("T1.1 : Group does not exist in DB -> 400 'Group name does not exist'", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com",
          "sarah@example.com",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    
    const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Group name does not exist")  
  })


  test(" T1.2 : Verification for 'Group' failed -> 401 'Unauthorized'", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com",
          "sarah@example.com",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(401)
    expect(response.body.error).toEqual("Unauthorized access, not in a group")  
  })


  test(" T1.3.1 : Email body is missing -> 400 'Missing attribute'", async () => {
    Req = {
      body: {
        emails: undefined
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: "groupName",
      members: [
        {email: "john@example.com", id:"idOne"},
        {email: "paul@example.com", id:"idTwo"},
        {email: "luke@example.com", id:"idThree"}
      ]
    };
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Missing attribute")  
  })


  test(" T1.3.2 : Email body is empty -> 400 'Missing attribute'", async () => {
    Req = {
      body: {
        emails: []
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: "groupName",
      members: [
        {email: "john@example.com", id:"idOne"},
        {email: "paul@example.com", id:"idTwo"},
        {email: "luke@example.com", id:"idThree"}
      ]
    };
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Missing attribute")  
  })


  test(" T1.4 : Empty email ->  400 'At least one email is empty'", async () => {
    Req = {
      body: {
        emails: [
        "john@example.com",
        "",]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: "groupName",
      members: [
        {email: "john@example.com", id:"idOne"},
        {email: "paul@example.com", id:"idTwo"},
        {email: "luke@example.com", id:"idThree"}
      ]
    };
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("At least one email is empty")  
  })
 


 test(" T1.5 : Invalid email ->  400 'Invalid email: ${email}'", async () => {
  Req = {
    body: {
      emails: [
      "john@example.com",
      "invalidEmail@com",]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: regularAccessToken, refreshToken: regularRefreshToken,
    },
  };
  const group_in_DB = {
    name: "groupName",
    members: [
      {email: "john@example.com", id:"idOne"},
      {email: "paul@example.com", id:"idTwo"},
      {email: "luke@example.com", id:"idThree"}
    ]
  };
  await Group.create(group_in_DB)
  const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual(`Invalid email: ${Req.body.emails[1]}`)  
})


test(" T1.6.1 : All emails not in DB ->  400 `All the provided emails represent users that are already in a group or do not exist in the database`", async () => {
  Req = {
    body: {
      emails: [
      "john@example.com",
      "sarah@example.com",]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: regularAccessToken, refreshToken: regularRefreshToken,
    },
  };
  const group_in_DB = {
    name: "groupName",
    members: [
      {email: "john@example.com", id:"idOne"},
      {email: "paul@example.com", id:"idTwo"},
      {email: "luke@example.com", id:"idThree"}
    ]
  };
  await Group.create(group_in_DB)
  const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual(`All the provided emails represent users that are already in a group or do not exist in the database`)  
})


test(" T1.6.2 : All emails already grouped ->  400 `All the provided emails represent users that are already in a group or do not exist in the database`", async () => {
  Req = {
    body: {
      emails: [
      "john@example.com",
      "sarah@example.com",]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: regularAccessToken, refreshToken: regularRefreshToken,
    },
  };
  const group_in_DB = {
    name: "groupName",
    members: [
      {email: "john@example.com", id:"idOne"},
      {email: "sarah@example.com", id:"idTwo"},
      {email: "luke@example.com", id:"idThree"}
    ]
  };
  await Group.create(group_in_DB)

  const Users_in_DB = [
    {username: "luke", email: "luke@example.com", password: "pass123", role: "Regular"},
    {username: "john", email: "john@example.com", password: 'king_john', role: 'Regular'},
    {username: "sarah", email: "sarah4@gamil.com", password: "sarah11", role: 'Regular'}
  ]
  await User.create(Users_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual(`All the provided emails represent users that are already in a group or do not exist in the database`)  
})


test(" T1.7.1 : Users added succesfully -USER ROUTE- -> 200", async () => {
  Req = {
    body: {
      emails: [
      "john@example.com",
      "sarah@example.com",
      "mike@example.com",
      ]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: regularAccessToken, refreshToken: regularRefreshToken,
    },
  };
  const group_in_DB = {
    name: "groupName",
    members: [
      {email: "mike@example.com", id:"idOne"},
      {email: "david@example.com", id:"idTwo"},
      {email: "luke@example.com", id:"idThree"},
      {email: "john@example.com", id:"idFour"}
    ]
  };
  await Group.create(group_in_DB)

  const Users_in_DB = [
    {username: "luke", email: "luke@example.com", password: "pass123", role: "Regular"},
    {username: "john", email: "john@example.com", password: 'king_john', role: "Regular"},
    {username: "sarah", email: "sarah@example.com", password: "sarah11", role: "Regular"},
    {username: "mike", email: "mike@example.com", password: "mike334", role: "Regular"},
    {username: "david", email: "david@example.com", password: "david334", role: "Regular"}
  ]
  await User.create(Users_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(200)
  expect(response.body.data.group.name).toEqual(Req.params.name)
  const already_in_group = [{email: "john@example.com"}, {email: "mike@example.com"}]
  expect(response.body.data.alreadyInGroup[0]).toEqual(already_in_group[0]) 
  expect(response.body.data.alreadyInGroup[1]).toEqual(already_in_group[1])
  const updated_group_in_DB = {
    name: "groupName",
    members: [
      {email: "sarah@example.com"},
      {email: "mike@example.com"},
      {email: "david@example.com"},
      {email: "luke@example.com"},
      {email: "john@example.com"}
    ]
  };  
  expect(response.body.data.group.members).toEqual(updated_group_in_DB.members) 
  expect(response.body.data.group.name).toEqual(updated_group_in_DB.name) 
})


test(" T1.7.2 : Users added succesfully + Not Found -USER ROUTE- -> 200", async () => {
  Req = {
    body: {
      emails: [
      "john@example.com",
      "sarah@example.com",
      "mike@example.com",
      "lorenzo@examle.com"]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: regularAccessToken, refreshToken: regularRefreshToken,
    },
  };
  const group_in_DB = {
    name: "groupName",
    members: [
      {email: "mike@example.com", id:"idOne"},
      {email: "david@example.com", id:"idTwo"},
      {email: "luke@example.com", id:"idThree"},
      {email: "john@example.com", id:"idFour"}
    ]
  };
  await Group.create(group_in_DB)

  const Users_in_DB = [
    {username: "luke", email: "luke@example.com", password: "pass123", role: "Regular"},
    {username: "john", email: "john@example.com", password: 'king_john', role: "Regular"},
    {username: "sarah", email: "sarah@example.com", password: "sarah11", role: "Regular"},
    {username: "mike", email: "mike@example.com", password: "mike334", role: "Regular"},
    {username: "david", email: "david@example.com", password: "david334", role: "Regular"}
  ]
  await User.create(Users_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/add`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(200)
  expect(response.body.data.group.name).toEqual(Req.params.name)
  const already_in_group = [{email: "john@example.com"}, {email: "mike@example.com"}]
  expect(response.body.data.alreadyInGroup[0]).toEqual(already_in_group[0]) 
  expect(response.body.data.alreadyInGroup[1]).toEqual(already_in_group[1])
  const updated_group_in_DB = {
    name: "groupName",
    members: [
      {email: "sarah@example.com"},
      {email: "mike@example.com"},
      {email: "david@example.com"},
      {email: "luke@example.com"},
      {email: "john@example.com"}
    ]
  };  
  expect(response.body.data.group.members).toEqual(updated_group_in_DB.members) 
  expect(response.body.data.group.name).toEqual(updated_group_in_DB.name) 
  const members_not_found = {email: "lorenzo@examle.com"}
  expect(response.body.data.membersNotFound[0]).toEqual(members_not_found) 

})

// T2 tests : Admin route
test(" T2.1 : Verification for 'Admin' failed -> 401 'Unauthorized'", async () => {
  Req = {
    body: {
      emails: [
      "john@example.com",
      "sarah@example.com"
    ]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: regularAccessToken, refreshToken: regularRefreshToken,
    },
  };
  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(401)
  expect(response.body.error).toEqual("Unauthorized access, not an Admin")
})


test(" T2.2 : Group does not exist in DB -> 400 'Group name does not exist'", async () => {
  Req = {
    body: {
      emails: [
      "john@example.com",
      "sarah@example.com"
    ]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
    },
  };
  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual("Group name does not exist")
})


test(" T2.3.1 : Email body is missing -> 400 'Missing attribute'", async () => {
  Req = {
    body: {
      emails: undefined
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
    },
  };
  const group_in_DB = {
    name: Req.params.name, 
    members: [
       {email: 'john@example.com'},
       {email: 'mike@example.com'}
      ]
  }
  await Group.create(group_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual("Missing attribute")
})


test(" T2.3.2 : Email body is empty -> 400 'Missing attribute'", async () => {
  Req = {
    body: {
      emails: []
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
    },
  };
  const group_in_DB = {
    name: Req.params.name, 
    members: [
       {email: 'john@example.com'},
       {email: 'mike@example.com'}
      ]
  }
  await Group.create(group_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual("Missing attribute")
})


test(" T2.4 : Empty email ->  400 'At least one email is empty'", async () => {
  Req = {
    body: {
      emails: [
        "john@example.com",
        "",
      ]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
    },
  };
  const group_in_DB = {
    name: Req.params.name, 
    members: [
       {email: 'john@example.com'},
       {email: 'mike@example.com'}
      ]
  }
  await Group.create(group_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual("At least one email is empty")
})


test(" T2.5 : Invalid email ->  400 'Invalid email: ${email}'", async () => {
  Req = {
    body: {
      emails: [
        "john@example.com",
        "invalidEmail@com",
      ]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
    },
  };
  const group_in_DB = {
    name: Req.params.name, 
    members: [
       {email: 'john@example.com'},
       {email: 'mike@example.com'}
      ]
  }
  await Group.create(group_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual(`Invalid email: ${Req.body.emails[1]}`)
})


test(" T2.6.1 : All emails not in DB ->  400 `All the provided emails represent users that are already in a group or do not exist in the database`", async () => {
  Req = {
    body: {
      emails: [
        "john@example.com",
        "sarah@example.com",
      ]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
    },
  };
  const group_in_DB = {
    name: Req.params.name, 
    members: [
       {email: 'john@example.com'},
       {email: 'mike@example.com'}
      ]
  }
  await Group.create(group_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual(`All the provided emails represent users that are already in a group or do not exist in the database`)
})


test(" T2.6.2 : All emails already grouped ->  400 `All the provided emails represent users that are already in a group or do not exist in the database`", async () => {
  Req = {
    body: {
      emails: [
        "john@example.com",
        "sarah@example.com",
      ]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
    },
  };

  const Users_in_DB = [
    {username: "mike", email: "mike@example.com", password: "pass123", role: "Regular"},
    {username: "john", email: "john@example.com", password: 'king_john', role: 'Admin'},
    {username: "sarah", email: "sarah4@gamil.com", password: "sarah11", role: 'Regular'}
  ]
  await User.create(Users_in_DB)
  const group_in_DB = {
    name: Req.params.name, 
    members: [
       {email: 'john@example.com'},
       {email: 'mike@example.com'}
      ]
  }
  await Group.create(group_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(400)
  expect(response.body.error).toEqual(`All the provided emails represent users that are already in a group or do not exist in the database`)
})


test(" T2.7.1 : Users added succesfully -USER ROUTE- -> 200", async () => {
  Req = {
    body: {
      emails: [
        "john@example.com",
        "sarah@example.com",
      ]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
    },
  };

  const Users_in_DB = [
    {username: "mike", email: "mike@example.com", password: "pass123", role: "Regular"},
    {username: "john", email: "john@example.com", password: 'king_john', role: 'Admin'},
    {username: "sarah", email: "sarah@example.com", password: "sarah11", role: 'Regular'},
    {username: "luke", email: "luke@example.com", password: 'luke557', role: 'Regular'},
    {username: "paul", email: "paul@example.com", password: "paul121", role: 'Regular'}
  ]
  await User.create(Users_in_DB)
  const group_in_DB = {
    name: Req.params.name, 
    members: [
       {email: 'luke@example.com'},
       {email: 'mike@example.com'},
       {email: 'paul@example.com'}
      ]
  }
  await Group.create(group_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(200)
  expect(response.body.data.group.name).toEqual(Req.params.name)
  expect(response.body.data.alreadyInGroup).toEqual([]) 
  const updated_group_in_DB = {
    name: "groupName",
    members: [
      {email: "john@example.com"},
      {email: "sarah@example.com"},
      {email: "luke@example.com"},
      {email: "mike@example.com"},
      {email: "paul@example.com"},
    ]
  };  
  expect(response.body.data.group.members).toEqual(updated_group_in_DB.members) 
  expect(response.body.data.group.name).toEqual(updated_group_in_DB.name) 
  expect(response.body.data.membersNotFound).toEqual([])
})


test(" T2.7.2 : Users added succesfully + Not Found -USER ROUTE- -> 200", async () => {
  Req = {
    body: {
      emails: [
        "john@example.com",
        "sarah@example.com",
        "lorenzo@example.com",
        "mike@example.com"
      ]
    },
    params: {
      name: "groupName",
    },
    cookies: {
      accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
    },
  };

  const Users_in_DB = [
    {username: "mike", email: "mike@example.com", password: "pass123", role: "Regular"},
    {username: "john", email: "john@example.com", password: 'king_john', role: 'Admin'},
    {username: "sarah", email: "sarah@example.com", password: "sarah11", role: 'Regular'},
    {username: "luke", email: "luke@example.com", password: 'luke557', role: 'Regular'},
    {username: "paul", email: "paul@example.com", password: "paul121", role: 'Regular'}
  ]
  await User.create(Users_in_DB)
  const group_in_DB = {
    name: Req.params.name, 
    members: [
       {email: 'luke@example.com'},
       {email: 'mike@example.com'},
       {email: 'paul@example.com'}
      ]
  }
  await Group.create(group_in_DB)

  const response = await request(app).patch(`/api/groups/${Req.params.name}/insert`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  .send(Req.body)

  expect(response.status).toEqual(200)
  expect(response.body.data.group.name).toEqual(Req.params.name)
  const already_in_group = {email: "mike@example.com"}
  expect(response.body.data.alreadyInGroup[0]).toEqual(already_in_group) 
  const updated_group_in_DB = {
    name: "groupName",
    members: [
      {email: "john@example.com"},
      {email: "sarah@example.com"},
      {email: "luke@example.com"},
      {email: "mike@example.com"},
      {email: "paul@example.com"},
    ]
  };  
  expect(response.body.data.group.members).toEqual(updated_group_in_DB.members) 
  expect(response.body.data.group.name).toEqual(updated_group_in_DB.name) 
  const members_not_found = {email: "lorenzo@example.com"}
  expect(response.body.data.membersNotFound[0]).toEqual(members_not_found)
})


})




describe("removeFromGroup", () => {

  let Req
  beforeEach(async() => {
      Req = {
        body: {
          emails: [
            "john@example.com",
            "sarah@example.com",
          ]
        },
        cookies: {
          accessToken: regularAccessToken, refreshToken: regularRefreshToken,
        },
      };

      await User.deleteMany()
      await categories.deleteMany()
      await transactions.deleteMany()
      await Group.deleteMany()

  })

    //Can't send empty params
  // T1 tests : User route
  // test("T1.1.1 : Name parameter is missing -> 400 'Missing attribute' ", async () => {
  //   Req = {
  //     body: {
  //       emails: [
  //         "john@example.com",
  //         "sarah@example.com",
  //       ]
  //     },
  //     params: {
  //       name: undefined,
  //     },
  //     cookies: {
  //       accessToken: regularAccessToken, refreshToken: regularRefreshToken,
  //     },
  //   };
  //   console.log(Req.params.name)
  //   const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  //   .send(Req.body)

  //   expect(response.status).toEqual(400)
  //   expect(response.body.error).toEqual("Missing attribute")  
  // })

  test("T1.1.2 : Email body is missing -> 400 'Missing attribute' ", async () => {
    Req = {
      body: {
        emails: undefined
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [
         {email: 'john@example.com'},
         {email: 'mike@example.com'}
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Missing attribute")  
  })
  
  test("T1.1.3 : Email body is empty -> 400 'Missing attribute' ", async () => {
    Req = {
      body: {
        emails: []
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [
         {email: 'john@example.com'},
         {email: 'mike@example.com'}
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Missing attribute")  
  })

  test("T1.2 : Group does not exist in DB -> 400 'Group name does not exist' ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com",
          "sarah@example.com",
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    
    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Group name does not exist")  
  })


  test("T1.3 : Verification for 'Group' failed -> 401 'Unauthorized access, not in a group' ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "sarah@example.com",
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [           //the tokens email is john@example.com, doesn't exist in members
         {email: 'mike@example.com'},
         {email: 'sarah@example.com'}
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(401)
    expect(response.body.error).toEqual("Unauthorized access, not in a group")  
  })


  test("T1.4 : Only one member -> 400 'The group contains only one member'", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "sarah@example.com",
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [           
         {email: 'john@example.com'},
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("The group contains only one member")  
  })


  test("T1.5: Empty email ->  400 'At least one email is empty'", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "",
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [           
         {email: 'john@example.com'},
         {email: 'sarah@example.com'}
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("At least one email is empty")  
  })


  test("T1.6 : Invalid email ->  400 'Invalid email: ${email}'", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "invalidEmail@",
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [           
         {email: 'john@example.com'},
         {email: 'sarah@example.com'}
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`Invalid email: ${Req.body.emails[1]}`)  
  })


  test("T1.7.1 : All emails not members ->  400 'All the provided emails represent users that do not belong to the group or do not exist in the database'", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "sarah@example.com",
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    
    const group_in_DB = {
      name: Req.params.name, 
      members: [           
         {email: 'john@example.com'},
         {email: 'david@example.com'}
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("All the provided emails represent users that do not belong to the group or do not exist in the database")  
  })


  test("T1.7.2 : All emails not in DB ->  400 'All the provided emails represent users that do not belong to the group or do not exist in the database'", async () => {
    Req = {
      body: {
        emails: [
          "mike@example.com", 
          "sarah@example.com",
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [           
         {email: 'john@example.com'},
         {email: 'david@example.com'}
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("All the provided emails represent users that do not belong to the group or do not exist in the database")  
  })

  // T1.8 : Status 200
  test(" T1.8.1 : Not all the users are deleted ->  200 ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "sarah@example.com",
          "paul@example.com",
          "luke@example.com"
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const users_in_DB = [
      {username: "john", email: "john@example.com", password: "john123", role: "Regular"},
      {username: "sarah", email: "sarah@example.com", password: "sarah123", role: "Regular"},
      {username: "paul", email: "paul@example.com", password: "paul123", role: "Regular"},
      {username: "luke", email: "luke@example.com", password: "luke123", role: "Regular"},
    ]
    await User.create(users_in_DB)
    const group_in_DB = {
      name: Req.params.name, 
      members: [           
         {email: 'john@example.com'},
         {email: 'sarah@example.com'},
         {email: "paul@example.com"},
         {email: "luke@example.com"}
        ]
    }
    await Group.create(group_in_DB)

    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(200)
    expect(response.body.data.group.members[0].email).toEqual(group_in_DB.members[0].email)  
    expect(response.body.data.group.name).toEqual(Req.params.name)  
  })


  test("T1.8.2 : User removed succesfully -USER ROUTE- ->  200 ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "sarah@example.com",
          "paul@example.it",
          "luke@example.com"
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const users_in_DB = [
      {username: "john", email: "john@example.com", password: "john123", role: "Regular"},
      {username: "sarah", email: "sarah@example.com", password: "sarah123", role: "Regular"},
      {username: "paul", email: "paul@example.com", password: "paul123", role: "Regular"},
      {username: "luke", email: "luke@example.com", password: "luke123", role: "Regular"},
      {username: "david", email: "david@example.com", password: "david123", role: "Regular"},
    ]
    await User.create(users_in_DB)
    const group_in_DB = {
      name: Req.params.name, 
      members: [           
         {email: 'john@example.com'},
         {email: 'sarah@example.com'},
         {email: "david@example.it"}
        ]
    }
    await Group.create(group_in_DB)

    const response = await request(app).patch(`/api/groups/${Req.params.name}/remove`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(200)
    expect(response.body.data.group.members[0].email).toEqual("david@example.it")  
    expect(response.body.data.group.name).toEqual(Req.params.name) 
    const expexted_membersNotFound = {}
    expect(response.body.data.membersNotFound[0].email).toEqual("paul@example.it")  
    expect(response.body.data.notInGroup[0].email).toEqual("luke@example.com")  

  })


  test("T2.1 : Verification for 'Admin' failed -> 401 'Unauthorized'", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "sarah@example.com",
        ]
      },
      params: {
        name: 'utilities',
      },
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };

    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(401)
    expect(response.body.error).toEqual("Unauthorized access, not an Admin")  
  })


      //req params cannot be empty or undefined
  // test(" T2.2.1 : Name parameter is missing -> 400 'Missing attribute' ", async () => {
  //   Req = {
  //     body: {
  //       emails: [
  //         "john@example.com", 
  //         "sarah@example.com",
  //       ]
  //     },
  //     params: {
  //       name: undefined,
  //     },
  //     cookies: {
  //       accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
  //     },
  //   };

  //   const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
  //   .send(Req.body)

  //   expect(response.status).toEqual(400)
  //   expect(response.body.error).toEqual("Missing attribute")  
  // })


  test(" T2.2.2 : Email body is missing -> 400 'Missing attribute' ", async () => {
    Req = {
      body: {
        emails: undefined
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };

    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Missing attribute")  
  })


  test(" T2.2.3 : Email body is empty -> 400 'Missing attribute' ", async () => {
    Req = {
      body: {
        emails: []
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };

    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Missing attribute")  
  })


  test(" T2.3 : Group does not exist in DB -> 400 'Group name does not exist' ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com",
          "sarah@example.com",
        ]
      },
      params: {
        name: "utilities",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };

    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("Group name does not exist")  
  })


  test(" T2.4 : Only one member -> 400 'The group contains only one member' ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com",
          "sarah@example.com",
        ]
      },
      params: {
        name: "utilities",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [
         {email: 'sarah@example.com'},
        ]
    }
    await Group.create(group_in_DB);
    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("The group contains only one member")  
  })


  test(" T2.5 : Empty email ->  400 'At least one email is empty' ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com",
          "",
        ]
      },
      params: {
        name: "utilities",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [
         {email: 'sarah@example.com'},
         {email: "paul@example.it"},
         {email: "luke@example.it"}
        ]
    }
    await Group.create(group_in_DB);
    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual("At least one email is empty")  
  })


  test(" T2.6 : Invalid email ->  400 'Invalid email: ${email}'  ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com",
          "invalidEmail@",
        ]
      },
      params: {
        name: "utilities",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [
         {email: 'sarah@example.com'},
         {email: "paul@example.it"},
         {email: "luke@example.it"}
        ]
    }
    await Group.create(group_in_DB);
    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`Invalid email: ${Req.body.emails[1]}`)  
  })


  test("  T2.7.1 : All emails not members ->  400 'All the provided emails represent users that do not belong to the group or do not exist in the database'  ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com",
          "sarah@example.com",
        ]
      },
      params: {
        name: "utilities",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [
         {email: 'mike@example.com'},
         {email: "paul@example.it"},
         {email: "luke@example.it"}
        ]
    }
    await Group.create(group_in_DB);
    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`All the provided emails represent users that do not belong to the group or do not exist in the database`)  
  })


  test("  T2.7.2 : All emails not in DB ->  400 'All the provided emails represent users that do not belong to the group or do not exist in the database'  ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com",
          "sarah@example.com",
        ]
      },
      params: {
        name: "utilities",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.params.name, 
      members: [
         {email: 'john@example.com'},
         {email: "sarah@example.it"},
         {email: "luke@example.it"}
        ]
    }
    await Group.create(group_in_DB);
    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`All the provided emails represent users that do not belong to the group or do not exist in the database`)  
  })

  // T2.8 : status 200
  test(" T2.8.1 : Not all the users are deleted ->  200 ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "sarah@example.com",
          "paul@example.com",
          "luke@example.com"
        ]
      },
      params: {
        name: "utilities",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const users_in_DB = [
      {username: "john", email: "john@example.com", password: "john123", role: "Regular"},
      {username: "sarah", email: "sarah@example.com", password: "sarah123", role: "Regular"},
      {username: "paul", email: "paul@example.com", password: "paul123", role: "Regular"},
      {username: "luke", email: "luke@example.com", password: "luke123", role: "Regular"},
    ]
    await User.create(users_in_DB)
    const group_in_DB = {
      name: Req.params.name, 
      members: [           
         {email: 'john@example.com'},
         {email: 'sarah@example.com'},
         {email: "paul@example.com"},
         {email: "luke@example.com"}
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(200)
    expect(response.body.data.group.members[0].email).toEqual(group_in_DB.members[0].email)  
    expect(response.body.data.group.name).toEqual(Req.params.name)  
  })


  test(" T2.8.2 : User removed succesfully -ADMIN ROUTE- ->  200  ", async () => {
    Req = {
      body: {
        emails: [
          "john@example.com", 
          "sarah@example.com",
          "paul@example.it",
          "luke@example.com"
        ]
      },
      params: {
        name: "utilities",
      },
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const users_in_DB = [
      {username: "john", email: "john@example.com", password: "john123", role: "Regular"},
      {username: "sarah", email: "sarah@example.com", password: "sarah123", role: "Regular"},
      {username: "paul", email: "paul@example.com", password: "paul123", role: "Regular"},
      {username: "luke", email: "luke@example.com", password: "luke123", role: "Regular"},
      {username: "david", email: "david@example.com", password: "david123", role: "Regular"},
    ]
    await User.create(users_in_DB)
    const group_in_DB = {
      name: Req.params.name, 
      members: [           
        {email: 'john@example.com'},
        {email: 'sarah@example.com'},
        {email: "david@example.it"}
        ]
    }
    await Group.create(group_in_DB)
    const response = await request(app).patch(`/api/groups/${Req.params.name}/pull`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(200)
    expect(response.body.data.group.members[0].email).toEqual("david@example.it")  
    expect(response.body.data.group.name).toEqual(Req.params.name)  
    expect(response.body.data.membersNotFound[0].email).toEqual("paul@example.it")  
    expect(response.body.data.notInGroup[0].email).toEqual("luke@example.com")  
  })

 })




describe("deleteUser", () => {
  let Req
  beforeEach(async() => {
      Req = {
        body: {email: 'john@example.com'},
        params: {},
        cookies: {
          accessToken: regularAccessToken, refreshToken: regularRefreshToken,
        },
      };

      await User.deleteMany()
      await categories.deleteMany()
      await transactions.deleteMany()
      await Group.deleteMany()

  })

  test("T1: Not admin -> 401 and error 'Unauthorized access, not an Admin' ", async () => {
    Req = {
      body: {email: 'john@example.com'},
      params: {},
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const response = await request(app).delete(`/api/users`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(401)
    expect(response.body.error).toEqual(`Unauthorized access, not an Admin`)  
  })

    //All tests starting with T2 refer to admin check passed
  test("T2.1.1: email attribute missing -> 400 and error 'Missing attribute' ", async () => {
    Req = {
      body: {},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const response = await request(app).delete(`/api/users`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`Missing attribute`)  
  })


  test("T2.1.2: email attribute is an empty string -> 400 and error 'Email is empty' ", async () => {
    Req = {
      body: {email: '  '},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const response = await request(app).delete(`/api/users`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`Email is empty`)  
  })


  test("T2.1.3: email attribute has invalid format -> 400 and error 'Invalid email: invalidEmail@com' ", async () => {
    Req = {
      body: {email: 'invalidEmail@com'},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const response = await request(app).delete(`/api/users`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`Invalid email: ${Req.body.email}`)  
  })


  test("T2.2: The user associated to the email doesn't exist in the DB -> 400 and error 'The email passed in the request body does not represent a user in the database' ", async () => {
    Req = {
      body: {email: 'mike@example.com'},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const response = await request(app).delete(`/api/users`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`The email passed in the request body does not represent a user in the database`)  
  })


  //T2.3 refer to not empty email, valid format and exists in the DB
  test("T2.3.1: email belongs to an admin -> 400 and error 'The email passed in the request body represents an admin' ", async () => {
    Req = {
      body: {email: 'mike@example.com'},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const user_in_DB = {username: "mike", email: "mike@example.com", password: "pass123", role: "Admin"}
    await User.create(user_in_DB)
    const response = await request(app).delete(`/api/users`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`The email passed in the request body represents an admin`)  
  })


  test("T2.3.2: email doesn't belongs to an admin, and last user in the group -> 200, deletedFromGroup: true, deletedTransaction: 3  ", async () => {
    Req = {
      body: {email: 'mike@example.com'},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };

    const user_in_DB = {username: "mike", email: "mike@example.com", password: "pass123", role: "regular"}
    await User.create(user_in_DB)

    const categories_in_DB = [
      { type: "utilities", color: "#fcbe44" },
      { type: "food", color: "#47D63E" },
      { type: "fuel", color: "#6F94DA" }
    ]
    await categories.create(categories_in_DB)

    const group_in_DB = {
      name: 'family', 
      members: [
         {email: 'mike@example.com'}
        ]
    }
    await Group.create(group_in_DB)
    const transactions_in_DB = [
      { username: "mike", type: "utilities", amount: 80, date: "2021" },
      { username: "john", type: "food", amount: 45, date: "2022" },
      { username: "mike", type: "fuel", amount: 100, date: "2023" },
      { username: "mike", type: "food", amount: 100, date: "2023" },
    ]
    await transactions.create(transactions_in_DB)
  
    
    const response = await request(app).delete(`/api/users`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(200)
    expect(response.body.data.deletedFromGroup).toEqual(true)  
    expect(response.body.data.deletedTransactions).toEqual(3)  //because mike had 3 transactions only

  })


  test("T2.3.3: email doesn't belongs to an admin, not last user in the group -> 200, deletedFromGroup: false, deletedTransaction: 3  ", async () => {
    Req = {
      body: {email: 'mike@example.com'},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };

    const user_in_DB = {username: "mike", email: "mike@example.com", password: "pass123", role: "regular"}
    await User.create(user_in_DB)

    const categories_in_DB = [
      { type: "utilities", color: "#fcbe44" },
      { type: "food", color: "#47D63E" },
      { type: "fuel", color: "#6F94DA" }
    ]
    await categories.create(categories_in_DB)

    const group_in_DB = {
      name: 'family', 
      members: [
         {email: 'mike@example.com'},
         {email: 'sarah@example.com'},
         {email: 'david@example.com'}
        ]
    }
    await Group.create(group_in_DB)
    const transactions_in_DB = [
      { username: "mike", type: "utilities", amount: 80, date: "2021" },
      { username: "john", type: "food", amount: 45, date: "2022" },
      { username: "mike", type: "fuel", amount: 100, date: "2023" },
      { username: "mike", type: "food", amount: 100, date: "2023" },
    ]
    await transactions.create(transactions_in_DB)
  
    
    const response = await request(app).delete(`/api/users`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(200)
    expect(response.body.data.deletedFromGroup).toEqual(true)  
    expect(response.body.data.deletedTransactions).toEqual(3)  //because mike had 3 transactions only

  })
 })



 
describe("deleteGroup", () => {

  let Req
  beforeEach(async() => {
      Req = {
        body: {name: 'family'},
        params: {},
        cookies: {
          accessToken: regularAccessToken, refreshToken: regularRefreshToken,
        },
      };

      await User.deleteMany()
      await categories.deleteMany()
      await transactions.deleteMany()
      await Group.deleteMany()

  })

  test("deleteGroup T1: Not admin -> 401 and error 'Unauthorized access, not an Admin' ", async () => {
    Req = {
      body: {name: 'family'},
      params: {},
      cookies: {
        accessToken: regularAccessToken, refreshToken: regularRefreshToken,
      },
    };
    const response = await request(app).delete(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(401)
    expect(response.body.error).toEqual(`Unauthorized access, not an Admin`)  
  })

  //T2 refers to admin check passed
  test("deleteGroup T2.1: name attribute is missing -> 400 and error 'Missing attribute' ", async () => {
    Req = {
      body: {},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const response = await request(app).delete(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`Missing attribute`)  
  })


  test("deleteGroup T2.2: name attribute is an empty string -> 400 and error 'Group name is empty' ", async () => {
    Req = {
      body: {name: '   '},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const response = await request(app).delete(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`Group name is empty`)  
  })

  test("deleteGroup T2.3: Group associated to the req.body name doesn't exist in the DB -> 400 and error 'Group name does not exist' ", async () => {
    Req = {
      body: {name: 'family'},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const response = await request(app).delete(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(400)
    expect(response.body.error).toEqual(`Group name does not exist`)  
  })


  test("deleteGroup T2.4: Group associated to the req.body name exists in the DB -> 200 and message 'Group deleted successfully' ", async () => {
    Req = {
      body: {name: 'family'},
      params: {},
      cookies: {
        accessToken: AdminAccessToken, refreshToken: AdminRefreshToken,
      },
    };
    const group_in_DB = {
      name: Req.body.name, 
      members: [
         {email: 'sarah@example.com'},
         {email: 'mike@example.com'}
        ]
    }
    await Group.create(group_in_DB);

    const response = await request(app).delete(`/api/groups`).set('Cookie', `accessToken=${Req.cookies.accessToken}; refreshToken=${Req.cookies.refreshToken}`)
    .send(Req.body)

    expect(response.status).toEqual(200)
    expect(response.body.data.message).toEqual(`Group deleted successfully`)  
  })

 })
