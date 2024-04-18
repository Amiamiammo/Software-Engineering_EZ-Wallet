import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model.js';
import * as moduleApi from '../controllers/utils';
import { verifyAuth } from '../controllers/utils';
import { getUser, getUsers, createGroup, getGroup, addToGroup, getGroups, removeFromGroup, deleteUser, deleteGroup } from '../controllers/users';
import { Group} from "../models/User.js";
import { User } from "../models/User.js";


jest.mock('jsonwebtoken')
jest.mock("bcryptjs")
jest.mock('../models/model');

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */


beforeEach(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
  jest.clearAllMocks();
});
/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
// beforeEach(() => {
//   User.find.mockClear()
//   //additional `mockClear()` must be placed here
// });

describe("getUsers", () => {


  let mockReq;
  let mockRes;

  beforeEach(()=>{
    mockReq = {
        body:{},
        cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {refreshTokenMessage: "Some message"}
    };
  });

  afterEach(()=>{
      jest.clearAllMocks();
  })
  

  test("T1: Verification failed because it is being called by a non admin -> should return 401 with error 'Unauthorized' ", async () => {
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

    await getUsers(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized")
  })


  test("T2: Verification passed -> should return 200 with the data for all users", async () => {
    const returned_Users = [
      {
        username: 'mike',
        email: 'mike@example.com',
        role: 'Regular'
      },
      {
        username: 'john',
        email: 'john@example.com',
        role: 'Admin'
      },
      {
        username: 'sarah',
        email: 'sarah@example.com',
        role: 'Regular'
      }
    ]
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue(returned_Users),
      exec: jest.fn().mockResolvedValue(returned_Users)
    });
    
    await getUsers(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_Users)
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})

  })


  test("T3: Verification passed, User.find throwed an exception -> should return 500 with the error message", async () => {
    
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'find').mockImplementation(() => {throw new Error('Database error');})

    
    await getUsers(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Database error' })
  })

})




describe("getUser", () => { 

  let mockReq;
  let mockRes;

  beforeEach(()=>{
    mockReq = {
        body:{},
        params: {username: 'john'},
        cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {refreshTokenMessage: "Some message"}
    };
  });

  afterEach(()=>{
      jest.clearAllMocks();
  })


  test("T1: Regular user looking for another user -> should return 401 with the error 'Unauthorized'", async () => {
    
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
    
    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Unauthorized' })
  })


  test("T2: Regular user looking for himself, couldn't find match in the DB-> should return 400 with the error 'User not found' ", async () => {
     
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'findOne').mockImplementation(() => false)

    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'User not found' })
  })


  test("T3: Regular user looking for himself, found his match in the DB-> should return 200 with the user's data ", async () => {
     
    const returned_User = {
      username: 'mike',
      email: 'mike@example.com',
      role: 'Regular'
    }
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'findOne').mockImplementation(() => returned_User)

    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_User)
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
  })


  test("T4: Admin looking for another user, no match in the DB -> should return 400 with error message 'User not found' ", async () => {
     
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

    jest.spyOn(User, 'findOne').mockImplementation(() => false)

    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'User not found' })

  })


  test("T5: Admin looking for another user, found in the DB -> should return 200 with found user's data ", async () => {
    const returned_User = {
      username: 'mike',
      email: 'mike@example.com',
      role: 'Regular'
    }
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

    jest.spyOn(User, 'findOne').mockImplementation(() => returned_User)

    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_User)
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
  })


  test("T6: User.findOne throwed an exception -> should return 500 with the error message ", async () => {
     
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'findOne').mockImplementation(() => {throw new Error('Database error');})

    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json.mock.calls[0][0].error).toEqual('Database error')
  })

})




