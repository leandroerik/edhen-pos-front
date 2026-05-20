import React from 'react';

// Gráfico de barras horizontales SVG — reutilizable en todos los informes
const HBarChart = ({ data, valueKey, labelKey, color = '#0d6efd', formatValue }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const fmt = formatValue ?? (v => v.toLocaleString('es-AR'));
  const BAR_H   = 24;
  const GAP     = 12;
  const LABEL_W = 160;
  const BAR_MAX = 260;
  const height  = data.length * (BAR_H + GAP) + 10;

  return (
    <svg viewBox={`0 0 ${LABEL_W + BAR_MAX + 80} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {data.map((item, i) => {
        const barW = (item[valueKey] / max) * BAR_MAX;
        const y    = i * (BAR_H + GAP) + 5;
        return (
          <g key={i}>
            <text x={LABEL_W - 8} y={y + BAR_H / 2 + 4} textAnchor="end"
              fontSize="11" fill="#495057" fontFamily="inherit">
              {item[labelKey]}
            </text>
            <rect x={LABEL_W} y={y} width={barW || 2} height={BAR_H}
              fill={color} rx="3" opacity={i === 0 ? 1 : 0.75 - i * 0.05} />
            <text x={LABEL_W + barW + 6} y={y + BAR_H / 2 + 4}
              fontSize="11" fill="#495057" fontFamily="inherit" fontWeight="600">
              {fmt(item[valueKey])}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default HBarChart;
