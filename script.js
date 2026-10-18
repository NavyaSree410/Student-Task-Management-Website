
const form = document.getElementById("taskForm");
const titleInput = document.getElementById("taskTitle");
const subjectInput = document.getElementById("taskSubject");
const deadlineInput = document.getElementById("taskDeadline");
const priorityInput = document.getElementById("taskPriority");
const filterInput = document.getElementById("taskFilter");
const taskList = document.getElementById("taskList");
const formMessage = document.getElementById("formMessage");

const STORAGE_KEY = "student-task-manager-v1";

let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (Array.isArray(saved)) {
    tasks = saved.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.title === "string" &&
      typeof task.completed === "boolean"
    );
  }
} catch {
  tasks = [];
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    formMessage.textContent =
      "Unable to save tasks in this browser.";
  }
}

function updateStats() {
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;

  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("completedCount").textContent = completed;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderTasks() {
  taskList.replaceChildren();

  const filter = filterInput.value;
  const visibleTasks = tasks.filter(task => {
    if (filter === "Pending") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });

  if (visibleTasks.length === 0) {
    const empty = createElement("div", "empty-state");
    const heading = createElement(
      "strong",
      "",
      filter === "All" ? "No tasks yet" : `No ${filter.toLowerCase()} tasks`
    );
    const message = createElement(
      "span",
      "",
      "Add a task above to get started."
    );
    empty.append(heading, message);
    taskList.append(empty);
  }

  visibleTasks.forEach(task => {
    const item = createElement("article", "task-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const info = createElement("div", "task-info");
    const heading = createElement(
      "h3",
      task.completed ? "is-done" : "",
      task.title
    );

    const details = [
      task.subject || "General",
      task.deadline ? `Due ${task.deadline}` : "No deadline"
    ];

    const description = createElement("p", "", details.join(" · "));
    info.append(heading, description);

    const allowedPriorities = ["High", "Medium", "Low"];
    const priority = allowedPriorities.includes(task.priority)
      ? task.priority
      : "Medium";

    const badge = createElement(
      "span",
      `priority ${priority.toLowerCase()}`,
      priority
    );

    const deleteButton = createElement("button", "delete-btn", "Delete");
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, info, badge, deleteButton);
    taskList.append(item);
  });

  updateStats();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    title,
    subject: subjectInput.value.trim() || "General",
    deadline: deadlineInput.value,
    priority: priorityInput.value,
    completed: false
  });

  saveTasks();
  form.reset();
  priorityInput.value = "Medium";
  formMessage.textContent = "Task added successfully!";
  renderTasks();
  titleInput.focus();
});

filterInput.addEventListener("change", renderTasks);

renderTasks();