describe("createGroup", () => {
  let mockReq;
  let mockRes;

  beforeEach(()=>{
    mockReq = {
        body:{
          name: 'utilities',
          memberEmails: [
            "john@example.com",
            "sarah@example.com",
          ]},
        cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {refreshTokenMessage: "Some message"}
    };
    
  });

  afterEach(()=>{
      jest.clearAllMocks();
  })


  test("createGroup T1: Verification for 'Simple' failed -> should return 401 with the error 'Unauthorized'", async () => {
    
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
    
    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Unauthorized' })
  })

  // All tests starting with T2 refer to verification passed 
  test("createGroup T2.1.1 : Name parameter is missing -> should return 400 with the error 'Missing attribute'", async () => {
    mockReq = {
      body:{
        memberEmails: [
          "john@example.com",
          "sarah@example.com",
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
  };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing attribute' })
  })
  
  test("createGroup T2.1.2: Name parameter is empty -> should return 400 with the error 'Missing attribute'", async () => {
    mockReq = {
      body:{
        name: "",
        memberEmails: [
          "john@example.com",
          "sarah@example.com",
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing attribute' })
  })

  test("createGroup T2.1.3: Name parameter is just a space -> should return 400 with the error 'Group name cannot be empty'", async () => {
    mockReq = {
      body:{
        name: " ",
        memberEmails: [
          "john@example.com",
          "sarah@example.com",
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Group name cannot be empty' })
  })

  
  test("createGroup T2.2.1: memberEmails parameter is empty -> should return 400 with the error 'Missing attribute'", async () => {
    mockReq = {
      body:{
        name: "utilities",
        memberEmails: []},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing attribute' })
  }) 

  test("createGroup T2.2.2: memberEmails parameter is empty -> should return 400 with the error 'At least one email is empty'", async () => {
    mockReq = {
      body:{
        name: "utilities",
        memberEmails: [
          "",
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };
    const returned_User = {email: "someEmail@gmail.com"}
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => false)
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User)
    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'At least one email is empty' })
  }) 

  // All tests starting with T2.3 refer to authorization passed, and all attributes of the request are correct
  test("createGroup T2.3.1: Group name already exists in the DB -> should return 400 with the error 'Group name already existing'", async () => {
    mockReq = {
      body:{
        name: "utilities",
        memberEmails: [
          "",
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };
    const returned_User = {email: "someEmail@gmail.com"}
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => true)
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User)
    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Group name already existing' })
  }) 

  
  test("createGroup T2.3.2: One member emails has an invalid format -> should return 400 with the error 'Invalid email: invalid_email.com'", async () => {
    mockReq = {
      body:{
        name: "utilities",
        memberEmails: [
          "john@example.com",
          "sarah@example.com",
          "invalid_email.com"
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    const returned_User = {email: "someEmail@gmail.com"}
  
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    Group.findOne = jest.fn(() => (null)).mockReturnValue(false);
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User)
    jest.spyOn(User, 'findOne').mockImplementation(() => {_id: "someID"})

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Invalid email: invalid_email.com' })
  })
 
  //All tests starting with T2.4 refer to authentication passed, and all emails are valid
  test("createGroup T2.4.1: All emails already exist in another group -> should return 400 with the error 'All the provided emails represent users that are already in a group or do not exist in the database'", async () => {
    mockReq = {
      body:{
        name: "utilities",
        memberEmails: [
          "john@example.com",
          "sarah@example.com",
          "mike@example.com"
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    const returned_User = {email: "someEmail@gmail.com"}

    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    Group.findOne = jest.fn(() => (null)).mockReturnValueOnce(false);
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User)
    jest.spyOn(User, 'findOne').mockImplementation(() => {_id: "someID"})
    Group.findOne = jest.fn(() => (null)).mockReturnValueOnce(false);
    Group.findOne = jest.fn(() => (null)).mockReturnValueOnce(false);
    Group.findOne = jest.fn(() => (null)).mockReturnValueOnce(false);

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'All the provided emails represent users that are already in a group or do not exist in the database' })
  })
 
    
  test("createGroup T2.4.2: None of the emails already exists in another group, but the user who called the API is already in a group -> should return 400 with the error 'Calling user already in a group'", async () => {
    mockReq = {
      body:{
        name: "utilities",
        memberEmails: [
          "john@example.com",
          "sarah@example.com",
          "mike@example.com",
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    const callingUserEmail = {email: 'david@example.com'}
    const emailCheck = [{_id: "someID1"}, {_id: "someID2"}, {_id: "someID3"}]
    const verifyAuth_return = {flag: true, cause: "Authorized"}
    jest.spyOn(moduleApi, 'verifyAuth').mockImplementationOnce(() => verifyAuth_return)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false); //Group name doesn't already exist in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(callingUserEmail) //user who called the API already has his email in the list of members

    //inside the for:
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[0]) //First user exists in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[1]) //Second user exists in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[2]) //Third user exists in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[3]) //Fourth user exists in the DB
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) //First email doesn't exist in another group
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) //Second email doesn't exist in another group
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) //Third email doesn't exist in another group
    //jest.spyOn(Group, "findOne").mockResolvedValueOnce(true) //Fourth email exists in another group
    //for end

    jest.spyOn(Group, "findOne").mockImplementationOnce(() => true) //User who called the API is already in a group

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Calling user already in a group' })
  })
 
  
  test("createGroup T2.4.3: 1 of the emails already exists in another group, but the user who called the API is already in a group -> should return 400 with the error 'Calling user already in a group'", async () => {
    mockReq = {
      body:{
        name: "utilities",
        memberEmails: [
          "john@example.com",
          "sarah@example.com",
          "mike@example.com",
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    const callingUserEmail = {email: 'john@example.com'}
    const emailCheck = [{_id: "someID1"}, {_id: "someID2"}, {_id: "someID3"}]
    const verifyAuth_return = {flag: true, cause: "Authorized"}
    jest.spyOn(moduleApi, 'verifyAuth').mockImplementationOnce(() => verifyAuth_return)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false); //Group name doesn't already exist in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(callingUserEmail) //user who called the API already has his email in the list of members
    //inside the for:
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[0]) //First user exists in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[1]) //Second user exists in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[2]) //Third user exists in the DB
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) //First email doesn't exist in another group
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) //Second email doesn't exist in another group
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(true) //Third email already exist in another group
    //for end
    jest.spyOn(Group, "findOne").mockImplementationOnce(() => false) //User who called the API is not in a group
    jest.spyOn(Group, "create").mockImplementationOnce(() => true) //Mocking the create group


    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data.group.name).toEqual(mockReq.body.name)

    //checking for only the first 2 emails because the third one wasn't added
    expect(mockRes.json.mock.calls[0][0].data.group.members[0].email).toEqual(mockReq.body.memberEmails[1])
    expect(mockRes.json.mock.calls[0][0].data.group.members[1].email).toEqual(mockReq.body.memberEmails[0])
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
  })
  

  test("createGroup T2.4.4: None of the emails already exists in another group, and the user who called the API is also not in a group -> should return 200 with name of the created group and list of members", async () => {
    mockReq = {
      body:{
        name: "utilities",
        memberEmails: [
          "john@example.com",
          "sarah@example.com",
          "mike@example.com",
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    const callingUserEmail = {email: 'john@example.com'}
    const emailCheck = [{_id: "someID1"}, {_id: "someID2"}, {_id: "someID3"}]
    const verifyAuth_return = {flag: true, cause: "Authorized"}
    jest.spyOn(moduleApi, 'verifyAuth').mockImplementationOnce(() => verifyAuth_return)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false); //Group name doesn't already exist in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(callingUserEmail) //user who called the API already has his email in the list of members
    //inside the for:
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[0]) //First user exists in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[1]) //Second user exists in the DB
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(emailCheck[2]) //Third user exists in the DB
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) //First email doesn't exist in another group
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) //Second email doesn't exist in another group
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) //Third email doesn't exist in another group
    //for end
    jest.spyOn(Group, "findOne").mockImplementationOnce(() => false) //User who called the API is not in a group
    jest.spyOn(Group, "create").mockImplementationOnce(() => true) 


    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data.group.name).toEqual(mockReq.body.name)
    expect(mockRes.json.mock.calls[0][0].data.group.members[0].email).toEqual(mockReq.body.memberEmails[1])
    expect(mockRes.json.mock.calls[0][0].data.group.members[1].email).toEqual(mockReq.body.memberEmails[2])
    expect(mockRes.json.mock.calls[0][0].data.group.members[2].email).toEqual(mockReq.body.memberEmails[0])
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
  })


  test("createGroup T2.4.5: Group.findOne throws an error -> should return 500 with the error 'Database error'", async () => {
    mockReq = {
      body:{
        name: "utilities",
        memberEmails: [
          "",
        ]},
      cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, 'findOne').mockImplementation(() => {throw new Error('Database error');})
    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json.mock.calls[0][0]).toEqual('Database error')
  }) 
 })




 

 describe('getGroups', () => {
  let mockReq;
  let mockRes;

  beforeEach(()=>{
    mockReq = {
        body:{},
        cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {refreshTokenMessage: "Some message"}
    };
  });

  afterEach(()=>{
      jest.clearAllMocks();
  })
  

  test("T1: Verification failed because it is being called by a non admin -> should return 401 with error 'Unauthorized' ", async () => {
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

    await getGroups(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized")
  })
  test("T2: Verification passed -> should return 200 with the data for all users", async () => {
    const returned = [
      {
        name: "family",
        members: [{ email: "mike@example.com" }, { email: "peter@example.com" }]
      }
    ];
  
    jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({ flag: true, cause: "Authorized" });
    jest.spyOn(Group, "find").mockResolvedValue(returned); // Mock the Group.find operation
  
    await getGroups(mockReq, mockRes);
  
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json.mock.calls[0][0].data).toEqual(returned);
    expect(mockRes.locals).toEqual({ refreshTokenMessage: "Some message" });
  });
  
  test("T3: Verification passed but error occurs -> should return 500 with the error message", async () => {
    const errorMessage = "An error occurred.";
  
    jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({ flag: true, cause: "Authorized" });
    jest.spyOn(Group, "find").mockRejectedValue(new Error(errorMessage)); // Mock the Group.find operation to throw an error
  
    await getGroups(mockReq, mockRes);
  
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
  });
  
  
 });
 



 
describe("getGroup", () => {
  let mockReq;
  let mockRes;

  beforeEach(()=>{
    mockReq = {
        params:{
          name: 'grocery',
          },
        cookies: {accessToken: 'someAccessToken', refreshToken: ''}
    };

    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {refreshTokenMessage: "Some message"}
    };
  });

  afterEach(()=>{
      jest.clearAllMocks();
  })

  test("T1: Group name not associated to any group in the DB -> should return 400 with error 'Group name does not exist' ", async () => {

    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => false)

    await getGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Group name does not exist' })

  })

  //All tests starting with T2 refer to cases where the group was found in the DB
  test("T2.1: User is in the group -> should return 200 with the found Group", async () => {
    const matched_group = {
      name: 'utilities', 
      members: [
         {email: 'john@example.com', user: '6479e86b52b2827ceb04d3f1'},
         {email: 'mike@example.com', user: '7479e86b52b2827ceb04d3f1'}
        ]
    }
    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => matched_group)
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

    await getGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data.group).toEqual(matched_group)
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})

  })

  test("T2.2: User is not in the group, and not an Admin -> should return 400 with error 'Group name does not exist' ", async () => {
    const matched_group = {
      name: 'utilities', 
      members: [
         {email: 'john@example.com', user: '6479e86b52b2827ceb04d3f1'},
         {email: 'mike@example.com', user: '7479e86b52b2827ceb04d3f1'}
        ]
    }
    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => matched_group)
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized access, not an Admin"})

    await getGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Unauthorized access, not an Admin' })

  })

  test("T2.3: User is not in the group, but Admin -> should return 200 with the found Group ", async () => {
    const matched_group = {
      name: 'utilities', 
      members: [
         {email: 'john@example.com', user: '6479e86b52b2827ceb04d3f1'},
         {email: 'mike@example.com', user: '7479e86b52b2827ceb04d3f1'}
        ]
    }
    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => matched_group)
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

    await getGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data.group).toEqual(matched_group)
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
  })

  test("T3: Group.findOne throws an exception -> should return 500 with error message 'Database error' ", async () => {
    
    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => {throw new Error('Database error');})

    await getGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json.mock.calls[0][0]).toEqual('Database error')
  })
 })

 

 
describe('addToGroup', () => {

  beforeEach(() => {
    User.findOne.mockClear()
    Group.findOne.mockClear()
    verifyAuth.mockClear()
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // T1 tests : User route
  test(" T1.1 : Group does not exist in DB -> 400 'Group name does not exist'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(false);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Group name does not exist" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(Group.findOne).toHaveBeenCalled()
  })

  test(" T1.2 : Verification for 'Group' failed -> 401 'Unauthorized'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    verifyAuth.mockReturnValueOnce({flag: false, cause: "Unauthorized access, not in a group"})

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized access, not in a group" });
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(Group.findOne).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
   })

  test(" T1.3.1 : Email body is missing -> 400 'Missing attribute'", async () => { 
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: undefined
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing attribute" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(Group.findOne).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
  })

  test(" T1.3.2 : Email body is empty -> 400 'Missing attribute'", async () => { 
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: []
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing attribute" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(Group.findOne).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
  })

  test(" T1.4 : Empty email ->  400 'At least one email is empty'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "At least one email is empty" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(Group.findOne).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
   })

  test(" T1.5 : Invalid email ->  400 'Invalid email: ${email}'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "invalid@",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: `Invalid email: ${mockReq.body.emails[1]}` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(Group.findOne).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
   })

  test(" T1.6.1 : All emails not in DB ->  400 `All the provided emails represent users that are already in a group or do not exist in the database`", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(User, 'findOne').mockImplementationOnce(false);
    jest.spyOn(User, 'findOne').mockImplementation(false);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: `All the provided emails represent users that are already in a group or do not exist in the database` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(Group.findOne).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
    expect(User.findOne).toHaveBeenCalled();
   })

  test(" T1.6.2 : All emails already grouped ->  400 `All the provided emails represent users that are already in a group or do not exist in the database`", async () => { 
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const returned_Group1 = {
      name: "groupOne",
      members: [
        {email: "some@example.it", id:"idUno"},
        {email: "john@example.com", id:"idDue"},
      ]
    };

    const returned_Group2 = {
      name: "groupDefault",
      members: [
        {email: "default@example.it", id:"idDefault"},
        {email: "sarah@example.com", id:"idDefaultBis"},
      ]
    };

    const returned_User = {email: "john@example.com", _id: "idDue"};

    const defaultReturn = {email: "sarah@example.com", _id: "idDefaultBis"};

    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(User, 'findOne').mockResolvedValue(returned_User);
    jest.spyOn(User, 'findOne').mockResolvedValue(defaultReturn);
    jest.spyOn(Group, "findOne").mockResolvedValue(returned_Group1);
    jest.spyOn(Group, 'findOne').mockResolvedValue(returned_Group2);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: `All the provided emails represent users that are already in a group or do not exist in the database` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(Group.findOne).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOne).toHaveBeenCalled();
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T1.7.1 : Users added succesfully -USER ROUTE- -> 200", async () => { 
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const groupUpdated = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"},
        {email: "john@example.com", id:"idDue"},
        {email: "sarah@example.com", id:"idDefaultBis"}
      ]
    };

    const returned_User = {email: "john@example.com", _id: "idDue"};

    const defaultReturn = {email: "sarah@example.com", _id: "idDefaultBis"};

    jest.spyOn(Group, "findOne").mockReturnValueOnce(group);
    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(User, 'findOne').mockResolvedValue(returned_User);
    jest.spyOn(User, 'findOne').mockResolvedValue(defaultReturn);
    jest.spyOn(Group, 'findOne').mockImplementation(false);
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue(groupUpdated);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group:{
          name: "groupName",
          members: [
            { email: "john@example.com"},
            { email: "sarah@example.com"},
            { email: "mike@example.it"},
            { email: "paul@example.it"},
            { email: "luke@example.it"}
        ]},
        alreadyInGroup: [],
        membersNotFound: []},
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(Group.findOne).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOne).toHaveBeenCalled();
    expect(Group.findOneAndUpdate).toHaveBeenCalled();
  })

  test(" T1.7.2 : Users added succesfully + Not Found -USER ROUTE- -> 200", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/add" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const groupUpdated = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"},
        {email: "john@example.com", id:"idDue"},
        {email: "sarah@example.com", id:"idDefaultBis"}
      ]
    };

    const returned_User = {email: "john@example.com", _id: "idDue"};

    const defaultReturn = {email: "sarah@example.com", _id: "idDefaultBis"};

    jest.spyOn(Group, "findOne").mockReturnValueOnce(group);
    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(User, 'findOne').mockReturnValueOnce(returned_User);
    jest.spyOn(User, 'findOne').mockImplementation(false);
    jest.spyOn(Group, 'findOne').mockImplementation(false);
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue(groupUpdated);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group:{
          name: "groupName",
          members: [
            { email: "john@example.com"},
            { email: "mike@example.it"},
            { email: "paul@example.it"},
            { email: "luke@example.it"}
        ]},
        alreadyInGroup: [],
        membersNotFound: [{ email: "sarah@example.com"}]},
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(Group.findOne).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOne).toHaveBeenCalled();
    expect(Group.findOneAndUpdate).toHaveBeenCalled();
   })

  // T2 tests : Admin route
  test(" T2.1 : Verification for 'Admin' failed -> 401 'Unauthorized'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: false, cause: "Unauthorized access, not an Admin"})

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized access, not an Admin"});
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
   })

  test(" T2.2 : Group does not exist in DB -> 400 'Group name does not exist'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(false);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Group name does not exist" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled()
  })

  test(" T2.3.1 : Email body is missing -> 400 'Missing attribute'", async () => { 
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: undefined
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing attribute" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T2.3.2 : Email body is empty -> 400 'Missing attribute'", async () => { 
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: []
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing attribute" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T2.4 : Empty email ->  400 'At least one email is empty'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "At least one email is empty" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();

   })

  test(" T2.5 : Invalid email ->  400 'Invalid email: ${email}'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "invalid@",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: `Invalid email: ${mockReq.body.emails[1]}` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();

   })

  test(" T2.6.1 : All emails not in DB ->  400 `All the provided emails represent users that are already in a group or do not exist in the database`", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockImplementationOnce(false);
    jest.spyOn(User, 'findOne').mockImplementation(false);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: `All the provided emails represent users that are already in a group or do not exist in the database` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
   })

  test(" T2.6.2 : All emails already grouped ->  400 `All the provided emails represent users that are already in a group or do not exist in the database`", async () => { 
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const returned_Group1 = {
      name: "groupOne",
      members: [
        {email: "some@example.it", id:"idUno"},
        {email: "john@example.com", id:"idDue"},
      ]
    };

    const returned_Group2 = {
      name: "groupDefault",
      members: [
        {email: "default@example.it", id:"idDefault"},
        {email: "sarah@example.com", id:"idDefaultBis"},
      ]
    };

    const returned_User = {email: "john@example.com", _id: "idDue"};

    const defaultReturn = {email: "sarah@example.com", _id: "idDefaultBis"};

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockResolvedValue(returned_User);
    jest.spyOn(User, 'findOne').mockResolvedValue(defaultReturn);
    jest.spyOn(Group, "findOne").mockResolvedValue(returned_Group1);
    jest.spyOn(Group, 'findOne').mockResolvedValue(returned_Group2);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: `All the provided emails represent users that are already in a group or do not exist in the database` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOne).toHaveBeenCalled();
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T2.7.1 : Users added succesfully -USER ROUTE- -> 200", async () => { 
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const groupUpdated = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"},
        {email: "john@example.com", id:"idDue"},
        {email: "sarah@example.com", id:"idDefaultBis"}
      ]
    };

    const returned_User = {email: "john@example.com", _id: "idDue"};

    const defaultReturn = {email: "sarah@example.com", _id: "idDefaultBis"};

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockReturnValueOnce(group);
    jest.spyOn(User, 'findOne').mockResolvedValue(returned_User);
    jest.spyOn(User, 'findOne').mockResolvedValue(defaultReturn);
    jest.spyOn(Group, 'findOne').mockImplementation(false);
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue(groupUpdated);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group:{
          name: "groupName",
          members: [
            { email: "john@example.com"},
            { email: "sarah@example.com"},
            { email: "mike@example.it"},
            { email: "paul@example.it"},
            { email: "luke@example.it"}
        ]},
        alreadyInGroup: [],
        membersNotFound: []},
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOne).toHaveBeenCalled();
    expect(Group.findOneAndUpdate).toHaveBeenCalled();
  })

  test(" T2.7.2 : Users added succesfully + Not Found -USER ROUTE- -> 200", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert" }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const groupUpdated = {
      name: "groupName",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"},
        {email: "john@example.com", id:"idDue"},
        {email: "sarah@example.com", id:"idDefaultBis"}
      ]
    };

    const returned_User = {email: "john@example.com", _id: "idDue"};

    const defaultReturn = {email: "sarah@example.com", _id: "idDefaultBis"};

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockReturnValueOnce(group);
    jest.spyOn(User, 'findOne').mockReturnValueOnce(returned_User);
    jest.spyOn(User, 'findOne').mockImplementation(false);
    jest.spyOn(Group, 'findOne').mockImplementation(false);
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue(groupUpdated);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group:{
          name: "groupName",
          members: [
            { email: "john@example.com"},
            { email: "mike@example.it"},
            { email: "paul@example.it"},
            { email: "luke@example.it"}
        ]},
        alreadyInGroup: [],
        membersNotFound: [{ email: "sarah@example.com"}]},
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOne).toHaveBeenCalled();
    expect(Group.findOneAndUpdate).toHaveBeenCalled();
   })

   test(" T3 : Error 500 ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/insert"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockImplementationOnce(() => {
      throw new Error("DB error")
    });
    
    await addToGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "DB error"});
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();

  } )

})





 
describe("removeFromGroup", () => {

  beforeEach(() => {
    User.findOne.mockClear()
    Group.findOne.mockClear()
    verifyAuth.mockClear()
    jest.clearAllMocks()
  });

  afterEach(()=>{
      jest.clearAllMocks();
  });
  
  // T1 tests : User route
  test(" T1.1.1 : Name parameter is missing -> 400 'Missing attribute'", async () => { 
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sarah@example.com",
        ]
      },
      params: {
        name: undefined,
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing attribute" });
    expect(mockRes.status).toHaveBeenCalledWith(400);

  })

  test(" T1.1.2 : Email body is missing -> 400 'Missing attribute'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: undefined
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
      ]
    };

    const emailList = ["mike@example.it"];

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "Missing attribute" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: emailList});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T1.1.3 : Email body is empty -> 400 'Missing attribute'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: []
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
      ]
    };

    const emailList = ["mike@example.it"];

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "Missing attribute" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: emailList});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T1.2 : Group does not exist in DB -> 400 'Group name does not exist'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(false);

    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ error: "Group name does not exist" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T1.3 : Verification for 'Group' failed -> 401 'Unauthorized'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const emailList = ["mike@example.it", "paul@example.it", "luke@example.it"];

    verifyAuth.mockReturnValueOnce({flag: false, cause: "Unauthorized access, not in a group"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "Unauthorized access, not in a group"});
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: emailList});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T1.4 : Only one member -> 400 'The group contains only one member'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
      ]
    };

    const emailList = ["mike@example.it"];

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: `The group contains only one member` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: emailList});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T1.5 : Empty email ->  400 'At least one email is empty'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const emailList = ["mike@example.it", "paul@example.it", "luke@example.it"];

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "At least one email is empty" });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: emailList});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T1.6 : Invalid email ->  400 'Invalid email: ${email}'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "invalid@",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const emailList = ["mike@example.it", "paul@example.it", "luke@example.it"];

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: `Invalid email: ${mockReq.body.emails[1]}` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: emailList});
    expect(Group.findOne).toHaveBeenCalled();
  })
  
  test(" T1.7.1 : All emails not members ->  400 'All the provided emails represent users that do not belong to the group or do not exist in the database'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sara@example.com",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const emailList = ["mike@example.it", "paul@example.it", "luke@example.it"];
    
    const returned_User = {email: "someEmail@gmail.com", _id: "someID"};

    const defaultReturn = {email: "anyEmail@gmail.com", _id: "someID"};

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User)
    jest.spyOn(User, 'findOne').mockImplementation(() => defaultReturn)
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: `All the provided emails represent users that do not belong to the group or do not exist in the database` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: emailList});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
  })

  test(" T1.7.2 : All emails not in DB ->  400 'All the provided emails represent users that do not belong to the group or do not exist in the database'", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sara@example.com",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const emailList = ["mike@example.it", "paul@example.it", "luke@example.it"];

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockImplementationOnce(false);
    jest.spyOn(User, 'findOne').mockImplementation(false);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: `All the provided emails represent users that do not belong to the group or do not exist in the database` });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: emailList});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
  })

  // T1.8 : Status 200
  test(" T1.8.1 : Not all the users are deleted ->  200 ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sara@example.com",
          "paul@example.it",
          "mike@example.it",
          "luke@example.it"
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };
    
    const returned_User = {email: "someEmail@gmail.com", _id: "someID"};

    const defaultReturn = {email: "anyEmail@gmail.com", _id: "someID"};

    const updatedGroup = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User);
    jest.spyOn(User, 'findOne').mockImplementation(() => defaultReturn);
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue(updatedGroup);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group: {
          name: "groupName",
          members: [
            { email: "mike@example.it"}
          ]
        },
        notInGroup: [{ email: "john@example.com"}, { email: "sara@example.com"}],
        membersNotFound: []
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOneAndUpdate).toHaveBeenCalled();
  })

  test(" T1.8.2 : User removed succesfully -USER ROUTE- ->  200 ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sara@example.com",
          "paul@example.it",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/remove"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const returned_User = {email: "someEmail@gmail.com", _id: "someID"};

    const defaultReturn = {email: "anyEmail@gmail.com", _id: "someID"};

    const updatedGroup = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User);
    jest.spyOn(User, 'findOne').mockImplementation(() => defaultReturn);
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue(updatedGroup);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group: {
          name: "groupName",
          members: [
            { email: "mike@example.it"},
            { email: "luke@example.it"}
          ]
        },
        notInGroup: [{ email: "john@example.com"}, { email: "sara@example.com"}],
        membersNotFound: []
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Group", emails: expect.any(Array)});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOneAndUpdate).toHaveBeenCalled();
  })

  // T2 tests : Admin route
  test(" T2.1 : Verification for 'Admin' failed -> 401 'Unauthorized' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    verifyAuth.mockReturnValueOnce({flag: false, cause: "Unauthorized access, not an Admin"})
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "Unauthorized access, not an Admin"});
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
  })

  test(" T2.2.1 : Name parameter is missing -> 400 'Missing attribute' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sarah@example.com",
        ]
      },
      params: {
        name: undefined,
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "Missing attribute"});
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
  })

  test(" T2.2.2 : Email body is missing -> 400 'Missing attribute' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: undefined
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "Missing attribute"});
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
  })

  test(" T2.2.3 : Email body is empty -> 400 'Missing attribute' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: []
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "Missing attribute"});
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
  })

  test(" T2.3 : Group does not exist in DB -> 400 'Group name does not exist' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(false);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "Group name does not exist"});
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T2.4 : Only one member -> 400 'The group contains only one member' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "The group contains only one member"});
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T2.5 : Empty email ->  400 'At least one email is empty' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: "At least one email is empty"});
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T2.6 : Invalid email ->  400 'Invalid email: ${email}' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "invalid@",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: `Invalid email: ${mockReq.body.emails[1]}`});
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
  })

  test(" T2.7.1 : All emails not members ->  400 'All the provided emails represent users that do not belong to the group or do not exist in the database' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sara@example.com",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const returned_User = {email: "someEmail@gmail.com", _id: "someID"};

    const defaultReturn = {email: "anyEmail@gmail.com", _id: "someID"};

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User);
    jest.spyOn(User, 'findOne').mockImplementation(() => defaultReturn);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: `All the provided emails represent users that do not belong to the group or do not exist in the database`});
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
  })

  test(" T2.7.2 : All emails not in DB ->  400 'All the provided emails represent users that do not belong to the group or do not exist in the database' ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sara@example.com",
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockImplementationOnce(false);
    jest.spyOn(User, 'findOne').mockImplementation(false);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({error: `All the provided emails represent users that do not belong to the group or do not exist in the database`});
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
  })

  // T2.8 : status 200
  test(" T2.8.1 : Not all the users are deleted ->  200 ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sara@example.com",
          "paul@example.it",
          "mike@example.it",
          "luke@example.it"
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"},
        {email: "paul@example.it", id:"idTwo"},
        {email: "luke@example.it", id:"idThree"}
      ]
    };

    const returned_User = {email: "someEmail@gmail.com", _id: "someID"};

    const defaultReturn = {email: "anyEmail@gmail.com", _id: "someID"};

    const updatedGroup = {
      name: "groupOne",
      members: [
        {email: "mike@example.it", id:"idOne"}
      ]
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"});
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User);
    jest.spyOn(User, 'findOne').mockImplementation(() => defaultReturn);
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue(updatedGroup);
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group: {
          name: "groupName",
          members: [
            { email: "mike@example.it"}
          ]
        },
        notInGroup: [{ email: "john@example.com"}, { email: "sara@example.com"}],
        membersNotFound: []
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOneAndUpdate).toHaveBeenCalled();
  })

  test(" T2.8.2 : User removed succesfully -ADMIN ROUTE- ->  200 ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
      body: {
        emails: [
          "john@example.com",
          "sara@example.com",
          "paul@example.it"
        ]
      },
      params: {
        name: "groupName",
      },
      cookies: {
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull" },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    const group = {
      name: "groupOne",
      members: [
        { email: "mike@example.it", id: "idOne" },
        { email: "paul@example.it", id: "idTwo" },
        { email: "luke@example.it", id: "idThree" }
      ]
    };

    const returned_User = { email: "someEmail@gmail.com", _id: "someID" };

    const defaultReturn = { email: "anyEmail@gmail.com", _id: "someID" };

    const updatedGroup = {
      name: "groupOne",
      members: [
        { email: "mike@example.it", id: "idOne" }
      ]
    };

    verifyAuth.mockReturnValueOnce({ flag: true, cause: "Authorized" });
    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => returned_User);
    jest.spyOn(User, 'findOne').mockImplementation(() => defaultReturn);
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue(updatedGroup);

    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group: {
          name: "groupName",
          members: [
            { email: "mike@example.it" },
            { email: "luke@example.it" }
          ]
        },
        notInGroup: [{ email: "john@example.com"}, { email: "sara@example.com"}],
        membersNotFound: []
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
    expect(Group.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalled();
    expect(Group.findOneAndUpdate).toHaveBeenCalled();
  })

  test(" T3 : Error 500 ", async () => {
    let mockReq;
    let mockRes;

    mockReq = {
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
        accessToken: 'testAToken', refreshToken: 'testRToken',
      },
      route: { path: "/groups/:name/pull"},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "Some message" }
    };

    verifyAuth.mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockImplementationOnce(() => {
      throw new Error("DB error")
    });
    
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith("DB error");
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    expect(Group.findOne).toHaveBeenCalled()

  } )
 
})




describe("deleteUser", () => {
  let mockReq;
  let mockRes;

  beforeEach(()=>{
    jest.clearAllMocks();
    mockReq = {
      body: {email: 'john@example.com'},
      params: {},
      cookies: {
        accessToken: "exampleAccessToken", refreshToken: "exampleRefreshToken",
      },
    };

    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {refreshTokenMessage: "Some message"}
    };
  });

  afterEach(()=>{
      jest.clearAllMocks();
  })


  test("T1: Not admin -> 401 and error 'Unauthorized access, not an Admin' ", async () => {
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized access, not an Admin"})
    
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Unauthorized access, not an Admin' })
  })

    //All tests starting with T2 refer to admin check passed
  test("T2.1.1: email attribute missing -> 400 and error 'Missing attribute' ", async () => {
    mockReq = {
      body: {},
      params: {},
      cookies: {
        accessToken: "exampleAccessToken", refreshToken: "exampleRefreshToken",
      },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing attribute' })
  })


  test("T2.1.2: email attribute is an empty string -> 400 and error 'Email is empty' ", async () => {
    mockReq = {
      body: {email: '  '},
      params: {},
      cookies: {
        accessToken: "exampleAccessToken", refreshToken: "exampleRefreshToken",
      },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Email is empty' })
  })


  test("T2.1.3: email attribute has invalid format -> 400 and error 'Invalid email: invalidEmail@com' ", async () => {
    mockReq = {
      body: {email: 'invalidEmail@com'},
      params: {},
      cookies: {
        accessToken: "exampleAccessToken", refreshToken: "exampleRefreshToken",
      },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: `Invalid email: ${mockReq.body.email}` })
  })


  test("T2.2: The user associated to the email doesn't exist in the DB -> 400 and error 'The email passed in the request body does not represent a user in the database' ", async () => {
    mockReq = {
      body: {email: 'mike@example.com'},
      params: {},
      cookies: {
        accessToken: "exampleAccessToken", refreshToken: "exampleRefreshToken",
      },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'findOne').mockReturnValueOnce(false)
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: `The email passed in the request body does not represent a user in the database` })
  })

  //T2.3 refer to not empty email, valid format and exists in the DB
  test("T2.3.1: email belongs to an admin -> 400 and error 'The email passed in the request body represents an admin' ", async () => {
    mockReq = {
      body: {email: 'mike@example.com'},
      params: {},
      cookies: {
        accessToken: "exampleAccessToken", refreshToken: "exampleRefreshToken",
      },
    };
    const user_in_DB = {username: "mike", email: "mike@example.com", password: "pass123", role: "Admin"}
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'findOne').mockReturnValueOnce(user_in_DB)
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: `The email passed in the request body represents an admin` })
  })


  test("T2.3.2: email doesn't belongs to an admin, and last user in the group -> 200, deletedFromGroup: true, deletedTransaction: 3  ", async () => {
    mockReq = {
      body: {email: 'mike@example.com'},
      params: {},
      cookies: {
        accessToken: "exampleAccessToken", refreshToken: "exampleRefreshToken",
      },
    };
    const user_in_DB = {username: "mike", email: "mike@example.com", password: "pass123", role: "Regular"}
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'findOne').mockReturnValueOnce(user_in_DB)
    const transactions_deleteMany_return = {deletedCount: 3}
    jest.spyOn(transactions, 'deleteMany').mockImplementationOnce(() => transactions_deleteMany_return)
    const Group_findOne_return = {members: {length: 1}}
    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => Group_findOne_return)
    jest.spyOn(Group, 'deleteOne').mockImplementationOnce(() => true)
    jest.spyOn(User, 'deleteOne').mockImplementationOnce(() => true)
    await deleteUser(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data.deletedFromGroup).toEqual(true)
    expect(mockRes.json.mock.calls[0][0].data.deletedTransactions).toEqual(3)
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})

  })


  test("T2.3.3: email doesn't belongs to an admin, not last user in the group -> 200, deletedFromGroup: false, deletedTransaction: 3  ", async () => {
    mockReq = {
      body: {email: 'mike@example.com'},
      params: {},
      cookies: {
        accessToken: "exampleAccessToken", refreshToken: "exampleRefreshToken",
      },
    };
    const user_in_DB = {username: "mike", email: "mike@example.com", password: "pass123", role: "Regular"}
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'findOne').mockReturnValueOnce(user_in_DB)
    const transactions_deleteMany_return = {deletedCount: 3}
    jest.spyOn(transactions, 'deleteMany').mockImplementationOnce(() => transactions_deleteMany_return)
    const Group_findOne_return = {members: {length: 3}, name: 'mike'}
    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => Group_findOne_return)
    jest.spyOn(Group, 'findOneAndUpdate').mockImplementationOnce(() => true)
    jest.spyOn(User, 'deleteOne').mockImplementationOnce(() => true)

    await deleteUser(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data.deletedFromGroup).toEqual(true)
    expect(mockRes.json.mock.calls[0][0].data.deletedTransactions).toEqual(3)
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
  })


  test("T3: User.findOne throws an error -> 500 and error 'Database error' ", async () => {
    mockReq = {
      body: {email: 'mike@example.com'},
      params: {},
      cookies: {
        accessToken: "exampleAccessToken", refreshToken: "exampleRefreshToken",
      },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => {throw new Error("DB error")})
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json.mock.calls[0][0]).toEqual(`DB error`)
  })
})




describe("deleteGroup", () => {

  let mockReq;
  let mockRes;

  beforeEach(()=>{
    jest.clearAllMocks();
    mockReq = {
      body: {name: 'family'},
        params: {},
        cookies: {
          accessToken: 'exampleAccessToken', refreshToken: 'exampleRefreshToken',
        },
    };

    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {refreshTokenMessage: "Some message"}
    };
  });

  afterEach(()=>{
      jest.clearAllMocks();
  })


  test("deleteGroup T1: Not admin -> 401 and error 'Unauthorized access, not an Admin' ", async () => {
    
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized access, not an Admin"})
    
    await deleteGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Unauthorized access, not an Admin' })
  })

  //T2 refers to admin check passed
  test("deleteGroup T2.1: name attribute is missing -> 400 and error 'Missing attribute' ", async () => {
    mockReq = {
      body: {},
        params: {},
        cookies: {
          accessToken: 'exampleAccessToken', refreshToken: 'exampleRefreshToken',
        },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await deleteGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing attribute' })
  })


  test("deleteGroup T2.2: name attribute is an empty string -> 400 and error 'Group name is empty' ", async () => {
    mockReq = {
      body: {name: '   '},
        params: {},
        cookies: {
          accessToken: 'exampleAccessToken', refreshToken: 'exampleRefreshToken',
        },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
    await deleteGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Group name is empty' })
  })


  test("deleteGroup T2.3: Group associated to the req.body name doesn't exist in the DB -> 400 and error 'Group name does not exist' ", async () => {
    mockReq = {
      body: {name: 'family'},
        params: {},
        cookies: {
          accessToken: 'exampleAccessToken', refreshToken: 'exampleRefreshToken',
        },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, 'findOne').mockReturnValueOnce(false)
    await deleteGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Group name does not exist' })
  })


  test("deleteGroup T2.4: Group associated to the req.body name exists in the DB -> 200 and message 'Group deleted successfully' ", async () => {
    mockReq = {
      body: {name: 'family'},
        params: {},
        cookies: {
          accessToken: 'exampleAccessToken', refreshToken: 'exampleRefreshToken',
        },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, 'findOne').mockReturnValueOnce(true)
    jest.spyOn(Group, 'deleteOne').mockReturnValueOnce({acknowledged: true})
    await deleteGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json.mock.calls[0][0].data.message).toEqual("Group deleted successfully")
    expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
  })


  test("deleteGroup T3: Group.findOne throws and error  -> 500 and error 'Database error' ", async () => {
    mockReq = {
      body: {name: 'family'},
        params: {},
        cookies: {
          accessToken: 'exampleAccessToken', refreshToken: 'exampleRefreshToken',
        },
    };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(Group, 'findOne').mockImplementationOnce(() => {throw new Error('Database error')})
    await deleteGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json.mock.calls[0][0]).toEqual('Database error')
  })

 })