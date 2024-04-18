import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken')
jest.mock("bcryptjs")
jest.mock('../models/User.js');


describe('handleDateFilterParams', () => {
  test("T1: Date parameter provided -> should return date filter object with start and end of day", async() => {
    const req = { query: { date: '2023-01-01' } };

    const result = handleDateFilterParams(req);

    expect(result).toEqual({
      date: {
        $gte: new Date('2023-01-01T00:00:00'),
        $lte: new Date('2023-01-01T23:59:59')
      }
    });
  });

  

  test("T2: From parameter provided -> should return date filter object with start date", async() => {
    const req = { query: { from: '2023-01-01' } };

    const result = handleDateFilterParams(req);

    expect(result).toEqual({
      date: {
        $gte: new Date('2023-01-01T00:00:00.000Z')
      }
    });
  });

  test("T3: UpTo parameter provided -> should return date filter object with end of day", async() => {
    const req = { query: { upTo: '2023-01-31' } };

    const result = handleDateFilterParams(req);

    expect(result).toEqual({
      date: {
        $lte: new Date('2023-01-31T23:59:59.999Z')
      }
    });
  });

  test("T4: Date and from parameters provided -> should throw an error", async() => {
    const req = { query: { date: '2023-01-01', from: '2023-01-02' } };

    try {
      handleDateFilterParams(req);
      // If no error is thrown, fail the test
      throw new Error("Expected an error to be thrown.");
    } catch (error) {
      expect(error.message).toBe("Invalid query parameters. 'date' cannot be used together with 'from' or 'upTo'.");
    }
    });

  test("T5: Date and upTo parameters provided -> should throw an error", () => {
    const req = { query: { date: '2023-01-01', upTo: '2023-01-31' } };

    try {
      handleDateFilterParams(req);
      // If no error is thrown, fail the test
      throw new Error("Expected an error to be thrown.");
    } catch (error) {
      expect(error.message).toBe("Invalid query parameters. 'date' cannot be used together with 'from' or 'upTo'.");
    }
  });

  test("T6: Invalid date format in date parameter -> should throw an error", () => {
    const req = { query: { date: '2023/01/01T00:00:00' } };

    try {
      handleDateFilterParams(req);
      // If no error is thrown, fail the test
      throw new Error("Expected an error to be thrown.");
    } catch (error) {
      expect(error.message).toBe("Invalid date format. Date must be in the format 'YYYY-MM-DD'.");
    }
  });

  test("T7: Invalid date format in from parameter -> should throw an error", () => {
    const req = { query: { from: '2023/01/01T00:00:00' } };

    try {
      handleDateFilterParams(req);
      // If no error is thrown, fail the test
      throw new Error("Expected an error to be thrown.");
    } catch (error) {
      expect(error.message).toBe("Invalid date format. Date must be in the format 'YYYY-MM-DD'.");
    }  });

  test("T8: Invalid date format in upTo parameter -> should throw an error", () => {
    const req = { query: { upTo: '2023/01-01T00:00:00' } };

    try {
      handleDateFilterParams(req);
      // If no error is thrown, fail the test
      throw new Error("Expected an error to be thrown.");
    } catch (error) {
      expect(error.message).toBe("Invalid date format. Date must be in the format 'YYYY-MM-DD'.");
    }  });

  test("T9: No date parameters provided -> should return an empty object", () => {
    const req = { query: {} };

    const result = handleDateFilterParams(req);

    expect(result).toEqual({});
  });
});



