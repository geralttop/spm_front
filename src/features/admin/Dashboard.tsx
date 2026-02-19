import { useEffect, useState } from 'react';
import { Title } from 'react-admin';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './dashboard.css';

// Функция для получения токена
const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;
    
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Простой компонент карточки
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 animate-fade-in ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
  <Card className="stat-card">
    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
    <div className={`text-4xl font-bold ${color}`}>
      {value.toLocaleString()}
    </div>
  </Card>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="chart-card">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
    {children}
  </Card>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [reportsStats, setReportsStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getAccessToken();
        
        // Загружаем основную статистику
        const statsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats(data);
        }

        // Загружаем статистику жалоб
        const reportsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/reports?_start=0&_end=1000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          
          // Обрабатываем статистику жалоб
          const reports = reportsData.data || [];
          const reportsStats = {
            total: reports.length,
            pending: reports.filter((r: any) => r.status === 'pending').length,
            resolved: reports.filter((r: any) => r.status === 'resolved').length,
            dismissed: reports.filter((r: any) => r.status === 'dismissed').length,
            byType: {
              point: reports.filter((r: any) => r.type === 'point').length,
              comment: reports.filter((r: any) => r.type === 'comment').length,
              user: reports.filter((r: any) => r.type === 'user').length,
            },
            byReason: {
              spam: reports.filter((r: any) => r.reason === 'spam').length,
              inappropriate: reports.filter((r: any) => r.reason === 'inappropriate').length,
              harassment: reports.filter((r: any) => r.reason === 'harassment').length,
              fake: reports.filter((r: any) => r.reason === 'fake').length,
              other: reports.filter((r: any) => r.reason === 'other').length,
            }
          };
          
          setReportsStats(reportsStats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Загрузка статистики...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Не удалось загрузить статистику</div>
      </div>
    );
  }

  // Данные для круговой диаграммы пользователей
  const usersData = [
    { name: 'Администраторы', value: stats.users.admins },
    { name: 'Пользователи', value: stats.users.regularUsers },
  ];

  const verificationData = [
    { name: 'Подтверждены', value: stats.users.verified },
    { name: 'Не подтверждены', value: stats.users.unverified },
  ];

  // Данные для статистики жалоб
  const reportsStatusData = reportsStats ? [
    { name: 'Ожидают', value: reportsStats.pending },
    { name: 'Решены', value: reportsStats.resolved },
    { name: 'Отклонены', value: reportsStats.dismissed },
  ] : [];

  const reportsTypeData = reportsStats ? [
    { name: 'Точки', value: reportsStats.byType.point },
    { name: 'Комментарии', value: reportsStats.byType.comment },
    { name: 'Пользователи', value: reportsStats.byType.user },
  ] : [];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Панель управления</h1>

      {/* Карточки с общей статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Пользователи" 
          value={stats.totals.users} 
          color="text-blue-600" 
        />
        <StatCard 
          title="Точки" 
          value={stats.totals.points} 
          color="text-green-600" 
        />
        <StatCard 
          title="Категории" 
          value={stats.totals.categories} 
          color="text-yellow-600" 
        />
        <StatCard 
          title="Контейнеры" 
          value={stats.totals.containers} 
          color="text-purple-600" 
        />
        <StatCard 
          title="Жалобы" 
          value={reportsStats?.total || 0} 
          color="text-red-600" 
        />
      </div>

      {/* Статистика жалоб */}
      {reportsStats && reportsStats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Ожидают рассмотрения" 
            value={reportsStats.pending} 
            color="text-orange-600" 
          />
          <StatCard 
            title="Решены" 
            value={reportsStats.resolved} 
            color="text-green-600" 
          />
          <StatCard 
            title="Отклонены" 
            value={reportsStats.dismissed} 
            color="text-gray-600" 
          />
        </div>
      )}

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение пользователей по ролям */}
        <ChartCard title="Распределение по ролям">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usersData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {usersData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Подтверждение email */}
        <ChartCard title="Подтверждение Email">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={verificationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {verificationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index + 2 % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Точки по категориям */}
        <ChartCard title="Точки по категориям">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.pointsByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Количество точек">
                {stats.pointsByCategory.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Топ авторов */}
        <ChartCard title="Топ-10 авторов точек">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.pointsByAuthor} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="username" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Точек создано" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* График создания точек по времени */}
        {stats.pointsTimeline.length > 0 && (
          <div className="lg:col-span-2">
            <ChartCard title="Создание точек за последние 30 дней">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.pointsTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    name="Точек создано"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* Статистика жалоб */}
        {reportsStats && reportsStats.total > 0 && (
          <>
            <ChartCard title="Статус жалоб">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportsStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportsStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#f59e0b', '#10b981', '#6b7280'][index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Жалобы по типам">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportsTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#ef4444" name="Количество жалоб" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </div>
    </div>
  );
};