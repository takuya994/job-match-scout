import React from 'react';
import { CompanyAnalysis, JobRequirement } from '../types';
import { Briefcase, AlertCircle, CheckCircle, ExternalLink, GraduationCap, Clock } from 'lucide-react';

interface AnalysisResultsProps {
  results: CompanyAnalysis[];
  onBack: () => void;
}

const MatchBadge: React.FC<{ score: number }> = ({ score }) => {
  let color = 'bg-slate-100 text-slate-600';
  if (score >= 80) color = 'bg-green-100 text-green-700';
  else if (score >= 50) color = 'bg-yellow-100 text-yellow-700';
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>
      マッチ度: {score}%
    </span>
  );
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, onBack }) => {
  const finishedResults = results.filter(r => r.isAnalyzed);
  const loadingResults = results.filter(r => r.isLoading);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">求人スクリーニング結果</h2>
          <p className="text-slate-500">ご指定の条件に基づいて抽出された情報です。</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          条件を変更して再検索
        </button>
      </div>

      {loadingResults.length > 0 && (
        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-indigo-800 font-medium">
            残り {loadingResults.length} 社を分析中...
          </span>
        </div>
      )}

      <div className="space-y-8">
        {finishedResults.map((company) => (
          <div key={company.companyId} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{company.companyName}</h3>
                <p className="text-sm text-slate-500 mt-1">{company.generalRecruitmentSummary}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600">
                   {company.jobs.length} 件の関連求人
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {company.jobs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                  <p>条件に完全に一致する具体的な求人は見つかりませんでした。</p>
                  <p className="text-xs mt-1">※公式採用ページに詳細がないか、現在募集停止中の可能性があります。</p>
                </div>
              ) : (
                company.jobs.map((job, idx) => (
                  <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-indigo-900">{job.role}</h4>
                          <MatchBadge score={job.matchScore} />
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap size={16} className="text-slate-400" />
                            <span className="font-medium">学歴要件:</span> {job.educationLevel}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-slate-400" />
                            <span className="font-medium">雇用形態:</span> {job.employmentType}
                          </div>
                          {job.location && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">勤務地:</span> {job.location}
                            </div>
                          )}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">応募要件・スキル</h5>
                          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                            {job.requirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="md:w-1/4 md:pl-6 md:border-l md:border-slate-100 mt-4 md:mt-0 flex flex-col justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">AI分析メモ</h5>
                          <p className="text-sm text-slate-600 italic">"{job.matchReason}"</p>
                        </div>
                        
                        {job.url && (
                          <a 
                            href={job.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2 bg-white border border-indigo-200 text-indigo-600 rounded hover:bg-indigo-50 transition-colors text-sm font-semibold"
                          >
                            求人詳細を見る <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisResults;