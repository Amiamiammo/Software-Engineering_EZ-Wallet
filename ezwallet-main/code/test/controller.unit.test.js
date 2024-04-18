import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model.js';
import { getTransactionsByUser, getTransactionsByUserByCategory, getTransactionsByGroup,
getTransactionsByGroupByCategory, deleteTransaction, deleteTransactions, createCategory,
updateCategory, getCategories, createTransaction, getAllTransactions, deleteCategory } from '../controllers/controller';
import { User, Group } from '../models/User.js';
import * as moduleApi from '../controllers/utils';
import { verifyAuth } from '../controllers/utils';
import { query } from 'express';
import { CastError } from 'mongoose';


jest.mock('../models/model');
jest.mock('jsonwebtoken')
jest.mock("bcryptjs")

beforeEach(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
});


const valid_id1 = '6479e86b52b2827ceb04d3f1';
const valid_id2 = '7479e86b52b2827ceb04d3f1';
const valid_id3 = '8479e86b52b2827ceb04d3f1';

describe("createCategory", () => { 

    let mockReq;
    let mockRes;

    beforeEach(()=>{
      mockReq = {
          body:{
          type: 'groceries',
          color: '#fcbe44',
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
        jest.resetAllMocks();
    })


    test("createCategory T1: Function is called by a non Admin -> should return 401 with error 'Unauthorized access'", async () => {
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
    });


    test("createCategory T2: Authorization passed, but type parameter is missing -> should return 400 with error 'Missing 'type' parameter'", async () => {
        
        mockReq = {
            body:{
            color: '#fcbe44',
            },
            cookies: {accessToken: 'someAccessToken', refreshToken: ''}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized access"})

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing 'type' parameter")
    });


    test("createCategory T2.1: Authorization passed, but type parameter is an empty string -> should return 400 with error 'Missing 'type' parameter'", async () => {
        
        mockReq = {
            body:{
            type: '',
            color: '#fcbe44',
            },
            cookies: {accessToken: 'someAccessToken', refreshToken: ''}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized access"})

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing 'type' parameter")
    });


    test("createCategory T3: Previous 2 checks passed, but color parameter is missing -> should return 400 with error 'Missing 'type' parameter'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            },
            cookies: {accessToken: 'someAccessToken', refreshToken: ''}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized access"})

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing 'color' parameter")
    });


    test("createCategory T3.1: Previous 2 checks passed, but color parameter is an empty string -> should return 400 with error 'Missing 'type' parameter'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '',
            },
            cookies: {accessToken: 'someAccessToken', refreshToken: ''}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized access"})

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing 'color' parameter")
    });


    test("createCategory T4: Previous 3 checks passed, but category is already in the DB -> should return 400 with error 'Category already found in the database'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            cookies: {accessToken: 'someAccessToken', refreshToken: ''}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized access"})
        jest.spyOn(categories, "findOne").mockImplementation(()=>true)

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Category already found in the database")
    });


    test("createCategory T5: Previous 4 checks passed, save worked -> should return 200 with data and res.locals.refreshedTokenMessage", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            cookies: {accessToken: 'someAccessToken', refreshToken: ''}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized access"})
        jest.spyOn(categories, "findOne").mockImplementation(()=>false)
        jest.spyOn(categories.prototype, 'save').mockImplementation(() =>{ const result = {type: 'groceries', color: '#fcbe44'};
             return Promise.resolve(result);})
        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data).toEqual({type: 'groceries', color: '#fcbe44'})
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
    });


    test("createCategory T6: Previous 4 checks passed, save throwed an exception -> should return 500 with the error message", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            cookies: {accessToken: 'someAccessToken', refreshToken: ''}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized access"})
        jest.spyOn(categories, "findOne").mockImplementation(()=>false)
        jest.spyOn(categories.prototype, 'save').mockImplementation(() => {throw new Error('Database error');})
        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Database error")
    });

})




describe("updateCategory", () => { 
    let mockReq;
    let mockRes;

    beforeEach(()=>{
      mockReq = {
          body:{
          type: 'groceries',
          color: '#fcbe44',
          },
          params:{type: 'utilities'},
          cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
      };

      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {refreshTokenMessage: "Some message"}
      };
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })


    test("updateCategory T1: Function is called by a non Admin -> should return 401 with error 'Unauthorized access'", async () => {
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
    });


    test("updateCategory T2: Function is called by an Admin, but oldTtype parameter is missing -> should return 400 with error 'Missing old 'type' parameter'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            params:{},
            cookies: {accessToken: 'someAccessToken', refreshToken: ''}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing old 'type' parameter")
    });


    test("updateCategory T2.1: Function is called by an Admin, but oldType parameter is an empty string -> should return 400 with error 'Missing old 'type' parameter'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            params:{type: ''},
            cookies: {accessToken: 'someAccessToken', refreshToken: ''}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing old 'type' parameter")
    });


    test("updateCategory T3: Previous 2 checks passed, but newType parameter is missing -> should return 400 with error 'Missing new 'type' parameter'", async () => {
        
        mockReq = {
            body:{
            color: '#fcbe44',
            },
            params:{type: 'utilites'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing new 'type' parameter")
    });


    test("updateCategory T3.1: Previous 2 checks passed, but newType parameter is an empty string -> should return 400 with error 'Missing new 'type' parameter'", async () => {
        
        mockReq = {
            body:{
            type: '',
            color: '#fcbe44',
            },
            params:{type: 'utilites'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing new 'type' parameter")
    });


    test("updateCategory T4: Previous 3 checks passed, but color parameter is missing -> should return 400 with error 'Missing 'color' parameter'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            },
            params:{type: 'utilites'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing 'color' parameter")
    });


    test("updateCategory T4.1: Previous 3 checks passed, but color parameter is an empty string -> should return 400 with error 'Missing 'color' parameter'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '',
            },
            params:{type: 'utilites'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing 'color' parameter")
    });


    test("updateCategory T5.1: Previous 4 checks passed, but the new category already exists in the DB -> should return 400 with error 'New category already found in the database'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            params:{type: 'utilites'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, "findOne").mockImplementation(()=>true)
        
        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("New category already found in the database")
    });

    test("updateCategory T5.2: Previous 4 checks passed, new category not in db -> should return 200", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            params:{type: 'utilites'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        const expectedResult = {acknowledged: true, matchedCount: 1, modifiedCount: 1}
        const expectedResult2 = {acknowledged: true, matchedCount: 1, modifiedCount: 1}
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, "findOne").mockImplementation(()=>false)
        jest.spyOn(categories, "updateOne").mockImplementation(()=> expectedResult)
        jest.spyOn(transactions, "updateMany").mockImplementation(()=> {()=> expectedResult2})
        
        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
    });


    test("updateCategory T5.3: Previous 4 checks passed, new category in db but equal to oldcategory -> should return 200", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            params:{type: 'groceries'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        const expectedResult = {acknowledged: true, matchedCount: 1, modifiedCount: 1}
        const expectedResult2 = {acknowledged: true, matchedCount: 1, modifiedCount: 1}
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, "findOne").mockImplementation(()=>true)
        jest.spyOn(categories, "updateOne").mockImplementation(()=> expectedResult)
        jest.spyOn(transactions, "updateMany").mockImplementation(()=> {()=> expectedResult2})
        
        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
    });

    test("updateCategory T6: Previous 5 checks passed, but no match in the DB -> should return 400 with error 'New category already found in the database'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            params:{type: 'utilites'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        const expectedResult = {acknowledged: true, matchedCount: 0, modifiedCount: 0}
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, "findOne").mockImplementation(()=>false)
        jest.spyOn(categories, "updateOne").mockImplementation(()=> expectedResult)

        
        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Old category not found in the database")
    });


    test("updateCategory T7: Previous 6 checks passed, .updateMany worked -> should return 200 with error 'Category edited successfully'", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            params:{type: 'utilites'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        const expectedResult = {acknowledged: true, matchedCount: 1, modifiedCount: 1}
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, "findOne").mockImplementation(()=>false)
        jest.spyOn(categories, "updateOne").mockImplementation(()=> expectedResult)
        jest.spyOn(transactions, "updateMany").mockImplementation(()=> expectedResult)
        
        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data).toEqual({message: "Category edited successfully", count: expectedResult.modifiedCount})
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
    });


    test("updateCategory T8: Previous 6 checks passed, .updateMany throwed an exception -> should return 500 with error message", async () => {
        
        mockReq = {
            body:{
            type: 'groceries',
            color: '#fcbe44',
            },
            params:{type: 'utilites'},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        const expectedResult = {acknowledged: true, matchedCount: 1, modifiedCount: 1}
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, "findOne").mockImplementation(()=>false)
        jest.spyOn(categories, "updateOne").mockImplementation(()=> expectedResult)
        jest.spyOn(transactions, "updateMany").mockImplementation(()=> {throw new Error('Database error');})

        
        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Database error' })
    });
})




describe("deleteCategory", () => {

    beforeEach(async () => {
        verifyAuth.mockClear()
        categories.find.mockClear()
        categories.deleteMany.mockClear()
        categories.deleteOne.mockClear()
        transactions.updateMany.mockClear()
        });

        afterEach(async () => {
            jest.clearAllMocks();
        })

    test("deleteCategory T1: Authorization failed, not an Admin -> should return 401 with error 'Unauthorized access' ", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {
                types: ["Investment", "Grocery"]
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }
        
        verifyAuth.mockReturnValue({flag: false, cause: "Unauthorized access, not an Admin"})

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({error: "Unauthorized access" });
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});

    });
    

    test("deleteCategory T2.1: Missing attributes -> should return 400", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {},
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }

        verifyAuth.mockReturnValue({flag: true, cause: "Authorized"})

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error:"Missing attributes"});
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
        
    });

    test("deleteCategory T2.2: Missing attributes -> should return 400", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {
                types: []
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }

        verifyAuth.mockReturnValue({flag: true, cause: "Authorized"})

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error:"Missing attributes"});
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
    });

    test("deleteCategory T3: Missing attributes, empty string -> should return 400", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {
                types: [" "]
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }

        verifyAuth.mockReturnValue({flag: true, cause: "Authorized"});
        jest.spyOn(categories, "find").mockResolvedValue(categoriesDB);

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error:"Missing attributes, empty string"});
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
        expect(categories.find).toHaveBeenCalled();
    });

    test("deleteCategory T4: Not enough categories in the db -> should return 400", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            }
        ]

        mockReq = {
            body: {
                types: ["Investment", "Grocery"]
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }

        verifyAuth.mockReturnValue({flag: true, cause: "Authorized"});
        jest.spyOn(categories, "find").mockResolvedValue(categoriesDB);

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error: "Not enough categories in the database"});
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
        expect(categories.find).toHaveBeenCalled();
    });

    test("deleteCategory T5: Category does not exist -> should return 400", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {
                types: ["Investment", "Grocery"]
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }

        verifyAuth.mockReturnValue({flag: true, cause: "Authorized"});
        jest.spyOn(categories, "find").mockResolvedValue(categoriesDB);
        jest.spyOn(categories, "findOne").mockReturnValueOnce(true);
        jest.spyOn(categories, 'findOne').mockImplementation(false);

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error:"Category does not exist"});
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
        expect(categories.find).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        
    });

    test("deleteCategory T6.1: N < T -> should return 400", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {
                types: ["Investment", "Grocery", "none1", "none2"]
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }

        verifyAuth.mockReturnValue({flag: true, cause: "Authorized"});
        jest.spyOn(categories, "find").mockResolvedValue(categoriesDB);
        jest.spyOn(categories, "findOne").mockReturnValueOnce(true);
        jest.spyOn(categories, 'findOne').mockImplementation(false);

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error:"Category does not exist"});
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
        expect(categories.find).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();

    });
 

    test("deleteCategory T6.2: N < T with duplicates -> should return 200", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {
                types: ["Holidays", "Health", "Holidays", "Holidays", "Health"]
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }

        verifyAuth.mockReturnValue({flag: true, cause: "Authorized"});
        jest.spyOn(categories, "find").mockResolvedValue(categoriesDB);

        //for:
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        //end for

        jest.spyOn(categories, 'findOne').mockReturnValueOnce({
            sort: jest.fn().mockReturnValueOnce(true),
            exec: jest.fn().mockReturnValueOnce(true)
          });
        jest.spyOn(transactions, 'updateMany').mockResolvedValue({modifiedCount: 2});
        jest.spyOn(categories, 'deleteMany').mockResolvedValue({modifiedCount: 2});

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "Categories deleted", count: 2 }, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
        expect(categories.find).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.updateMany).toHaveBeenCalled();
        expect(categories.deleteMany).toHaveBeenCalled();

    });

    test("deleteCategory T7: N = T -> should return 200", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {
                types: ["Holidays", "Health", "Investment"]
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }

        verifyAuth.mockReturnValue({flag: true, cause: "Authorized"});
        jest.spyOn(categories, "find").mockResolvedValue(categoriesDB);

        //for:
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        //end for

        jest.spyOn(categories, 'findOne').mockReturnValueOnce({
            sort: jest.fn().mockReturnValueOnce(true),
            exec: jest.fn().mockReturnValueOnce(true)
          });
        jest.spyOn(transactions, 'updateMany').mockResolvedValue({modifiedCount: 2});
        jest.spyOn(categories, 'deleteMany').mockResolvedValue({modifiedCount: 2});

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "Categories deleted", count: 2 }, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
        expect(categories.find).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.updateMany).toHaveBeenCalled();
        expect(categories.deleteMany).toHaveBeenCalled();

    });

    test("deleteCategory T8: N > T -> should return 200", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {
                types: ["Holidays", "Health"]
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message'}
        }

        verifyAuth.mockReturnValue({flag: true, cause: "Authorized"});
        jest.spyOn(categories, "find").mockResolvedValue(categoriesDB);

        //for:
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
        //end for

        jest.spyOn(categories, 'findOne').mockReturnValueOnce({
            sort: jest.fn().mockReturnValueOnce(true),
            exec: jest.fn().mockReturnValueOnce(true)
          });
        jest.spyOn(transactions, 'updateMany').mockResolvedValue({modifiedCount: 2});
        jest.spyOn(categories, 'deleteMany').mockResolvedValue({modifiedCount: 2});

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "Categories deleted", count: 2 }, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, {authType: "Admin"});
        expect(categories.find).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.updateMany).toHaveBeenCalled();
        expect(categories.deleteMany).toHaveBeenCalled();
    });

    test("deleteCategory T9: Error 500", async () => {

        let mockReq;
        let mockRes;
        let categoriesDB = [
            {
                type: "Investment",
                color: "Red"
            },
            {
                type: "Health",
                color: "Green"
            },
            {
                type: "Holidays",
                color: "Blue"
            }
        ]

        mockReq = {
            body: {
                types: ["Holidays", "Health"]
            },
            params: {},
            cookies: {
                accessToken: "regularAccessToken",
                refreshToken: "regularRefreshToken"
            }
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            locals: { refreshedTokenMessage: 'Some message' }
        }

        verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" })
        jest.spyOn(categories, "find").mockImplementation(() => {
            throw new Error("DB error")
        });

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error: "DB error" });
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(categories.find).toHaveBeenCalled();

    });

})




describe("getCategories", () => { 
    let mockReq;
    let mockRes;

    beforeEach(()=>{
      mockReq = {
          body:{
          },
          params:{},
          cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
      };

      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {refreshTokenMessage: "Some message"}
      };
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })


    test("getCategories T1: Authorization failed -> should return 401 with error 'Unauthorized access'", async () => {
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
        
        await getCategories(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Unauthorized access' })
    });


    test("getCategories T2: Authorization passed, categories.find worked -> should return 200 with all filtered categories", async () => {
        
        const return_categories_find = [
            {type: 'groceries', color: '#fcbe44', _id: 'someRandomID1'},
            {type: 'utilities', color: '#D6593E', _id: 'someRandomID2'},
            {type: 'investment', color: '#47D63E', _id: 'someRandomID2'}
        ]
        const return_Object_assign = [
            {type: 'groceries', color: '#fcbe44'},
            {type: 'utilities', color: '#D6593E'},
            {type: 'investment', color: '#47D63E'}
        ]
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, 'find').mockImplementation(()=> return_categories_find)
        jest.spyOn(Object, 'assign').mockReturnValueOnce(return_Object_assign[0])
        jest.spyOn(Object, 'assign').mockReturnValueOnce(return_Object_assign[1])
        jest.spyOn(Object, 'assign').mockReturnValueOnce(return_Object_assign[2])

        await getCategories(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ data: return_Object_assign })
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
    });


    test("getCategories T3: Authorization passed, categories.find throwed an exception -> should return 500 with error message", async () => {
        
        const return_categories_find = [
            {type: 'groceries', color: '#fcbe44', _id: 'someRandomID1'},
            {type: 'utilities', color: '#D6593E', _id: 'someRandomID2'},
            {type: 'investment', color: '#47D63E', _id: 'someRandomID2'}
        ]
        const return_Object_assign = [
            {type: 'groceries', color: '#fcbe44'},
            {type: 'utilities', color: '#D6593E'},
            {type: 'investment', color: '#47D63E'}
        ]
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, 'find').mockImplementation(()=> {throw new Error('Database error');})
        jest.spyOn(Object, 'assign').mockReturnValueOnce(return_Object_assign[0])
        jest.spyOn(Object, 'assign').mockReturnValueOnce(return_Object_assign[1])
        jest.spyOn(Object, 'assign').mockReturnValueOnce(return_Object_assign[2])
        //jest.spyOn(Array.prototype, "map").mockImplementation(()=>return_Object_assign)

        await getCategories(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Database error' })
    });
})




describe("createTransaction", () => { 

    let mockReq;
    let mockRes;

    beforeEach(()=>{
      mockReq = {
          body:{
            username: "mike74",
            amount: 80,
            type: "groceries",
            },
          params:{username: "mike74"},
          cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
      };

      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {refreshTokenMessage: "Some message"}
      };
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })

    test("createTransaction T1: Authorization failed -> should return 401 with error 'Unauthorized access' ", async () => {
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Unauthorized access' })
    });

    //All tests starting with T2 refer to authorization passed
    test("createTransaction T2.1.1: Username parameter is missing -> should return 400 with error 'Missing body param(s)' ", async () => {

        mockReq = {
            body:{
              amount: 80,
              type: "groceries",
              },
            params:{username: "mike74"},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing body param(s)' })
    });


    test("createTransaction T2.1.2: Username parameter is an empty string -> should return 400 with error 'Missing body param(s)' ", async () => {

        mockReq = {
            body:{
              type: "",
              amount: 80,
              type: "groceries",
              },
            params:{username: "mike74"},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing body param(s)' })

    });


    test("createTransaction T2.2.1: Type parameter is missing -> should return 400 with error 'Missing body param(s)' ", async () => {

        mockReq = {
            body:{
              username: "john24",
              amount: 80,
              },
            params:{username: "mike74"},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing body param(s)' })
    });


    test("createTransaction T2.2.2: Type parameter is an empty string -> should return 400 with error 'Missing body param(s)' ", async () => {

        mockReq = {
            body:{
              username: "john24",
              amount: 80,
              type: ""
              },
            params:{username: "mike74"},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing body param(s)' })
    });


    test("createTransaction T2.3.1: Amount parameter is missing -> should return 400 with error 'Missing body param(s)' ", async () => {

        mockReq = {
            body:{
              username: "john24",
              },
            params:{username: "mike74"},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing body param(s)' })
    });


    test("createTransaction T2.3.2: Amount parameter is an empty string -> should return 400 with error 'Missing body param(s)' ", async () => {

        mockReq = {
            body:{
              username: "john24",
              amount: "",
              type: ""
              },
            params:{username: "mike74"},
            cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Missing body param(s)' })
    });

    //All tests starting with T3 refer to authorization passed, and inputs are correct
    test("createTransaction T3.1: Category doesn't exist in the DB -> should return 400 with error 'Category does not exist' ", async () => {
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, 'findOne').mockImplementation(()=>false)
        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Category does not exist' })
    });


    test("createTransaction T3.2: Username (in body) doesn't exist in the DB -> should return 400 with error 'User body does not exist' ", async () => {
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, 'findOne').mockImplementation(()=>true)
        jest.spyOn(User, 'findOne').mockReturnValueOnce(false)
        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'User body does not exist' })
    });


    test("createTransaction T3.3: Username (in params) doesn't exist in the DB -> should return 400 with error 'User param does not exist' ", async () => {
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, 'findOne').mockImplementation(()=>true)
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(User, 'findOne').mockReturnValueOnce(false)
        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'User param does not exist' })
    });


    test("createTransaction T3.4: Route username and body username do not match -> should return 400 with error 'Route username and body username do not match' ", async () => {
            mockReq = {
                body:{
                  username: "john33",
                  amount: 80,
                  type: "groceries",
                  },
                params:{username: "mike74"},
                cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
            };
            jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
            jest.spyOn(categories, 'findOne').mockImplementation(()=>true)
            jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
            jest.spyOn(User, 'findOne').mockReturnValueOnce(true)

            await createTransaction(mockReq, mockRes);
    
            expect(mockRes.status).toHaveBeenCalledWith(400)
            expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Route username and body username do not match' })
        });


    test("createTransaction T3.5: Amount is not a floating point number -> should return 400 with error 'The amount is not a floating point number' ", async () => {
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, 'findOne').mockImplementation(()=>true)
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(global, "isNaN").mockReturnValue(true)
        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'The amount is not a floating point number' })
    });

   
    test("createTransaction T3.6: All checks passed -> should return 200 with data and res.locals.refreshedTokenMessage ", async () => {
        
        const new_transaction = {username: 'mike54', type: 'groceries', amount: 70, date: Date.now};
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, 'findOne').mockImplementation(()=>true)
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(global, "isNaN").mockReturnValue(false)
        jest.spyOn(transactions.prototype, 'save').mockImplementation(() =>{ const result = new_transaction;
             return Promise.resolve(result);})
        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data).toEqual(new_transaction)
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
    });


    test("createTransaction T4: categories.findOne throws an exception -> should return 500 with error 'Database error' ", async () => {
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(categories, 'findOne').mockImplementation(()=> {throw new Error('Database error');})
        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json.mock.calls[0][0].error).toEqual('Database error')
    });
})




