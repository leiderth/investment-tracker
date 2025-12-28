// frontend/src/components/common/RiskBadge.jsx

import { Shield, AlertTriangle, AlertCircle } from 'lucide-react';

export default function RiskBadge({ level, size = 'md', showIcon = true, showLabel = true }) {
  const getRiskConfig = (riskLevel) => {
    const configs = {
      bajo: {
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: Shield,
        label: 'Bajo Riesgo',
        iconColor: 'text-green-600'
      },
      medio: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: AlertTriangle,
        label: 'Riesgo Medio',
        iconColor: 'text-yellow-600'
      },
      alto: {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertCircle,
        label: 'Alto Riesgo',
        iconColor: 'text-red-600'
      }
    };
    return configs[riskLevel] || configs.medio;
  };

  const config = getRiskConfig(level);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon size={iconSizes[size]} className={config.iconColor} />}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}