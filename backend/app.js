const express = require("express");
const readline = require("readline");
const fs = require("fs");
const PORT = "8080";
const app = express();

async function processLineByLine() {
  const arr = [];
  const fileStream = fs.createReadStream("todo.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const todoId = line[0];
    const todoText = line.trim().slice(4);
    arr.push({
      [todoId]: todoText,
    });
  }
  return arr;
}

app.put("/", (req, res) => {
  const todoId = req.query.id;
  const updatedTodoText = req.query.text;

  fs.readFile("todo.txt", "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Error");
    } else {
      const prevTodo = data
        .split("\n")
        .slice(0, todoId - 1)
        .join("\n");
      const afterTodo = data.split("\n").slice(todoId).join("\n");
      const updatedTodo = `${todoId} = ${updatedTodoText} \n`;

      const newTodos = prevTodo + "\n" + updatedTodo + updatedTodo;
      fs.writeFile("todo.txt", newTodos, (err) => {
        if (err) {
          res.status(500).send("Error");
        }
        res.send("Deleted successfully");
      });
    }
  });
});

app.delete("/", (req, res) => {
  const todoId = req.query.id;
  fs.readFile("todo.txt", "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Server Error");
    } else {
      const prevTodo = data
        .split("\n")
        .slice(0, todoId - 1)
        .join("\n");
      const afterTodo = data.split("\n").slice(todoId).join("\n");
      const newTodoList = prevTodo + "\n" + afterTodo;
      fs.writeFile("todo.txt", newTodoList, (err) => {
        if (err) {
          res.status(500).send("Error");
        }
        res.send("Deleted successfully");
      });
    }
  });
});

app.post("/", (req, res) => {
  const todoId = req.query.id;
  const todoText = req.query.text;
  fs.appendFile("todo.txt", `${todoId} = ${todoText} \n`, (err) => {
    if (err) {
      res.status(500).send("Failed to add todo.");
    } else {
      res.send("Todo Added successfully.");
    }
  });
});

app.get("/", (req, res) => {
  processLineByLine().then((data) => {
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log("Server is started");
});