describe("getAllTransactions", () => { 

    let mockReq;
    let mockRes;

    beforeEach(()=>{
      mockReq = {
          body:{},
          params:{},
          cookies: {accessToken: 'exampleaccessToken', refreshToken: 'examplerefreshToken'}
      };

      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {refreshTokenMessage: "Some message"}
      };
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })


    test("getAllTransactions T1: Authorization failed due to not being an admin -> should return 401 with error 'Unauthorized access' ", async () => {
         jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

        await getAllTransactions(mockReq, mockRes)

         expect(mockRes.status).toHaveBeenCalledWith(401)
         expect(mockRes.json.mock.calls[0][0]).toEqual({ error: "Unauthorized access" })

    });


    test("getAllTransactions T2: Authorization passed  -> should return 200 with data and res.locals.refreshedTokenMessage ", async () => {
        const returned_transactions = [{
                    _id: 'randomID1',
                    username: 'john32',
                    type: 'expense',
                    amount: 50,
                    date: new Date('2023-05-26'),
                    categories_info: { color: '#fcbe44' },
                },
                {
                    _id: 'randomID2',
                    username: 'mike76',
                    type: 'grocery',
                    amount: 130,
                    date: new Date('2023-05-29'),
                    categories_info: { color: '#fcbe44' },
                }]
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(transactions, 'aggregate').mockImplementation(()=> { const result = returned_transactions;
                  return Promise.resolve(result);})
        jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[0])
        jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[1])

       await getAllTransactions(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_transactions)
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
   });


   test("getAllTransactions T3: transactions.aggregate throwed an exception -> should return 500 with error 'Database error' ", async () => {
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    jest.spyOn(transactions, 'aggregate').mockImplementation(()=> {throw new Error('Database error');})

   await getAllTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json.mock.calls[0][0]).toEqual({ error: "Database error" })

});
})


//----------------START FROM HERE


