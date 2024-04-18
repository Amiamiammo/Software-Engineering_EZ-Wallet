# Graphical User Interface Prototype  - FUTURE

Authors: Federico Castriotta

Date: 28/04/2023

Version: 1.0

# Contents

- [Graphical User Interface Prototype  - FUTURE](#graphical-user-interface-prototype----future)
- [Contents](#contents)
- [Use case 1, Manage User Account](#use-case-1-manage-user-account)
  - [Use case 1.1, Define a new user](#use-case-11-define-a-new-user)
  - [Use case 1.2, Login](#use-case-12-login)
  - [Use case 1.3, Logout](#use-case-13-logout)
  - [Use case 1.4, Delete user](#use-case-14-delete-user)
- [Use case 2, Retrieve user information](#use-case-2-retrieve-user-information)
  - [Use case 2.1, Get all users](#use-case-21-get-all-users)
  - [Use case 2.2, Get user by username](#use-case-22-get-user-by-username)
  - [Use case 2.3, Search for user](#use-case-23-search-for-user)
- [Use case 3, Manage categories](#use-case-3-manage-categories)
  - [Use case 3.1, Create category](#use-case-31-create-category)
  - [Use case 3.2, Get categories \& Use case 3.3, Delete category](#use-case-32-get-categories--use-case-33-delete-category)
  - [Use case 3.4, Check category spending reports](#use-case-34-check-category-spending-reports)
- [Use case 4, Manage transactions](#use-case-4-manage-transactions)
  - [Use case 4.1, Create transaction](#use-case-41-create-transaction)
  - [Use case 4.2, Get all transactions](#use-case-42-get-all-transactions)
  - [Use case 4.3, Delete transaction](#use-case-43-delete-transaction)
- [Use case 5, Get all labels](#use-case-5-get-all-labels)
- [Use case 6, Manage ads](#use-case-6-manage-ads)
- [Use case 7, Manage Wallet](#use-case-7-manage-wallet)
  - [Use case 7.1, Add wallet](#use-case-71-add-wallet)
  - [Use case 7.2, Add user to wallet \& Use case 7.3, Delete wallet](#use-case-72-add-user-to-wallet--use-case-73-delete-wallet)
- [Use case 8, Set budget](#use-case-8-set-budget)
  - [Use case 8.1, Add budget \& Use case 8.2, Modify budget](#use-case-81-add-budget--use-case-82-modify-budget)
  - [Use case 8.3, Check budget reports](#use-case-83-check-budget-reports)
- [Use case 9, Get conversion rate](#use-case-9-get-conversion-rate)
- [Use case 10, Select currency](#use-case-10-select-currency)
- [Use case 11, Report user](#use-case-11-report-user)


# Use case 1, Manage User Account

## Use case 1.1, Define a new user

![Register](imagesGUIv2/1_1_1Register.png "Sign Up")

![RegisterGoogle](imagesGUIv2/1_1_2RegisterGoogle.png "Sign Up with Google")

![RegisterError1](imagesGUIv2/1_1RegisterException.png "Already registered")

![RegisterError2](imagesGUIv2/1_1RegisterPswError.png "Password")

## Use case 1.2, Login

![Login](imagesGUIv2/1_2_1Login.png "Log in")

![LoginGoogle](imagesGUIv2/1_2_2LoginGoogle.png "Log in with Google")

![LoginError1](imagesGUIv2/1_2LoginCredentialsError.png "Wrong credentials")

![LoginError2](imagesGUIv2/1_2LoginErrorRegister.png "Need registration")

## Use case 1.3, Logout

After the user logged in, the logout can be performed by clicking on the <img src="imagesGUIv1/Logout.png" alt="Logout" width="5%" height="5%" title="Logout icon"> icon displayed in the right top corner of each page.

## Use case 1.4, Delete user

![Menu](imagesGUIv2/1_4_1Menu.png "Menu")

![DeleteOwn](imagesGUIv2/1_4_1DeleteConfirm.png "Delete Account")

![AdminDelete](imagesGUIv2/1_4_2AdminDeletesUsers.png "Admin Delete Account")

# Use case 2, Retrieve user information

## Use case 2.1, Get all users

![AllUsers](imagesGUIv2/2_1GetAllUsers.png "User List")

## Use case 2.2, Get user by username

![ViewProfile](imagesGUIv2/2_2GetUserByUsername.png "View Profile")

## Use case 2.3, Search for user

![AdminSearchUser](imagesGUIv2/2_3AdminSearchUser.png "Admin Search")

# Use case 3, Manage categories

## Use case 3.1, Create category

![NewCategory](imagesGUIv2/3_1NewCategory.png "New Category")

## Use case 3.2, Get categories & Use case 3.3, Delete category

![Categories](imagesGUIv2/3_2GetCategoriesDeleteCategories.png "Get Categories")

## Use case 3.4, Check category spending reports

![Report](imagesGUIv2/3_4CategoriesReports.png "Report")

![Report1](imagesGUIv2/3_4ChartOne.png "Report 1")

![Report2](imagesGUIv2/3_4ChartTwo.png "Report 2")

# Use case 4, Manage transactions

## Use case 4.1, Create transaction

![NewTransaction](imagesGUIv2/4_1NewTransaction.png "Create Transaction")

## Use case 4.2, Get all transactions

![GetallTransaction](imagesGUIv2/4_2Transactions.png "Transaction list")

## Use case 4.3, Delete transaction

![DeleteTransaction](imagesGUIv2/4_3DeleteTransaction.png "Delete Transaction")

# Use case 5, Get all labels

![Labels](imagesGUIv2/5Labels.png "Show Labels")

# Use case 6, Manage ads

After the user logged in, the advertisement banner <img src="imagesGUIv2/GoogleAds.jpg" alt="Advertisement" width="20%" height="20%" title="Advertisement"> is displayed in the bottom left corner of each page.

# Use case 7, Manage Wallet

## Use case 7.1, Add wallet

![NewWallet](imagesGUIv2/7_1NewWallet.png "Create new wallet")

## Use case 7.2, Add user to wallet & Use case 7.3, Delete wallet

![ManageWallet](imagesGUIv2/7_2_7_3_8_1_8_2ManageWallet.png "Wallet Menu")

# Use case 8, Set budget

## Use case 8.1, Add budget & Use case 8.2, Modify budget

Budget can be set or modified directly in the "Manage Wallet" window that has been just shown.

## Use case 8.3, Check budget reports

Budget reports are shown in Use case 3.4 .

# Use case 9, Get conversion rate

Conversion rates are not shown to the user/admin, they are directly stored in the DB .

# Use case 10, Select currency

![Currency](imagesGUIv2/10Currency.png "Currency menu")

![CurrencyChange](imagesGUIv2/10CurrencyChange.png "Currency change in dollar")

# Use case 11, Report user

![WalletUserList](imagesGUIv2/11WalletList.png "Wallet Members")

![MemberReport](imagesGUIv2/11WalletListReport.png "User report")