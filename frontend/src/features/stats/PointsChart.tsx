import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../auth/AuthContext"; // För att hämta användardata
import { useDailyLeaderboard } from "../leaderboard/hooks/useDailyLeaderboard"; // Exempel: Hämta daglig data
import { Loading } from "../../components/ui/Loading";
import { ErrorMessage } from "../../components/ui/ErrorMessage";

interface ChartDataPoint {
  date: string; // T.ex. "YYYY-MM-DD"
  points: number;
}
