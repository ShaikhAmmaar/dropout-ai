
import React from 'react';
import { RiskCategory } from '../types';

interface Props {
  category: RiskCategory;
}

export const RiskBadge: React.FC<Props> = ({ category }) => {
  const colors = {
    [RiskCategory.SAFE]: 'bg-green-100 text-green-700 border-green-200',
    [RiskCategory.MODERATE]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [RiskCategory.HIGH]: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[category]}`}>
      {category}
    </span>
  );
};
