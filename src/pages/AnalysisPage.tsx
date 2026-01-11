import React, { useMemo } from 'react';
import { BarChart3, Calendar, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import type { Session } from '../types';

/**
 * 数据分析页面
 * 展示学习会话的统计数据和可视化图表
 */
function AnalysisPage () {
  // 从 localStorage 读取所有会话数据
  const sessions = useMemo<Session[]>(() => {
    try {
      const saved = localStorage.getItem('today-sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('读取会话数据失败:', error);
    }
    return [];
  }, []);

  // 统计数据计算
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === 'completed').length;
    const totalTodos = sessions.reduce((sum, s) => sum + s.todos.length, 0);
    const completedTodos = sessions.reduce(
      (sum, s) => sum + s.todos.filter((t) => t.completed).length,
      0
    );
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const todoCompletionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    // 按日期统计
    const sessionsByDate = sessions.reduce((acc, session) => {
      const date = new Date(session.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 最近 7 天的活动
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString();
    }).reverse();

    return {
      totalSessions,
      completedSessions,
      totalTodos,
      completedTodos,
      totalMessages,
      completionRate: Math.round(completionRate),
      todoCompletionRate: Math.round(todoCompletionRate),
      sessionsByDate,
      last7Days,
    };
  }, [sessions]);

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            数据分析
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看你的学习进度和统计数据
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="总会话数"
            value={stats.totalSessions}
            subtitle={`已完成 ${stats.completedSessions} 个`}
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="完成率"
            value={`${stats.completionRate}%`}
            subtitle={`${stats.completedSessions}/${stats.totalSessions} 会话`}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="待办事项"
            value={stats.totalTodos}
            subtitle={`已完成 ${stats.completedTodos} 个 (${stats.todoCompletionRate}%)`}
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="消息总数"
            value={stats.totalMessages}
            subtitle="与 AI 的对话消息"
          />
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 最近 7 天活动趋势 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              最近 7 天活动
            </h2>
            <div className="space-y-3">
              {stats.last7Days.map((date) => {
                const count = stats.sessionsByDate[date] || 0;
                const maxCount = Math.max(...Object.values(stats.sessionsByDate), 1);
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                      {date}
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 会话状态分布 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              会话状态分布
            </h2>
            <div className="space-y-4">
              <StatusBar
                label="规划中"
                count={sessions.filter((s) => s.status === 'planning').length}
                total={stats.totalSessions}
                color="bg-blue-500"
              />
              <StatusBar
                label="执行中"
                count={sessions.filter((s) => s.status === 'executing').length}
                total={stats.totalSessions}
                color="bg-yellow-500"
              />
              <StatusBar
                label="已完成"
                count={stats.completedSessions}
                total={stats.totalSessions}
                color="bg-green-500"
              />
            </div>
          </div>
        </div>

        {/* 会话列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            最近会话
          </h2>
          <div className="space-y-3">
            {sessions.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                    <span>{session.messages.length} 条消息</span>
                    <span>{session.todos.length} 个待办</span>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : session.status === 'executing'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {session.status === 'completed'
                      ? '已完成'
                      : session.status === 'executing'
                      ? '执行中'
                      : '规划中'}
                  </span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                暂无会话数据
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// 统计卡片组件
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-600 dark:text-gray-400">{icon}</div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-500">{subtitle}</div>
    </div>
  );
};

// 状态条组件
interface StatusBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {count} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default AnalysisPage;