describe("verifyAuth", () => { 

  let mockReq;
  let mockRes;
  let mockInfo;

    beforeEach(()=>{
        mockReq = {
            body:{},
            cookies: {accessToken: "testerAccessTokenValid", refreshToken: "testerAccessTokenValid"}
        };
        
        mockRes = {cookie: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                   locals: {refreshedTokenMessage: "Some message"}
        };
        mockInfo ={
            authType: "User",
            username: "john",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
    });

    afterEach(()=>{
        jest.clearAllMocks();
    })


    test("verifyAuth T1.1: accessToken is missing -> should return false flag and 'Unauthorized as cause' ", async() => {
        mockReq = {
            body:{},
            cookies: {accessToken: "", refreshToken: "testerAccessTokenValid"}
        };
        
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Unauthorized")
    });


    test("verifyAuth T1.2: refreshToken is missing -> should return false flag and 'Unauthorized' as cause ", async() => {
        mockReq = {
            body:{},
            cookies: {accessToken: "testerAccessTokenValid", refreshToken: ""}
        };
        
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Unauthorized")
    });


    test("verifyAuth T2: Both tokens are present, but the info.authType is not recognized -> should return false flag and 'Unauthorized' as cause ", async() => {
 
        mockInfo ={
            authType: "Non_existing_authType",
            username: "sarah43",
            emails: "john@gmail.com"
        }

        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Unauthorized")
    });

    //All tests starting with T3 refer to both Tokens present and valid, authType is valid
    test("verifyAuth T3.1.1: Decoded Access Token is missing the username -> should return false flag and 'Unauthorized' as cause ", async() => {
        
        const mockDecodedAccessToken = {username: '', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Token is missing information")
    });

    test("verifyAuth T3.1.2: Decoded Access Token is missing the email -> should return false flag and 'Unauthorized' as cause ", async() => {

        const mockDecodedAccessToken = {username: 'john', email: '', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Token is missing information")
    });

    test("verifyAuth T3.1.3: Decoded Access Token is missing the role -> should return false flag and 'Unauthorized' as cause ", async() => {
        
        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: ''}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Token is missing information")
    });


    test("verifyAuth T3.2.1: Decoded Refresh Token is missing the username -> should return false flag and 'Unauthorized' as cause ", async() => {

        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: '', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Token is missing information")
    });

    test("verifyAuth T3.2.2: Decoded Refresh Token is missing the email -> should return false flag and 'Unauthorized' as cause ", async() => {

        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: '', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result =  verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Token is missing information")
    });

    test("verifyAuth T3.2.3: Decoded Refresh Token is missing the role -> should return false flag and 'Unauthorized' as cause ", async() => {

        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: ''}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Token is missing information")
    });

    //All tests starting with T3.3 refer to both tokens present, valid, have all the necessary attributes and authType is valid 
    test("verifyAuth T3.3.1: Decoded Refresh Token and decoded Access Token have different usernames -> should return false flag and 'Mismatched users' as cause", async() => {

        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'mike', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Mismatched users")
    });

    test("verifyAuth T3.3.2: Decoded Refresh Token and decoded Access Token have different emails -> should return false flag and 'Mismatched users' as cause", async() => {

        const mockDecodedAccessToken = {username: 'john', email: 'mike@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Mismatched users")
    });

    test("verifyAuth T3.3.3: Decoded Refresh Token and decoded Access Token have different roles -> should return false flag and 'Mismatched users' as cause", async() => {

        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Admin'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Mismatched users")
    });

    //All tests starting with T4 refer to both tokens present, valid, all attributes present, attributes for access and refresh token match, authType is valid
    test("verifyAuth T4.1: info.authType is Simple -> should return true flag and 'Authorized' as cause", async() => {
        mockInfo ={
            authType: "Simple",
            username: "john",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(true)
        expect(result.cause).toBe("Authorized")
    });

    test("verifyAuth T4.2.1: info.authType is User, tokens' username match that of info.username -> should return true flag and 'Authorized' as cause", async() => {
        mockInfo ={
            authType: "User",
            username: "john",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(true)
        expect(result.cause).toBe("Authorized")
    });


    test("verifyAuth T4.2.2: info.authType is User, but decodedAccessToken.username is different from info.username -> should return true flag and 'Authorized' as cause", async() => {
        mockInfo ={
            authType: "User",
            username: "sarah43",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Unauthorized access, not a User")
    });


    test("verifyAuth T4.3: info.authType is Admin, but decodedAccessToken.role is not Admin -> should return true flag and 'Authorized' as cause ", async() => {
        mockInfo ={
            authType: "Admin",
            username: "john",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Unauthorized access, not an Admin")
    });


    test("verifyAuth T4.4: info.authType is Group, but info.emails does not include decodedAccessToken.email -> should return true flag and 'Authorized' as cause ", async() => {
        mockInfo ={
            authType: "Group",
            username: "john",
            emails: ["sarah@gmail.com", "mike@gmail.com"]
        }
        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Unauthorized access, not in a group")
    });


    test("verifyAuth T4.5: info.authType is Group, and info.emails includes decodedAccessToken.email -> should return true flag and 'Authorized' as cause ", async() => {
        mockInfo ={
            authType: "Group",
            username: "john",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockDecodedAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const mockDecodedRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedAccessToken)
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockDecodedRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(true)
        expect(result.cause).toBe("Authorized")
    });
    

    //All tests starting with T5 refer to both tokens present, refreshToken is valid, but accessToken is expired, authType is valid
    test("verifyAuth T5.1: info.authType is Simple -> should return true flag and 'Authorized' as cause", async() => {
        mockInfo ={
            authType: "Simple",
            username: "mike",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}
        const newAccesssToken = 'someNewAccessToken'

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            throw error;
        })
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockAccessToken)
        jest.spyOn(jwt, 'sign').mockReturnValueOnce(() => newAccesssToken)

        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(true)
        expect(result.cause).toBe("Authorized")
    });


    test("verifyAuth T5.2: info.authType is User, but refreshToken.username is different than info.username -> should return false flag and 'Unauthorized access' as cause ", async() => {
        mockInfo ={
            authType: "User",
            username: "mike",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockAccessToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            throw error;
        })
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockAccessToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Unauthorized access")
    });


    test("verifyAuth T5.3.1: info.authType is Admin, but refreshToken.role is not 'Admin' -> should return false flag and 'Unauthorized access' as cause ", async() => {
        mockInfo ={
            authType: "Admin",
            username: "john",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            throw error;
        })
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Unauthorized access")
    });


    test("verifyAuth T5.3.2: info.authType is Admin, refreshToken.role is 'Admin' -> should return true flag and 'Authorized' as cause ", async() => {
        mockInfo ={
            authType: "Admin",
            username: "john",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Admin'}

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            throw error;
        })
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(true)
        expect(result.cause).toBe("Authorized")
    });


    test("verifyAuth T5.4.1: info.authType is Group, but refreshToken.email is not included in info.emails -> should return false flag and 'Unauthorized access, not in a group' as cause ", async() => {
        mockInfo ={
            authType: "Group",
            username: "john",
            emails: ["sarah@gmail.com", "mike@gmail.com"]
        }
        const mockRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            throw error;
        })
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Unauthorized access, not in a group")
    });


    test("verifyAuth T5.4.2: info.authType is Group, refreshToken.email is included in info.emails -> should return true flag and 'Authorized' as cause ", async() => {
        mockInfo ={
            authType: "Group",
            username: "john",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            throw error;
        })
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(true)
        expect(result.cause).toBe("Authorized")
    });


    test("verifyAuth T6: jwt.verify throwed an error because refresh token is expired -> should return false flag and 'perform login again' as cause ", async() => {
        mockInfo ={
            authType: "User",
            username: "john",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockRefreshToken = {username: 'john', email: 'john@gmail.com', id: '64709aa5bff1708afb0798bc',role: 'Regular'}
        const newAccesssToken = 'someNewAccessToken'
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            throw error;
        });
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            throw error;
        });

        const result = await verifyAuth(mockReq, mockRes, mockInfo)

        expect(result.flag).toBe(false)
        expect(result.cause).toBe("Perform login again")
        

    });


    test("verifyAuth T7: jwt.verify throwed an error, but not due to expiry -> should return false flag and 'JsonWebTokenError' as cause ", async() => {
        mockInfo ={
            authType: "User",
            username: "john",
            emails: ["sarah@gmail.com", "mike@gmail.com"]
        }
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            throw error;
        });
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'other_error';
            throw error;
        });

        const result = await verifyAuth(mockReq, mockRes, mockInfo)

        expect(result.flag).toBe(false)
        expect(result.cause).toBe("other_error")
    });


    test("T8: jwt.verify throws an exception because of some random error -> should return false flag and 'err.name' as cause ", async() => {
        mockInfo ={
            authType: "User",
            username: "mike",
            emails: ["john@gmail.com", "mike@gmail.com"]
        }
        const mockRefreshToken = {username: 'john', email: 'john@gmail.com', role: 'Regular'}

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            const error = new Error('Token expired');
            error.name = 'other_error';
            throw error;
        })
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(mockRefreshToken)
        const result = await verifyAuth(mockReq, mockRes, mockInfo)
        expect(result.flag).toBe(false)
        expect(result.cause).toBe("other_error")
    });
})






