import React from 'react';

// Gráfico de barras verticales SVG — para series temporales
const VBarChart = ({ data, valueKey, labelKey, color = '#0d6efd', formatValue }) => {
  const max    = Math.max(...data.map(d => d[valueKey]), 1);
  const fmt    = formatValue ?? (v => `$${(v / 1000).toFixed(0)}k`);
  const W      = 440;
  const H      = 160;
  const BASE_Y = 145;
  const slotW  = W / data.length;
  const BAR_W  = Math.min(slotW * 0.55, 36);
  const MAX_H  = 110;

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id={`vbar-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {data.map((item, i) => {
        const barH  = (item[valueKey] / max) * MAX_H;
        const x     = i * slotW;
        const barX  = x + (slotW - BAR_W) / 2;
        const y     = BASE_Y - barH;
        return (
          <g key={i}>
            <rect x={barX} y={y} width={BAR_W} height={barH}
              fill={`url(#vbar-${color.replace('#', '')})`} rx="3" />
            <text x={x + slotW / 2} y={BASE_Y + 14} textAnchor="middle"
              fontSize="9" fill="#6c757d" fontFamily="inherit">
              {item[labelKey]}
            </text>
            {barH > 14 && (
              <text x={barX + BAR_W / 2} y={y - 4} textAnchor="middle"
                fontSize="9" fill="#495057" fontFamily="inherit">
                {fmt(item[valueKey])}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default VBarChart;