describe("getTransactionsByUser", () => { 
    let mockReq;
    let mockRes;

    beforeEach(()=>{
      mockReq = {
          params:{
          username: 'john',
          },
          route:{
            path: "/users/:username/transactions"
          }
      };

      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {refreshTokenMessage: "Some message"}
      };
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })

    //All tests starting with T1 refer to user route
    test("getTransactionsByUser T1.1: username is not found in the DB -> should return 400 with error 'User not found'", async () => {
        mockReq = {
            params:{
            username: 'john',
            },
            route:{
              path: "/users/:username/transactions"
            }
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(false)
        await getTransactionsByUser(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("User not found")
    });

    test("getTransactionsByUser T1.2.1: username found in the DB, but no transactions is associated to it -> should return 200 with empty data", async () => {
        mockReq = {
            params:{
            username: 'john',
            },
            route:{
              path: "/users/:username/transactions"
            }
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(moduleApi, 'handleDateFilterParams').mockReturnValueOnce(true)
        jest.spyOn(moduleApi, 'handleAmountFilterParams').mockReturnValueOnce(true)

        jest.spyOn(transactions, 'aggregate').mockImplementationOnce(() => { const result = [];
            return Promise.resolve(result);})
        await getTransactionsByUser(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data).toEqual([])
    });
 
    test("getTransactionsByUser T1.2.2: username found in the DB, has some transactions -> should return 200 with the list of transactions ", async () => {
        mockReq = {
            params:{
            username: 'john',
            },
            route:{
              path: "/users/:username/transactions"
            }
        };
        const transaction_in_DB = [
            { username: 'john', type: 'utilities', amount: 80, categories_info: {color: '#fcbe44'} },
            { username: 'mike', type: 'fuel', amount: 110, categories_info: {color: '#52A666'} },
            { username: 'john', type: 'food', amount: 60, categories_info: {color: '#47D63E'} }
        ]
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(moduleApi, 'handleDateFilterParams').mockReturnValueOnce(true)
        jest.spyOn(moduleApi, 'handleAmountFilterParams').mockReturnValueOnce(true)
        jest.spyOn(transactions, 'aggregate').mockImplementationOnce(() => { const result = [transaction_in_DB[0], transaction_in_DB[2]];
            return Promise.resolve(result);})
         jest.spyOn(Object, 'assign').mockReturnValue(transaction_in_DB[0])
         jest.spyOn(Object, 'assign').mockReturnValueOnce(transaction_in_DB[2])

        await getTransactionsByUser(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data[0].username).toEqual(transaction_in_DB[2].username)
        expect(mockRes.json.mock.calls[0][0].data[0].type).toEqual(transaction_in_DB[2].type)
        expect(mockRes.json.mock.calls[0][0].data[0].amount).toEqual(transaction_in_DB[2].amount)

        expect(mockRes.json.mock.calls[0][0].data[1].username).toEqual(transaction_in_DB[0].username)
        expect(mockRes.json.mock.calls[0][0].data[1].type).toEqual(transaction_in_DB[0].type)
        expect(mockRes.json.mock.calls[0][0].data[1].amount).toEqual(transaction_in_DB[0].amount)

    });

    test("getTransactionsByUser T1.3: Authentication failed -> should return 401 with error 'Unauthorized access' and cause 'Unauthorized access'", async () => {
        mockReq = {
            params:{
            username: 'john',
            },
            route:{
              path: "/users/:username/transactions"
            }
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "false"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(false)
        await getTransactionsByUser(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
        expect(mockRes.json.mock.calls[0][0].cause).toEqual("Unauthorized access")

    });


    //All tests starting with T2 refer to admin route
    test("getTransactionsByUser T2.1: Not admin -> should return 401 with error 'Unauthorized access' and cause 'Unauthorized access'", async () => {
        mockReq = {
            params:{
            username: 'john',
            },
            route:{
              path: "/transactions/users/:username"
            }
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
        await getTransactionsByUser(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
        expect(mockRes.json.mock.calls[0][0].cause).toEqual("Unauthorized access")
    });

    test("getTransactionsByUser T2.2.1: username not found in DB -> should return 400 with error 'User not found'", async () => {
        mockReq = {
            params:{
            username: 'john',
            },
            route:{
              path: "/transactions/users/:username"
            }
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(false)
        await getTransactionsByUser(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("User not found")
    });

    test("getTransactionsByUser T2.2.2: username found in the DB, but no transactions is associated to it -> should return 200 with empty data ", async () => {
        mockReq = {
            params:{
            username: 'john',
            },
            route:{
              path: "/transactions/users/:username"
            }
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(transactions, 'aggregate').mockImplementationOnce(() => { const result = [];
            return Promise.resolve(result);})

        await getTransactionsByUser(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data).toEqual([])
    });
 
    test("getTransactionsByUser T2.2.3: username found in the DB, has transactions associated to it -> should return 200 with list of transactions ", async () => {
        mockReq = {
            params:{
            username: 'john',
            },
            route:{
              path: "/transactions/users/:username"
            }
        };
        const transaction_in_DB = [
            { username: 'john', type: 'utilities', amount: 80, categories_info: {color: '#fcbe44'} },
            { username: 'mike', type: 'fuel', amount: 110, categories_info: {color: '#52A666'} },
            { username: 'john', type: 'food', amount: 60, categories_info: {color: '#47D63E'} }
        ]
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(transactions, 'aggregate').mockImplementationOnce(() => { const result = [transaction_in_DB[0], transaction_in_DB[2]];
            return Promise.resolve(result);})
        jest.spyOn(Object, 'assign').mockImplementationOnce(() => transaction_in_DB[0])
        jest.spyOn(Object, 'assign').mockImplementationOnce(() => transaction_in_DB[2])
        await getTransactionsByUser(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data[0].username).toEqual(transaction_in_DB[0].username)
        expect(mockRes.json.mock.calls[0][0].data[0].type).toEqual(transaction_in_DB[0].type)
        expect(mockRes.json.mock.calls[0][0].data[0].amount).toEqual(transaction_in_DB[0].amount)

        expect(mockRes.json.mock.calls[0][0].data[1].username).toEqual(transaction_in_DB[2].username)
        expect(mockRes.json.mock.calls[0][0].data[1].type).toEqual(transaction_in_DB[2].type)
        expect(mockRes.json.mock.calls[0][0].data[1].amount).toEqual(transaction_in_DB[2].amount)
    });

    test("getTransactionsByUser T3: User.findOne throws an error -> should return 500 with error 'Database error'", async () => {
        mockReq = {
            params:{
            username: 'john',
            },
            route:{
              path: "/users/:username/transactions"
            }
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockImplementationOnce(() => {throw new Error('Database error');})
        await getTransactionsByUser(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Database error")
    });

})




describe("getTransactionsByUserByCategory", () => { 
    let mockReq;
    let mockRes;

    beforeEach(()=>{
      mockReq = {
          params:{
          username: 'user123',
          category: 'utilities'
          },
          route: {path: "/users/:username/transactions/category/:category"},
          cookies: {accessToken: 'someAccessToken', refreshToken: ''}
      };

      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {refreshTokenMessage: "Some message"}
      };
    });

    afterEach(()=>{
        jest.resetAllMocks();
    });

    test("T1: Authorization failed, trying to use admin route being a user -> should return 401, message 'Unauthorized access' ", async () => {
        mockReq.route.path = "/transactions/users/:username/category/:category"
        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: false, cause: "Unauthorized"})

        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
        
        a.mockRestore();
        
    });

    test("T2: Authorization failed, trying to use user route being not the right user  -> should return 401, message 'Unauthorized access' ", async () => {
        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: false, cause: "Unauthorized"})
        
        
        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
        
        a.mockRestore();
        
    });

    

    test("T3: (user route) User not in db -> should return 400 with message 'User not found' ", async () => {
        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(User, "findOne").mockImplementationOnce(()=>false)
        
        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({error: "User not found"})
        a.mockRestore();
        b.mockRestore();
    });

    test("T4: (user route) User in db, category not in db -> should return 400 with message 'Category not found' ", async () => {
        const user = {
            username: "john",
            email: "john@example.com",
            password: "123",
            role: "Admin",
            refreshToken: undefined
        }
        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(User, "findOne").mockImplementationOnce(()=>user)
        const c = jest.spyOn(categories, "findOne").mockImplementationOnce(()=>false)
        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({error: "Category not found"})
        a.mockRestore();
        b.mockRestore();
        c.mockRestore();
    });
    test("T5.1: (user route) Return list of transactions by user by category -> should return 200 with the data ", async () => {
        const returned_transactions = [{
            username: 'john32',
            type: 'utilities',
            amount: 50,
            date: new Date('2023-05-26'),
            categories_info: { color: '#fcbe44' },
        },
        {
            username: 'mike76',
            type: 'utilities',
            amount: 130,
            date: new Date('2023-05-29'),
            categories_info: { color: '#fcbe44' },
        }]

        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(User, "findOne").mockImplementationOnce(()=>true)
        const c = jest.spyOn(categories, "findOne").mockImplementationOnce(()=>true)
        const d = jest.spyOn(transactions, 'aggregate').mockImplementationOnce(()=> { 
            const result = returned_transactions;
            return Promise.resolve(result);
        })
        const e = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[0])
        const f = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[1])

        await getTransactionsByUserByCategory(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
        expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_transactions)
        a.mockRestore();
        b.mockRestore();
        c.mockRestore();
        d.mockRestore();
        e.mockRestore();
        f.mockRestore();
    });

    test("T5.2: (user route) Return list of transactions by user by category -> should return 200 with no transactions", async () => {
        const returned_transactions = []

        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(User, "findOne").mockImplementationOnce(()=>true)
        const c = jest.spyOn(categories, "findOne").mockImplementationOnce(()=>true)
        const d = jest.spyOn(transactions, 'aggregate').mockImplementationOnce(()=> { 
            const result = returned_transactions;
            return Promise.resolve(result);
        })
        //const e = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[0])
        //const f = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[1])

        await getTransactionsByUserByCategory(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
        expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_transactions)
        a.mockRestore();
        b.mockRestore();
        c.mockRestore();
        d.mockRestore();
        // e.mockRestore();
        // f.mockRestore();
    });

    test("T6: (Admin route) User not in db -> should return 400 with message 'User not found' ", async () => {
        mockReq.route.path = "/transactions/users/:username/category/:category"
        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(User, "findOne").mockImplementationOnce(()=>false)
        
        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({error: "User not found"})
        a.mockRestore();
        b.mockRestore();
    });


    


    test("T7: (Admin route) User not in db, category not in db -> should return 400 with message 'Category not found' ", async () => {
        mockReq.route.path = "/transactions/users/:username/category/:category"
        const user = {
            username: "john",
            email: "john@example.com",
            password: "123",
            role: "Admin",
            refreshToken: undefined
        }
        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(User, "findOne").mockImplementationOnce(()=>user)
        const c = jest.spyOn(categories, "findOne").mockImplementationOnce(()=>false)
        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({error: "Category not found"})
        a.mockRestore();
        b.mockRestore();
        c.mockRestore();
    });
    

    

    test("T8: (admin route) Return list of transactions by user by category -> should return 200 with the data ", async () => {
        mockReq.route.path = "/transactions/users/:username/category/:category"
        const returned_transactions = [{
            username: 'john32',
            type: 'utilities',
            amount: 50,
            date: new Date('2023-05-26'),
            categories_info: { color: '#fcbe44' },
        },
        {
            username: 'mike76',
            type: 'utilities',
            amount: 130,
            date: new Date('2023-05-29'),
            categories_info: { color: '#fcbe44' },
        }]

        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(User, "findOne").mockImplementationOnce(()=>true)
        const c = jest.spyOn(categories, "findOne").mockImplementationOnce(()=>true)
        const d = jest.spyOn(transactions, 'aggregate').mockImplementationOnce(()=> { 
            const result = returned_transactions;
            return Promise.resolve(result);
        })
        const e = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[0])
        const f = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[1])

        await getTransactionsByUserByCategory(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
        expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_transactions)
        a.mockRestore();
        b.mockRestore();
        c.mockRestore();
        d.mockRestore();
        e.mockRestore();
        f.mockRestore();
    });
    
    test("T9.1: (user route) Access and refresh token expired, refreshed token message -> should return 401", async () => {
        
        mockReq.cookies.accessToken = "expired_Token_regular";
        mockReq.cookies.refreshToken = "expired_Token_regular";
        await getTransactionsByUserByCategory(mockReq, mockRes);
      
        expect(mockRes.status).toHaveBeenCalledWith(401);
      });
    
      test("T9.2: (user route) Access token expired, Return list of transactions by user by category -> should return 200 with data and refreshed token message", async () => {
        mockReq.cookies.accessToken = "expired_Token_regular";
        mockReq.cookies.refreshToken = "regularRefreshToken";
        const returned_transactions = [
          {
            username: 'john32',
            type: 'utilities',
            amount: 50,
            date: new Date('2023-05-26'),
            categories_info: { color: '#fcbe44' },
          },
          {
            username: 'mike76',
            type: 'utilities',
            amount: 130,
            date: new Date('2023-05-29'),
            categories_info: { color: '#fcbe44' },
          }
        ];
        const message = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls";
          
        // Mock the necessary functions or services
        const a = jest.spyOn(moduleApi, "verifyAuth").mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(User, "findOne").mockImplementationOnce(()=>true)
        const c = jest.spyOn(categories, "findOne").mockImplementationOnce(()=>true)
        const d = jest.spyOn(transactions, 'aggregate').mockImplementationOnce(()=> { 
            const result = returned_transactions;
            return Promise.resolve(result);
        })
        const e = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[0])
        const f = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[1])
        
        mockRes.locals.refreshedTokenMessage = message;
        
        // Call the function under test
        await getTransactionsByUserByCategory(mockReq, mockRes);
        
        // Assert the response
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          data: returned_transactions,
          refreshedTokenMessage: message
        });
        
        // Restore the mock functions
        a.mockRestore();
        b.mockRestore();
      });
      
      

    test("T10: findOne throws exception -> should return 500", async () => {
        const a = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(User, 'findOne').mockImplementationOnce(() => {throw new Error('Database error');})
        
          await getTransactionsByUserByCategory(mockReq, mockRes);
        
          // Assert that the response status is 500 and the error message is sent in the response
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
          a.mockRestore();
          b.mockRestore();
    });

})




