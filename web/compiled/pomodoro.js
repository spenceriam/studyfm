// pomodoro.jsx — pomofocus.io-style simple timer, neofuturistic chrome
// Tabs (POMODORO / SHORT BREAK / LONG BREAK), big mm:ss, START button.

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [{
      f: 880,
      t: 0.00
    }, {
      f: 1175,
      t: 0.18
    }, {
      f: 1480,
      t: 0.36
    }].forEach(({
      f,
      t
    }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.exponentialRampToValueAtTime(0.22, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.32);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.34);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch (e) {/* no-op */}
}
function Pomodoro({
  focusMin = 25,
  shortMin = 5,
  longMin = 15,
  onHide,
  onDragStart
}) {
  // mode: 'focus' | 'short' | 'long'
  const [mode, setMode] = React.useState('focus');
  const [running, setRunning] = React.useState(false);
  const [round, setRound] = React.useState(1);
  const [remaining, setRemaining] = React.useState(focusMin * 60);
  const [flash, setFlash] = React.useState(false);
  const durFor = m => (m === 'focus' ? focusMin : m === 'short' ? shortMin : longMin) * 60;

  // If prop durations change and we're idle on that mode, sync.
  React.useEffect(() => {
    if (!running) setRemaining(durFor(mode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMin, shortMin, longMin, mode]);

  // Tick
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          playBeep();
          setFlash(true);
          setTimeout(() => setFlash(false), 1800);
          // auto-advance
          if (mode === 'focus') {
            // every 4th round → long break
            const next = round % 4 === 0 ? 'long' : 'short';
            setMode(next);
            return durFor(next);
          } else {
            setMode('focus');
            setRound(n => n + 1);
            return durFor('focus');
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, round, focusMin, shortMin, longMin]);
  const switchMode = next => {
    if (next === mode) return;
    setMode(next);
    setRunning(false);
    setRemaining(durFor(next));
  };
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return /*#__PURE__*/React.createElement("div", {
    className: `cj-pom ${flash ? 'is-flash' : ''}`,
    "data-mode": mode,
    onMouseDown: onDragStart,
    onTouchStart: onDragStart
  }, onHide && /*#__PURE__*/React.createElement("button", {
    className: "cj-pom__hide",
    onClick: onHide,
    "aria-label": "Hide timer",
    title: "Hide timer"
  }, "HIDE"), /*#__PURE__*/React.createElement("div", {
    className: "cj-pom__tabs",
    role: "tablist"
  }, [{
    id: 'focus',
    label: 'POMODORO'
  }, {
    id: 'short',
    label: 'SHORT BREAK'
  }, {
    id: 'long',
    label: 'LONG BREAK'
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    role: "tab",
    "aria-selected": mode === t.id,
    className: `cj-pom__tab ${mode === t.id ? 'is-on' : ''}`,
    onClick: () => switchMode(t.id)
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    className: "cj-pom__time"
  }, /*#__PURE__*/React.createElement("span", null, mm), /*#__PURE__*/React.createElement("span", {
    className: "cj-pom__colon"
  }, ":"), /*#__PURE__*/React.createElement("span", null, ss)), /*#__PURE__*/React.createElement("button", {
    className: `cj-pom__start ${running ? 'is-on' : ''}`,
    onClick: () => setRunning(r => !r)
  }, running ? 'PAUSE' : 'START'), /*#__PURE__*/React.createElement("div", {
    className: "cj-pom__round"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cj-pom__round-label"
  }, "ROUND"), /*#__PURE__*/React.createElement("span", {
    className: "cj-pom__round-val"
  }, "#", String(round).padStart(2, '0'))), /*#__PURE__*/React.createElement(TaskList, null));
}

// ── TaskList ────────────────────────────────────────────────────────────────
// Persistent checklist. Each task has a check toggle; checked tasks show
// strikethrough + an explicit UNDO button. Delete (X) on hover.
function TaskList() {
  const STORAGE_KEY = 'codejams.tasks.v1';
  const listRef = React.useRef(null);
  const [tasks, setTasks] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [{
      id: 'demo-1',
      text: 'Ship landing hero',
      done: false
    }, {
      id: 'demo-2',
      text: 'Wire audio stream',
      done: false
    }];
  });
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [editDraft, setEditDraft] = React.useState('');
  const inputRef = React.useRef(null);
  const editInputRef = React.useRef(null);
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);
  React.useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  // Auto-grow the add textarea as the user types
  React.useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [draft, adding]);

  // Grow the list until it'd hit the viewport bottom — accounting for the
  // add-row textarea below it, which itself grows as the user types.
  // Recomputes on window resize, drag (wrap inline-style mutation), and
  // panel size changes (input growing fires ResizeObserver on the panel).
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const panel = list.closest('.cj-pom');
      if (!panel) return;
      const listTop = list.getBoundingClientRect().top;

      // sum heights of all siblings below the list inside .cj-tasks
      let belowList = 0;
      let sib = list.nextElementSibling;
      while (sib) {
        belowList += sib.offsetHeight;
        sib = sib.nextElementSibling;
      }
      const tasks = list.parentElement;
      const tasksPB = parseFloat(getComputedStyle(tasks).paddingBottom) || 0;
      const tasksGap = parseFloat(getComputedStyle(tasks).rowGap || getComputedStyle(tasks).gap) || 0;
      const panelPB = parseFloat(getComputedStyle(panel).paddingBottom) || 0;
      const BOTTOM_PAD = 20;
      const available = window.innerHeight - listTop - belowList - tasksGap - tasksPB - panelPB - BOTTOM_PAD;
      list.style.maxHeight = `${Math.max(72, available)}px`;
    };
    update();
    window.addEventListener('resize', update);
    const wrap = list.closest('.cj-pom-wrap');
    const panel = list.closest('.cj-pom');
    let mo, ro;
    if (wrap) {
      mo = new MutationObserver(update);
      mo.observe(wrap, {
        attributes: true,
        attributeFilter: ['style', 'data-visible']
      });
    }
    if (panel) {
      ro = new ResizeObserver(update);
      ro.observe(panel);
    }
    return () => {
      window.removeEventListener('resize', update);
      mo && mo.disconnect();
      ro && ro.disconnect();
    };
  }, [tasks.length, adding]);
  React.useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Auto-grow the edit textarea
  React.useEffect(() => {
    const ta = editInputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [editDraft, editingId]);
  const addTask = () => {
    const text = draft.trim();
    if (!text) {
      setAdding(false);
      setDraft('');
      return;
    }
    setTasks(ts => [...ts, {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      done: false
    }]);
    setDraft('');
    setAdding(false);
  };
  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? {
    ...t,
    done: !t.done
  } : t));
  const remove = id => setTasks(ts => ts.filter(t => t.id !== id));
  const clearDone = () => setTasks(ts => ts.filter(t => !t.done));
  const startEdit = task => {
    setEditingId(task.id);
    setEditDraft(task.text);
  };
  const commitEdit = () => {
    if (!editingId) return;
    const text = editDraft.trim();
    if (text) {
      setTasks(ts => ts.map(t => t.id === editingId ? {
        ...t,
        text
      } : t));
    }
    setEditingId(null);
    setEditDraft('');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft('');
  };
  const onEditKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };
  const onKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask();
    } else if (e.key === 'Escape') {
      setAdding(false);
      setDraft('');
    }
  };
  const doneCount = tasks.filter(t => t.done).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "cj-tasks"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-tasks__hd"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cj-tasks__label"
  }, "TASKS"), /*#__PURE__*/React.createElement("span", {
    className: "cj-tasks__count"
  }, tasks.length === 0 ? 'NONE' : `${doneCount}/${tasks.length}`)), tasks.length > 0 && /*#__PURE__*/React.createElement("ul", {
    ref: listRef,
    className: "cj-tasks__list",
    role: "list"
  }, tasks.map(t => {
    const isEditing = editingId === t.id;
    return /*#__PURE__*/React.createElement("li", {
      key: t.id,
      className: `cj-task ${t.done ? 'is-done' : ''} ${isEditing ? 'is-editing' : ''}`
    }, /*#__PURE__*/React.createElement("button", {
      className: "cj-task__check",
      onClick: () => toggle(t.id),
      "aria-label": t.done ? 'Mark incomplete' : 'Mark complete',
      "aria-pressed": t.done,
      disabled: isEditing
    }, t.done ? /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "12",
      height: "12",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3.5 8.5 6.5 11.5 12.5 4.5",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })) : null), isEditing ? /*#__PURE__*/React.createElement("textarea", {
      ref: editInputRef,
      className: "cj-task__editinput",
      value: editDraft,
      onChange: e => setEditDraft(e.target.value),
      onKeyDown: onEditKeyDown,
      onBlur: commitEdit,
      maxLength: 240,
      rows: 1
    }) : /*#__PURE__*/React.createElement("span", {
      className: "cj-task__text",
      onDoubleClick: () => !t.done && startEdit(t),
      title: t.done ? '' : 'Double-click to edit'
    }, /*#__PURE__*/React.createElement("span", {
      className: "cj-task__text-inner"
    }, t.text)), !isEditing && /*#__PURE__*/React.createElement("div", {
      className: "cj-task__actions",
      "aria-hidden": !isEditing ? undefined : true
    }, t.done ? /*#__PURE__*/React.createElement("button", {
      className: "cj-task__undo",
      onClick: () => toggle(t.id),
      "aria-label": "Undo",
      title: "Undo"
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "11",
      height: "11",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 8h7a3 3 0 1 1 0 6H7",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5.5 5.5 3 8l2.5 2.5",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))) : /*#__PURE__*/React.createElement("button", {
      className: "cj-task__edit",
      onClick: () => startEdit(t),
      "aria-label": "Edit task",
      title: "Edit"
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "11",
      height: "11",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M10.5 2.5l3 3L5.5 13.5H2.5V10.5L10.5 2.5z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 4l3 3",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.4",
      strokeLinecap: "round"
    }))), /*#__PURE__*/React.createElement("button", {
      className: "cj-task__del",
      onClick: () => remove(t.id),
      "aria-label": "Delete task",
      title: "Delete"
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "10",
      height: "10",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 4l8 8M12 4l-8 8",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })))));
  })), adding ? /*#__PURE__*/React.createElement("div", {
    className: "cj-tasks__addrow"
  }, /*#__PURE__*/React.createElement("button", {
    className: "cj-tasks__addbtn",
    onClick: addTask,
    "aria-label": "Add task",
    title: "Add task"
  }, "+"), /*#__PURE__*/React.createElement("textarea", {
    ref: inputRef,
    className: "cj-tasks__input",
    value: draft,
    onChange: e => setDraft(e.target.value),
    onKeyDown: onKeyDown,
    onBlur: () => {
      if (!draft.trim()) {
        setAdding(false);
      }
    },
    placeholder: "What are you working on?",
    maxLength: 240,
    rows: 1
  })) : /*#__PURE__*/React.createElement("button", {
    className: "cj-tasks__newbtn",
    onClick: () => setAdding(true)
  }, /*#__PURE__*/React.createElement("span", {
    className: "cj-tasks__plus"
  }, "+"), " ADD TASK"));
}
Object.assign(window, {
  Pomodoro,
  TaskList,
  playBeep
});