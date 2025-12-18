import type { AnalyzeResult } from '../types';
import { AnalysisReport } from './report/report';
import { AnalyzerEmptyState, AnalyzerErrorState, AnalyzerLoadingState } from './analyzer-states';

type AnalyzerProps = {
    isAnalyzing: boolean;
    data: AnalyzeResult | null;
};

export function Analyzer({ data, isAnalyzing }: AnalyzerProps) {
    if (isAnalyzing && !data) {
        return <AnalyzerLoadingState />;
    }

    if (!data) {
        return <AnalyzerEmptyState />;
    }

    if (!data.ok) {
        return <AnalyzerErrorState error={data.error} />;
    }

    return <AnalysisReport data={data.data} />;
}
