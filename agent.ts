import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent, tool } from "langchain";
import z from "zod";

const tasks: { id: number; task: string; completed: boolean }[] = [];

const addTask = tool(
  async (task: string) => {
    const id = tasks.length + 1;
    tasks.push({ id, task, completed: false });
    return `Task added with ID ${id}`;
  },
  {
    name: "addTask",
    description: "Add a new task to the list. Input is the task description.",
  }
);

const listTasks = tool(async () => JSON.stringify(tasks), {
  name: "list_tasks",
  description: "List all tasks with their ids and status.",
  schema: z.object({}),
});

const completeTask = tool(
  async ({ id }) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return "Task not found";
    t.completed = true;
    return `Completed: ${t.task}`;
  },
  {
    name: "complete_task",
    description: "Mark a task as done by its id.",
    schema: z.object({ id: z.number() }),
  }
);

const agent = createAgent({
  model: new ChatGoogleGenerativeAI({ model: "gemini-3.7-flash" }),
  tools: [addTask, listTasks, completeTask],
  systemPrompt:
    "You are a task assistant. Use the tools to manage the user's list. Be brief.",
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "Add 'write report' and 'email Priya', then show my list.",
    },
  ],
});

console.log(result);
