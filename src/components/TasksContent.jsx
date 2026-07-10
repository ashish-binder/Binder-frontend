import React, { useMemo, useEffect, useState } from "react";
import {
  ImagePlus,
  X,
  Check,
  Ban,
  ListChecks,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ThemedSelect from "./IMS/StockSheet/ThemedSelect";
import { createTask, getIPOs } from "../services/integration";
import { uploadToBlob } from "../services/blobUpload";
import { normalizeOrderType } from "../utils/orderType";

/* ------------------------------------------------------------------ *
 * Flat/clean theme (matches the StockSheet revamp) — class strings + local primitives.
 * ------------------------------------------------------------------ */
const CARD = "rounded-lg border border-[#e2e3e8] bg-card p-5 md:p-6";
const LABEL =
  "mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
const CTRL =
  "w-full rounded-md border border-[#e2e3e8] bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";
const PRIMARY_BTN =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const OUTLINE_BTN =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#e2e3e8] bg-card px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted";

const PRIORITY_LEVELS = ["Low", "Medium", "High", "Urgent"];
const PRIORITY_PILL = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};
const STATUS_BADGE = {
  pending: { cls: "bg-amber-100 text-amber-700", label: "Pending" },
  accepted: { cls: "bg-green-100 text-green-700", label: "Accepted" },
  rejected: { cls: "bg-red-100 text-red-700", label: "Rejected" },
};

const Input = ({ className = "", ...props }) => (
  <input className={`${CTRL} ${className}`} {...props} />
);

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    {label && (
      <label className={LABEL}>
        {label} {required && <span className="text-primary">*</span>}
      </label>
    )}
    {children}
  </div>
);

const SectionTitle = ({ step, children }) => (
  <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
    {step && (
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
        {step}
      </span>
    )}
    {children}
  </h2>
);

