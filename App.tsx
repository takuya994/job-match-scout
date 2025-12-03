import { useState } from 'react';
import { AppStep, SearchCriteria, Company, CompanyAnalysis } from './types';
import StepIndicator from './components/StepIndicator';
import CriteriaForm from './components/CriteriaForm';
import CompanyList from './components/CompanyList';
import AnalysisResults from './components/AnalysisResults';
import { searchCompanies, analyzeCompanyJobs } from './services/geminiService';
import { Briefcase } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.DEFINE_CRITERIA);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [analysisResults, setAnalysisResults] = useState<CompanyAnalysis[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Step 1: Search Companies
  const handleSearchCompanies = async (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setIsLoading(true);
    try {
      const results = await searchCompanies(criteria.industryKeywords);
      setCompanies(results);
      setCurrentStep(AppStep.SEARCH_COMPANIES);
    } catch (error) {
      console.error("Search failed", error);
      alert("企業の検索中にエラーが発生しました。APIキーを確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Select Companies
  const toggleCompanySelection = (id: string) => {
    setCompanies(prev => prev.map(c => 
      c.id === id ? { ...c, isSelected: !c.isSelected } : c
    ));
  };

  // Step 3: Analyze Jobs
  const handleStartAnalysis = async () => {
    if (!searchCriteria) return;
    
    const selectedCompanies = companies.filter(c => c.isSelected);
    setCurrentStep(AppStep.ANALYZE_JOBS);
    setIsAnalyzing(true);

    // Initialize results with loading state
    const initialResults: CompanyAnalysis[] = selectedCompanies.map(c => ({
      companyId: c.id,
      companyName: c.name,
      jobs: [],
      generalRecruitmentSummary: '',
      isAnalyzed: false,
      isLoading: true
    }));
    setAnalysisResults(initialResults);

    // Process companies one by one to avoid rate limits and allow progressive rendering
    for (const company of selectedCompanies) {
      try {
        const analysis = await analyzeCompanyJobs(company.name, searchCriteria.jobKeywords);
        
        setAnalysisResults(prev => prev.map(res => {
          if (res.companyId === company.id) {
            return {
              ...res,
              jobs: analysis.jobs,
              generalRecruitmentSummary: analysis.summary,
              isAnalyzed: true,
              isLoading: false
            };
          }
          return res;
        }));
      } catch (e) {
        console.error(`Failed to analyze ${company.name}`, e);
        setAnalysisResults(prev => prev.map(res => {
          if (res.companyId === company.id) {
            return {
              ...res,
              generalRecruitmentSummary: "分析中にエラーが発生しました。",
              isAnalyzed: true,
              isLoading: false
            };
          }
          return res;
        }));
      }
    }
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setCurrentStep(AppStep.DEFINE_CRITERIA);
    setCompanies([]);
    setAnalysisResults([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Briefcase className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Job Match Scout</h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Google Gemini 2.0 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator currentStep={currentStep} />
        
        <div className="mt-8">
          {currentStep === AppStep.DEFINE_CRITERIA && (
            <CriteriaForm onSearch={handleSearchCompanies} isLoading={isLoading} />
          )}

          {currentStep === AppStep.SEARCH_COMPANIES && (
            <CompanyList 
              companies={companies} 
              onToggleSelect={toggleCompanySelection} 
              onProceed={handleStartAnalysis}
              isAnalyzing={isAnalyzing}
            />
          )}

          {currentStep === AppStep.ANALYZE_JOBS && (
            <AnalysisResults 
              results={analysisResults} 
              onBack={handleReset} 
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 Job Match Scout. This application uses AI to analyze publicly available information.</p>
          <p>情報の正確性を保証するものではありません。詳細は各企業の公式サイトをご確認ください。</p>
        </div>
      </footer>
    </div>
  );
}