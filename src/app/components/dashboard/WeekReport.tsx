"use client";

import React, { useEffect, useState } from "react";
import CardBox from "../shared/CardBox";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  _id?: string;
  id?: string;
  title: string;
  task: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED";
  createdAt?: string;
  weekStart?: string;
  weekEnd?: string;
}

interface WeekStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
}

const WeekReport: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<WeekStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [weekLabel, setWeekLabel] = useState<string>("");
  const [weeks, setWeeks] = useState<{
    start: string;
    end: string;
    label: string;
    isCurrent: boolean;
  }[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  useEffect(() => {
    fetchWeeklyTasks();
  }, []);

  useEffect(() => {
    if (!selectedWeek) return;

    const response = axios.get(
      apiUrl(API_CONFIG.ENDPOINTS.TASK.WEEKLY),
      { withCredentials: true },
    ).then((res) => {
      const data = res.data;
      let allTasks: Task[] = [];

      if (Array.isArray(data)) {
        allTasks = data;
      } else if (data && data.tasks) {
        const tasksPayload = data.tasks;
        const current = Array.isArray(tasksPayload.currentWeek)
          ? tasksPayload.currentWeek
          : [];
        const previous = Array.isArray(tasksPayload.previousWeeks)
          ? tasksPayload.previousWeeks
          : [];
        allTasks = [...current, ...previous];
      } else if (data && Array.isArray(data.currentWeek)) {
        const current = data.currentWeek;
        const previous = Array.isArray(data.previousWeeks) ? data.previousWeeks : [];
        allTasks = [...current, ...previous];
      }

      // Filter tasks by selected week
      const filteredTasks = allTasks.filter((t) => t.weekStart === selectedWeek);
      setTasks(filteredTasks);

      // Calculate stats
      const weekStats: WeekStats = {
        total: filteredTasks.length,
        pending: 0,
        inProgress: 0,
        completed: 0,
        failed: 0,
      };

      filteredTasks.forEach((task) => {
        if (task.status === "PENDING") weekStats.pending++;
        else if (task.status === "IN_PROGRESS") weekStats.inProgress++;
        else if (task.status === "SUCCESS") weekStats.completed++;
        else if (task.status === "FAILED") weekStats.failed++;
      });

      setStats(weekStats);

      // Set week label
      if (filteredTasks.length > 0 && filteredTasks[0].weekStart && filteredTasks[0].weekEnd) {
        const start = new Date(filteredTasks[0].weekStart);
        const end = new Date(filteredTasks[0].weekEnd);
        const label = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
        setWeekLabel(label);
      }
    });
  }, [selectedWeek]);

  const fetchWeeklyTasks = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.TASK.WEEKLY),
        { withCredentials: true },
      );
      console.log(response.data);
      const data = response.data;
      let currentWeekTasks: Task[] = [];
      let previousWeeksTasks: Task[] = [];

      if (Array.isArray(data)) {
        currentWeekTasks = data;
      } else if (data && data.tasks) {
        const tasksPayload = data.tasks;
        currentWeekTasks = Array.isArray(tasksPayload.currentWeek)
          ? tasksPayload.currentWeek
          : [];
        previousWeeksTasks = Array.isArray(tasksPayload.previousWeeks)
          ? tasksPayload.previousWeeks
          : [];
      } else if (data && Array.isArray(data.currentWeek)) {
        currentWeekTasks = data.currentWeek;
        previousWeeksTasks = Array.isArray(data.previousWeeks)
          ? data.previousWeeks
          : [];
      }

      // Build weeks list
      const weeksList: {
        start: string;
        end: string;
        label: string;
        isCurrent: boolean;
      }[] = [];

      if (currentWeekTasks.length > 0 && currentWeekTasks[0].weekStart && currentWeekTasks[0].weekEnd) {
        const start = currentWeekTasks[0].weekStart;
        const end = currentWeekTasks[0].weekEnd;
        const s = new Date(start);
        const e = new Date(end);
        weeksList.push({
          start,
          end,
          label: `${s.toLocaleDateString()} - ${e.toLocaleDateString()} (Current)`,
          isCurrent: true,
        });
      }

      previousWeeksTasks.forEach((task) => {
        if (task.weekStart && task.weekEnd) {
          const key = `${task.weekStart}|${task.weekEnd}`;
          if (!weeksList.some((w) => `${w.start}|${w.end}` === key)) {
            const s = new Date(task.weekStart);
            const e = new Date(task.weekEnd);
            weeksList.push({
              start: task.weekStart,
              end: task.weekEnd,
              label: `${s.toLocaleDateString()} - ${e.toLocaleDateString()}`,
              isCurrent: false,
            });
          }
        }
      });

      setWeeks(weeksList);

      // Set initial selected week to current
      if (weeksList.length > 0) {
        setSelectedWeek(weeksList[0].start);
      }
    } catch (error) {
      console.error("Error fetching weekly tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "lightPrimary";
      case "IN_PROGRESS":
        return "lightWarning";
      case "SUCCESS":
        return "lightSuccess";
      case "FAILED":
        return "lightError";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "tabler:clock";
      case "IN_PROGRESS":
        return "tabler:player-play";
      case "SUCCESS":
        return "tabler:check";
      case "FAILED":
        return "tabler:x";
      default:
        return "tabler:help";
    }
  };

  return (
    <CardBox className="h-full">
      <div className="mb-6">
        <h5 className="card-title flex items-center gap-2 mb-2">
          <Icon
            icon="solar:calendar-bold-duotone"
            className="text-primary text-2xl"
          />
          This Week&apos;s Report
        </h5>
        {weekLabel && (
          <p className="text-sm text-muted-foreground">{weekLabel}</p>
        )}
      </div>

      {weeks.length > 0 && (
        <div className="mb-4 w-[200px]">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger>
              <SelectValue placeholder="Select Week" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((w) => (
                <SelectItem key={w.start} value={w.start}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                Total Tasks
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                Completed
              </p>
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                In Progress
              </p>
              <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                Pending
              </p>
              <p className="text-2xl font-bold text-primary">{stats.pending}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                Failed
              </p>
              <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks for this week
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                Recent Tasks
              </p>
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task._id || task.id}
                  className="p-3 rounded-lg bg-muted/20 flex items-start justify-between gap-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {task.task}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(task.status)} className="flex-shrink-0">
                    <Icon
                      icon={getStatusIcon(task.status)}
                      className="mr-1 h-3 w-3"
                    />
                    {task.status}
                  </Badge>
                </div>
              ))}
              {tasks.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{tasks.length - 5} more tasks
                </p>
              )}
            </div>
          )}
        </>
      )}
    </CardBox>
  );
};

export default WeekReport;
