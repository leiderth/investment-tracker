import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/common/StatCard';
import PatrimonyChart from '../components/common/PatrimonyChart';
import {
  TrendingUp,
  Wallet,
  DollarSign,
  Activity,
  PieChart,
  Plus
} from 'lucide-react';
import { formatCurrency, formatPercent, getProfitColor, getInvestmentTypeDisplay } from '../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar errores previos
      
      const [statsRes, evolutionRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getEvolution()
      ]);
      
      setStats(statsRes.data);
      setEvolution(evolutionRes.data);
    } catch (error) {
      console.error('Error cargando el dashboard:', error);
      setError(error.response?.data?.message || 'Error cargando el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  // Validar que stats existe antes de desestructurar
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">No hay datos disponibles</div>
      </div>
    );
  }

  const { summary, byType, topInvestments } = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen de tus inversiones</p>
        </div>
        <Link
          to="/investments"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Inversión</span>
        </Link>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patrimonio Total"
          value={formatCurrency(summary?.totalPatrimony || 0)}
          icon={Wallet}
          color="primary"
        />

        <StatCard
          title="Capital Invertido"
          value={formatCurrency(summary?.totalCapital || 0)}
          icon={DollarSign}
          color="purple"
        />

        <StatCard
          title="Ganancia/Pérdida"
          value={formatCurrency(summary?.totalProfit || 0)}
          icon={TrendingUp}
          color={(summary?.totalProfit || 0) >= 0 ? 'green' : 'red'}
          subtitle={`${formatPercent(summary?.generalReturn || 0)} de rendimiento`}
        />

        <StatCard
          title="Inversiones Activas"
          value={summary?.activeInvestments || 0}
          icon={Activity}
          color="yellow"
          subtitle={`${summary?.totalInvestments || 0} en total`}
        />
      </div>

      {/* Gráfico de evolución */}
      {summary?.totalInvestments > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Evolución del Patrimonio (últimos 30 días)
          </h2>
          <PatrimonyChart data={evolution} />
        </div>
      )}

      {/* Distribución por tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla por tipo */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Distribución por Tipo</h2>
          </div>

          {byType && byType.length > 0 ? (
            <div className="space-y-3">
              {byType.map((type, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {getInvestmentTypeDisplay(type.type)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {type.count} {type.count === 1 ? 'inversión' : 'inversiones'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(type.total)}
                    </p>
                    <p className={`text-sm font-medium ${getProfitColor(type.avgReturn)}`}>
                      {formatPercent(type.avgReturn)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              No tienes inversiones activas
            </p>
          )}
        </div>

        {/* Top inversiones */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Top Inversiones</h2>
          </div>

          {topInvestments && topInvestments.length > 0 ? (
            <div className="space-y-3">
              {topInvestments.map((inv, index) => (
                <Link
                  key={inv.id}
                  to={`/investments/${inv.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                        <p className="font-medium text-gray-900">
                          {getInvestmentTypeDisplay(inv.type)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{inv.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(inv.currentAmount)}
                      </p>
                      <p className={`text-sm font-medium ${getProfitColor(inv.returnPercentage)}`}>
                        {inv.returnPercentage > 0 ? '+' : ''}
                        {formatPercent(inv.returnPercentage)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              No tienes inversiones registradas
            </p>
          )}
        </div>
      </div>

      {/* Call to action si no hay inversiones */}
      {summary?.totalInvestments === 0 && (
        <div className="card bg-primary-50 border-2 border-primary-200">
          <div className="text-center py-8">
            <Wallet className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¡Comienza a invertir hoy!
            </h3>
            <p className="text-gray-600 mb-4">
              Registra tu primera inversión y empieza a hacer crecer tu patrimonio
            </p>
            <Link to="/investments" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Registrar Primera Inversión</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}