import React from 'react';
import { BarChart2, CheckCircle2 } from 'lucide-react';

const IndicatorTypeBadge = ({ type, className = '' }) => {
  if (type === 'SCALE_1_4') {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
        <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
        ระดับ 1-4
      </span>
    );
  } else if (type === 'YES_NO') {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
        ผ่าน/ไม่ผ่าน
      </span>
    );
  }

  // Fallback
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      {type}
    </span>
  );
};

export default IndicatorTypeBadge;
