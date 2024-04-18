import jwt from 'jsonwebtoken'

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 - Returns an object with a `date` attribute used for filtering mongoDB's `aggregate` queries
- The value of `date` is an object that depends on the query parameters:
  - If the query parameters include `from` then it must include a `$gte` attribute that specifies the starting date as a `Date` object in the format **YYYY-MM-DDTHH:mm:ss**
    - Example: `/api/users/Mario/transactions?from=2023-04-30` => `{date: {$gte: 2023-04-30T00:00:00.000Z}}`
  - If the query parameters include `upTo` then it must include a `$lte` attribute that specifies the ending date as a `Date` object in the format **YYYY-MM-DDTHH:mm:ss**
    - Example: `/api/users/Mario/transactions?upTo=2023-05-10` => `{date: {$lte: 2023-05-10T23:59:59.000Z}}`
  - If both `from` and `upTo` are present then both `$gte` and `$lte` must be included
  - If `date` is present then it must include both `$gte` and `$lte` attributes, these two attributes must specify the same date as a `Date` object in the format **YYYY-MM-DDTHH:mm:ss**
    - Example: `/api/users/Mario/transactions?date=2023-05-10` => `{date: {$gte: 2023-05-10T00:00:00.000Z, $lte: 2023-05-10T23:59:59.000Z}}`
  - If there is no query parameter then it returns an empty object
    - Example: `/api/users/Mario/transactions` => `{}`
- Throws an error if `date` is present in the query parameter together with at least one of `from` or `upTo`
- Throws an error if the value of any of the three query parameters is not a string that represents a date in the format **YYYY-MM-DD**
 */


function isValidDateFormat(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const isValidDate = !isNaN(date) && date.toISOString().slice(0, 10) === dateString;
  
  return isValidDate;
}

export const handleDateFilterParams = (req) => {
  let { date = '', from = '', upTo = '' } = req.query || {};

  date = date ? date.trim() : date;
  from = from ? from.trim() : from;
  upTo = upTo ? upTo.trim() : upTo;

  if ((date && from) || (date && upTo)) {
    throw new Error("Invalid query parameters. 'date' cannot be used together with 'from' or 'upTo'.");
  }

  let dateFilter = {};

  if (date) {
    if (!isValidDateFormat(date)){
      throw new Error("Invalid date format. Date must be in the format 'YYYY-MM-DD'.");
    }
    let parsedDate = new Date(date);
    let startOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 0, 0, 0);
    let endOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 23, 59, 59);

    dateFilter.$gte = startOfDay;
    dateFilter.$lte = endOfDay;
  } else {
    if (from) {
      if (!isValidDateFormat(from)){
        throw new Error("Invalid date format. Date must be in the format 'YYYY-MM-DD'.");
      }
      let parsedFrom = new Date(from);
      dateFilter.$gte = parsedFrom;
    }

    if (upTo) {
      if (!isValidDateFormat(upTo)){
        throw new Error("Invalid date format. Date must be in the format 'YYYY-MM-DD'.");
      }
      let parsedUpTo = new Date(upTo);
      parsedUpTo.setUTCHours(23, 59, 59, 999); // Set time to end of day
      dateFilter.$lte = parsedUpTo;
    }
  }

  if (Object.keys(dateFilter).length === 0) {
    return {};
  }

  return { date: dateFilter };
};






