
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, IELTSFeedback, SentenceComparison } from './types';
import { getIELTSFeedback } from './geminiService';
import ScoreChart from './components/ScoreChart';
import LoadingScreen from './components/LoadingScreen';

const EXAMPLE_PROMPTS = [
  {
    title: "Technology",
    text: "Some people believe that technology has made our lives more complex, and the solution is to lead a simpler life without too much technology. To what extent do you agree or disagree?"
  },
  {
    title: "Education",
    text: "In many countries, students who do not speak the national language as their first language are taught in separate groups. Is this a positive or negative development?"
  },
  {
    title: "Environment",
    text: "Global warming is one of the most serious issues the world is facing today. What are the causes of global warming and what measures can be taken to address this problem?"
  }
];

const VALID_ACCESS_CODE = "SKYIELTS2019";

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return localStorage.getItem('ielts_access_granted') === 'true';
  });
  const [accessInput, setAccessInput] = useState('');
  const [accessError, setAccessError] = useState('');

  const [state, setState] = useState<AppState>(() => {
    const savedDraft = localStorage.getItem('ielts_draft');
    if (savedDraft) {
      try {
        const { question, writing } = JSON.parse(savedDraft);
        return { question: question || '', writing: writing || '', loading: false, error: null, feedback: null };
      } catch (e) {
        return { question: '', writing: '', loading: false, error: null, feedback: null };
      }
    }
    return {
      question: '',
      writing: '',
      loading: false,
      error: null,
      feedback: null
    };
  });

  const [activeTab, setActiveTab] = useState<'overall' | 'feedback' | 'improved' | 'vocabulary' | 'structures' | 'model'>('overall');

  useEffect(() => {
    if (!state.feedback && isAuthorized) {
      localStorage.setItem('ielts_draft', JSON.stringify({
        question: state.question,
        writing: state.writing
      }));
    }
  }, [state.question, state.writing, state.feedback, isAuthorized]);

  const wordCount = useMemo(() => {
    return state.writing.trim() ? state.writing.trim().split(/\s+/).length : 0;
  }, [state.writing]);

  const wordProgress = Math.min((wordCount / 350) * 100, 100);

  const sortedVocabulary = useMemo(() => {
    if (!state.feedback?.advancedVocabulary) return [];
    return [...state.feedback.advancedVocabulary].sort((a, b) => 
      a.term.toLowerCase().localeCompare(b.term.toLowerCase())
    );
  }, [state.feedback?.advancedVocabulary]);

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessInput.trim().toUpperCase() === VALID_ACCESS_CODE) {
      setIsAuthorized(true);
      localStorage.setItem('ielts_access_granted', 'true');
      setAccessError('');
    } else {
      setAccessError('Mã Access Code không chính xác. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.question.trim() || !state.writing.trim()) {
      setState(prev => ({ ...prev, error: 'Vui lòng nhập đề bài và bài viết của bạn.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, feedback: null }));
    try {
      const feedback = await getIELTSFeedback(state.question, state.writing);
      setState(prev => ({ ...prev, loading: false, feedback }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, loading: false, error: err.message || 'Phân tích thất bại.' }));
    }
  };

  const reset = () => {
    if (window.confirm("Bắt đầu bài viết mới? Toàn bộ kết quả hiện tại sẽ bị xóa.")) {
      setState({
        question: '',
        writing: '',
        loading: false,
        error: null,
        feedback: null
      });
      localStorage.removeItem('ielts_draft');
      setActiveTab('overall');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50/50 p-4 font-['Inter']">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-rose-100 p-10 border border-rose-100 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-rose-200">
              <span className="text-white font-black text-4xl">W</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Access Required</h1>
            <p className="text-slate-500 text-sm font-medium">Nhập Access Code để bắt đầu sử dụng hệ thống chấm bài thông minh.</p>
          </div>
          
          <form onSubmit={handleAccessSubmit} className="space-y-4">
            <input 
              type="text" 
              placeholder="Nhập Access Code..." 
              value={accessInput}
              onChange={(e) => setAccessInput(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-rose-100 focus:ring-4 focus:ring-rose-100 focus:border-rose-400 outline-none transition-all text-center text-xl font-bold tracking-widest text-slate-700 uppercase"
            />
            {accessError && <p className="text-red-500 text-xs font-bold text-center">{accessError}</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-rose-200 active:scale-95"
            >
              Xác nhận Access
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
             <div className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
               Tạo bởi <a href="https://vanthanhphancv.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline decoration-2 hover:text-rose-700 transition-all font-black">Tiến sĩ Phan Thị Vân Thanh</a> <br/> Sáng lập <a href="https://www.facebook.com/skylanguagevn" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline decoration-2 hover:text-rose-700 transition-all font-black">SKY IELTS</a>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 selection:bg-rose-100 selection:text-rose-900 bg-rose-50/30 font-['Inter']">
      {/* HEADER SECTION */}
      <header className="bg-white/90 backdrop-blur-md border-b border-rose-100 sticky top-0 z-[100] shadow-sm py-2">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => window.location.reload()}
            >
              <span className="text-white font-bold text-2xl pointer-events-none">W</span>
            </div>
            <div className="flex flex-col text-left">
              <h1 
                className="text-xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent leading-tight cursor-pointer"
                onClick={() => window.location.reload()}
              >
                Phân tích bài viết IELTS Task 2
              </h1>
              <div className="text-[10px] md:text-[11px] text-slate-500 font-medium leading-relaxed">
                Tạo bởi <a href="https://vanthanhphancv.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-rose-600 font-bold underline decoration-2 hover:text-rose-700 transition-all">Tiến sĩ Phan Thị Vân Thanh</a> - sáng lập <a href="https://www.facebook.com/skylanguagevn" target="_blank" rel="noopener noreferrer" className="text-rose-600 font-bold underline decoration-2 hover:text-rose-700 transition-all">SKY IELTS</a>. Follow để cập nhật nhiều app hay.
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {(state.feedback || state.question || state.writing) && (
              <button 
                onClick={reset}
                className="text-xs font-bold text-slate-600 hover:text-rose-600 transition-all border border-slate-200 px-4 py-2.5 rounded-xl bg-white/50 hover:bg-rose-50"
              >
                Viết bài mới
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!state.feedback && !state.loading ? (
          /* INPUT SECTION */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-rose-600 text-white p-6 rounded-3xl shadow-xl shadow-rose-200/50 space-y-4">
                <h2 className="text-2xl font-bold leading-tight">Task 2 Expert</h2>
                <p className="text-rose-50 text-sm opacity-90">
                  Phân tích bài viết chuyên sâu theo bộ tiêu chí của giám khảo BC & IDP.
                </p>
                <div className="pt-2">
                   <p className="text-xs font-bold uppercase tracking-widest text-rose-200 mb-3">Chọn đề bài mẫu</p>
                   <div className="flex flex-wrap gap-2">
                     {EXAMPLE_PROMPTS.map((p, i) => (
                       <button
                         key={i}
                         type="button"
                         onClick={() => setState(prev => ({ ...prev, question: p.text }))}
                         className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors border border-white/10"
                       >
                         {p.title}
                       </button>
                     ))}
                   </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-rose-100 space-y-4 shadow-sm">
                <h3 className="font-semibold text-rose-800 flex items-center gap-2 text-sm uppercase tracking-tighter">
                   <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                   Tự động ghi nhớ
                </h3>
                <p className="text-xs text-rose-500/70 leading-relaxed italic">
                  Hệ thống tự động lưu bản nháp. Bạn có thể thoát và quay lại bất cứ lúc nào.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Câu hỏi (Question)</label>
                <textarea
                  value={state.question}
                  onChange={(e) => setState(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Dán câu hỏi IELTS Writing Task 2..."
                  className="w-full h-32 p-5 rounded-2xl bg-white border border-rose-100 focus:ring-4 focus:ring-rose-100 focus:border-rose-400 outline-none transition-all resize-none text-slate-700 shadow-sm leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end ml-1">
                   <label className="text-sm font-bold text-slate-700">Bài làm (Essay)</label>
                   <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${wordCount < 250 ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {wordCount} / 350 Words
                      </span>
                      <div className="w-32 h-1.5 bg-rose-50 rounded-full overflow-hidden border border-rose-100/50">
                        <div 
                          className={`h-full transition-all duration-500 ${wordCount < 250 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                          style={{ width: `${wordProgress}%` }}
                        />
                      </div>
                   </div>
                </div>
                <textarea
                  value={state.writing}
                  onChange={(e) => setState(prev => ({ ...prev, writing: e.target.value }))}
                  placeholder="Bắt đầu viết bài luận của bạn..."
                  className="w-full h-80 p-5 rounded-2xl bg-white border border-rose-100 focus:ring-4 focus:ring-rose-100 focus:border-rose-400 outline-none transition-all resize-none text-slate-700 leading-relaxed shadow-sm font-['Inter']"
                />
              </div>

              {state.error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium">
                  {state.error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={state.loading}
                  className="flex-1 py-5 rounded-2xl text-white font-black text-xl active:scale-[0.98] transition-all shadow-xl bg-rose-600 hover:bg-rose-700 shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {state.loading ? "Giám khảo đang chấm bài..." : "Nhận kết quả & Phản hồi"}
                </button>
              </div>
            </form>
          </div>
        ) : state.loading ? (
          <div className="bg-white border border-rose-100 rounded-3xl shadow-xl overflow-hidden">
            <LoadingScreen />
          </div>
        ) : (
          /* RESULT SECTION */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Score Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Score Card */}
              <div className="md:col-span-4 p-8 rounded-3xl text-white bg-rose-600 shadow-2xl shadow-rose-200 relative overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <span className="text-white/80 text-xs font-black uppercase tracking-widest mb-2 relative z-1">Estimated Band Score</span>
                <div className="text-9xl font-black mb-4 relative z-1 drop-shadow-2xl">{state.feedback?.estimatedScore.total}</div>
                <p className="text-xs leading-relaxed text-white relative z-1 px-4 mt-2 font-semibold mb-6">
                  {state.feedback?.estimatedScore.overallFeedback}
                </p>
              </div>

              {/* Chart & Badges Row */}
              <div className="md:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-rose-100 shadow-lg flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-3/5">
                   <ScoreChart scores={state.feedback!.estimatedScore} />
                </div>
                <div className="w-full md:w-2/5 grid grid-cols-2 gap-4 h-full py-2">
                  <ScoreBadge label="Task Response" score={state.feedback!.estimatedScore.taskResponse} />
                  <ScoreBadge label="Coherence" score={state.feedback!.estimatedScore.coherenceCohesion} />
                  <ScoreBadge label="Lexical" score={state.feedback!.estimatedScore.lexicalResource} />
                  <ScoreBadge label="Grammar" score={state.feedback!.estimatedScore.grammaticalRange} />
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide sticky top-[5.5rem] z-40 bg-rose-50/20 backdrop-blur-md py-2">
              <TabButton active={activeTab === 'overall'} onClick={() => setActiveTab('overall')} label="Góp ý chung" icon={<ExamIcon />} />
              <TabButton active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} label="Lỗi sai & Góp ý" icon={<FeedbackIcon />} />
              <TabButton active={activeTab === 'improved'} onClick={() => setActiveTab('improved')} label="Nâng cấp bài" icon={<PencilIcon />} />
              <TabButton active={activeTab === 'vocabulary'} onClick={() => setActiveTab('vocabulary')} label="Từ vựng hay" icon={<BookIcon />} />
              <TabButton active={activeTab === 'structures'} onClick={() => setActiveTab('structures')} label="Cấu trúc hay" icon={<ZapIcon />} />
              <TabButton active={activeTab === 'model'} onClick={() => setActiveTab('model')} label="Bài mẫu Band 9.0" icon={<StarIcon />} />
            </div>

            {/* Content Display Area */}
            <div className="bg-white border border-rose-100 rounded-[2.5rem] shadow-xl min-h-[500px] overflow-hidden mb-12 relative">
              {activeTab === 'overall' && (
                <div className="p-8 md:p-12 space-y-8">
                  <h3 className="text-3xl font-black text-rose-800 tracking-tight">Nhận xét từ Giám khảo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CriteriaCard title="Task Response" content={state.feedback?.criteriaFeedback.taskResponse || ''} />
                    <CriteriaCard title="Coherence & Cohesion" content={state.feedback?.criteriaFeedback.coherenceCohesion || ''} />
                    <CriteriaCard title="Lexical Resource" content={state.feedback?.criteriaFeedback.lexicalResource || ''} />
                    <CriteriaCard title="Grammatical Range" content={state.feedback?.criteriaFeedback.grammaticalRange || ''} />
                  </div>
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="p-8 md:p-12 space-y-8">
                  <h3 className="text-2xl font-black text-rose-800 flex items-center gap-3">
                    <FeedbackIcon />
                    Sửa lỗi & Ghi chú trực tiếp
                  </h3>
                  <div className="p-10 bg-slate-50 rounded-3xl border border-slate-200 leading-[3.5rem] text-xl text-slate-700 whitespace-pre-wrap font-medium">
                    {state.writing.split('\n').map((line, lidx) => (
                      <p key={lidx} className="mb-8">
                        {state.feedback?.grammarAndVocabIssues.reduce((acc: (string | React.ReactNode)[], corr) => {
                          const newAcc: (string | React.ReactNode)[] = [];
                          acc.forEach(item => {
                            if (typeof item === 'string' && item.includes(corr.original)) {
                              const parts = item.split(corr.original);
                              parts.forEach((p, i) => {
                                newAcc.push(p);
                                if (i < parts.length - 1) {
                                  newAcc.push(
                                    <span key={i} className="group relative inline cursor-pointer">
                                      <span className="text-red-500 line-through decoration-red-300 decoration-2">{corr.original}</span>
                                      <span className="mx-2 text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-lg shadow-sm border border-emerald-100">
                                        <span className="mr-1 text-emerald-300">→</span>
                                        {corr.correction}
                                      </span>
                                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 p-5 bg-slate-900 text-white text-xs rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none shadow-2xl leading-relaxed font-normal">
                                        <div className="font-black text-rose-400 mb-2 border-b border-white/10 pb-1 uppercase tracking-widest text-[10px]">{corr.type}</div>
                                        {corr.explanation}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-slate-900"></div>
                                      </span>
                                    </span>
                                  );
                                }
                              });
                            } else {
                              newAcc.push(item);
                            }
                          });
                          return newAcc;
                        }, [line])}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'improved' && (
                <div className="p-8 md:p-12 space-y-8">
                  <h3 className="text-2xl font-black text-rose-800">Nâng cấp bài viết (Toàn bộ các câu)</h3>
                  <div className="space-y-6">
                    {state.feedback?.sentenceComparisons.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm group">
                        <div className="p-6 bg-white border-b md:border-b-0 md:border-r border-slate-50 group-hover:bg-slate-50 transition-colors">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Câu gốc #{idx + 1}</span>
                           <p className="text-slate-500 text-sm italic leading-relaxed">{item.original}</p>
                        </div>
                        <div className="p-6 bg-emerald-50/10 group-hover:bg-emerald-50/30 transition-colors">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-3">Bản AI nâng cấp</span>
                           <div className="text-slate-800 text-base font-bold leading-relaxed">
                             {item.upgraded.split(/(\[up\].*?\[\/up\])/).map((part, i) => {
                               if (part.startsWith('[up]')) {
                                 const content = part.replace('[up]', '').replace('[/up]', '');
                                 return <span key={i} className="bg-emerald-100 text-emerald-900 px-1.5 rounded-md font-black shadow-sm ring-1 ring-emerald-200">{content}</span>;
                               }
                               return part;
                             })}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'vocabulary' && (
                <div className="p-8 md:p-12 space-y-8">
                  <h3 className="text-2xl font-black text-rose-800">15 Từ vựng học thuật (Sắp xếp A-Z)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedVocabulary.map((vocab, idx) => (
                      <div key={idx} className="p-6 rounded-[2rem] bg-orange-50/30 border border-orange-100 flex flex-col group hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                        <span className="text-rose-700 font-black text-2xl mb-1 tracking-tight">{vocab.term}</span>
                        <span className="text-[10px] text-orange-500 font-black mb-4 bg-white px-2.5 py-1 rounded-full w-fit border border-orange-100 shadow-sm uppercase">{vocab.pronunciation}</span>
                        <div className="p-4 bg-white rounded-2xl border border-orange-100 mb-4 flex-grow shadow-inner">
                           <p className="text-slate-800 text-sm font-black leading-relaxed">{vocab.meaningVN}</p>
                        </div>
                        <p className="text-slate-500 text-xs italic mt-auto leading-relaxed border-t border-orange-50 pt-3">Ví dụ: "{vocab.example}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'structures' && (
                <div className="p-8 md:p-12 space-y-8">
                  <h3 className="text-2xl font-black text-rose-800">5 Cấu trúc ngữ pháp giúp tăng Band Score</h3>
                  <div className="grid grid-cols-1 gap-8">
                    {state.feedback?.scoringStructures.map((s, idx) => (
                      <div key={idx} className="p-8 md:p-10 bg-slate-50/80 rounded-[3rem] border border-slate-200 flex flex-col md:flex-row gap-10 items-start hover:shadow-xl transition-all hover:bg-white">
                         <div className="w-16 h-16 bg-rose-600 rounded-[1.75rem] flex-shrink-0 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-rose-200">
                           {idx + 1}
                         </div>
                         <div className="flex-1 space-y-4">
                            <h4 className="text-3xl font-black text-rose-700 tracking-tight">{s.title}</h4>
                            <p className="text-lg text-slate-600 leading-relaxed font-semibold">{s.description}</p>
                            <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 shadow-inner border-l-[10px] border-l-rose-600">
                               <code className="text-rose-700 text-xl font-black block leading-relaxed">{s.example}</code>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'model' && (
                <div className="p-8 md:p-12 space-y-10">
                  <h3 className="text-3xl font-black text-rose-800 border-b border-rose-100 pb-6">Bài mẫu Examiner (Band 9.0)</h3>
                  <div className="p-12 bg-emerald-50/20 rounded-[4rem] border border-emerald-100 relative shadow-inner">
                    <div className="text-slate-700 leading-[3.5rem] text-2xl whitespace-pre-wrap font-serif">
                      {state.feedback?.modelAnswer.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx} className="mb-10 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-rose-100 text-center relative z-[100]">
         <div className="text-slate-500 text-sm font-bold leading-relaxed">
            Tạo bởi <a href="https://vanthanhphancv.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline hover:text-rose-700 decoration-2 transition-colors inline-block relative z-[110] pointer-events-auto">Tiến sĩ Phan Thị Vân Thanh</a> - sáng lập <a href="https://www.facebook.com/skylanguagevn" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline hover:text-rose-700 decoration-2 transition-colors inline-block relative z-[110] pointer-events-auto">SKY IELTS</a>. <br/>
            Follow để cập nhật nhiều app hay.
         </div>
      </footer>
    </div>
  );
};

const CriteriaCard: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="p-8 bg-white rounded-[2rem] border border-rose-50 shadow-sm hover:shadow-xl transition-all duration-300">
    <h4 className="text-[12px] font-black text-rose-500 mb-4 uppercase tracking-[0.3em]">{title}</h4>
    <p className="text-slate-600 text-base leading-relaxed font-medium">{content}</p>
  </div>
);

const ScoreBadge: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="flex flex-col items-center justify-center p-5 bg-rose-50/50 rounded-3xl border border-rose-100 hover:bg-white transition-all shadow-sm hover:shadow-md">
    <span className="text-[11px] uppercase font-black text-rose-400 tracking-widest text-center leading-tight mb-2">{label}</span>
    <span className="text-4xl font-black text-rose-600 leading-none">{score}</span>
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-8 py-5 rounded-[1.5rem] font-black text-sm whitespace-nowrap transition-all flex-shrink-0 active:scale-95 ${
      active 
        ? 'bg-rose-600 text-white shadow-2xl shadow-rose-200 ring-4 ring-rose-200/40' 
        : 'bg-white text-slate-500 hover:bg-rose-50 border border-rose-100 shadow-sm'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ExamIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
);
const FeedbackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
);
const PencilIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
);
const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
);
const ZapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
);
const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
);

export default App;

