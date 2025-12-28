import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/format';

export default function PatrimonyChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        No hay suficientes datos para mostrar el gráfico
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(date) => {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(date) => new Date(date).toLocaleDateString('es-CO')}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#0284c7" 
          strokeWidth={2}
          dot={{ fill: '#0284c7', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}