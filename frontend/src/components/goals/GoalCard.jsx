// frontend/src/components/goals/GoalCard.jsx

import { Target, Calendar, TrendingUp, Edit2, Trash2, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

export default function GoalCard({ 
  goal, 
  onEdit, 
  onDelete, 
  onAddProgress 
}) {
  const progressPercentage = (goal.current_amount / goal.target_amount) * 100;
  const daysRemaining = goal.days_remaining || 0;
  const isCompleted = goal.status === 'completada';
  const isPaused = goal.status === 'pausada';

  // Calcular si está en riesgo (menos del 25% del tiempo, menos del 25% de progreso)
  const targetDays = new Date(goal.deadline) - new Date();
  const totalDays = new Date(goal.deadline) - new Date(goal.created_at);
  const timeProgress = ((totalDays - targetDays) / totalDays) * 100;
  const isAtRisk = timeProgress > 75 && progressPercentage < 25;

  const getPriorityColor = (priority) => {
    const colors = {
      baja: 'bg-blue-100 text-blue-700 border-blue-200',
      media: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      alta: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      vivienda: '🏠',
      educacion: '🎓',
      retiro: '👴',
      viaje: '✈️',
      negocio: '💼',
      otro: '🎯'
    };
    return emojis[category] || '🎯';
  };

  const getStatusLabel = (status) => {
    const labels = {
      en_progreso: 'En Progreso',
      completada: 'Completada',
      pausada: 'Pausada'
    };
    return labels[status] || status;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 ${
      isCompleted ? 'border-green-600' : 
      isPaused ? 'border-gray-600' :
      isAtRisk ? 'border-red-600' : 'border-indigo-600'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getCategoryEmoji(goal.category)}</span>
            <h3 className="font-bold text-lg text-gray-900">{goal.name}</h3>
          </div>
          <p className="text-sm text-gray-600">{goal.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 text-gray-400 hover:text-indigo-600 transition"
            title="Editar"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Status y Priority */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(goal.priority)}`}>
          Prioridad {goal.priority}
        </span>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          isCompleted ? 'bg-green-100 text-green-700' :
          isPaused ? 'bg-gray-100 text-gray-700' :
          isAtRisk ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {getStatusLabel(goal.status)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Progreso</div>
          <div className="text-sm font-bold text-gray-900">{progressPercentage.toFixed(1)}%</div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' :
              isAtRisk ? 'bg-red-500' :
              progressPercentage < 33 ? 'bg-red-500' :
              progressPercentage < 66 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Montos */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Ahorrado</span>
          <span className="font-bold text-gray-900">{formatCurrency(goal.current_amount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Objetivo</span>
          <span className="font-bold text-gray-900">{formatCurrency(goal.target_amount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Falta</span>
          <span className="font-bold text-red-600">
            {formatCurrency(goal.target_amount - goal.current_amount)}
          </span>
        </div>
      </div>

      {/* Información de tiempo */}
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>Vence en {daysRemaining} días</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={14} />
          <span>Ahorro mensual: {formatCurrency(goal.monthly_savings)}</span>
        </div>
      </div>

      {/* Alertas */}
      {isAtRisk && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          ⚠️ Meta en riesgo: poco tiempo y bajo progreso
        </div>
      )}

      {daysRemaining < 30 && daysRemaining > 0 && !isCompleted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-700">
          ⏰ Vencimiento próximo: {goal.deadline}
        </div>
      )}

      {/* Botón de agregar progreso */}
      {!isCompleted && !isPaused && (
        <button
          onClick={() => onAddProgress(goal)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm font-medium"
        >
          <Plus size={16} />
          Agregar Progreso
        </button>
      )}
    </div>
  );
}
