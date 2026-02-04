"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";

import { CustomAlertDialog } from "@/components/CustomAlertDialog";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TASKS_PER_PAGE = 10;

export default function TaskPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    task: "",
  });

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedTaskForComment, setSelectedTaskForComment] =
    useState<any>(null);
  const [adminComment, setAdminComment] = useState("");

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm?: () => void;
    variant: "info" | "danger" | "warning" | "success";
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "info",
  });

  const showAlert = (
    title: string,
    description: string,
    onConfirm?: () => void,
    variant: "info" | "danger" | "warning" | "success" = "info",
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      description,
      onConfirm,
      variant,
    });
  };

  const fetchTasks = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.TASK.GET), {
        withCredentials: true,
      });
      console.log(response.data);
      if (response.status === 200) {
        const data = response.data;
        let taskList = [];

        if (Array.isArray(data)) {
          taskList = data;
        } else if (data && data.tasks) {
          // Handle the structure: { success: true, tasks: { currentWeek: [], previousWeeks: [] } }
          const tasksPayload = data.tasks;
          if (Array.isArray(tasksPayload)) {
            taskList = tasksPayload;
          } else {
            const current = Array.isArray(tasksPayload.currentWeek)
              ? tasksPayload.currentWeek
              : [];
            const previous = Array.isArray(tasksPayload.previousWeeks)
              ? tasksPayload.previousWeeks
              : [];
            taskList = [...current, ...previous];
          }
        } else if (data) {
          // Fallback for flat structure
          const current = Array.isArray(data.currentWeek)
            ? data.currentWeek
            : [];
          const previous = Array.isArray(data.previousWeeks)
            ? data.previousWeeks
            : [];
          taskList = [...current, ...previous];
        }

        setTasks(taskList);
      }
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.TASK.CREATE),
        formData,
        { withCredentials: true },
      );

      if (response.status === 200 || response.status === 201) {
        showAlert(
          "Success",
          "Task created successfully!",
          undefined,
          "success",
        );
        setFormData({ title: "", task: "" });
        setIsModalOpen(false);
        fetchTasks();
      }
    } catch (error: any) {
      console.error("Error creating task:", error);
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to create task",
        undefined,
        "danger",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  

  

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForComment) return;
    setLoading(true);
    try {
      const taskId = selectedTaskForComment._id || selectedTaskForComment.id;
      const response = await axios.post(
        apiUrl(`${API_CONFIG.ENDPOINTS.TASK.COMMENT}${taskId}/comment`),
        { comment: adminComment },
        { withCredentials: true },
      );

      if (response.status === 200 || response.status === 201) {
        showAlert(
          "Success",
          "Comment added successfully!",
          undefined,
          "success",
        );
        setAdminComment("");
        setIsCommentModalOpen(false);
        fetchTasks();
      }
    } catch (error: any) {
      console.error("Error adding comment:", error);
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to add comment",
        undefined,
        "danger",
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
  const endIndex = startIndex + TASKS_PER_PAGE;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  return (
    <div className=" space-y-6">
      <div className="flex gap-6 justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Task Management
          </h1>
          <p className="text-muted-foreground">
            Create and track your administrative tasks.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Icon icon="solar:clipboard-add-linear" className="text-lg" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[330px] sm:max-w-[500px]">
            <form onSubmit={handleCreateTask}>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Enter the details of the task you want to post.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Update User Roles"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task">Task Description</Label>
                  <Textarea
                    id="task"
                    placeholder="Describe the task in detail..."
                    value={formData.task}
                    onChange={handleChange}
                    required
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Posting..." : "Post Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px]">Date Created</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetchLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Icon
                      icon="line-md:loading-twotone-loop"
                      className="text-3xl text-primary"
                    />
                    <span className="text-muted-foreground">
                      Loading tasks...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : Array.isArray(tasks) && tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No tasks found. Create one to get started!
                </TableCell>
              </TableRow>
            ) : (
              Array.isArray(paginatedTasks) &&
              paginatedTasks.map((t, idx) => (
                <TableRow
                  key={t._id || idx}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-semibold">{t.title}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col gap-1 cursor-help">
                            <span className="truncate block">{t.task}</span>
                            {t.comment && (
                              <div className="bg-muted px-2 py-1 rounded text-xs border-l-2 border-primary mt-1">
                                <span className="font-bold text-primary mr-1">
                                  User:
                                </span>
                                <span className="text-muted-foreground truncate block">
                                  {t.comment}
                                </span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[300px]">
                          <div className="flex flex-col gap-2 py-1">
                            <div>
                              <p className="font-bold text-xs text-gray-400 uppercase  mb-1">
                                Task Description
                              </p>
                              <p className="text-sm text-gray-100">{t.task}</p>
                            </div>
                            {t.comment && (
                              <div className="pt-2 border-t">
                                <p className="font-bold text-xs uppercase text-primary mb-1">
                                  User Comment
                                </p>
                                <p className="text-sm">{t.comment}</p>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === "SUCCESS"
                          ? "lightSuccess"
                          : t.status === "FAILED"
                            ? "lightError"
                            : t.status === "IN_PROGRESS"
                              ? "lightWarning"
                              : "lightPrimary"
                      }
                      className="font-bold"
                    >
                      {t.status || "PENDING"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {tasks.length > 0 && (
        <div className="border rounded-lg bg-card p-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, tasks.length)} of{" "}
            {tasks.length} tasks
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {generatePageNumbers().map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageClick(page)}
                className="min-w-[2.5rem]"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CustomAlertDialog
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.variant === "danger" ? "Delete" : "OK"}
      />

      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handlePostComment}>
            <DialogHeader>
              <DialogTitle>User Comment</DialogTitle>
              <DialogDescription>
                Add a feedback or note to this task.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-2">
                <Label htmlFor="adminComment">Your Comment</Label>
                <Textarea
                  id="adminComment"
                  placeholder="Enter your comment here..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  required
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCommentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Comment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