describe("getTransactionsByGroup", () => { 

    let mockReq;
    let mockRes;

    beforeEach(()=>{
        mockReq = {
            params:{
            name: 'Family',
            },
            route: {path: "/groups/:name/transactions"}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshTokenMessage: "Some message"}
        };
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })

    test("T1: Group name doesn't exist in the DB -> should return 400 with message 'group not'", async () => {
        const a = jest.spyOn(Group, "findOne").mockImplementation(()=>false)

        await getTransactionsByGroup(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0]).toEqual({error: "Group not found"})
        a.mockRestore();
    });

    // T2: Authorization failed, trying to use admin route being a user -> should return 401 with error 'Unauthorized access' 
    // T3: Authorization failed, trying to ask for transaction of group which the user doesn't belong to -> should return 401 with error 'Unauthorized access' 
    // T4: Admin asks for transaction of the group -> should return 200
    // T5: User asks for transaction of the group he/she belongs to -> should return 200
    test("T2: Authorization failed, trying to use admin route being a user -> should return 401 with error 'Unauthorized access'", async () => {
        mockReq.route.path = "/transactions/groups/:name";
        const group = {
            name: "groupOne",
            members: [
              {email: "mike@example.it", id:"idOne"},
            ]
          };
          const a = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
          const b = jest.spyOn(Group, "findOne").mockImplementation(()=>group)
        
        await getTransactionsByGroup(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
        a.mockRestore();
        b.mockRestore();
   });

   test("T3: Authorization failed, trying to ask for transaction of group which the user doesn't belong to -> should return 401 with error 'Unauthorized access'", async () => {
    
    const group = {
        name: "groupOne",
        members: [
          {email: "mike@example.it", id:"idOne"},
        ]
      };
      const a = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})
      const b = jest.spyOn(Group, "findOne").mockImplementation(()=>group)

      await getTransactionsByGroup(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
        a.mockRestore();
        b.mockRestore();

    });


    test("T4: Admin asks for transaction of the group -> should return 200", async () => {
        mockReq.route.path = "/transactions/groups/:name";
        const returned_transactions = [{
            username: 'john32',
            type: 'expense',
            amount: 50,
            date: new Date('2023-05-26'),
            categories_info: { color: '#fcbe44' },
        },
        {
            username: 'mike76',
            type: 'grocery',
            amount: 130,
            date: new Date('2023-05-29'),
            categories_info: { color: '#fcbe44' },
        }]
        const group = {
            name: "groupOne",
            members: [
              {email: "mike@example.it", id:"idOne"},
              {email: "john@example.it", id:"idjohn"},
            ]
          };
        const a = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(Group, "findOne").mockImplementation(()=>group)
        
        const c = jest.spyOn(transactions, 'aggregate').mockImplementationOnce(()=> { 
            const result = returned_transactions;
            return Promise.resolve(result);
        })

        const d = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[0])
        const e = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[1])

        await getTransactionsByGroup(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
        expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_transactions)
        a.mockRestore();
        b.mockRestore();
        c.mockRestore();
        d.mockRestore();
        e.mockRestore();
    });

    test("T5: User asks for transaction of the group he/she belongs to -> should return 200", async () => {
        
        const returned_transactions = [{
            username: 'john32',
            type: 'expense',
            amount: 50,
            date: new Date('2023-05-26'),
            categories_info: { color: '#fcbe44' },
        },
        {
            username: 'mike76',
            type: 'grocery',
            amount: 130,
            date: new Date('2023-05-29'),
            categories_info: { color: '#fcbe44' },
        }]
        const group = {
            name: "groupOne",
            members: [
              {email: "mike@example.it", id:"idOne"},
              {email: "john@example.it", id:"idjohn"},
            ]
          };
        const a = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(Group, "findOne").mockImplementation(()=>group)
        
        const c = jest.spyOn(transactions, 'aggregate').mockImplementationOnce(()=> { 
            const result = returned_transactions;
            return Promise.resolve(result);
        })

        const d = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[0])
        const e = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[1])

        await getTransactionsByGroup(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
        expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_transactions)
        a.mockRestore();
        b.mockRestore();
        c.mockRestore();
        d.mockRestore();
        e.mockRestore();
    });

    test("T6: findOne throws exception -> should return 500", async () => {
        const a = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        const b = jest.spyOn(Group, 'findOne').mockImplementationOnce(() => {throw new Error('Database error');})
        
          await getTransactionsByGroup(mockReq, mockRes);
        
          // Assert that the response status is 500 and the error message is sent in the response
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
          a.mockRestore();
          b.mockRestore();
    });
})