/**
 * #### `verifyAuth`

- Verifies that the tokens present in the request's cookies allow access depending on the different criteria.
- Returns an object with a boolean `flag` that specifies whether access is granted or not and a `cause` that describes the reason behind failed authentication
- Example: `{flag: false, cause: "Unauthorized"}`
- Refreshes the `accessToken` if it has expired and the `refreshToken` allows authentication; sets the `refreshedTokenMessage` to inform users that the `accessToken` must be changed
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */
export const verifyAuth = (req, res, info) => {
    const cookie = req.cookies;
  
    if (!cookie.accessToken || !cookie.refreshToken) {
      return { flag: false, cause: "Unauthorized" };
    }
  
    try {
      // Verify the access token and refresh token
      
      if (info.authType !== "User" && info.authType !== "Admin" && info.authType !== "Group"
        && info.authType !== "Simple") {
          return { flag: false, cause: "Unauthorized" };
        }

      const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
      const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);
      // Check if the tokens contain the necessary information
      if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
        return { flag: false, cause: "Token is missing information" };
      }
      if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
        return { flag: false, cause: "Token is missing information" };
      }

      if (decodedAccessToken.username !== decodedRefreshToken.username ||
        decodedAccessToken.email !== decodedRefreshToken.email ||
        decodedAccessToken.role !== decodedRefreshToken.role) {
        return { flag: false, cause: "Mismatched users" };
      }
    
      if (info.authType === "Simple") {
        return { flag: true, cause: "Authorized" };
      }
      // Check based on authType
      else if (info.authType === "User") {
        if (
          (decodedAccessToken.username !== info.username || decodedRefreshToken.username !== info.username)
        ) {
          return { flag: false, cause: "Unauthorized access, not a User" };
        }
      } else if (info.authType === "Admin") {
        if (
          (decodedAccessToken.role !== "Admin" || decodedRefreshToken.role !== "Admin")
        ) {
          return { flag: false, cause: "Unauthorized access, not an Admin" };
        }
      } else if (info.authType === "Group") {
        const emails = info.emails;
        
        if (
          (!emails.includes(decodedAccessToken.email) || !emails.includes(decodedRefreshToken.email))
        ) {
          return { flag: false, cause: "Unauthorized access, not in a group" };
        }
        
      }
  
      return { flag: true, cause: "Authorized" };
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        try {
          // Refresh the access token using the refresh token
          const refreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);

          /* here handle of those cases when the accessToken is expired but the refreshToken is not */

          
          if (info.authType === "User") {
            if ( (refreshToken.username !== info.username)) {
              return { flag: false, cause: "Unauthorized access" };
            }
          } else if (info.authType === "Admin") {
            if (refreshToken.role !== "Admin") {
              return { flag: false, cause: "Unauthorized access" };
            }
          } else if (info.authType === "Group") {
            const emails = info.emails;

            if (
              (!emails.includes(refreshToken.email))
            ) {
              return { flag: false, cause: "Unauthorized access, not in a group" };
            }
          }
          const newAccessToken = jwt.sign(
            {
              username: refreshToken.username,
              email: refreshToken.email,
              id: refreshToken.id,
              role: refreshToken.role
            },
            process.env.ACCESS_KEY,
            { expiresIn: '1h' }
          );
          // Set the new access token as a cookie
          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            path: '/api',
            maxAge: 60 * 60 * 1000,
            sameSite: 'none',
            secure: true
          });

          res.locals.refreshedTokenMessage =
            'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls';
            return { flag: true, cause: "Authorized" };
        } catch (err) {
          if (err.name === "TokenExpiredError") {
            return { flag: false, cause: "Perform login again" };
          } else {
            return { flag: false, cause: err.name };
          }
        }
      } else {
        return { flag: false, cause: err.name };
      }
    }
  }
  
  



/**
 * 
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 * 
 * #### `handleAmountFilterParams`

- Returns an object with an `amount` attribute used for filtering mongoDB's `aggregate` queries
- The value of `amount` is an object that depends on the query parameters:
  - If the query parameters include `min` then it must include a `$gte` attribute that is an integer equal to `min`
    - Example: `/api/users/Mario/transactions?min=10` => `{amount: {$gte: 10} }
  - If the query parameters include `min` then it must include a `$lte` attribute that is an integer equal to `max`
    - Example: `/api/users/Mario/transactions?min=50` => `{amount: {$lte: 50} }
  - If both `min` and `max` are present then both `$gte` and `$lte` must be included
    - If neither is present then the function must return an empty object
    - Example: `/api/users/Mario/transactions` => `{}`
- Throws an error if the value of any of the two query parameters is not a numerical value

 */
export const handleAmountFilterParams = (req) => {
  let { min, max } = req.query;
  min = min ? min.toString().trim() : '';
  max = max ? max.toString().trim() : '';

  let amountFilter = {};

  if (min !== '') {
    if (!min.match(/^\d+$/)) {
      throw new Error("Invalid query parameter. 'min' must be a numerical value.");
    }
    amountFilter.$gte = Number(min);
  }

  if (max !== '') {
    if (!max.match(/^\d+$/)) {
      throw new Error("Invalid query parameter. 'max' must be a numerical value.");
    }
    amountFilter.$lte = Number(max);
  }

  if (Object.keys(amountFilter).length === 0) {
    return {};
  }

  return { amount: amountFilter };
};

