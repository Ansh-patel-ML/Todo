const express = require("express");
const readline = require("readline");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");

const PORT = "8080";
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function processLineByLine() {
  const arr = [];
  const fileStream = fs.createReadStream("todo.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const todoArr = line.split(" = ");
    const todoId = todoArr[0];
    const todoText = todoArr[1]?.trim();
    arr.push({
      id: todoId,
      text: todoText,
    });
  }
  return arr;
}

app.put("/", [body("id").isUUID(), body("text").notEmpty()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const todoId = req.body.id;
  const updatedTodoText = req.body.text;
  fs.readFile("todo.txt", "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Error");
    } else {
      const todosArray = data.split("\n").map((todo) => todo.split(" = "));
      console.log("todosArray", todosArray);
      const filteredTodos = todosArray.filter((todo) => {
        if (todo[0] === todoId) {
          todo[1] = updatedTodoText;
          return todo;
        } else {
          return todo;
        }
      });
      console.log("filteredTodos", filteredTodos);
      const newTodos = filteredTodos.map((todo) => todo.join(" = ")).join("\n");
      console.log("newTodos", newTodos);
      fs.writeFile("todo.txt", newTodos, (err) => {
        if (err) {
          res.status(500).send("Error");
        }
        res.send("Updated successfully");
      });
    }
  });
});

app.delete("/", [body("id").isUUID()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const todoId = req.body.id;
  fs.readFile("todo.txt", "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Server Error");
    } else {
      const todosArray = data.split("\n").map((todo) => todo.split(" = "));
      const filteredTodos = todosArray.filter((todo) => todo[0] !== todoId);
      const newTodos = filteredTodos.map((todo) => todo.join(" = ")).join("\n");
      fs.writeFile("todo.txt", newTodos, (err) => {
        if (err) {
          res.status(500).send("Server Error");
        }
        res.send("Deleted successfully");
      });
    }
  });
});

app.post("/", [body("text").notEmpty()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  todoId = uuidv4();
  const todoText = req.body.text;
  fs.appendFile("todo.txt", `${todoId} = ${todoText} \n`, (err) => {
    if (err) {
      res.status(500).send("Failed to add todo.");
    } else {
      res.send("Todo Added successfully.");
    }
  });
});

app.get("/", (_, res) => {
  processLineByLine().then((data) => {
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log("Server is started");
});
