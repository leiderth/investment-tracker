// frontend/src/pages/Simulations.jsx

import { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Target,
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { calculateSimulation, compareScenarios as compareAPI, calculateRequiredContribution } from '../services/api';
import { formatCurrency } from '../utils/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Simulations() {
  const [activeTab, setActiveTab] = useState('simple'); // simple, compare, goal
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Estado para simulación simple
  const [simpleForm, setSimpleForm] = useState({
    initial_amount: '',
    monthly_contribution: '',
    annual_return_percentage: '10',
    years: '10',
    compound_frequency: 'mensual'
  });

  // Estado para comparación de escenarios
  const [compareForm, setCompareForm] = useState({
    initial_amount: '',
    monthly_contribution: '',
    years: '10'
  });

  // Estado para calculadora de meta
  const [goalForm, setGoalForm] = useState({
    target_amount: '',
    initial_amount: '',
    annual_return_percentage: '10',
    years: '10'
  });

  // Simulación simple
  const handleSimpleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await calculateSimulation(simpleForm);
      setResult({ type: 'simple', data: response.data });
    } catch (error) {
      console.error('Error al calcular simulación:', error);
      alert('Error al calcular la simulación');
    } finally {
      setLoading(false);
    }
  };

  // Comparación de escenarios
  const handleCompare = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await compareAPI(compareForm);
      setResult({ type: 'compare', data: response.data });
    } catch (error) {
      console.error('Error al comparar escenarios:', error);
      alert('Error al comparar escenarios');
    } finally {
      setLoading(false);
    }
  };

  // Calculadora de meta
  const handleGoalCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await calculateRequiredContribution(goalForm);
      setResult({ type: 'goal', data: response.data });
    } catch (error) {
      console.error('Error al calcular meta:', error);
      alert('Error al calcular la meta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Sparkles className="text-indigo-600" size={32} />
          Simuladores Financieros
        </h1>
        <p className="text-gray-600">Proyecta el crecimiento de tus inversiones a largo plazo</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b">
          <button
            onClick={() => { setActiveTab('simple'); setResult(null); }}
            className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'simple'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calculator size={20} />
            Simulador Simple
          </button>
          <button
            onClick={() => { setActiveTab('compare'); setResult(null); }}
            className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'compare'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={20} />
            Comparar Escenarios
          </button>
          <button
            onClick={() => { setActiveTab('goal'); setResult(null); }}
            className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'goal'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Target size={20} />
            Calculadora de Meta
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: Simulador Simple */}
          {activeTab === 'simple' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Proyecta tu Inversión
                </h3>
                <form onSubmit={handleSimpleCalculate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Capital Inicial
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        step="0.01"
                        value={simpleForm.initial_amount}
                        onChange={(e) => setSimpleForm({ ...simpleForm, initial_amount: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="1000000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Aporte Mensual
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        step="0.01"
                        value={simpleForm.monthly_contribution}
                        onChange={(e) => setSimpleForm({ ...simpleForm, monthly_contribution: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="100000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rendimiento Anual Esperado (%)
                    </label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        step="0.01"
                        value={simpleForm.annual_return_percentage}
                        onChange={(e) => setSimpleForm({ ...simpleForm, annual_return_percentage: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Años de Inversión
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        value={simpleForm.years}
                        onChange={(e) => setSimpleForm({ ...simpleForm, years: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="10"
                        min="1"
                        max="50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Frecuencia de Capitalización
                    </label>
                    <select
                      value={simpleForm.compound_frequency}
                      onChange={(e) => setSimpleForm({ ...simpleForm, compound_frequency: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="diario">Diaria</option>
                      <option value="mensual">Mensual</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Calculando...' : (
                      <>
                        <Calculator size={20} />
                        Calcular Proyección
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Resultados */}
              <div>
                {result?.type === 'simple' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 shadow-lg">
                      <div className="text-sm opacity-90 mb-2">Monto Final Proyectado</div>
                      <div className="text-4xl font-bold mb-4">
                        {formatCurrency(result.data.calculation.final_amount)}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight size={16} />
                        <span>En {result.data.calculation.years} años</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-blue-600 mb-1">Total Aportado</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {formatCurrency(result.data.calculation.total_contributions)}
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-sm text-purple-600 mb-1">Ganancias</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {formatCurrency(result.data.calculation.total_earnings)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">ROI (Retorno sobre Inversión)</div>
                      <div className="text-3xl font-bold text-indigo-600">
                        {result.data.calculation.roi}%
                      </div>
                    </div>

                    {/* Gráfico */}
                    {result.data.yearly_projection && (
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Proyección Año por Año
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={result.data.yearly_projection}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" label={{ value: 'Año', position: 'insideBottom', offset: -5 }} />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="#8b5cf6" 
                              strokeWidth={3}
                              name="Saldo Total"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="contributions" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              name="Aportes"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {!result && (
                  <div className="flex items-center justify-center h-full text-center text-gray-400">
                    <div>
                      <Calculator size={64} className="mx-auto mb-4 opacity-50" />
                      <p>Completa el formulario para ver la proyección</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Comparar Escenarios */}
          {activeTab === 'compare' && (
            <div className="space-y-6">
              <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">Capital Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={compareForm.initial_amount}
                    onChange={(e) => setCompareForm({ ...compareForm, initial_amount: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="1000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Aporte Mensual</label>
                  <input
                    type="number"
                    step="0.01"
                    value={compareForm.monthly_contribution}
                    onChange={(e) => setCompareForm({ ...compareForm, monthly_contribution: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Años</label>
                  <input
                    type="number"
                    value={compareForm.years}
                    onChange={(e) => setCompareForm({ ...compareForm, years: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="10"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Comparando...' : 'Comparar Escenarios'}
                  </button>
                </div>
              </form>

              {result?.type === 'compare' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Conservador */}
                  <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-900">Conservador</h3>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Rendimiento: 6% anual</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-600">Monto Final</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(result.data.comparison.conservador.finalAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Ganancias</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(result.data.comparison.conservador.totalEarnings)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">ROI</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {result.data.comparison.conservador.roi.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Moderado */}
                  <div className="bg-white border-2 border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-900">Moderado</h3>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Rendimiento: 10% anual</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-600">Monto Final</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {formatCurrency(result.data.comparison.moderado.finalAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Ganancias</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(result.data.comparison.moderado.totalEarnings)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">ROI</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {result.data.comparison.moderado.roi.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agresivo */}
                  <div className="bg-white border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-900">Agresivo</h3>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Rendimiento: 15% anual</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-600">Monto Final</div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(result.data.comparison.agresivo.finalAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Ganancias</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(result.data.comparison.agresivo.totalEarnings)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">ROI</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {result.data.comparison.agresivo.roi.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!result && (
                <div className="flex items-center justify-center py-16 text-center text-gray-400">
                  <div>
                    <BarChart3 size={64} className="mx-auto mb-4 opacity-50" />
                    <p>Completa el formulario para comparar los 3 escenarios</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Calculadora de Meta */}
          {activeTab === 'goal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ¿Cuánto necesito ahorrar mensualmente?
                </h3>
                <form onSubmit={handleGoalCalculate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Meta Financiera
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        step="0.01"
                        value={goalForm.target_amount}
                        onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="10000000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Capital Inicial (opcional)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        step="0.01"
                        value={goalForm.initial_amount}
                        onChange={(e) => setGoalForm({ ...goalForm, initial_amount: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rendimiento Anual Esperado (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={goalForm.annual_return_percentage}
                      onChange={(e) => setGoalForm({ ...goalForm, annual_return_percentage: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Años Disponibles
                    </label>
                    <input
                      type="number"
                      value={goalForm.years}
                      onChange={(e) => setGoalForm({ ...goalForm, years: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Calculando...' : 'Calcular Aporte Necesario'}
                  </button>
                </form>
              </div>

              <div>
                {result?.type === 'goal' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
                      <div className="text-sm opacity-90 mb-2">Debes ahorrar mensualmente</div>
                      <div className="text-4xl font-bold mb-4">
                        {formatCurrency(result.data.required_monthly_contribution)}
                      </div>
                      <div className="text-sm opacity-90">
                        Durante {result.data.years} años para alcanzar {formatCurrency(result.data.target_amount)}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-blue-600 mb-1">Total a Aportar</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatCurrency(result.data.total_to_contribute)}
                      </div>
                    </div>

                    {result.data.yearly_projection && (
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Proyección para Alcanzar tu Meta
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={result.data.yearly_projection}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="#8b5cf6" 
                              strokeWidth={3}
                              name="Saldo Proyectado"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {!result && (
                  <div className="flex items-center justify-center h-full text-center text-gray-400">
                    <div>
                      <Target size={64} className="mx-auto mb-4 opacity-50" />
                      <p>Define tu meta financiera para calcular<br />cuánto necesitas ahorrar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}