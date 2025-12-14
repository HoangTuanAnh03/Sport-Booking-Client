import { useQuery } from "@tanstack/react-query";
import http from "@/utils/api";

export const useGetWeeklyAnswerByLevelQuery = () => {
  return useQuery({
    queryKey: ["weekly-answer-by-level"],
    queryFn: () => http.get<IBackendRes<Array<{ level_name: string; total_answers: number }>>>("/statistics/weekly-answer-by-level"),
  });
};

export const useGetPvpRankingReportQuery = () => {
  return useQuery({
    queryKey: ["pvp-ranking-report"],
    queryFn: () => http.get<IBackendRes<Array<{ fileName: string; lastModified: string; fileSize: number }>>>("/statistics/reports"),
  });
};

export const useGetWeeklyAnswerRateQuery = () => {
  return useQuery({
    queryKey: ["weekly-answer-rate"],
    queryFn: () => http.get<IBackendRes<{ correct: number; incorrect: number }>>("/statistics/weekly-answer-rate"),
  });
};

export const useGetWeeklyPVPLeaderboardQuery = () => {
  return useQuery({
    queryKey: ["weekly-pvp-leaderboard"],
    queryFn: () => http.get<IBackendRes<Array<{ name: string; point: number }>>>("/statistics/weekly-pvp-leaderboard"),
  });
};
