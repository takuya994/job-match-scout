import React from 'react';
import { Company } from '../types';
import { CheckCircle, Circle, Globe, ArrowRight } from 'lucide-react';

interface CompanyListProps {
  companies: Company[];
  onToggleSelect: (id: string) => void;
  onProceed: () => void;
  isAnalyzing: boolean;
}

const CompanyList: React.FC<CompanyListProps> = ({ companies, onToggleSelect, onProceed, isAnalyzing }) => {
  const selectedCount = companies.filter(c => c.isSelected).length;

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        企業が見つかりませんでした。条件を変更して再検索してください。
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">検索結果: {companies.length}社</h2>
          <p className="text-sm text-slate-500">詳細分析を行いたい企業を選択してください。</p>
        </div>
        <button
          onClick={onProceed}
          disabled={selectedCount === 0 || isAnalyzing}
          className={`flex items-center gap-2 py-2 px-6 rounded-lg font-semibold text-white transition-colors
            ${selectedCount === 0 || isAnalyzing
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20'
            }`}
        >
          {isAnalyzing ? '分析中...' : `${selectedCount}社を分析する`}
          {!isAnalyzing && <ArrowRight size={18} />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company) => (
          <div 
            key={company.id}
            className={`
              relative p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md
              ${company.isSelected 
                ? 'border-indigo-500 bg-indigo-50/50' 
                : 'border-white bg-white hover:border-slate-200'
              }
            `}
            onClick={() => onToggleSelect(company.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800 mb-1">{company.name}</h3>
                <p className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">
                  {company.relevance}
                </p>
                <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                  {company.description}
                </p>
                {company.websiteUrl && (
                  <a 
                    href={company.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe size={12} className="mr-1" />
                    Webサイトを確認
                  </a>
                )}
              </div>
              <div className="ml-4">
                {company.isSelected ? (
                  <CheckCircle className="text-indigo-600" size={24} />
                ) : (
                  <Circle className="text-slate-300" size={24} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyList;