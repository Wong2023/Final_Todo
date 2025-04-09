import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Button, Typography, IconButton, Switch, MenuItem,
  FormControlLabel, List, ListItem, ListItemText, Snackbar, Dialog, DialogTitle,
  DialogActions, DialogContent, DialogContentText, Slide, Box, LinearProgress
} from '@mui/material';
import {
  Delete, CheckCircle, Logout, Edit, DarkMode, LightMode, Star, StarBorder
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const App = () => {
  const themes = ['light', 'dark', 'forest', 'ocean', 'cyberpunk', 'sunset'];
  const [themeName, setThemeName] = useState(localStorage.getItem('theme') || 'light');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState({});
  const [loggedInUser, setLoggedInUser] = useState('');
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [snack, setSnack] = useState('');
  const [cookieOpen, setCookieOpen] = useState(true);
  const [filter, setFilter] = useState('all');
  const [flash, setFlash] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const theme = createTheme({ palette: { mode: themeName === 'dark' ? 'dark' : 'light' } });

  useEffect(() => {
    document.body.classList.remove(...themes.map(t => `theme-${t}`));
    document.body.classList.add(`theme-${themeName}`);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    localStorage.setItem('theme', themeName);
  }, [themeName]);

  useEffect(() => {
    if (loggedInUser) {
      const saved = localStorage.getItem(`tasks_${loggedInUser}`);
      setTasks(saved ? JSON.parse(saved) : []);
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem(`tasks_${loggedInUser}`, JSON.stringify(tasks));
    }
  }, [tasks, loggedInUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updatedTasks = tasks.map(task => {
        const deadlineTime = new Date(task.deadline).getTime();
        if (!task.notified && now >= deadlineTime) {
          playSound('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
          setSnack(`🔔 Reminder: ${task.text}`);
          return { ...task, notified: true };
        }
        return task;
      });
      setTasks(updatedTasks);
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  useEffect(() => {
    const fullAIDictionary = {
      "buy": ["milk", "bread", "meat"],
      "study": ["math", "physics", "biology", "english"],
      "call": ["mom", "dad", "boss", "client"],
      "eat": ["breakfast", "lunch", "dinner"],
      "clean": ["room", "desk", "car"],
      "plan": ["trip", "week", "party"],
      "fix": ["bug", "layout"],
      "build": ["project", "portfolio", "resume"],
      "train": ["arms", "legs", "soon"],
      "play": ["football", "voleyball", "game"],
      "work": ["presentation", "email", "task"],
      "read": ["book", "article", "docs"],
      "write": ["code", "post", "essay"],
      "learn": ["maths", "school", "react"],
      "visit": ["grandma", "store", "friend"],
      "meet": ["team", "client", "group"],
      "watch": ["movie", "show", "stream"],
      "paint": ["wall", "picture", "door"],
      "order": ["food", "drink", "taxi"],
      "cook": ["pasta", "meat", "soup"]
    };

    const input = task.toLowerCase().trim();
    const key = input.split(' ')[0];
    if (fullAIDictionary[key]) {
      setAiSuggestions(fullAIDictionary[key]);
    } else {
      setAiSuggestions([]);
    }
  }, [task]);

  const playSound = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  const handleRegister = () => {
    if (!username || !password) return;
    if (users[username]) return setSnack('User already exists');
    setUsers({ ...users, [username]: password });
    setLoggedInUser(username);
    const saved = localStorage.getItem(`tasks_${username}`);
    setTasks(saved ? JSON.parse(saved) : []);
    setSnack('Registered successfully');
  };

  const handleLogin = () => {
    if (users[username] === password) {
      setLoggedInUser(username);
      const saved = localStorage.getItem(`tasks_${username}`);
      setTasks(saved ? JSON.parse(saved) : []);
      setSnack('Logged in');
    } else {
      setSnack('Invalid credentials');
    }
  };

  const handleAddOrUpdateTask = () => {
    if (!task || !deadline) return;
    const id = editingTaskId ?? Date.now();
    const existing = tasks.find(t => t.id === id);
    const newTask = {
      id,
      text: task,
      deadline,
      createdAt: existing?.createdAt || Date.now(),
      done: existing?.done || false,
      favorite: existing?.favorite || false,
      notified: false
    };
    const updated = editingTaskId
      ? tasks.map(t => t.id === id ? newTask : t)
      : [...tasks, newTask];
    setTasks(updated);
    setTask('');
    setDeadline('');
    setEditingTaskId(null);
    playSound('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
    setSnack(editingTaskId ? 'Task updated' : 'Task added');
  };

  const handleEdit = (task) => {
    setTask(task.text);
    setDeadline(task.deadline);
    setEditingTaskId(task.id);
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    setSnack('Task deleted');
  };

  const handleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleToggleFavorite = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, favorite: !t.favorite } : t));
  };

  const formatTimeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days}d ${hrs}h ${mins}m`;
  };

  const formatProgress = (task) => {
    const now = Date.now();
    const start = task.createdAt;
    const end = new Date(task.deadline).getTime();
    const total = end - start;
    const passed = now - start;
    return Math.min(100, Math.max(0, (passed / total) * 100));
  };

  const filteredTasks = tasks
    .filter(t => {
      if (filter === 'active') return !t.done;
      if (filter === 'completed') return t.done;
      if (filter === 'favorite') return t.favorite;
      return true;
    })
    .sort((a, b) => b.favorite - a.favorite);

    const dailyProgress = () => {
      const completed = tasks.filter(t => t.done).length;
      const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
      return `You completed ${completed} of ${tasks.length} tasks – ${percent}%`;
    };
    

  const particlesInit = async (main) => await loadFull(main);

  return (
    <ThemeProvider theme={theme}>
      {flash && <div style={{
        position: 'fixed',
        inset: 0,
        background: 'white',
        opacity: 0.3,
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'opacity 0.4s ease'
      }} />}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: { onClick: { enable: true, mode: "push" }, onHover: { enable: true, mode: "repulse" } },
            modes: { push: { quantity: 2 }, repulse: { distance: 80, duration: 0.4 } }
          },
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, color: "#ffffff", distance: 120 },
            move: { enable: true, speed: 1.5 },
            number: { value: 50 },
            opacity: { value: 0.3 },
            size: { value: 2 }
          }
        }}
      />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
          <FormControlLabel
            control={<Switch className="theme-toggle" checked={themeName === 'dark'} onChange={() => {
              const next = themeName === 'dark' ? 'light' : 'dark';
              setThemeName(next);
            }} />}
            label={themeName === 'dark' ? <DarkMode /> : <LightMode />}
          />
          <TextField
            select
            fullWidth
            label="Theme"
            value={themeName}
            onChange={e => setThemeName(e.target.value)}
            sx={{ my: 2 }}
          >
            {themes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          {!loggedInUser ? (
            <>
              <Typography variant="h5">Register / Login</Typography>
              <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
              <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
              <Button fullWidth variant="contained" onClick={handleRegister} sx={{ mt: 1 }}>Register</Button>
              <Button fullWidth variant="outlined" onClick={handleLogin} sx={{ mt: 1 }}>Login</Button>
            </>
          ) : (
            <>
              <Typography variant="h5">Welcome, {loggedInUser}</Typography>
              <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>{dailyProgress()}</Typography>
              <Box display="flex" justifyContent="space-between" mt={2}>
                {['all', 'active', 'completed', 'favorite'].map(f => (
                  <Button key={f} variant={filter === f ? 'contained' : 'outlined'} onClick={() => setFilter(f)}>
                    {f}
                  </Button>
                ))}
              </Box>
              <TextField label="Task" fullWidth margin="normal" value={task} onChange={e => setTask(e.target.value)} />
              <AIPopup aiSuggestions={aiSuggestions} setTask={setTask} task={task} />
              <TextField type="datetime-local" fullWidth margin="normal" value={deadline} onChange={e => setDeadline(e.target.value)} />
              <Button fullWidth variant="contained" onClick={handleAddOrUpdateTask} sx={{ mt: 1 }}>
                {editingTaskId ? 'Update Task' : 'Add Task'}
              </Button>
              <List sx={{ mt: 2 }}>
                {filteredTasks.map(t => (
                  <Slide key={t.id} direction="up" in mountOnEnter unmountOnExit>
                    <ListItem className="task-item" secondaryAction={
                      <Box>
                        <IconButton onClick={() => handleToggleFavorite(t.id)}>{t.favorite ? <Star /> : <StarBorder />}</IconButton>
                        <IconButton onClick={() => handleEdit(t)}><Edit /></IconButton>
                        <IconButton onClick={() => handleComplete(t.id)}><CheckCircle /></IconButton>
                        <IconButton onClick={() => handleDelete(t.id)}><Delete /></IconButton>
                      </Box>
                    }>
                      <ListItemText
                        primary={t.text}
                        secondary={
                          <>
                            ⏰ Time left: {formatTimeLeft(t.deadline)}
                            <LinearProgress variant="determinate" value={formatProgress(t)} sx={{ mt: 1, height: 8, borderRadius: 5 }} />
                          </>
                        }
                        style={{ textDecoration: t.done ? 'line-through' : 'none' }}
                      />
                    </ListItem>
                  </Slide>
                ))}
              </List>
              <Button onClick={() => { setLoggedInUser(''); setTasks([]); }} startIcon={<Logout />}>Logout</Button>
            </>
          )}
        </Box>
        <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
        <Dialog open={cookieOpen}>
          <DialogTitle>🍪 Cookies</DialogTitle>
          <DialogContent>
            <DialogContentText>We use cookies to improve your experience. Do you accept?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCookieOpen(false)}>Accept</Button>
            <Button onClick={() => setCookieOpen(false)}>Decline</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};


const AIPopup = ({ aiSuggestions = [], setTask, task }) => (
  Array.isArray(aiSuggestions) && aiSuggestions.length > 0 && (
    <Box sx={{ mt: 1, p: 1, bgcolor: '#333', borderRadius: 2, color: '#fff' }}>
      <Typography variant="caption">Suggestions:</Typography>
      <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
        {aiSuggestions.map((s, i) => (
          <Button
            key={i}
            size="small"
            variant="outlined"
            sx={{ color: '#fff', borderColor: '#fff' }}
            onClick={() => setTask(task + (task.endsWith(' ') ? '' : ' ') + s)}
          >
            {s}
          </Button>
        ))}
      </Box>
    </Box>
  )
);

export default App;
