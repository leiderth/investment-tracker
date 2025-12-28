// frontend/src/pages/Goals.jsx

import { useState, useEffect } from 'react';
import { Plus, Target, X, AlertCircle } from 'lucide-react';
import { getGoals, createGoal, updateGoal, deleteGoal, addGoalProgress } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import GoalCard from '../components/goals/GoalCard';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('en_progreso');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressAmount, setProgressAmount] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    current_amount: 0,
    monthly_savings: 0,
    deadline: '',
    priority: 'media',
    category: 'otro',
    notes: ''
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getGoals({ status: filter });
      setGoals(response.data.data || response.data || []);
    } catch (err) {
      setError('Error al cargar metas: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGoal({
        name: formData.name,
        description: formData.description,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        monthly_savings: parseFloat(formData.monthly_savings) || 0,
        deadline: formData.deadline,
        priority: formData.priority,
        category: formData.category,
        notes: formData.notes
      });

      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        target_amount: '',
        current_amount: 0,
        monthly_savings: 0,
        deadline: '',
        priority: 'media',
        category: 'otro',
        notes: ''
      });
      loadGoals();
    } catch (err) {
      setError('Error al crear meta: ' + err.message);
      console.error(err);
    }
  };

  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      monthly_savings: goal.monthly_savings,
      deadline: goal.deadline,
      priority: goal.priority,
      category: goal.category,
      notes: goal.notes
    });
    setShowCreateForm(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('¿Estás seguro de eliminar esta meta?')) {
      try {
        await deleteGoal(goalId);
        loadGoals();
      } catch (err) {
        setError('Error al eliminar meta: ' + err.message);
        console.error(err);
      }
    }
  };

  const handleAddProgress = (goal) => {
    setSelectedGoal(goal);
    setProgressAmount('');
    setShowProgressModal(true);
  };

  const submitProgress = async () => {
    if (!progressAmount || parseFloat(progressAmount) <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    try {
      await addGoalProgress(selectedGoal.id, {
        amount: parseFloat(progressAmount)
      });
      setShowProgressModal(false);
      setProgressAmount('');
      loadGoals();
    } catch (err) {
      setError('Error al agregar progreso: ' + err.message);
      console.error(err);
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'todas') return true;
    return goal.status === filter;
  });

  // Estadísticas
  const stats = {
    total: goals.length,
    completadas: goals.filter(g => g.status === 'completada').length,
    enProgreso: goals.filter(g => g.status === 'en_progreso').length,
    pausadas: goals.filter(g => g.status === 'pausada').length,
    totalAhorrado: goals.reduce((sum, g) => sum + g.current_amount, 0),
    totalObjetivo: goals.reduce((sum, g) => sum + g.target_amount, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando metas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Metas Financieras</h1>
        <p className="text-gray-600">Define y trackea tus objetivos financieros</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-600">
          <p className="text-xs text-gray-600 mb-1">Total de Metas</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-600">
          <p className="text-xs text-gray-600 mb-1">Completadas</p>
          <p className="text-2xl font-bold text-green-600">{stats.completadas}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
          <p className="text-xs text-gray-600 mb-1">En Progreso</p>
          <p className="text-2xl font-bold text-blue-600">{stats.enProgreso}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-600">
          <p className="text-xs text-gray-600 mb-1">Pausadas</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pausadas}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-600">
          <p className="text-xs text-gray-600 mb-1">Progreso Total</p>
          <p className="text-2xl font-bold text-purple-600">
            {stats.totalObjetivo > 0 
              ? ((stats.totalAhorrado / stats.totalObjetivo) * 100).toFixed(0) 
              : 0}%
          </p>
        </div>
      </div>

      {/* Filtros y Acciones */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => { setFilter('todas'); }}
            className={`px-4 py-2 rounded-lg transition ${filter === 'todas'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Todas ({stats.total})
          </button>
          <button
            onClick={() => { setFilter('en_progreso'); }}
            className={`px-4 py-2 rounded-lg transition ${filter === 'en_progreso'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            En Progreso ({stats.enProgreso})
          </button>
          <button
            onClick={() => { setFilter('completada'); }}
            className={`px-4 py-2 rounded-lg transition ${filter === 'completada'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Completadas ({stats.completadas})
          </button>
          <button
            onClick={() => { setFilter('pausada'); }}
            className={`px-4 py-2 rounded-lg transition ${filter === 'pausada'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Pausadas ({stats.pausadas})
          </button>
        </div>

        <button
          onClick={() => {
            setShowCreateForm(true);
            setSelectedGoal(null);
            setFormData({
              name: '',
              description: '',
              target_amount: '',
              current_amount: 0,
              monthly_savings: 0,
              deadline: '',
              priority: 'media',
              category: 'otro',
              notes: ''
            });
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Nueva Meta
        </button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedGoal ? 'Editar Meta' : 'Nueva Meta'}
            </h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Casa Propia"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="vivienda">🏠 Vivienda</option>
                <option value="educacion">🎓 Educación</option>
                <option value="retiro">👴 Retiro</option>
                <option value="viaje">✈️ Viaje</option>
                <option value="negocio">💼 Negocio</option>
                <option value="otro">🎯 Otro</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Detalla tu meta..."
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monto Objetivo *</label>
              <input
                type="number"
                step="0.01"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monto Actual</label>
              <input
                type="number"
                step="0.01"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ahorro Mensual</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_savings}
                onChange={(e) => setFormData({ ...formData, monthly_savings: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha Límite *</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows="2"
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
              >
                {selectedGoal ? 'Actualizar' : 'Crear'} Meta
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de metas */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay metas {filter !== 'todas' && `${filter}`}
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza a definir tus metas financieras para alcanzar tus objetivos
          </p>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-2"
            >
              <Plus size={20} />
              <span>Crear Primera Meta</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onAddProgress={handleAddProgress}
            />
          ))}
        </div>
      )}

      {/* Modal de progreso */}
      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Agregar Progreso a "{selectedGoal.name}"
              </h3>
              <button
                onClick={() => setShowProgressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Progreso Actual:</p>
              <p className="text-2xl font-bold text-indigo-600 mb-4">
                {formatCurrency(selectedGoal.current_amount)} / {formatCurrency(selectedGoal.target_amount)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Monto a Agregar *</label>
              <input
                type="number"
                step="0.01"
                value={progressAmount}
                onChange={(e) => setProgressAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitProgress}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition font-medium"
              >
                Agregar
              </button>
              <button
                onClick={() => setShowProgressModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
