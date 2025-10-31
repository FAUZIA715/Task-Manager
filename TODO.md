# TODO: Implement Subtask Rearrangement and Completion with Order Persistence

## Backend Changes

- [x] Add `order` field to taskModel.js
- [x] Update getTasks in taskController.js to sort by order
- [x] Update createTask in taskController.js to assign order based on existing tasks
- [x] Implement hierarchical completion logic in updateTask: when subtask completes, check if all siblings completed to complete parent; when subtask uncompletes, uncomplete parent; when parent completes, complete all subtasks recursively; when parent uncompletes, uncomplete all subtasks recursively

## Frontend API Changes

- [x] Update Task interface in taskApi.ts to include order
- [x] Ensure fetchTasks includes order in response

## Frontend UI Changes

- [x] Simplify toggleTask in Dashboard.tsx to call backend and reload tasks (server handles hierarchy)
- [x] Fix updateTaskDetails in Dashboard.tsx to use updateTaskInHierarchy
- [x] Fix addDeadline in Dashboard.tsx to use updateTaskInHierarchy and remove reload for subtasks
- [x] Implement drag-and-drop for subtasks in SortableItem using SortableSubtask and handleSubtaskDragEnd with order persistence
- [x] Update handleDragEnd for tasks to persist order
- [x] Update handleSubtaskDragEnd to persist order for subtasks
- [x] Make subtasks editable: click to edit title and description inline