const PriorityChips = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {PRIORITY_LEVELS.map((level) => {
      const active = value === level;
      const activeCls =
        level === "Urgent"
          ? "border-red-500 bg-red-500/10 text-red-600"
          : "border-primary bg-primary/10 text-primary";
      return (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            active
              ? activeCls
              : "border-[#e2e3e8] text-muted-foreground hover:bg-muted"
          }`}
        >
          {level}
        </button>
      );
    })}
  </div>
);

const PriorityPill = ({ level }) => {
  const key = level || "Low";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        PRIORITY_PILL[key] || PRIORITY_PILL.Low
      }`}
    >
      {key}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

const Meta = ({ label, children }) => (
  <div className="min-w-0">
    <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="wrap-break-word text-sm text-foreground">{children}</div>
  </div>
);

// Truncate a filename to `max` chars, keeping the extension and adding an ellipsis.
const truncateName = (name, max = 22) => {
  if (!name || name.length <= max) return name || "";
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot) : "";
  const base = dot > 0 ? name.slice(0, dot) : name;
  const keep = Math.max(1, max - ext.length - 3);
  return `${base.slice(0, keep)}...${ext}`;
};

// Themed image picker: dashed upload button, or once chosen a thumbnail + name + X to clear.
const ImageUpload = ({ id, value, onChange }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  if (value) {
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-[#e2e3e8] bg-card p-1.5">
        {preview ? (
          <img
            src={preview}
            alt={value.name}
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
          </div>
        )}
        <span
          className="flex-1 truncate text-sm font-medium text-foreground"
          title={value.name}
        >
          {truncateName(value.name)}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Remove image"
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#cdced6] bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
    >
      <ImagePlus className="h-4 w-4" />
      Upload Image
      <input
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
};

// Tag input for multiple users — styled to match the other bordered fields (grey border,
// orange focus ring, same height). Type a name and press Enter (or comma) to add a chip.
const UsersInput = ({ value = [], onChange, placeholder }) => {
  const [draft, setDraft] = useState("");
  const values = Array.isArray(value) ? value : [];

  const addValue = (raw) => {
    const v = raw.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
      e.preventDefault();
      addValue(draft);
      setDraft("");
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-md border border-[#e2e3e8] bg-card px-3 py-2 text-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      {values.map((val) => (
        <span
          key={val}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e3e8] bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
        >
          {val}
          <button
            type="button"
            onClick={() => onChange(values.filter((x) => x !== val))}
            title="Remove"
            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={values.length === 0 ? placeholder : "Add more..."}
        className="min-w-30 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
};

const PO_TYPE_OPTIONS = ["Company", "Production", "Sampling"];
const DEPARTMENT_OPTIONS = ["Department 1", "Department 2", "Department 3"];
const toOptions = (values) => values.map((v) => ({ value: v, label: v }));

const TasksContent = ({ initialView = "assign" }) => {
  const [activeView, setActiveView] = useState(initialView);
  const [selectedType, setSelectedType] = useState("Production");
  const [selectedIpo, setSelectedIpo] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [task, setTask] = useState("");
  const [subTask, setSubTask] = useState("");
  const [remarks, setRemarks] = useState("");
  const [taskImage, setTaskImage] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [existingIPOs, setExistingIPOs] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [rejectingTasks, setRejectingTasks] = useState({});
  const [rejectionNotes, setRejectionNotes] = useState({});
  const [newAssignees, setNewAssignees] = useState({});
  const [addUserForms, setAddUserForms] = useState({});
  const [showAddUserForm, setShowAddUserForm] = useState({});
  const [showAssignedDialog, setShowAssignedDialog] = useState(false);
  const [showUserAssignedDialog, setShowUserAssignedDialog] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const todayDate = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  useEffect(() => {
    const loadIPOs = async () => {
      try {
        const response = await getIPOs();
        const ipos = response?.results || response?.data || response || [];
        const normalized = Array.isArray(ipos)
          ? ipos.map((ipo) => ({
              ipoId: ipo.id || ipo.ipoId || null,
              ipoCode: ipo.ipo_code || ipo.ipoCode || "",
              orderType: normalizeOrderType(ipo.order_type || ipo.orderType || ""),
              buyerCode: ipo.buyer_code_text || ipo.buyerCode || "",
              type: ipo.company_type || ipo.type || "",
              programName: ipo.program_name || ipo.programName || "",
              poSrNo: ipo.po_sr_no || ipo.poSrNo || 1,
              createdAt: ipo.created_at || ipo.createdAt || "",
            }))
          : [];
        setExistingIPOs(normalized);
      } catch (error) {
        console.error("Error loading IPOs:", error);
        setExistingIPOs([]);
      }
    };

    loadIPOs();
    const handleIpoUpdate = () => loadIPOs();
    window.addEventListener("internalPurchaseOrdersUpdated", handleIpoUpdate);
    return () => {
      window.removeEventListener(
        "internalPurchaseOrdersUpdated",
        handleIpoUpdate,
      );
    };
  }, []);

  useEffect(() => {
    setActiveView(initialView || "assign");
  }, [initialView]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("assignedTasks") || "[]");
      setAssignedTasks(Array.isArray(stored) ? stored : []);
    } catch (error) {
      console.error("Error loading assigned tasks:", error);
      setAssignedTasks([]);
    }
  }, []);

  const persistAssignedTasks = (nextTasks) => {
    setAssignedTasks(nextTasks);
    try {
      localStorage.setItem("assignedTasks", JSON.stringify(nextTasks));
    } catch (error) {
      console.error("Error saving assigned tasks:", error);
    }
  };

  const resetTaskForm = () => {
    setTask("");
    setSubTask("");
    setRemarks("");
    setTaskImage(null);
    setDueDate("");
    setPriority("");
    setSelectedUsers([]);
  };

  const updateTask = (taskId, updater) => {
    persistAssignedTasks(
      assignedTasks.map((taskItem) =>
        taskItem.id === taskId ? updater(taskItem) : taskItem,
      ),
    );
  };

  const handleAcceptTask = (taskId) => {
    setRejectingTasks((prev) => ({ ...prev, [taskId]: false }));
    updateTask(taskId, (taskItem) => {
      setAddUserForms((prev) => ({
        ...prev,
        [taskId]: {
          user: "",
          department: taskItem.department || "",
          ipo: taskItem.ipo || "",
          task: taskItem.task || "",
          remarks: taskItem.remarks || "",
          dueDate: taskItem.dueDate || todayDate,
          priority: taskItem.priority || "Low",
        },
      }));
      return { ...taskItem, status: "accepted" };
    });
  };

  const handleRejectTask = (taskId) => {
    setRejectingTasks((prev) => ({ ...prev, [taskId]: true }));
  };

  const handleSendRejection = (taskId) => {
    const note = (rejectionNotes[taskId] || "").trim();
    updateTask(taskId, (taskItem) => ({
      ...taskItem,
      status: "rejected",
      rejectedRemark: note,
    }));
    setRejectingTasks((prev) => ({ ...prev, [taskId]: false }));
  };

  const handleAddAssignee = (taskId) => {
    const form = addUserForms[taskId] || {};
    const newAssignee = (form.user || "").trim();
    if (!newAssignee) return;
    updateTask(taskId, (taskItem) => ({
      ...taskItem,
      assignees: [...(taskItem.assignees || []), newAssignee],
      status: "accepted",
    }));
    setAddUserForms((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setNewAssignees((prev) => ({ ...prev, [taskId]: "" }));
    setShowAddUserForm((prev) => ({ ...prev, [taskId]: false }));
    setShowUserAssignedDialog(true);
  };

  const handleOpenAddUserForm = (taskItem) => {
    const draft = (newAssignees[taskItem.id] || "").trim();
    if (!draft) return;
    setAddUserForms((prev) => ({
      ...prev,
      [taskItem.id]: {
        user: draft,
        department: "",
        ipo: "",
        task: "",
        remarks: "",
        dueDate: "",
        priority: "",
      },
    }));
    setShowAddUserForm((prev) => ({ ...prev, [taskItem.id]: true }));
  };

  const handleTaskImageSelect = (file) => {
    if (!file || !file.type?.startsWith("image/")) {
      setTaskImage(null);
      return;
    }
    setTaskImage(file);
  };

  const handleAssignTask = async () => {
    if (isAssigning) return;
    setIsAssigning(true);
    try {
      const primaryAssignee =
        selectedUsers.length > 0 ? selectedUsers[0] : "Unassigned";
      let uploadedTaskImageUrl = "";

      if (taskImage) {
        try {
          uploadedTaskImageUrl = (await uploadToBlob(taskImage, "tasks")) || "";
        } catch (error) {
          console.error("Error uploading task image:", error);
        }
      }

      const taskPayload = {
        po_type: selectedType || "",
        ipo_code: selectedIpo || "",
        department: selectedDepartment || "",
        task: task.trim() || "Task",
        sub_task: subTask.trim(),
        remarks: remarks.trim(),
        due_date: dueDate || todayDate,
        priority: priority || "Low",
        status: "pending",
        assigned_to: primaryAssignee,
        assignees: selectedUsers,
        image_url: uploadedTaskImageUrl || "",
        image_name: taskImage?.name || "",
      };

      let serverTask = null;
      try {
        const response = await createTask(taskPayload);
        serverTask = response?.data ?? response;
      } catch (error) {
        console.warn("Task API save failed, keeping local copy only:", error);
      }

      const persistedTaskId =
        serverTask?.id ?? serverTask?.task_id ?? Date.now();
      const normalizedTaskId = String(persistedTaskId).startsWith("task-")
        ? String(persistedTaskId)
        : `task-${persistedTaskId}`;
      const newTask = {
        id: normalizedTaskId,
        dbId: serverTask?.id ?? serverTask?.task_id ?? null,
        user: primaryAssignee,
        department: selectedDepartment,
        ipo: selectedIpo || "",
        task: task.trim() || "Task",
        subTask: subTask.trim(),
        remarks: remarks.trim(),
        dueDate: dueDate || todayDate,
        priority: priority || "Low",
        imageUrl:
          uploadedTaskImageUrl ||
          serverTask?.image_url ||
          serverTask?.image ||
          "",
        imageName: taskImage?.name || serverTask?.image_name || "",
        status: "pending",
        assignees: selectedUsers,
      };

      const nextTasks = [newTask, ...assignedTasks];
      persistAssignedTasks(nextTasks);
      resetTaskForm();
      setShowAssignedDialog(true);
    } catch (error) {
      console.error("Error assigning task:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const ipoOptions = useMemo(() => {
    const normalizedType = normalizeOrderType(selectedType);
    return existingIPOs
      .filter(
        (ipo) =>
          normalizeOrderType(ipo.orderType || ipo.order_type) ===
            normalizedType &&
          (ipo.ipoCode || ipo.code),
      )
      .map((ipo) => ipo.ipoCode || ipo.code)
      .filter(Boolean);
  }, [existingIPOs, selectedType]);

  useEffect(() => {
    setSelectedIpo("");
  }, [selectedType]);

  const handleDueDateChange = (event) => {
    const value = event.target.value;
    if (value && value < todayDate) {
      setDueDate("");
      return;
    }
    setDueDate(value);
  };

  const TABS = [
    { key: "assign", label: "Assign Tasks" },
    { key: "assigned", label: "Tasks Assigned To You" },
  ];

  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={{
        zoom: 0.9,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        "--accent": "#edeef1",
      }}
    >
      <div className="mx-auto max-w-[95%] space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign and track work across departments.
          </p>
        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-md border border-[#e2e3e8] bg-muted p-1">
          {TABS.map((tab) => {
            const active = activeView === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveView(tab.key)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded px-5 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.key === "assigned" && assignedTasks.length > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                      active
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {assignedTasks.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ---------------- Assign view ---------------- */}
        {activeView === "assign" && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            {/* Assignment */}
            <div className={CARD}>
              <SectionTitle step="1">Assignment</SectionTitle>
              <div className="space-y-4">
                <Field label="Select PO Type" required>
                  <ThemedSelect
                    value={selectedType}
                    onChange={setSelectedType}
                    options={toOptions(PO_TYPE_OPTIONS)}
                    placeholder="Select PO type"
                  />
                </Field>
                <Field label="Select IPO" required>
                  <ThemedSelect
                    value={selectedIpo}
                    onChange={setSelectedIpo}
                    isDisabled={ipoOptions.length === 0}
                    options={toOptions(ipoOptions)}
                    placeholder={
                      ipoOptions.length === 0
                        ? "No IPOs available"
                        : "Select IPO"
                    }
                  />
                </Field>
                <Field label="Select Department" required>
                  <ThemedSelect
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    options={toOptions(DEPARTMENT_OPTIONS)}
                    placeholder="Select department"
                  />
                </Field>
                <Field label="Users">
                  <UsersInput
                    value={selectedUsers}
                    onChange={setSelectedUsers}
                    placeholder="Type user name and press Enter"
                  />
                </Field>
              </div>
            </div>

            {/* Task details */}
            <div className={CARD}>
              <SectionTitle step="2">Task Details</SectionTitle>
              <div className="space-y-4">
                <Field label="Define Task" required>
                  <Input
                    placeholder="Write the task..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                  />
                </Field>
                <Field label="Add Sub Task">
                  <Input
                    placeholder="Optional sub task"
                    value={subTask}
                    onChange={(e) => setSubTask(e.target.value)}
                  />
                </Field>
                <Field label="Remarks">
                  <textarea
                    className={`${CTRL} min-h-20 resize-y`}
                    placeholder="Context, notes, or constraints"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Image Upload">
                    <ImageUpload
                      id="task-image-upload"
                      value={taskImage}
                      onChange={handleTaskImageSelect}
                    />
                  </Field>
                  <Field label="Due Date">
                    <Input
                      type="date"
                      min={todayDate}
                      value={dueDate}
                      onChange={handleDueDateChange}
                    />
                  </Field>
                </div>
                <Field label="Priority">
                  <PriorityChips value={priority} onChange={setPriority} />
                </Field>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className={PRIMARY_BTN}
                  onClick={handleAssignTask}
                  disabled={isAssigning}
                >
                  {isAssigning ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- Assigned view ---------------- */}
        {activeView === "assigned" && (
          <div className="space-y-4">
            {assignedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d5d6dc] bg-card px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ListChecks className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  No tasks assigned yet
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Tasks assigned to you will appear here. Use the “Assign Tasks”
                  tab to create one.
                </p>
              </div>
            ) : (
              assignedTasks.map((taskItem) => {
                const chain = taskItem.assignees || [];
                const progress = 0;
                const isRejecting =
                  rejectingTasks[taskItem.id] && taskItem.status !== "accepted";
                return (
                  <div key={taskItem.id} className={CARD}>
                    {/* Card header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e2e3e8] pb-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-foreground">
                            {taskItem.task || "Task"}
                          </h3>
                          <PriorityPill level={taskItem.priority} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {taskItem.user}
                          {taskItem.department
                            ? ` · ${taskItem.department}`
                            : ""}
                          {taskItem.ipo ? ` · IPO ${taskItem.ipo}` : ""}
                        </div>
                      </div>
                      <StatusBadge status={taskItem.status} />
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 py-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Meta label="User">{taskItem.user || "-"}</Meta>
                      <Meta label="User Department">
                        {taskItem.department || "-"}
                      </Meta>
                      <Meta label="IPO">{taskItem.ipo || "-"}</Meta>
                      <Meta label="Sub Task">{taskItem.subTask || "-"}</Meta>
                      <Meta label="Remarks">{taskItem.remarks || "-"}</Meta>
                      <Meta label="Due Date">{taskItem.dueDate || "-"}</Meta>
                      <Meta label="Image">
                        {taskItem.imageUrl ? (
                          <a
                            href={taskItem.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-primary hover:underline"
                          >
                            View Image
                          </a>
                        ) : (
                          taskItem.imageName || "-"
                        )}
                      </Meta>
                    </div>

                    {/* Chain of custody */}
                    <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted/50 px-3 py-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Chain of custody
                      </span>
                      {chain.length > 0 ? (
                        chain.map((assignee, idx) => (
                          <React.Fragment key={`${taskItem.id}-chain-${idx}`}>
                            {idx > 0 && (
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className="rounded-full border border-[#e2e3e8] bg-card px-2.5 py-0.5 text-xs text-foreground">
                              {assignee}
                            </span>
                          </React.Fragment>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No linked users
                        </span>
                      )}
                    </div>

                    {/* Actions (pending) */}
                    {taskItem.status === "pending" && !isRejecting && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                          onClick={() => handleAcceptTask(taskItem.id)}
                        >
                          <Check className="h-4 w-4" /> Accept
                        </button>
                        <button
                          type="button"
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#e2e3e8] px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                          onClick={() => handleRejectTask(taskItem.id)}
                        >
                          <Ban className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    )}

                    {/* Reject remark */}
                    {isRejecting && (
                      <div className="mt-4 rounded-md border border-[#e2e3e8] bg-muted/40 p-4">
                        <label className={LABEL}>Rejection Remark</label>
                        <textarea
                          className={`${CTRL} min-h-20 resize-y`}
                          placeholder="Add a remark before sending"
                          value={rejectionNotes[taskItem.id] || ""}
                          onChange={(e) =>
                            setRejectionNotes((prev) => ({
                              ...prev,
                              [taskItem.id]: e.target.value,
                            }))
                          }
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            className={PRIMARY_BTN}
                            onClick={() => handleSendRejection(taskItem.id)}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rejected note */}
                    {taskItem.status === "rejected" &&
                      taskItem.rejectedRemark && (
                        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                          Remark sent: {taskItem.rejectedRemark}
                        </div>
                      )}

                    {/* Progress + add user (accepted) */}
                    {taskItem.status === "accepted" && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground">
                              In Progress
                            </span>
                            <span className="text-muted-foreground">
                              {progress}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {!showAddUserForm[taskItem.id] && (
                          <div className="flex flex-wrap items-end gap-2">
                            <div className="min-w-55 flex-1">
                              <Input
                                placeholder="Type user name to hand over"
                                value={newAssignees[taskItem.id] || ""}
                                onChange={(e) =>
                                  setNewAssignees((prev) => ({
                                    ...prev,
                                    [taskItem.id]: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <button
                              type="button"
                              className={OUTLINE_BTN}
                              onClick={() => handleOpenAddUserForm(taskItem)}
                            >
                              <Plus className="h-4 w-4" /> Add User
                            </button>
                          </div>
                        )}

                        {showAddUserForm[taskItem.id] && (
                          <div className="rounded-lg border border-[#e2e3e8] bg-muted/30 p-4">
                            <div className="mb-4 text-xs font-bold uppercase tracking-wide text-foreground">
                              Hand over to a new user
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <Field label="User">
                                <Input
                                  placeholder="Type user name"
                                  value={addUserForms[taskItem.id]?.user || ""}
                                  onChange={(e) =>
                                    setAddUserForms((prev) => ({
                                      ...prev,
                                      [taskItem.id]: {
                                        ...(prev[taskItem.id] || {}),
                                        user: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </Field>
                              <Field label="User Department">
                                <ThemedSelect
                                  value={
                                    addUserForms[taskItem.id]?.department || ""
                                  }
                                  onChange={(value) =>
                                    setAddUserForms((prev) => ({
                                      ...prev,
                                      [taskItem.id]: {
                                        ...(prev[taskItem.id] || {}),
                                        department: value,
                                      },
                                    }))
                                  }
                                  options={toOptions(DEPARTMENT_OPTIONS)}
                                  placeholder="Select department"
                                />
                              </Field>
                              <Field label="IPO">
                                <ThemedSelect
                                  value={addUserForms[taskItem.id]?.ipo || ""}
                                  onChange={(value) =>
                                    setAddUserForms((prev) => ({
                                      ...prev,
                                      [taskItem.id]: {
                                        ...(prev[taskItem.id] || {}),
                                        ipo: value,
                                      },
                                    }))
                                  }
                                  options={toOptions(ipoOptions)}
                                  placeholder="Select IPO"
                                />
                              </Field>
                              <Field label="Due Date">
                                <Input
                                  type="date"
                                  min={todayDate}
                                  value={
                                    addUserForms[taskItem.id]?.dueDate || ""
                                  }
                                  onChange={(e) =>
                                    setAddUserForms((prev) => ({
                                      ...prev,
                                      [taskItem.id]: {
                                        ...(prev[taskItem.id] || {}),
                                        dueDate: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </Field>
                              <Field
                                label="Define Task"
                                className="sm:col-span-2"
                              >
                                <Input
                                  placeholder="Define task"
                                  value={addUserForms[taskItem.id]?.task || ""}
                                  onChange={(e) =>
                                    setAddUserForms((prev) => ({
                                      ...prev,
                                      [taskItem.id]: {
                                        ...(prev[taskItem.id] || {}),
                                        task: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </Field>
                              <Field label="Remarks" className="sm:col-span-2">
                                <textarea
                                  className={`${CTRL} min-h-20 resize-y`}
                                  placeholder="Remarks"
                                  value={
                                    addUserForms[taskItem.id]?.remarks || ""
                                  }
                                  onChange={(e) =>
                                    setAddUserForms((prev) => ({
                                      ...prev,
                                      [taskItem.id]: {
                                        ...(prev[taskItem.id] || {}),
                                        remarks: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </Field>
                              <Field label="Priority" className="sm:col-span-2">
                                <PriorityChips
                                  value={
                                    addUserForms[taskItem.id]?.priority || "Low"
                                  }
                                  onChange={(level) =>
                                    setAddUserForms((prev) => ({
                                      ...prev,
                                      [taskItem.id]: {
                                        ...(prev[taskItem.id] || {}),
                                        priority: level,
                                      },
                                    }))
                                  }
                                />
                              </Field>
                            </div>
                            <div className="mt-5 flex justify-end">
                              <button
                                type="button"
                                className={PRIMARY_BTN}
                                onClick={() => handleAddAssignee(taskItem.id)}
                              >
                                Assign
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog
        open={showAssignedDialog}
        onOpenChange={(open) => {
          setShowAssignedDialog(open);
          if (!open) {
            resetTaskForm();
            setIsAssigning(false);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-xs rounded-xl"
          style={{ textAlign: "center" }}
        >
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="h-6 w-6" />
            </div>
            <DialogTitle className="text-base">Task Assigned</DialogTitle>
            <button
              type="button"
              className={`${PRIMARY_BTN} w-full`}
              onClick={() => setShowAssignedDialog(false)}
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showUserAssignedDialog}
        onOpenChange={setShowUserAssignedDialog}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-xs rounded-xl"
          style={{ textAlign: "center" }}
        >
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="h-6 w-6" />
            </div>
            <DialogTitle className="text-base">User Assigned</DialogTitle>
            <button
              type="button"
              className={`${PRIMARY_BTN} w-full`}
              onClick={() => setShowUserAssignedDialog(false)}
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksContent;
