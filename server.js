const express = require("express");
const sequelize = require("./config/connection");
const {
  promptUser,
  viewEmployee,
  viewEmployeeByDepartment,
  addEmployee,
  removeEmployees,
  updateEmployeeRole,
  addRole,
  end,
} = require("./inquirer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Turn on connection to db and server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log("Now listening on port 3306 🟢"));

  console.log(`
  / \\__
 (    @\\___
 /         O
/   (_____/ 
/_____/


Welcome to Husky Employees Tracker!`);

  promptUser();
});
