export interface AppState {
  question: string;
  writing: string;
  loading: boolean;
  error: string | null;
  feedback: IELTSFeedback | null;
}
export interface IELTSFeedback {
  estimatedScore: {
    total: number;
    taskResponse: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
    overallFeedback: string;
  };
  criteriaFeedback: any;
  grammarAndVocabIssues: any[];
  sentenceComparisons: any[];
  advancedVocabulary: any[];
  scoringStructures: any[];
  modelAnswer: string;
}
