import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
  try {
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (adminAuth.flag) {
      // It should find all the users ({} brackets are needed --> online doc)
      // use query.select() to include only the requested fields
      // we use exec() since the methods .find() and .select() return a query
      // const users = await User.find({}).select(['username', 'email', 'role']).exec(); --> altro modo per scrivere la query
      const users = await User.find({}, 'username email role -_id').sort({ username: 1 });
      res.status(200).json({ data: users, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      return res.status(401).json({ error: adminAuth.cause });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 401 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  // Choices on the 2 calls of verifyAuth: (checking the other way seemed worse than this)
  // 1st: User check
  // 2nd: Admin check
  // Scenarios:
  // 1) I'm a User looking for myself --> Resolves after the 1st call on verifyAuth;
  // 2) I'm a User looking for another user --> 1st check gives false, 2nd check gives also false and I return the 401
  //    with the adminAuth.cause (I will see that I'm not an Admin, which means I can't look for somebody else info)
  // 3) I'm an Admin looking for myself/somebody else --> Resolves after the second check on verifyAuth
  try {
    const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
    if (userAuth.flag) {
      const user = await User.findOne({ refreshToken: req.cookies.refreshToken }, 'username email role -_id');
      if (!user) { return res.status(400).json({ error: "User not found" }) };
      res.status(200).json({ data: user, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      if (adminAuth.flag) {
        const userAdmin = await User.findOne({ username: req.params.username }, 'username email role -_id');
        if (!userAdmin) { return res.status(400).json({ error: "User not found" }) };
        res.status(200).json({ data: userAdmin, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        return res.status(401).json({ error: adminAuth.cause });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
	#### `createGroup`
- Request Parameters: None
- Request request body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Example: `{name: "Family", memberEmails: ["mario.red@email.com", "luigi.red@email.com"]}`
- Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email does not appear in the system)
  - Example: `res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}, membersNotFound: [], alreadyInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- If the user who calls the API does not have their email in the list of emails then their email is added to the list of members
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the group name passed in the request body is an empty string
- Returns a 400 error if the group name passed in the request body represents an already existing group in the database
- Returns a 400 error if all the provided emails (the ones in the array, the email of the user calling the function does not have to be considered in this case) represent users that are already in a group or do not exist in the database
- Returns a 400 error if the user who calls the API is already in a group
- Returns a 400 error if at least one of the member emails is not in a valid email format
- Returns a 400 error if at least one of the member emails is an empty string
- Returns a 401 error if called by a user who is not authenticated (authType = Simple)
 */
export const createGroup = async (req, res) => {
  try {
    // Returns a 401 error if called by a user who is not authenticated (authType = Simple)
    const simpleAuth = verifyAuth(req, res, { authType: "Simple" });
    if (simpleAuth.flag) {
      let { name, memberEmails = [] } = req.body;
      let notFound = [];
      let alreadyGrouped = [];

      // Returns a 400 error if the request body does not contain all the necessary attributes
      if (!name || memberEmails.length === 0) {
        return res.status(400).json({ error: "Missing attribute" });
      }

      name = name ? name.trim() : name;

      // Returns a 400 error if the group name passed in the request body is an empty string
      if (name === "") { return res.status(400).json({ error: "Group name cannot be empty" }) };
      //Returns a 400 error if the group name passed in the request body represents an already existing group in the database
      const groupAlreadyExists = await Group.findOne({ name: name });
      if (groupAlreadyExists) { return res.status(400).json({ error: "Group name already existing" }) };

      // If the user who calls the API does not have his/her email in the list of emails then his/her email is added to the list of members
      const callingUserEmail = await User.findOne({ refreshToken: req.cookies.refreshToken }, 'email -_id');
      if (callingUserEmail !== null) {
        if (!memberEmails.some(e => e === callingUserEmail.email)) {
          memberEmails.push(callingUserEmail.email)
        };
      }

      let toBeAdded = []; // emails added in the DB instance
      let toBeDisplayed = []; // emails displayed in the data response

      // deleting duplicates
      memberEmails = [...new Set(memberEmails)];

      for (let email of memberEmails) {
        email = email ? email.trim() : email;
        // Returns a 400 error if at least one of the member emails is an empty string
        if (email === "") { return res.status(400).json({ error: "At least one email is empty" }) };

        // Returns a 400 error if at least one of the member emails is not in a valid email format
        let regex = new RegExp(/[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}/);
        const validEmail = email.match(regex);
        if (!validEmail) { return res.status(400).json({ error: `Invalid email: ${email}` }) };

        // checks if email exists in the DB
        let emailCheck = await User.findOne({ email: email }, 'email');
        if (!emailCheck) {
          notFound.push({ email: email });
        } else {
          // checks if email is already in a group only if the email exists in DB
          let groupCheck = await Group.findOne({ "members.email": email });
          if (groupCheck) {
            alreadyGrouped.push({ email: email });
          } else {
            // if the email is valid, not empty, existing, not in a group then I can add it in the new group
            toBeAdded.push({ email: email, user: emailCheck._id })
            toBeDisplayed.push({ email: email }) // in these 2 arrays we have the emails that passed all the checks
          }
        }
      }

      // Finding the index of the calling user email and removing it from the array (of objects of emails).
      // Since we checked all the emails before (including the one of the calling user), now we temporarily remove it in order
      // to check if all the other provided emails did not pass the checks.
      // If this is the case, we can trigger the 400 error. Later we will add again the user email.
      // By doing this, we are sure that at least the calling user email and another provided email are ready to be inserted in a new group
      for (let i = 0; i < toBeDisplayed.length; i++) {
        if (toBeDisplayed[i].email === callingUserEmail.email) {
          toBeDisplayed.splice(i, 1);
        }
      }

      //  Returns a 400 error if all the provided emails (THE ONES IN THE ARRAY, THE EMAIL OF THE USER CALLING THE FUNCTION DOES NOT HAVE TO BE CONSIDERED IN THIS CASE) represent users that are already in a group or do not exist in the database
      if (toBeDisplayed.length === 0) { return res.status(400).json({ error: `All the provided emails represent users that are already in a group or do not exist in the database` }) };

      // We add again the calling user email in the array of objects of emails that will be displayed in the response data
      toBeDisplayed.push({ email: callingUserEmail.email });

      // Returns a 400 error if the user who calls the API is already in a group
      const callingUserGroup = await Group.findOne({ "members.email": callingUserEmail.email });
      if (callingUserGroup) { return res.status(400).json({ error: "Calling user already in a group" }) };

      // Creates and saves the instance of the Group model
      const newGroup = await Group.create({
        name: name,
        members: toBeAdded,
      });

      res.status(200).json(
        {
          data: {
            group: { name: name, members: toBeDisplayed },
            membersNotFound: notFound, alreadyInGroup: alreadyGrouped
          },
          refreshedTokenMessage: res.locals.refreshedTokenMessage
        }
      );

    } else {
      return res.status(401).json({ error: simpleAuth.cause });
    }

  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
  try {
    // Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (adminAuth.flag) {
      const allGroups = await Group.find({}, 'name members.email');
      let groups = allGroups.map(v => Object.assign({}, { name: v.name, members: v.members }))
      res.status(200).json(
        {
          data: groups, refreshedTokenMessage: res.locals.refreshedTokenMessage
        }
      );
    } else {
      return res.status(401).json({ error: adminAuth.cause });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
  try {
    let emailList = [];
    let groupName = req.params.name;
    groupName = groupName ? groupName.trim() : groupName;

    // Query to find the group by its name (passed as parameter)
    const groupFound = await Group.findOne({ name: groupName }, '-_id name members.email');

    // Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
    if (!groupFound) { return res.status(400).json({ error: "Group name does not exist" }) };

    // Extract an array of emails from group members
    groupFound.members.forEach(v => emailList.push(v.email));

    // Check if the User is authorized and present in the group he/she is retrieving info from
    const groupAuth = verifyAuth(req, res, { authType: "Group", emails: emailList });

    if (groupAuth.flag) {
      res.status(200).json({ data: { group: { name: groupFound.name, members: groupFound.members } }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      // if the calling user is not present in the group he/she is retrieving info from, then check if he/she is an Admin
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      if (adminAuth.flag) {
        res.status(200).json({ data: { group: { name: groupFound.name, members: groupFound.members } }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
      } else {
        // Returns a 401 error if called by an authenticated user who is neither part of the group (authType = Group) nor an admin (authType = Admin)
        res.status(401).json({ error: adminAuth.cause });
      }
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const addToGroup = async (req, res) => {
  try {
    // User route -------------------------------------------------------------------------------------------------------------------------------------------
    if (req.route.path === "/groups/:name/add") {
      let groupName = req.params.name;
      groupName = groupName ? groupName.trim() : groupName;

      // Query to find the group by its name (passed as parameter)
      const groupFound = await Group.findOne({ name: groupName });

      // Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
      if (!groupFound) { return res.status(400).json({ error: "Group name does not exist" }) };

      // Extract an array of emails from group members
      let emailList = [];

      groupFound.members.forEach(v => emailList.push(v.email));

      // Check if the User is authorized and present in the group he/she is retrieving info from
      const groupAuth = verifyAuth(req, res, { authType: "Group", emails: emailList });
      if (groupAuth.flag) {

        let memberEmails = [];
        memberEmails = req.body.emails;
        let notFound = [];
        let alreadyGrouped = [];

        // deleting duplicates
        memberEmails = [...new Set(memberEmails)];

        // Returns a 400 error if the request body does not contain all the necessary attributes
        if (!memberEmails || memberEmails.length === 0) {
          return res.status(400).json({ error: "Missing attribute" });
        }

        let toBeAdded = []; // emails added/updated in the DB instance
        let toBeDisplayed = [] // array of objects with "email" attribute

        for (let email of memberEmails) {
          email = email ? email.trim() : email;
          // Returns a 400 error if at least one of the member emails is an empty string
          if (email === "") { return res.status(400).json({ error: "At least one email is empty" }) };

          // Returns a 400 error if at least one of the member emails is not in a valid email format
          let regex = new RegExp(/[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}/);
          const validEmail = email.match(regex);
          if (!validEmail) { return res.status(400).json({ error: `Invalid email: ${email}` }) };

          // checks if email exists in the DB
          let emailCheck = await User.findOne({ email: email }, 'email');
          if (!emailCheck) {
            notFound.push({ email: email });
          } else {
            // checks if email is already in a group only if the email exists in DB
            let groupCheck = await Group.findOne({ "members.email": email });
            if (groupCheck) {
              alreadyGrouped.push({ email: email });
            } else {
              // if the email is valid, not empty, existing, not in a group then I can add it in the new group
              toBeAdded.push({ email: email, user: emailCheck._id });
              toBeDisplayed.push({ email: email });
            }
          }
        }

        //  Returns a 400 error if all the provided emails represent users that are already in a group or do not exist in the database
        if (toBeAdded.length === 0) { return res.status(400).json({ error: `All the provided emails represent users that are already in a group or do not exist in the database` }) };

        // Add old emails of the group in the updated list of members
        // Careful to the order: Example --> push means that you are adding elements at the end of the array
        // --> toBeAdded = [emailOne,emailTwo] , members = [email3, email4, email5]
        // --> final result = [emailOne, emailTwo, email3, email4, email5]
        groupFound.members.forEach(v => toBeAdded.push({ email: v.email, user: v.user }));
        groupFound.members.forEach(v => toBeDisplayed.push({ email: v.email }));

        await Group.findOneAndUpdate(
          { name: groupName },
          { members: toBeAdded },
          // If `new` isn't true, `findOneAndUpdate()` will return the
          // document as it was _before_ it was updated.
          { new: true }
        );

        res.status(200).json(
          {
            data: {
              group: { name: groupName, members: toBeDisplayed },
              membersNotFound: notFound, alreadyInGroup: alreadyGrouped
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage
          }
        );

      } else {
        res.status(401).json({ error: groupAuth.cause });

      }



      // Admin-exclusive route --------------------------------------------------------------------------------------------------------------------------------
    } else if (req.route.path === "/groups/:name/insert") {
      // Check if the User is authorized as Admin
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });

      if (adminAuth.flag) {

        let groupName = req.params.name;
        groupName = groupName ? groupName.trim() : groupName;

        // Query to find the group by its name (passed as parameter)
        const groupFound = await Group.findOne({ name: groupName });

        // Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
        if (!groupFound) { return res.status(400).json({ error: "Group name does not exist" }) };

        let memberEmails = [];
        memberEmails = req.body.emails;
        let notFound = [];
        let alreadyGrouped = [];

        // deleting duplicates
        memberEmails = [...new Set(memberEmails)];

        // Returns a 400 error if the request body does not contain all the necessary attributes
        if (!groupName || !Array.isArray(memberEmails) || memberEmails.length === 0) {
          return res.status(400).json({ error: "Missing attribute" });
        }

        let toBeAdded = []; // emails added/updated in the DB instance
        let toBeDisplayed = [] // array of objects with "email" attribute

        for (let email of memberEmails) {
          email = email ? email.trim() : email;
          // Returns a 400 error if at least one of the member emails is an empty string
          if (email === "") { return res.status(400).json({ error: "At least one email is empty" }) };

          // Returns a 400 error if at least one of the member emails is not in a valid email format
          let regex = new RegExp(/[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}/);
          const validEmail = email.match(regex);
          if (!validEmail) { return res.status(400).json({ error: `Invalid email: ${email}` }) };

          // checks if email exists in the DB
          let emailCheck = await User.findOne({ email: email }, 'email');
          if (!emailCheck) {
            notFound.push({ email: email });
          } else {
            // checks if email is already in a group only if the email exists in DB
            let groupCheck = await Group.findOne({ "members.email": email });
            if (groupCheck) {
              alreadyGrouped.push({ email: email });
            } else {
              // if the email is valid, not empty, existing, not in a group then I can add it in the new group
              toBeAdded.push({ email: email, user: emailCheck._id });
              toBeDisplayed.push({ email: email });
            }
          }
        }

        //  Returns a 400 error if all the provided emails represent users that are already in a group or do not exist in the database
        if (toBeAdded.length === 0) { return res.status(400).json({ error: `All the provided emails represent users that are already in a group or do not exist in the database` }) };

        // Add old emails of the group in the updated list of members
        // Careful to the order: Example --> push means that you are adding elements at the end of the array
        // --> toBeAdded = [emailOne,emailTwo] , members = [email3, email4, email5]
        // --> final result = [emailOne, emailTwo, email3, email4, email5]
        groupFound.members.forEach(v => toBeAdded.push({ email: v.email, user: v.user }));
        groupFound.members.forEach(v => toBeDisplayed.push({ email: v.email }));

        await Group.findOneAndUpdate(
          { name: groupName },
          { members: toBeAdded },
          // If `new` isn't true, `findOneAndUpdate()` will return the
          // document as it was _before_ it was updated.
          { new: true }
        );

        res.status(200).json(
          {
            data: {
              group: { name: groupName, members: toBeDisplayed },
              membersNotFound: notFound, alreadyInGroup: alreadyGrouped
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage
          }
        );

      } else {
        res.status(401).json({ error: adminAuth.cause });

      }

    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Remove members from a group
  - Request Body Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
  try {
    // User route -------------------------------------------------------------------------------------------------------------------------------------------
    if (req.route.path === "/groups/:name/remove") {
      let groupName = req.params.name;
      groupName = groupName ? groupName.trim() : groupName;

      // Returns a 400 error if the request body does not contain all the necessary attributes
      if (!groupName) { return res.status(400).json({ error: "Missing attribute" }) };

      // Query to find the group by its name (passed as parameter)
      const groupFound = await Group.findOne({ name: groupName });

      // Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
      if (!groupFound) { return res.status(400).json({ error: "Group name does not exist" }) };

      // Extract an array of emails from group members
      let emailList = [];
      groupFound.members.forEach(v => emailList.push(v.email));

      // Check if the User is authorized and present in the group he/she is retrieving info from
      const groupAuth = verifyAuth(req, res, { authType: "Group", emails: emailList });

      if (groupAuth.flag) {

        let memberEmails = [];
        memberEmails = req.body.emails;
        let notFound = [];
        let notInGroup = [];
        let toBeDeleted = []; // emails to be deleted from the DB instance

        // deleting duplicates
        memberEmails = [...new Set(memberEmails)];

        // Returns a 400 error if the request body does not contain all the necessary attributes
        if (!memberEmails || memberEmails.length === 0) {
          return res.status(400).json({ error: "Missing attribute" });
        }

        // Returns a 400 error if the group contains only one member before deleting any user
        if (emailList.length === 1) { return res.status(400).json({ error: `The group contains only one member` }) };

        for (let email of memberEmails) {
          email = email ? email.trim() : email;
          // Returns a 400 error if at least one of the member emails is an empty string
          if (email === "") { return res.status(400).json({ error: "At least one email is empty" }) };

          // Returns a 400 error if at least one of the member emails is not in a valid email format
          let regex = new RegExp(/[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}/);
          const validEmail = email.match(regex);
          if (!validEmail) { return res.status(400).json({ error: `Invalid email: ${email}` }) };

          // checks if email exists in the DB
          let emailCheck = await User.findOne({ email: email }, 'email');
          if (!emailCheck) {
            notFound.push({ email: email });
          } else {
            // checks if email is already in this group only if the email exists in DB
            let insideGroup = emailList.some(e => e === email);
            if (!insideGroup) {
              notInGroup.push({ email: email });
            } else {
              // if the email is valid, not empty, existing and inside the group, then I can remove it
              toBeDeleted.push(email);
            }
          }
        }

        //  Returns a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database
        if (toBeDeleted.length === 0) { return res.status(400).json({ error: `All the provided emails represent users that do not belong to the group or do not exist in the database` }) };

        // "If the group contains four members, for example, and you call the function to remove all four members then the function is successful but only the second, third and fourth members are removed."
        // Look for the first email in the group and remove it from the array "toBeDeleted" so that, later, it won't be removed from the DB
        if (emailList.length === toBeDeleted.length) {
          for (let i = 0; i < toBeDeleted.length; i++) {
            if (toBeDeleted[i] === emailList[0]) {
              toBeDeleted.splice(i, 1);
            }
          }
        }

        await Group.findOneAndUpdate(
          { name: groupName },
          {
            $pull: { members: { email: { $in: toBeDeleted } } }
          }
        );

        // remove the deleted emails from the array that has to be displayed
        for (let i = 0; i < toBeDeleted.length; i++) {
          let index = emailList.indexOf(toBeDeleted[i]);
          emailList.splice(index, 1);
        }

        let toBeDisplayed = [];
        emailList.forEach(v => toBeDisplayed.push({ email: v }));

        res.status(200).json(
          {
            data: {
              group: { name: groupName, members: toBeDisplayed },
              membersNotFound: notFound, notInGroup: notInGroup
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage
          }
        );

      } else {
        return res.status(401).json({ error: groupAuth.cause });
      }

      // Admin-exclusive route ------------------------------------------------------------------------------------------------------------------------------
    } else if (req.route.path === "/groups/:name/pull") {
      // Check if the User is authorized as Admin
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });

      if (adminAuth.flag) {

        let groupName = req.params.name;
        groupName = groupName ? groupName.trim() : groupName;

        let memberEmails = [];
        memberEmails = req.body.emails;
        let notFound = [];
        let notInGroup = [];
        let toBeDeleted = []; // emails to be deleted from the DB instance

        // deleting duplicates
        memberEmails = [...new Set(memberEmails)];

        // Returns a 400 error if the request body does not contain all the necessary attributes
        if (!groupName || !memberEmails || memberEmails.length === 0) {
          return res.status(400).json({ error: "Missing attribute" });
        }

        // Query to find the group by its name (passed as parameter)
        const groupFound = await Group.findOne({ name: groupName });

        // Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
        if (!groupFound) { return res.status(400).json({ error: "Group name does not exist" }) };

        // Extract an array of emails from group members
        let emailList = [];
        groupFound.members.forEach(v => emailList.push(v.email));

        // Returns a 400 error if the group contains only one member before deleting any user
        if (emailList.length === 1) { return res.status(400).json({ error: `The group contains only one member` }) };

        for (let email of memberEmails) {
          email = email ? email.trim() : email;
          // Returns a 400 error if at least one of the member emails is an empty string
          if (email === "") { return res.status(400).json({ error: "At least one email is empty" }) };

          // Returns a 400 error if at least one of the member emails is not in a valid email format
          let regex = new RegExp(/[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}/);
          const validEmail = email.match(regex);
          if (!validEmail) { return res.status(400).json({ error: `Invalid email: ${email}` }) };

          // checks if email exists in the DB
          let emailCheck = await User.findOne({ email: email }, 'email');
          if (!emailCheck) {
            notFound.push({ email: email });
          } else {
            // checks if email is already in this group only if the email exists in DB
            let insideGroup = emailList.some(e => e === email);
            if (!insideGroup) {
              notInGroup.push({ email: email });
            } else {
              // if the email is valid, not empty, existing and inside the group, then I can remove it
              toBeDeleted.push(email);
            }
          }
        }

        //  Returns a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database
        if (toBeDeleted.length === 0) { return res.status(400).json({ error: `All the provided emails represent users that do not belong to the group or do not exist in the database` }) };

        // "If the group contains four members, for example, and you call the function to remove all four members then the function is successful but only the second, third and fourth members are removed."
        // Look for the first email in the group and remove it from the array "toBeDeleted" so that, later, it won't be removed from the DB
        if (emailList.length === toBeDeleted.length) {
          for (let i = 0; i < toBeDeleted.length; i++) {
            if (toBeDeleted[i] === emailList[0]) {
              toBeDeleted.splice(i, 1);
            }
          }
        }

        await Group.findOneAndUpdate(
          { name: groupName },
          {
            $pull: { members: { email: { $in: toBeDeleted } } }
          }
        );

        // remove the deleted emails from the array that has to be displayed
        for (let i = 0; i < toBeDeleted.length; i++) {
          let index = emailList.indexOf(toBeDeleted[i]);
          emailList.splice(index, 1);
        }

        let toBeDisplayed = [];
        emailList.forEach(v => toBeDisplayed.push({ email: v }));

        res.status(200).json(
          {
            data: {
              group: { name: groupName, members: toBeDisplayed },
              membersNotFound: notFound, notInGroup: notInGroup
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage
          }
        );

      } else {
        res.status(401).json({ error: adminAuth.cause });
      }
    }

  } catch (err) {
    res.status(500).json(err.message);
  }
}

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 401 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (adminAuth.flag) {

      let { email } = req.body;

      if (!email) { return res.status(400).json({ error: "Missing attribute" }) };

      email = email ? email.trim() : email;

      // Returns a 400 error if at least one of the member emails is an empty string
      if (email === "") { return res.status(400).json({ error: "Email is empty" }) };

      // Returns a 400 error if at least one of the member emails is not in a valid email format
      let regex = new RegExp(/[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}/);
      const validEmail = email.match(regex);
      if (!validEmail) { return res.status(400).json({ error: `Invalid email: ${email}` }) };

      // checks if email exists in the DB
      let emailCheck = await User.findOne({ email: email }, 'email role username');
      if (!emailCheck) {
        return res.status(400).json({ error: "The email passed in the request body does not represent a user in the database" });
      } else if (emailCheck.role === "Admin") {
        // Returns a 400 error if the email passed in the request body represents an admin
        return res.status(400).json({ error: "The email passed in the request body represents an admin" });
      }

      // Delete user's transactions
      let deletedUserTransactions = 0;

      const result = await transactions.deleteMany({ username: emailCheck.username });
      deletedUserTransactions = result.deletedCount;

      // Look for user's group
      const lastManStanding = await Group.findOne({ "members.email": email });

      // If the group is found then the user is part of it. If there's only one member, it must be the user we are dealing with
      let flag = false;
      if (lastManStanding) {
        // if the user is the only member of the group, then you enter the if statement:
        // the group will be deleted and the flag will be set to true
        if (lastManStanding.members.length === 1) {
          const deletedGroup = await Group.deleteOne({ name: lastManStanding.name });
          flag = true;
          // if the user is not the only member of the group, you will enter the else statement:
          // the user will be removed from the group and the flag will be set to true
        } else {
          const updatedGroup = await Group.findOneAndUpdate(
            { name: lastManStanding.name },
            {
              $pull: { members: { email: email } }
            }
          );
          flag = true;
        }
      }

      // Delete user from DB
      const deletedUser = await User.deleteOne({ email: email });

      return res.status(200).json({ data: { deletedTransactions: deletedUserTransactions, deletedFromGroup: flag }, refreshedTokenMessage: res.locals.refreshedTokenMessage });


    } else {
      res.status(401).json({ error: adminAuth.cause });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
}

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
    // Admin auth check
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (adminAuth.flag) {
      let { name } = req.body;

      // Missing attribute
      if (!name) { return res.status(400).json({ error: "Missing attribute" }) };

      name = name ? name.trim() : name;

      // Returns a 400 error if the name is an empty string
      if (name === "") { return res.status(400).json({ error: "Group name is empty" }) };

      // Query to find the group by its name
      const groupFound = await Group.findOne({ name: name });

      // Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
      if (!groupFound) { return res.status(400).json({ error: "Group name does not exist" }) };

      // Delete group
      const deletedGroup = await Group.deleteOne({ name: name });
      if (deletedGroup.acknowledged) { res.status(200).json({ data: { message: "Group deleted successfully" }, refreshedTokenMessage: res.locals.refreshedTokenMessage }) };

    } else {
      res.status(401).json({ error: adminAuth.cause });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
}