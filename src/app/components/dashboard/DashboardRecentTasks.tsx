"use client";

import React, { useEffect, useState } from "react";
import CardBox from "../shared/CardBox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";
import { CheckCircle2, Clock, PlayCircle, XCircle } from "lucide-react";

interface Task {
  _id?: string;
  id?: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED";
  weekStart?: string;
  weekEnd?: string;
  createdAt?: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
  IN_PROGRESS: <PlayCircle className="h-4 w-4 text-blue-500" />,
  SUCCESS: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function DashboardRecentTasks() {
  const [fetchedTasks, setFetchedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState<{
    start: string;
    end: string;
    label: string;
  }[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.TASK.GET), {
        withCredentials: true,
      });

      const data = response.data;
      let taskList: Task[] = [];

      if (Array.isArray(data)) {
        taskList = data;
      } else if (data && data.tasks) {
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
        const current = Array.isArray(data.currentWeek) ? data.currentWeek : [];
        const previous = Array.isArray(data.previousWeeks)
          ? data.previousWeeks
          : [];
        taskList = [...current, ...previous];
      }

      setFetchedTasks(taskList);

      // derive unique weeks
      const map = new Map<string, { start: string; end: string; label: string }>();
      taskList.forEach((t) => {
        if (t.weekStart && t.weekEnd) {
          const key = `${t.weekStart}|${t.weekEnd}`;
          if (!map.has(key)) {
            const s = new Date(t.weekStart);
            const e = new Date(t.weekEnd);
            const label = `${s.toLocaleDateString()} - ${e.toLocaleDateString()}`;
            map.set(key, { start: t.weekStart, end: t.weekEnd, label });
          }
        }
      });
      setWeeks(Array.from(map.values()));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setFetchedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // derive filtered lists for rendering
  const filteredTasksAll = fetchedTasks.filter((task) =>
    selectedWeek === "all" ? true : task.weekStart === selectedWeek,
  );

  const topTasks = filteredTasksAll.slice(0, 5);

  return (
    <CardBox className="h-full w-full">
      <div className="flex justify-between items-start mb-6 gap-4">
        <div>
          <h5 className="card-title flex items-center gap-2">
            <Icon
              icon="solar:clipboard-list-bold-duotone"
              className="text-primary text-2xl"
            />
            Recent Tasks
          </h5>
          <p className="text-sm text-muted-foreground font-normal">
            Latest administrative tasks
          </p>
        </div>
        <div className="flex items-center flex-col justify-start gap-3">
          {/* <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="border bg-card text-sm rounded px-2 py-1"
          >
            <option value="all">All Weeks</option>
            {weeks.map((w) => (
              <option key={w.start} value={w.start}>
                {w.label}
              </option>
            ))}
          </select> */}

          <Link href="/task">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              View All
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[150px]">Date Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <span className="text-muted-foreground">Loading...</span>
                </TableCell>
              </TableRow>
            ) : filteredTasksAll.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-muted-foreground"
                >
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              // show top 5 of filtered tasks
              topTasks.map((task) => (
                <TableRow key={task._id || task.id}>
                  <TableCell className="font-medium truncate max-w-[200px]">
                    {task.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.status === "SUCCESS"
                          ? "default"
                          : task.status === "FAILED"
                            ? "destructive"
                            : "secondary"
                      }
                      className="flex items-center gap-1 w-fit"
                    >
                      {statusIcons[task.status]}
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardBox>
  );
}
