import React, { useState } from 'react';
import { SearchCriteria } from '../types';
import { Search, Sparkles } from 'lucide-react';

interface CriteriaFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading: boolean;
}

const CriteriaForm: React.FC<CriteriaFormProps> = ({ onSearch, isLoading }) => {
  // Updated default values based on specific user requirements
  const [industryKeywords, setIndustryKeywords] = useState(
    '核融合技術の研究開発、実験、実証炉の建設・運用を計画している企業。スタートアップから大手重工、建設、プラントエンジニアリング企業まで幅広く。'
  );
  const [jobKeywords, setJobKeywords] = useState(
    '【必須条件】大卒でなくとも応募可能な求人、もしくは学歴不問。\n【希望職種】核融合炉の建設、インフラ維持管理、製造現場、または人事・広報・資金集め（ファンドレイジング）・総務などの周辺業務。\n【目的】広い意味で核融合エネルギー開発の実用化に貢献できる仕事。'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ industryKeywords, jobKeywords });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Sparkles className="text-indigo-600" />
          スマート求人スカウト
        </h2>
        <p className="text-slate-500 mt-2">
          AIが企業の公式サイトや求人情報をスクリーニングし、条件に合う仕事を提案します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            ① ターゲット業界・企業の条件
          </label>
          <textarea
            value={industryKeywords}
            onChange={(e) => setIndustryKeywords(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 min-h-[80px]"
            placeholder="例: 核融合実験炉, プラント建設, 重電メーカー..."
          />
          <p className="text-xs text-slate-400 mt-1">
            会社四季報やニュースリリース等を元に、この条件に合致する企業を検索します。
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            ② 求人のスクリーニング条件（人物像・職種）
          </label>
          <textarea
            value={jobKeywords}
            onChange={(e) => setJobKeywords(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 min-h-[120px]"
            placeholder="例: 大卒不問, 現場施工管理, インフラ維持, 総務・経理..."
          />
          <p className="text-xs text-slate-400 mt-1">
            各社の採用ページを解析し、この条件にマッチする求人を抽出・整理して表示します。
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
            ${isLoading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
            }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              情報を収集中...
            </>
          ) : (
            <>
              <Search size={20} />
              企業の調査を開始
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CriteriaForm;