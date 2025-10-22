import React, {useMemo} from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../auth/AuthContext'; // För att hämta användardata
import { useDailyLeaderboard } from '../../hooks/useDailyLeaderboard'; // Exempel: Hämta daglig data
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';

interface ChartDataPoint {
  date: string; // T.ex. "YYYY-MM-DD"
  points: number;
}

