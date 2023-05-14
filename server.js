const express = require('express');
const sequelize = require('./config/connection');
const inquirer = require("inquirer");
const app = express();
const PORT = process.env.PORT || 3001;

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "employees_db",
});


// turn on connection to db and server

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening on port 3001 🟢'));
});

pool.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + pool.threadId);
    console.log(`
    / \__
    (    @\___
    /         O
   /   (_____/
  /_____/
  
  Welcome to Husky Employees Tracker!`)
    
    firstPrompt();
});

function promptUser() {
    inquirer
      .prompt([
        {
            // questions to go here
         },
    ])
}

promptUser();