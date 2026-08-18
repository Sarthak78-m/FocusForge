import { Modal } from '@/components/common';
import { TaskForm, type TaskFormValues } from '@/components/tasks/TaskForm';
import { useCreateTask } from '@/hooks/useTasks';
import { useAppStore } from '@/store/appStore';
import { useNotificationStore } from '@/store/notification.store';

export function GlobalCreateTaskModal() {
  const isOpen = useAppStore((s) => s.createTaskModalOpen);
  const setIsOpen = useAppStore((s) => s.setCreateTaskModalOpen);
  const notify = useNotificationStore((s) => s.notify);
  const { mutate: createTask, isPending } = useCreateTask();

  const handleCreate = (values: TaskFormValues) => {
    createTask(
      {
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate || undefined,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          notify({
            title: 'Task Created',
            message: `"${values.title}" was added to your workspace.`,
            tone: 'success',
          });
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Add Task"
    >
      <TaskForm
        onSubmit={handleCreate}
        onCancel={() => setIsOpen(false)}
        isSubmitting={isPending}
        submitLabel="Add Task"
      />
    </Modal>
  );
}

