const consoleTable = require("console.table");
const inquirer = require("inquirer");
const connection = require("./config/connection");
const { QueryTypes } = require("sequelize");
async function promptUser() {
  const { task } = await inquirer.prompt([
    {
      type: "list",
      name: "task",
      message: "What would you like to do?",
      choices: [
        "View Employees",
        "View Employees by Department",
        "Add Employee",
        "Remove Employees",
        "Update Employee Role",
        "Add Role",
        "View Roles",
        "End",
      ],
    },
  ]);

  switch (task) {
    case "View Employees":
      await viewEmployee();
      break;

    case "View Employees by Department":
      await viewEmployeeByDepartment();
      break;

    case "Add Employee":
      await addEmployee();
      break;

    case "Remove Employees":
      await removeEmployees();
      break;

    case "Update Employee Role":
      await updateEmployeeRole();
      break;

    case "Add Role":
      await addRole();
      break;

      case "View Roles":
      await viewRoles(); 
      break;

    case "End":
      // End the database connection
      await end();
      break;
  }
}

async function viewEmployee() {
  console.log("Viewing employees\n");

  const query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r
      ON e.role_id = r.id
    LEFT JOIN department d
      ON d.id = r.department_id
    LEFT JOIN employee m
      ON m.id = e.manager_id`;

  try {
    const [res] = await connection.query(query);

    console.table(res);

    console.log("Employees viewed!\n");

    await promptUser();
  } catch (err) {
    throw err;
  }
}

async function viewEmployeeByDepartment() {
  console.log("Viewing employees by department\n");

  const query = `SELECT d.id, d.name, SUM(r.salary) AS budget
    FROM employee e
    LEFT JOIN role r
      ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`;

  try {
    const [res] = await connection.query(query);

    const departmentChoices = res.map((data) => ({
      value: data.id,
      name: data.name,
    }));

    console.table(res);
    console.log("Department view succeeded!\n");

    await promptDepartment(departmentChoices);
  } catch (err) {
    throw err;
  }
}

async function promptDepartment(departmentChoices) {
  const { departmentId } = await inquirer.prompt([
    {
      type: "list",
      name: "departmentId",
      message: "Which department would you choose?",
      choices: departmentChoices,
    },
  ]);

  console.log("answer ", departmentId);

  const query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
    FROM employee e
    LEFT JOIN role r
      ON r.id = e.role_id
    LEFT JOIN department d
      ON d.id = r.department_id
    WHERE d.id = :dpart_id`;

  try {
    const res = await connection.query(query, {
      replacements: { dpart_id: departmentId },
      type: QueryTypes.SELECT,
    });
    console.table(res);
    console.log(res.length + " Employees are viewed!\n");

    await promptUser();
  } catch (err) {
    throw err;
  }
}

async function addEmployee() {
  console.log("Adding an employee");

  try {
    // Prompt the user to enter the employee's details
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "Enter the employee's first name:",
      },
      {
        type: "input",
        name: "last_name",
        message: "Enter the employee's last name:",
      },
      {
        type: "input",
        name: "role_id",
        message: "Enter the employee's role ID:",
      },
      {
        type: "input",
        name: "manager_id",
        message: "Enter the employee's manager ID:",
      },
    ]);

    // Insert the employee into the database
    const { first_name, last_name, role_id, manager_id } = answers;
    const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (:f_name, :l_name, :new_role, :emp_manager)`;
    const [res] = await connection.query(query, {
      replacements: { f_name: first_name, l_name: last_name, new_role: role_id, emp_manager: manager_id },
      type: QueryTypes.INSERT,
    });

    console.log(`Employee ${first_name} ${last_name} added successfully!`);
    promptUser();
  } catch (error) {
    throw error;
  }
}

async function removeEmployees() {
  console.log("Removing employees");

  try {
    // Retrieve the list of employees from the database
    const query = `SELECT e.id, e.first_name, e.last_name FROM employee e`;
    const results = await connection.query(query, { type: QueryTypes.SELECT });
    const flattenedResults = results.flat();

    // Prompt the user to select an employee to remove
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Select an employee to remove:",
        choices: flattenedResults.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      },
    ]);

    // Remove the selected employee from the database
    const deleteQuery = `DELETE FROM employee WHERE id = :employeeId`;
    await connection.query(deleteQuery, {
      replacements: { employeeId: answer.employeeId },
      type: QueryTypes.DELETE,
    });

    console.log("Employee removed successfully!");
    promptUser();
  } catch (error) {
    throw error;
  }
}

async function updateEmployeeRole() {
  console.log("Updating an employee's role");

  try {
    // Retrieve the list of employees from the database
    const query = `SELECT e.id, e.first_name, e.last_name FROM employee e`;
    const results = await connection.query(query, { type: QueryTypes.SELECT });
    const flattenedResults = results.flat();

    // Prompt the user to select an employee to update
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Select an employee to update:",
        choices: flattenedResults.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      },
      {
        type: "input",
        name: "newRole",
        message: "Enter the employee's new role:",
      },
    ]);

    // Update the employee's role in the database
    const { employeeId, newRole } = answer;
    const updateQuery = `UPDATE employee SET role_id = :newRole WHERE id = :employeeId`;
    await connection.query(updateQuery, {
      replacements: { newRole, employeeId },
      type: QueryTypes.UPDATE,
    });

    console.log("Employee role updated successfully!");
    promptUser();
  } catch (error) {
    throw error;
  }
}

async function addRole() {
  console.log("Adding a role");

  try {
    // Prompt the user to enter the role details
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Enter the role's title:",
      },
      {
        type: "input",
        name: "salary",
        message: "Enter the role's salary:",
      },
      {
        type: "input",
        name: "department_id",
        message: "Enter the role's department ID:",
      },
    ]);

    // Insert the role into the database
    const { title, salary, department_id } = answers;
    const query = `INSERT INTO role (title, salary, department_id) VALUES (:title, :salary, :department_id)`;
    await connection.query(query, {
      replacements: { title, salary, department_id },
      type: QueryTypes.INSERT,
    });

    console.log(`Role "${title}" added successfully!`);
    promptUser();
  } catch (error) {
    throw error;
  }
}

async function viewRoles() {
  console.log("Viewing roles\n");

  const query = `SELECT r.id, r.title FROM role r`;

  try {
    const roles = await connection.query(query, { type: QueryTypes.SELECT });

    console.table(roles);

    console.log("Roles viewed!\n");

    await promptUser();
  } catch (err) {
    throw err;
  }
}


async function end() {
  try {
    // Close the database connection
    await connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  promptUser,
  viewEmployee,
  viewEmployeeByDepartment,
  addEmployee,
  removeEmployees,
  updateEmployeeRole,
  addRole,
  viewRoles,
  end,
};
