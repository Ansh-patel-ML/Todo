import { useState } from "react";
import { useQuery, useMutation } from "react-query";
import axios from "axios";
import { FaTrashAlt, FaEdit, FaPlus } from "react-icons/fa";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Box,
} from "@mui/material";

const fetchTodos = async () => {
  const response = await axios.get("http://localhost:8080");
  return response.data;
};

const updateTodo = async (todo) => {
  const response = await axios.put("http://localhost:8080", todo);
  return response.data;
};

const deleteTodo = async (id) => {
  const response = await axios.delete("http://localhost:8080", {
    data: { id },
  });
  return response.data;
};

const addTodo = async (todo) => {
  const response = await axios.post("http://localhost:8080", todo);
  return response.data;
};

const TodoList = () => {
  const { data: todos, isLoading, refetch } = useQuery("todos", fetchTodos);
  const editTodo = useMutation(updateTodo, { onSuccess: () => refetch() });
  const removeTodo = useMutation(deleteTodo, { onSuccess: () => refetch() });
  const createTodo = useMutation(addTodo, { onSuccess: () => refetch() });

  const [newTodoText, setNewTodoText] = useState("");
  const [editTodoText, setEditTodoText] = useState();
  const [isEditTodo, setIsEditTodo] = useState(false);

  const handleInputChange = (e) => {
    setNewTodoText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTodoText.trim() === "") {
      return;
    }

    const todo = {
      text: newTodoText.trim(),
    };

    await createTodo.mutateAsync(todo);
    setNewTodoText("");
  };

  const handleEdit = async (todoText, todoId) => {
    setEditTodoText({
      text: todoText,
      id: todoId,
    });
    setIsEditTodo(true);
  };

  const handleSubmitEditTodo = async (e) => {
    e.preventDefault();
    if (editTodoText.text.trim() === "") {
      setIsEditTodo(false);
      setEditTodoText({});
      return;
    }

    const todo = {
      id: editTodoText.id,
      text: editTodoText.text.trim(),
    };

    console.log(todo);

    await editTodo.mutateAsync(todo);
    setEditTodoText("");
    setIsEditTodo(false);
  };

  const handleDelete = async (id) => {
    await removeTodo.mutateAsync(id);
  };

  const renderTodos = () => {
    if (isLoading) {
      return <Typography variant="body1">Loading...</Typography>;
    }

    if (!todos || todos.length === 0) {
      return <Typography variant="body1">No todos found</Typography>;
    }

    return (
      <List>
        {todos.map((todo) => (
          <ListItem key={todo.id}>
            <ListItemText primary={todo.text} />
            <ListItemSecondaryAction>
              <IconButton onClick={() => handleEdit(todo.text, todo.id)}>
                <FaEdit />
              </IconButton>
              <IconButton onClick={() => handleDelete(todo.id)}>
                <FaTrashAlt />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Todo List
      </Typography>
      <Box mb={2}>
        {isEditTodo && (
          <Typography variant="body1" marginBottom={3}>
            Edit Mode
          </Typography>
        )}
        {!isEditTodo && (
          <Typography variant="body1" marginBottom={3}>
            Add Mode
          </Typography>
        )}
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
          {!isEditTodo && (
            <TextField
              variant="outlined"
              label="Add Todo"
              fullWidth
              value={newTodoText}
              onChange={handleInputChange}
            />
          )}
          {isEditTodo && (
            <TextField
              variant="outlined"
              label="Edit Todo"
              fullWidth
              value={editTodoText.text}
              onChange={(e) =>
                setEditTodoText((prev) => ({ ...prev, text: e.target.value }))
              }
            />
          )}
          {isEditTodo && (
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={<FaEdit />}
              onClick={handleSubmitEditTodo}
            >
              Edit
            </Button>
          )}
          {!isEditTodo && (
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={<FaPlus />}
            >
              Add
            </Button>
          )}
        </form>
      </Box>
      {renderTodos()}
    </Container>
  );
};

export default TodoList;