describe("getTransactionsByGroupByCategory", () => { 
    let mockReq;
    let mockRes;

    beforeEach(()=>{
       mockReq = {
           params:{
            name: 'Family',
            category: 'utilities',
           },
           route:{path: "/groups/:name/transactions/category/:category"}
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

     
         test("T1: Group not found in the db -> should return 400", async () => {
        
        
        const a = jest.spyOn(Group, "findOne").mockImplementation(()=>false)

        
         await getTransactionsByGroupByCategory(mockReq, mockRes)

         expect(mockRes.status).toHaveBeenCalledWith(400)
         expect(mockRes.json).toHaveBeenCalledWith({error: "Group not found"})
         a.mockRestore();
         
     });
    //  
    test("T2: Authorization failed, trying to use admin route being a user -> should return 401 with error 'Unauthorized access'", async () => {
        mockReq.route.path = "/transactions/groups/:name/category/:category";
        const group = {
            name: "groupOne",
            members: [
              {email: "mike@example.it", id:"idOne"},
              {email: "john@example.it", id:"idjohn"},
            ]
          }; 
        const a = jest.spyOn(Group, "findOne").mockImplementation(()=>group)
        const b = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
       
        a.mockRestore();
        b.mockRestore();  
    });
       
    test("T3: Authorization failed, trying to ask for transaction of group which the user doesn't belong to -> should return 401 with error 'Unauthorized access'", async () => {
        const group = {
            name: "groupOne",
            members: [
              {email: "mike@example.it", id:"idOne"},
              {email: "john@example.it", id:"idjohn"},
            ]
          }; 
        const a = jest.spyOn(Group, "findOne").mockImplementation(()=>group)
        const b = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
       
        a.mockRestore();
        b.mockRestore();  
    });
    
     test("T4: Category not found in db -> should return 400", async () => {
        const group = {
            name: "groupOne",
            members: [
              {email: "mike@example.it", id:"idOne"},
              {email: "john@example.it", id:"idjohn"},
            ]
          }; 
        const a = jest.spyOn(Group, "findOne").mockImplementation(()=>group)
        const b = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        const c = jest.spyOn(categories, "findOne").mockImplementation(()=>false)
         await getTransactionsByGroupByCategory(mockReq, mockRes)

         expect(mockRes.status).toHaveBeenCalledWith(400)
         expect(mockRes.json.mock.calls[0][0]).toEqual({error: "Category not found"})
         a.mockRestore();
        b.mockRestore();
        c.mockRestore();
     });
     
    test("T5: User asks for transactions -> should return 200", async () => {
        const group = {
            name: "groupOne",
            members: [
              {email: "mike@example.it", id:"idOne"},
              {email: "john@example.it", id:"idjohn"},
            ]
          }; 
          const category = {
            type: "utilities",
            color: "red",
          }
        const returned_transactions = [{
            username: 'john32',
            type: 'utilities',
            amount: 50,
            date: new Date('2023-05-26'),
            categories_info: { color: 'red' },
        },
        {
            username: 'mike76',
            type: 'utilities',
            amount: 130,
            date: new Date('2023-05-29'),
            categories_info: { color: 'red' },
        }]

        const a = jest.spyOn(Group, "findOne").mockImplementation(()=>group)
        const b = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        const c = jest.spyOn(categories, "findOne").mockImplementation(()=>category)
        const d = jest.spyOn(transactions, 'aggregate').mockImplementationOnce(()=> { 
            const result = returned_transactions;
            return Promise.resolve(result);
        })
        const e = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[0])
        const f = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[1])
        
        await getTransactionsByGroupByCategory(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
        expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_transactions)
        a.mockRestore();
        b.mockRestore();
        c.mockRestore();
        d.mockRestore();
        e.mockRestore();
        f.mockRestore();
    });
      
    test("T6: (admin) Category not found in db -> should return 400", async () => {
        mockReq.route.path = "/transactions/groups/:name/category/:category";
        const group = {
            name: "groupOne",
            members: [
              {email: "mike@example.it", id:"idOne"},
              {email: "john@example.it", id:"idjohn"},
            ]
          }; 
        const a = jest.spyOn(Group, "findOne").mockImplementation(()=>group)
        const b = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        const c = jest.spyOn(categories, "findOne").mockImplementation(()=>false)
         
        await getTransactionsByGroupByCategory(mockReq, mockRes)

         expect(mockRes.status).toHaveBeenCalledWith(400)
         expect(mockRes.json.mock.calls[0][0]).toEqual({error: "Category not found"})
         a.mockRestore();
        b.mockRestore();
        c.mockRestore();
     });
    
    test("T7: Admin asks for transactions -> should return 200", async () => {
        mockReq.route.path = "/transactions/groups/:name/category/:category";
        const group = {
            name: "groupOne",
            members: [
              {email: "mike@example.it", id:"idOne"},
              {email: "john@example.it", id:"idjohn"},
            ]
          }; 
          const category = {
            type: "utilities",
            color: "#fcbe44",
          }
        const returned_transactions = [{
            username: 'john32',
            type: 'utilities',
            amount: 50,
            date: new Date('2023-05-26'),
            categories_info: { color: '#fcbe44' },
        },
        {
            username: 'mike76',
            type: 'utilities',
            amount: 130,
            date: new Date('2023-05-29'),
            categories_info: { color: '#fcbe44' },
        }]

        const a = jest.spyOn(Group, "findOne").mockImplementation(()=>group)
        const b = jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        const c = jest.spyOn(categories, "findOne").mockImplementation(()=>category)
        const d = jest.spyOn(transactions, 'aggregate').mockImplementationOnce(()=> { 
            const result = returned_transactions;
            return Promise.resolve(result);
        })
        const e = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[0])
        const f = jest.spyOn(Object, 'assign').mockReturnValueOnce(returned_transactions[1])
        
        await getTransactionsByGroupByCategory(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})
        expect(mockRes.json.mock.calls[0][0].data).toEqual(returned_transactions)
        a.mockRestore();
        b.mockRestore();
        c.mockRestore();
        d.mockRestore();
        e.mockRestore();
        f.mockRestore();
    });

    test("T8: findOne throws an error -> should return 500", async () => {
        const mockError = new Error("Database error");
        const mockFindOne = jest.spyOn(Group, "findOne").mockImplementationOnce(() => {
          throw mockError;
        });
      
        await getTransactionsByGroupByCategory(mockReq, mockRes);
      
        // Assert that the response status is 500 and the error message is sent in the response
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
      
        // Restore the mocked function
        mockFindOne.mockRestore();
      });
      

})




