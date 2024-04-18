import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";
import { mongoose } from 'mongoose';

/**
  #### `createCategory`

- Request Parameters: None
- Request Body Content: An object having attributes `type` and `color`
  - Example: `{type: "food", color: "red"}`
- Response `data` Content: An object having attributes `type` and `color`
  - Example: `res.status(200).json({data: {type: "food", color: "red"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the request body does not contain all the necessary attributes -> OK
- Returns a 400 error if at least one of the parameters in the request body is an empty string -> OK
- Returns a 400 error if the type of category passed in the request body represents an already existing category in the database -> OK
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) -> OK
 */
export const createCategory = async (req, res) => {
  try {

    const adminAuth = verifyAuth(req, res, { authType: "Admin" });

    if (!adminAuth.flag) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    let { type, color } = req.body;

    type = type ? type.trim() : type;
    color = color ? color.trim() : color;

    if (!type) {
      return res.status(400).json({ error: "Missing 'type' parameter" });
    }

    if (!color) {
      return res.status(400).json({ error: "Missing 'color' parameter" });
    }

    const categoryExists = await categories.findOne({ type: type });

    if (!!categoryExists) {
      return res.status(400).json({ error: "Category already found in the database" });
    }

    const new_categories = new categories({ type, color });

    new_categories.save()
      .then(data => res.status(200).json({
        data: data,
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      }))
      .catch(err => { throw err });

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
#### `updateCategory`

- Request Parameters: A string equal to the `type` of the category that must be edited
  - Example: `api/categories/food`
- Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Example: `{type: "Food", color: "yellow"}`
- Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Example: `res.status(200).json({data: {message: "Category edited successfully", count: 2}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- In case any of the following errors apply then the category is not updated, and transactions are not changed
- Returns a 400 error if the request body does not contain all the necessary attributes -> OK
- Returns a 400 error if at least one of the parameters in the request body is an empty string -> OK
- Returns a 400 error if the type of category passed as a route parameter does not represent a category in the database -> OK
- Returns a 400 error if the type of category passed in the request body as the new type represents an already existing category
   in the database and that category is not the same as the requested one
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) -> OK

 */
export const updateCategory = async (req, res) => {
  try {

    const adminAuth = verifyAuth(req, res, { authType: "Admin" });

    if (!adminAuth.flag) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    let { type: oldType } = req.params;
    let { type: newType, color } = req.body;

    oldType = oldType ? oldType.trim() : oldType;
    newType = newType ? newType.trim() : newType;
    color = color ? color.trim() : color;

    if (!oldType) {
      return res.status(400).json({ error: "Missing old 'type' parameter" });
    }

    if (!newType) {
      return res.status(400).json({ error: "Missing new 'type' parameter" });
    }

    if (!color) {
      return res.status(400).json({ error: "Missing 'color' parameter" });
    }


    const filter = { type: oldType };

    const updateCategory = {
      $set: { type: newType, color: color }
    };

    const updateTransaction = {
      $set: { type: newType }
    };

    const categoryExists = await categories.findOne({ type: newType });

    if ((!!categoryExists) && (newType !== oldType)) {
      return res.status(400).json({ error: "New category already found in the database" });
    }

    const resultUpdateCategory = await categories.updateOne(filter, updateCategory);

    if (resultUpdateCategory.matchedCount === 0) {
      return res.status(400).json({ error: "Old category not found in the database" });
    }

    const resultUpdateTransactions = await transactions.updateMany(filter, updateTransaction);

    res.status(200).json({ data: { message: "Category edited successfully", count: resultUpdateTransactions.modifiedCount }, refreshedTokenMessage: res.locals.refreshedTokenMessage });


  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**

 #### `deleteCategory`



- Request Parameters: None

- Request Body Content: An array of strings that lists the `types` of the categories to be deleted

  - Example: `{types: ["health"]}`

- Response `data` Content: An object with an attribute `message` that confirms successful deletion and an attribute `count` that specifies the number of transactions that have had their category type changed

  - Example: `res.status(200).json({data: {message: "Categories deleted", count: 1}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`

- Given N = categories in the database and T = categories to delete:

  - If N > T then all transactions with a category to delete must have their category set to the oldest category that is not in T

  - If N = T then the oldest created category cannot be deleted and all transactions must have their category set to that category

- In case any of the following errors apply then no category is deleted

- Returns a 400 error if the request body does not contain all the necessary attributes -> ok

- Returns a 400 error if called when there is only one category in the database -> ok

- Returns a 400 error if at least one of the types in the array is an empty string -> ok

- Returns a 400 error if the array passed in the request body is empty -> ok

- Returns a 400 error if at least one of the types in the array does not represent a category in the database -> ok

- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) -> OK

 */

export const deleteCategory = async (req, res) => {

  try {

    const adminAuth = verifyAuth(req, res, { authType: "Admin" });

    if (!adminAuth.flag) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    let { types } = req.body;

    if (!types || types.length === 0) {
      return res.status(400).json({ error: "Missing attributes" });
    }

    const dbcat = await categories.find({});

    if (dbcat.length <= 1) {
      return res.status(400).json({ error: "Not enough categories in the database" });
    }

    for (let index = 0; index < types.length; index++) {

      types[index] = types[index] ? types[index].trim() : types[index];

      if (!types[index]) {
        return res.status(400).json({ error: "Missing attributes, empty string" });
      }

      const categoryExists = await categories.findOne({ type: types[index] });

      if (!categoryExists) {
        return res.status(400).json({ error: "Category does not exist" });
      }
    }

    types = [...new Set(types)];

    /* if there was no error we proceed we the function */

    const N = (await categories.find({})).length; // categories in the database

    const T = types.length // categories to delete

    if (N > T) {

      const findOldest = await categories.findOne({ type: { $nin: types } }).sort({ _id: 1 });

      const filter = { type: { $in: types } };

      const updateCategory = {
        $set: { type: findOldest.type }
      };

      const resultUpdateTransactions = await transactions.updateMany(filter, updateCategory);

      const deletedCategories = await categories.deleteMany({ type: { $in: types } });

      res.status(200).json({ data: { message: "Categories deleted", count: resultUpdateTransactions.modifiedCount }, refreshedTokenMessage: res.locals.refreshedTokenMessage })

    } else if (N === T) {
      const findOldest = await categories.findOne({}).sort({ _id: 1 }); /* this can't be deleted */

      types = types.filter(item => item !== findOldest.type); /* delete all categories except oldest */

      const filter = { type: { $in: types } };

      const updateCategory = {
        $set: { type: findOldest.type }
      };

      const resultUpdateTransactions = await transactions.updateMany(filter, updateCategory);

      const deletedCategories = await categories.deleteMany({ type: { $in: types } });

      res.status(200).json({ data: { message: "Categories deleted", count: resultUpdateTransactions.modifiedCount }, refreshedTokenMessage: res.locals.refreshedTokenMessage })

    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }

}

/**
 #### `getCategories`

- Request Parameters: None
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Example: `res.status(200).json({data: [{type: "food", color: "red"}, {type: "health", color: "green"}], refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 401 error if called by a user who is not authenticated (authType = Simple)

 */
export const getCategories = async (req, res) => {
  try {
    const simpleAuth = verifyAuth(req, res, { authType: "Simple" });

    if (!simpleAuth.flag) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    let data = await categories.find({})

    let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))

    res.status(200).json({ data: filter, refreshedTokenMessage: res.locals.refreshedTokenMessage });
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 #### `createTransaction`

- Request Parameters: A string equal to the `username` of the involved user
  - Example: `/api/users/Mario/transactions`
- Request Body Content: An object having attributes `username`, `type` and `amount`
  - Example: `{username: "Mario", amount: 100, type: "food"}`
- Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Example: `res.status(200).json({data: {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the request body does not contain all the necessary attributes -> ok
- Returns a 400 error if at least one of the parameters in the request body is an empty string -> ok
- Returns a 400 error if the type of category passed in the request body does not represent a category in the database -> ok
- Returns a 400 error if the username passed in the request body is not equal to the one passed as a route parameter -> ok
- Returns a 400 error if the username passed in the request body does not represent a user in the database -> ok
- Returns a 400 error if the username passed as a route parameter does not represent a user in the database -> ok
- Returns a 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted) -> ok
- Returns a 401 error if called by an authenticated user who is not the same user as the one in the route parameter (authType = User) -> ok

 */
export const createTransaction = async (req, res) => {
  try {
    const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });

    if (!userAuth.flag) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    let { username, amount, type } = req.body;

    username = username ? username.trim() : username;
    amount = amount ? amount.toString().trim() : amount;
    type = type ? type.trim() : type;

    if (!username || !amount || !type) {
      return res.status(400).json({ error: "Missing body param(s)" });
    }

    const categoryExists = await categories.findOne({ type: type });

    if (!categoryExists) {
      return res.status(400).json({ error: "Category does not exist" });
    }

    const userExists = await User.findOne({ username: username });

    if (!userExists) {
      return res.status(400).json({ error: "User body does not exist" });
    }

    const userExists2 = await User.findOne({ username: req.params.username });

    if (!userExists2) {
      return res.status(400).json({ error: "User param does not exist" });
    }

    if (username !== req.params.username) {
      return res.status(400).json({ error: "Route username and body username do not match" });
    }

    if (isNaN(Number(amount))) {
      return res.status(400).json({ error: "The amount is not a floating point number" });
    }

    const new_transactions = new transactions({ username, amount, type });
    new_transactions.save()
      .then(data => res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage }))
      .catch(err => { throw err })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
#### `getAllTransactions`

- Request Parameters: None
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ], refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) -> OK
 */
export const getAllTransactions = async (req, res) => {
  try {

    const adminAuth = verifyAuth(req, res, { authType: "Admin" });

    if (!adminAuth.flag) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    /**
     * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
     */
    transactions.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "type",
          foreignField: "type",
          as: "categories_info"
        }
      },
      { $unwind: "$categories_info" }
    ]).then((result) => {
      let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
      res.status(200).json({
        data: data,
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }).catch(error => { throw (error) })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Return all transactions made by a specific user
 - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Request Parameters: A string equal to the `username` of the involved user
  - Example: `/api/users/Mario/transactions` (user route)
  - Example: `/api/transactions/users/Mario` (admin route)
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the username passed as a route parameter does not represent a user in the database
- Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username`
- Can be filtered by date and amount if the necessary query parameters are present and if the route is `/api/users/:username/transactions`
 */
export const getTransactionsByUser = async (req, res) => {
  try {
    let { username } = req.params;
    username = username ? username.trim() : username;

    // Check if the authenticated user is the same as the requested user or an admin
    const userAuth = verifyAuth(req, res, { authType: "User", username });
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });


    if (req.route.path === "/users/:username/transactions") {
      // Route: /api/users/:username/transactions/category/:category

      if (userAuth.flag === true) {
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }

        const dateFilter = handleDateFilterParams(req);
        const amountFilter = handleAmountFilterParams(req);

        // Authenticated user is the same as the requested user or an admin
        const pipeline = [
          {
            $match: { username, ...dateFilter, ...amountFilter },
          },
          {
            $lookup: {
              from: "categories",
              localField: "type",
              foreignField: "type",
              as: "categories_info",
            },
          },
          {
            $unwind: "$categories_info",
          },
        ];

        const result = await transactions.aggregate(pipeline);



        const data = result.map((v) =>
          Object.assign({}, { username: v.username, type: v.type, amount: v.amount, date: v.date, color: v.categories_info.color })
        );


        res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        return res.status(401).json({ error: "Unauthorized access", cause: "Unauthorized access" });
      }
    } else if (req.route.path === "/transactions/users/:username") {

      // Route: /api/transactions/users/:username
      if (adminAuth.flag === true) {

        const user = await User.findOne({ username });
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }

        // Authenticated user is an admin
        const result = await transactions.aggregate([
          {
            $match: { username },
          },
          {
            $lookup: {
              from: "categories",
              localField: "type",
              foreignField: "type",
              as: "categories_info",
            },
          },
          {
            $unwind: "$categories_info",
          },
        ]);

        const data = result.map((v) =>
          Object.assign({}, { username: v.username, type: v.type, amount: v.amount, date: v.date, color: v.categories_info.color })
        );

        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        return res.status(401).json({ error: "Unauthorized access", cause: "Unauthorized access" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};













/**
 * Return all transactions made by a specific user filtered by a specific category
 - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - The behavior defined below applies only for the specified route
- Request Parameters: A string equal to the `username` of the involved user, a string equal to the requested `category`
  - Example: `/api/users/Mario/transactions/category/food` (user route)
  - Example: `/api/transactions/users/Mario/category/food` (admin route)
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the username passed as a route parameter does not represent a user in the database -> ok
- Returns a 400 error if the category passed as a route parameter does not represent a category in the database
- Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions/category/:category` -> ok
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username/category/:category` -> ok
 */
export const getTransactionsByUserByCategory = async (req, res) => {
  try {
    let { username, category } = req.params;
    username = username ? username.trim() : username;
    category = category ? category.trim() : category;


    // Check if the authenticated user is the same as the requested user or an admin



    if (req.route.path === "/users/:username/transactions/category/:category") {

      const userAuth = verifyAuth(req, res, { authType: "User", username });
      // Route: /api/users/:username/transactions/category/:category
      if (userAuth.flag === true) {

        // Check if the username exists in the database
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }

        // Check if the category exists in the database
        const cat = await categories.findOne({ type: category });
        if (!cat) {
          return res.status(400).json({ error: "Category not found" });
        }
        // Authenticated user is the same as the requested user or an admin
        const result = await transactions.aggregate([
          {
            $match: { username, type: category }
          },
          {
            $lookup: {
              from: "categories",
              localField: "type",
              foreignField: "type",
              as: "categories_info"
            }
          },
          {
            $unwind: "$categories_info"
          }
        ]);

        const data = result.map(v =>
          Object.assign({}, { username: v.username, type: v.type, amount: v.amount, date: v.date, color: v.categories_info.color })
        );

        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        return res.status(401).json({ error: "Unauthorized access", cause: "Unauthorized access" });
      }
    } else if (req.route.path === "/transactions/users/:username/category/:category") {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      // Route: /api/transactions/users/:username/category/:category
      if (adminAuth.flag === true) {

        // Check if the username exists in the database
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }

        // Check if the category exists in the database
        const cat = await categories.findOne({ type: category });
        if (!cat) {
          return res.status(400).json({ error: "Category not found" });
        }
        // Authenticated user is an admin
        const result = await transactions.aggregate([
          {
            $match: { username, type: category }
          },
          {
            $lookup: {
              from: "categories",
              localField: "type",
              foreignField: "type",
              as: "categories_info"
            }
          },
          {
            $unwind: "$categories_info"
          }
        ]);

        const data = result.map(v =>
          Object.assign({}, { username: v.username, type: v.type, amount: v.amount, date: v.date, color: v.categories_info.color })
        );

        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        return res.status(401).json({ error: "Unauthorized access" });
      }
    }
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
};











/**
 * Return all transactions made by members of a specific group
  
- Request Parameters: A string equal to the `name` of the requested group
  - Example: `/api/groups/Family/transactions` (user route)
  - Example: `/api/transactions/groups/Family` (admin route)
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the group name passed as a route parameter does not represent a group in the database -> ok
- Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `/api/groups/:name/transactions`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/groups/:name` -> ok */
export const getTransactionsByGroup = async (req, res) => {
  try {

    //console.log(req.params);
    let { name } = req.params;
    name = name ? name.trim() : name;



    // Check if the group name exists in the database
    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(400).json({ error: "Group not found" });
    }

    // Check if the authenticated user is part of the group or an admin
    
    

    if (req.route.path === "/groups/:name/transactions") {
      // Route: /api/users/:username/transactions/category/:category
      const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => member.email) })
      if (groupAuth.flag === true) {
        // Authenticated user is the same as the requested user or an admin
        const result = await transactions.aggregate([
          {
            $lookup: {
              from: "categories",
              localField: "type",
              foreignField: "type",
              as: "categories_info"
            }
          },
          {
            $unwind: "$categories_info"
          },
          {
            $lookup: {
              from: "users",
              localField: "username",
              foreignField: "username",
              as: "user_info"
            }
          },
          {
            $unwind: "$user_info"
          },
          {
            $match: {
              $or: [
                { "user_info.email": { $in: group.members.map(member => member.email) } },
                { email: { $in: group.members.map(member => member.email) } }
              ]
            }
          }

        ]);

        const data = result.map(v =>
          Object.assign({}, { username: v.username, type: v.type, amount: v.amount, date: v.date, color: v.categories_info.color })
        );

        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        return res.status(401).json({ error: "Unauthorized access", cause: "Unauthorized access" });
      }
    } else if (req.route.path === "/transactions/groups/:name") {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      if (adminAuth.flag === true) {
        // Authenticated user is an admin
        const result = await transactions.aggregate([
          {
            $lookup: {
              from: "categories",
              localField: "type",
              foreignField: "type",
              as: "categories_info"
            }
          },
          {
            $unwind: "$categories_info"
          },
          {
            $lookup: {
              from: "users",
              localField: "username",
              foreignField: "username",
              as: "user_info"
            }
          },
          {
            $unwind: "$user_info"
          },
          {
            $match: {
              $or: [
                { "user_info.email": { $in: group.members.map(member => member.email) } },
                { email: { $in: group.members.map(member => member.email) } }
              ]
            }
          }

        ]);

        const data = result.map(v =>
          Object.assign({}, { username: v.username, type: v.type, amount: v.amount, date: v.date, color: v.categories_info.color })
        );

        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        return res.status(401).json({ error: "Unauthorized access", cause: "Unauthorized access" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};







/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Parameters: A string equal to the `name` of the requested group, a string equal to the requested `category`
  - Example: `/api/groups/Family/transactions/category/food` (user route)
  - Example: `/api/transactions/groups/Family/category/food` (admin route)
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the group name passed as a route parameter does not represent a group in the database -> ok
- Returns a 400 error if the category passed as a route parameter does not represent a category in the database -> ok
- Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `/api/groups/:name/transactions/category/:category`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/groups/:name/category/:category`
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
  try {
    let { name, category } = req.params;
    name = name ? name.trim() : name;
    category = category ? category.trim() : category;

    // Check if the group name exists in the database
    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(400).json({ error: "Group not found" });
    }

    // Check if the authenticated user is part of the group or an admin
    
    

    // Check if authentication and authorization failed
    if (req.route.path === "/groups/:name/transactions/category/:category") {

      const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => member.email) });
      // Route: /api/users/:username/transactions/category/:category
      if (groupAuth.flag === true) {
        // Check if the category exists in the database
        const cat = await categories.findOne({ type: category });
        if (!cat) {
          return res.status(400).json({ error: "Category not found" });
        }
        // Authenticated user is the same as the requested user or an admin
        const result = await transactions.aggregate([
          {
            $lookup: {
              from: "categories",
              localField: "type",
              foreignField: "type",
              as: "categories_info"
            }
          },
          {
            $unwind: "$categories_info"
          },
          {
            $lookup: {
              from: "users",
              localField: "username",
              foreignField: "username",
              as: "user_info"
            }
          },
          {
            $unwind: "$user_info"
          },
          {
            $match: {
              $or: [
                { "user_info.email": { $in: group.members.map(member => member.email) } },
                { email: { $in: group.members.map(member => member.email) } }
              ],
              "categories_info.type": category // Filter by the chosen category
            }
          }

        ]);
        // const result = await transactions.aggregate([
        //   {
        //     $match: { name, type: category }
        //   },
        //   {
        //     $lookup: {
        //       from: "categories",
        //       localField: "type",
        //       foreignField: "type",
        //       as: "categories_info"
        //     }
        //   },
        //   {
        //     $unwind: "$categories_info"
        //   }
        // ]);

        const data = result.map(v =>
          Object.assign({}, { username: v.username, type: v.type, amount: v.amount, date: v.date, color: v.categories_info.color })
        );

        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        return res.status(401).json({ error: "Unauthorized access" });
      }
    } else if (req.route.path === "/transactions/groups/:name/category/:category") {

      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      if (adminAuth.flag === true) {
        // Check if the category exists in the database
        const cat = await categories.findOne({ type: category });
        if (!cat) {
          return res.status(400).json({ error: "Category not found" });
        }
        // Authenticated user is an admin
        const result = await transactions.aggregate([
          {
            $lookup: {
              from: "categories",
              localField: "type",
              foreignField: "type",
              as: "categories_info"
            }
          },
          {
            $unwind: "$categories_info"
          },
          {
            $lookup: {
              from: "users",
              localField: "username",
              foreignField: "username",
              as: "user_info"
            }
          },
          {
            $unwind: "$user_info"
          },
          {
            $match: {
              $or: [
                { "user_info.email": { $in: group.members.map(member => member.email) } },
                { email: { $in: group.members.map(member => member.email) } }
              ],
              "categories_info.type": category // Filter by the chosen category
            }
          }

        ]);

        const data = result.map(v =>
          Object.assign({}, { username: v.username, type: v.type, amount: v.amount, date: v.date, color: v.categories_info.color })
        );

        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        return res.status(401).json({ error: "Unauthorized access" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}






/**
 * Delete a transaction made by a specific user
  - Request Parameters: A string equal to the `username` of the involved user
  - Example: `/api/users/Mario/transactions`
- Request Body Content: The `_id` of the transaction to be deleted
  - Example: `{_id: "6hjkohgfc8nvu786"}`
- Response `data` Content: A string indicating successful deletion of the transaction
  - Example: `res.status(200).json({data: {message: "Transaction deleted"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the `_id` in the request body is an empty string -> ok
- Returns a 400 error if the request body does not contain all the necessary attributes -> ok
- Returns a 400 error if the username passed as a route parameter does not represent a user in the database -> ok
- Returns a 400 error if the `_id` in the request body does not represent a transaction in the database -> ok
- Returns a 400 error if the `_id` in the request body represents a transaction made by a different user than the one in the route -> ok
- Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) -> ok
 */
export const deleteTransaction = async (req, res) => {
  try {

    let { username } = req.params;

    username = username ? username.trim() : username;

    let { _id } = req.body;
    _id = _id ? _id.trim() : _id;
    // Check if the authenticated user is the same as the user in the route
    const userAuth = verifyAuth(req, res, { authType: "User", username: username });
    // Check if authentication and authorization failed
    if (!userAuth.flag) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Check if the request body contains all the necessary attributes
    if (!_id) {
      return res.status(400).json({ error: "Missing _id in the request body" });
    }

    // Check if the username exists in the database
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Transaction not found, _id not valid" });
    }

    // Check if the _id represents a transaction in the database
    const transaction = await transactions.findOne({ _id: _id });
    if (!transaction || transaction.username !== username) {
      return res.status(400).json({ error: "Transaction not found" });
    }

    // Delete the transaction
    await transactions.deleteOne({ _id: _id });

    res.status(200).json({ data: { message: "Transaction deleted" }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



/**
 * Delete multiple transactions identified by their ids
  - Request Parameters: None
- Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Example: `{_ids: ["6hjkohgfc8nvu786"]}`
- Response `data` Content: A message confirming successful deletion
  - Example: `res.status(200).json({data: {message: "Transactions deleted"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- In case any of the following errors apply then no transaction is deleted
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the ids in the array is an empty string
- Returns a 400 error if at least one of the ids in the array does not represent a transaction in the database
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) */
export const deleteTransactions = async (req, res) => {
  try {
    let { _ids } = req.body;

    // Check if the authenticated user is an admin
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });

    // Check if authentication and authorization failed
    if (!adminAuth.flag) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Check if the request body contains all the necessary attributes
    if (!_ids || !Array.isArray(_ids)) {
      return res.status(400).json({ error: "Invalid request body. Missing _ids array" });
    }

    _ids = _ids.map(e => e ? e.trim() : e);

     _ids = [...new Set(_ids)];

    for (let _id of _ids) {
      if (!_id) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: "Transaction not found, _id not valid" });
      }
    }

    const transactions_arr = await transactions.find({ _id: { $in: _ids } });
    // Check if the request body contains all the necessary attributes
    if (transactions_arr.length !== _ids.length) {
      return res.status(400).json({ error: "Invalid request body. Missing or invalid _ids array" });
    }

    // Delete the transactions
    await transactions.deleteMany({ _id: { $in: _ids } });

    res.status(200).json({ data: { message: "Transactions deleted" }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