describe('handleAmountFilterParams', () => {
  test("T1: No min and max parameters provided -> should return empty object", () => {
    const req = { query: {} };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({});
  });

  test("T2: Only min parameter provided -> should return amount filter object with $gte", () => {
    const req = { query: { min: '100' } };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({ amount: { $gte: 100 } });
  });

  test("T3: Only max parameter provided -> should return amount filter object with $lte", () => {
    const req = { query: { max: '500' } };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({ amount: { $lte: 500 } });
  });

  test("T4: Both min and max parameters provided -> should return amount filter object with $gte and $lte", () => {
    const req = { query: { min: '100', max: '500' } };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({ amount: { $gte: 100, $lte: 500 } });
  });

  test("T5: Invalid min parameter -> should throw an error", () => {
    const req = { query: { min: 'abc' } };
    try {
      handleAmountFilterParams(req);
      // If no error is thrown, fail the test
      throw new Error("Expected an error to be thrown.");
    } catch (error) {
      expect(error.message).toBe("Invalid query parameter. 'min' must be a numerical value.");
    }  
   });

  test("T6: Invalid max parameter -> should throw an error", () => {
    const req = { query: { max: 'xyz' } };
    try {
      handleAmountFilterParams(req);
      // If no error is thrown, fail the test
      throw new Error("Expected an error to be thrown.");
    } catch (error) {
      expect(error.message).toBe("Invalid query parameter. 'max' must be a numerical value.");
    }
    });
});