describe("deleteTransaction", () => { 

    let mockReq;
    let mockRes;

    beforeEach(()=>{
      mockReq = {
          body:{_id: valid_id1},
          params:{
          username: 'mike',
          }
      };

      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {refreshTokenMessage: "Some message"}
      };
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })


    test("T1: User authentication failed -> should return 401 with message 'Unauthorized access'", async () => {
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

        await deleteTransaction(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
    });

   //All tests starting with T2 refer to passed authentication
   test("T2.1.1: _id is missing from the body of the request -> should return 400 with message 'Missing _id in the request body'", async () => {
    mockReq = {
          body:{},
          params:{
          username: 'mike',
          }
      };
    jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

    await deleteTransaction(mockReq,mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing _id in the request body")
    });

    test("T2.1.2: _id is an empty string -> should return 400 with message 'Missing _id in the request body'", async () => {
        mockReq = {
                body:{_id: ''},
              params:{
              username: 'mike',
              }
          };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
    
        await deleteTransaction(mockReq,mockRes);
    
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Missing _id in the request body")
        });


    test("T2.2.1: username doesn't exist in the DB -> should return 400 with message 'User not found'", async () => {
        mockReq = {
                body:{_id: valid_id1},
                params:{
                username: 'mike',
                }
            };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(false)
        await deleteTransaction(mockReq,mockRes);
    
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("User not found")
    });

        
    test("T2.2.2: _id is not valid -> should return 400 with message 'Transaction not found, _id not valid'", async () => {
        mockReq = {
                body:{_id: 'unvalid_ID'},
                params:{
                username: 'mike',
                }
            };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(transactions, 'findOne').mockReturnValueOnce(false)
        await deleteTransaction(mockReq,mockRes);
    
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Transaction not found, _id not valid")
    }); 

    //All tests starting with T2.3 refer to passed verification, request body is correct, username exists in the DB
    test("T2.3.1: Valid _id, but couldn't find transaction in the DB corresponding to the _id -> should return 400 with message 'Transaction not found'", async () => {
        mockReq = {
                body:{_id: valid_id1},
                params:{
                username: 'mike',
                }
            };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(transactions, 'findOne').mockReturnValueOnce(false)
        await deleteTransaction(mockReq,mockRes);
    
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Transaction not found")
    });
 
    test("T2.3.2: found transaction in the DB corresponding to _id, but this transaction has a username different than the username in the req params  -> should return 400 with message 'Transaction not found'", async () => {
        mockReq = {
                body:{_id: valid_id1},
                params:{
                username: 'mike',
                }
            };
        const transaction_in_DB = {username: "john", type: "utilities", amount: 120, date: "23/12/2022"
        }
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(transactions, 'findOne').mockReturnValueOnce(transaction_in_DB)

        await deleteTransaction(mockReq,mockRes);
    
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Transaction not found")
    });
 

    test("T2.3.3: found transaction in the DB corresponding to _id-> should return 200 with message 'Transaction deleted'", async () => {
        mockReq = {
                body:{_id: valid_id1},
                params:{
                username: 'john',
                }
            };
        const transaction_in_DB = {username: "john", type: "utilities", amount: 120, date: "23/12/2022"}
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        jest.spyOn(transactions, 'findOne').mockReturnValueOnce(transaction_in_DB)
        jest.spyOn(transactions, 'deleteOne').mockReturnValueOnce(true)

        await deleteTransaction(mockReq,mockRes);

        //expect(transactions.deleteOne).toHaveBeenCalledWith({ _id: mockReq.body._id });
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data).toEqual({ message: "Transaction deleted" })
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})

    });

 
    test("T2.4: transactions.find throwed an exception -> should return 500 with message 'Database error'", async () => {
        mockReq = {
                body:{_id: valid_id1},
                params:{
                username: 'john',
                }
            };
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(User, 'findOne').mockReturnValueOnce(true)
        transactions.findOne = jest.fn(()=>null).mockImplementation(() => {throw new Error('Database error');})
        await deleteTransaction(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Database error'})
    }); 
    
})




describe("deleteTransactions", () => { 
    let mockReq;
    let mockRes;

    beforeEach(()=>{
      mockReq = {
          body:{_ids: ["6hjkohgfc8nvu786", "4rcnsmdkp0wdb357", "wgfnch41wue8jei5"]}
      };

      mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {refreshTokenMessage: "Some message"}
      };
    });

    afterEach(()=>{
        jest.resetAllMocks();
    })


    test("deleteTransactions T1: User authentication failed -> should return 401 with message 'Unauthorized access'", async () => {
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: false, cause: "Unauthorized"})

        await deleteTransactions(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Unauthorized access")
    });

    //All tests starting with T2 refer to passed authentication
    test("deleteTransactions T2.1.1: missing _ids attribute in body request -> should return 400 with message 'Invalid request body. Missing _ids array' ", async () => {
        mockReq = {
            body:{}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await deleteTransactions(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Invalid request body. Missing _ids array")
    });

    test("deleteTransactions T2.1.2: _ids attribute is not an array -> should return 400 with message 'Invalid request body. Missing _ids array' ", async () => {
        mockReq = {
            body:{_ids: "not_an_array"}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await deleteTransactions(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Invalid request body. Missing _ids array")
    }); 
    

    test("deleteTransactions T2.1.3: _ids attribute has an empty element -> should return 400 with message 'Invalid transaction ID' ", async () => {
        mockReq = {
            body:{_ids: [valid_id1, "7479e86b52b2827ceb04d3f1", " "]}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await deleteTransactions(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Invalid transaction ID")
    }); 

    test("deleteTransactions T2.1.4: _ids attribute has an invalid element -> should return 400 with message 'Transaction not found, _id not valid' ", async () => {
        mockReq = {
            body:{_ids: ["invalid_ID", "7479e86b52b2827ceb04d3f1", "8479e86b52b2827ceb04d3f1"]}
        };
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})

        await deleteTransactions(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Transaction not found, _id not valid")
    });
    

    //All tests starting with T2.2 refer to passed authentication and _ids attribute is correct
    test("deleteTransactions T2.2.1: Could not find transactions corresponding to all ids in DB-> should return 400 with message 'Invalid request body. Missing or invalid _ids array' ", async () => {
        mockReq = {
            body:{_ids: [valid_id1, valid_id2, valid_id3]}
        };
        const matched_transactions_in_DB = [
            {username: "mike", type: "utilities", amount: 120, date: "23/12/2022"},
            {username: "john", type: "groceries", amount: 40, date: "10/12/2022"}
        ]

        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(transactions, 'find').mockImplementation(() => matched_transactions_in_DB)
        await deleteTransactions(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json.mock.calls[0][0].error).toEqual("Invalid request body. Missing or invalid _ids array")
    });


    test("deleteTransactions T2.2.2: Found transactions corresponding to all ids in DB -> should return 400 with message 'Invalid request body. Missing or invalid _ids array' ", async () => {
        mockReq = {
            body:{_ids: [valid_id1, valid_id2, valid_id3]}
        };
        const matched_transactions_in_DB = [
            {username: "mike", type: "utilities", amount: 120, date: "23/12/2022"},
            {username: "john", type: "groceries", amount: 40, date: "10/12/2022"},
            {username: "sarah", type: "fuel", amount: 200, date: "30/11/2022"},
        ]

        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(transactions, 'find').mockImplementation(() => matched_transactions_in_DB)
        jest.spyOn(transactions, 'deleteMany').mockReturnValueOnce(true)

        await deleteTransactions(mockReq,mockRes);
        expect(transactions.deleteMany).toHaveBeenCalledTimes(1)
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json.mock.calls[0][0].data).toEqual({ message: "Transactions deleted" })
        expect(mockRes.locals).toEqual({refreshTokenMessage: "Some message"})    
    });


    test("deleteTransactions T2.3: transactions.find throws an error-> should return 500 with message 'Database error'", async () => {
        mockReq = {
            body:{_ids: [valid_id1, valid_id2, valid_id3]}
        };
        
        jest.spyOn(moduleApi, 'verifyAuth').mockReturnValueOnce({flag: true, cause: "Authorized"})
        jest.spyOn(transactions, 'find').mockImplementation(() => {throw new Error('Database error');})

        await deleteTransactions(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json.mock.calls[0][0]).toEqual({ error: 'Database error'})
    });

})
