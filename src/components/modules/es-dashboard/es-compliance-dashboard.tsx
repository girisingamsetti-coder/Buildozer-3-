'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  BaseRecord,
  ComplianceCategory,
  DashboardFilterState,
  RAGStatus,
  OverdueItem,
  DataQualityIssue
} from './types';
import {
  fetchAllDatasets,
  extractAllRecords,
  extractOverdueItems,
  extractDataQualityIssues,
  calculateProjectRAG
} from './data-loader';
import { OverviewView } from './overview-view';
import { EnvironmentView } from './environment-view';
import { OHSView } from './ohs-view';
import { RoadSafetyView } from './road-safety-view';
import { SocialView } from './social-view';
import { CrossCuttingView } from './cross-cutting-view';
import { RecordDetailModal } from './record-detail-modal';
import {
  Filter,
  Search,
  RotateCcw,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  FileText,
  TreePine,
  HardHat,
  Car,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers
} from 'lucide-react';

interface EsComplianceDashboardProps {
  addNewButton?: React.ReactNode;
}

export default function EsComplianceDashboard({ addNewButton }: EsComplianceDashboardProps = {}) {
  const [loading, setLoading] = useState(true);
  const [allRecords, setAllRecords] = useState<BaseRecord[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Filter state
  const [filters, setFilters] = useState<DashboardFilterState>({
    month: 'All',
    category: 'All',
    formType: 'All',
    ragStatus: 'All',
    searchQuery: ''
  });

  // Overdue feed drawer expanded state
  const [isOverdueOpen, setIsOverdueOpen] = useState(false);

  // Selected record for modal drilldown
  const [selectedRecord, setSelectedRecord] = useState<BaseRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    let isMounted = true;
    fetchAllDatasets().then(datasets => {
      if (isMounted) {
        const records = extractAllRecords(datasets);
        setAllRecords(records);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Failed to load datasets:', err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      if (filters.month !== 'All' && r.reporting_month !== filters.month) return false;
      if (filters.category !== 'All' && r.category !== filters.category) return false;
      if (filters.formType !== 'All' && r.form_type !== filters.formType) return false;
      if (filters.ragStatus !== 'All' && r.rag_status !== filters.ragStatus) return false;
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(query);
        const matchesType = r.form_type.toLowerCase().includes(query);
        const matchesLocation = (r.project_location || '').toLowerCase().includes(query);
        if (!matchesId && !matchesType && !matchesLocation) return false;
      }
      return true;
    });
  }, [allRecords, filters]);

  // Project KPIs & RAG
  const projectMetrics = useMemo(() => {
    return calculateProjectRAG(filteredRecords);
  }, [filteredRecords]);

  // Overdue & Expiry items feed
  const overdueFeed = useMemo(() => {
    return extractOverdueItems(filteredRecords);
  }, [filteredRecords]);

  // Data Quality exceptions
  const dataQualityFeed = useMemo(() => {
    return extractDataQualityIssues(filteredRecords);
  }, [filteredRecords]);

  // Months available
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach(r => {
      if (r.reporting_month) set.add(r.reporting_month);
    });
    return Array.from(set).sort();
  }, [allRecords]);

  // Form types available
  const availableFormTypes = useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach(r => {
      if (r.form_type) set.add(r.form_type);
    });
    return Array.from(set).sort();
  }, [allRecords]);

  const handleRecordClick = (record: BaseRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      month: 'All',
      category: 'All',
      formType: 'All',
      ragStatus: 'All',
      searchQuery: ''
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-muted-foreground">
        <Clock className="w-8 h-8 animate-spin text-teal-600" />
        <div className="text-sm font-medium">Ingesting 280 E&S compliance submissions...</div>
      </div>
    );
  }

  const ragColorBadge: Record<RAGStatus, string> = {
    Green: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    Amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    Red: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
  };

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Global Filter Bar */}
      <Card className="shadow-sm border-teal-500/15">
        <CardContent className="p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Interactive Filter Engine
              </span>
              <Badge variant="secondary" className="text-[11px] font-mono">
                {filteredRecords.length} / {allRecords.length} Records
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 text-xs text-muted-foreground hover:text-teal-600 gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </Button>
              {addNewButton}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Month Filter */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                Reporting Month
              </label>
              <Select
                value={filters.month}
                onValueChange={v => setFilters(prev => ({ ...prev, month: v }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Months (12+ Window)</SelectItem>
                  {availableMonths.map(m => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(v: ComplianceCategory) => setFilters(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="OHS">OHS</SelectItem>
                  <SelectItem value="Road Safety">Road Safety</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Form Type Filter */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                Form Type
              </label>
              <Select
                value={filters.formType}
                onValueChange={v => setFilters(prev => ({ ...prev, formType: v }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All 7 Form Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All 7 Form Types</SelectItem>
                  {availableFormTypes.map(f => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RAG Status Filter */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                RAG Performance
              </label>
              <Select
                value={filters.ragStatus}
                onValueChange={(v: any) => setFilters(prev => ({ ...prev, ragStatus: v }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All RAG" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All (Green/Amber/Red)</SelectItem>
                  <SelectItem value="Green">Green (≥90% Compliant)</SelectItem>
                  <SelectItem value="Amber">Amber (70-89% At-Risk)</SelectItem>
                  <SelectItem value="Red">Red (&lt;70% or Overdue)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Free Search */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                Search Submissions
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="ENV-001, OHS-002..."
                  value={filters.searchQuery}
                  onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Top-Level KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Blended Compliance */}
        <Card className="shadow-sm">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Overall Compliance %</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {projectMetrics.overallScore}%
              </span>
              <Badge variant="outline" className={`font-semibold text-[10px] ${ragColorBadge[projectMetrics.overallRAG]}`}>
                Project {projectMetrics.overallRAG}
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground">Blended Across 7 Forms</div>
          </CardContent>
        </Card>

        {/* Open NCs */}
        <Card className="shadow-sm">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Open Non-Conformities</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {projectMetrics.openNCs}
              </span>
              <Badge variant="outline" className="text-[10px]">
                PMC / PgMC
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground">Requires Immediate Closure</div>
          </CardContent>
        </Card>

        {/* Overdue Items Tracker Trigger */}
        <Card
          className="shadow-sm cursor-pointer hover:border-amber-500/50 transition-colors"
          onClick={() => setIsOverdueOpen(!isOverdueOpen)}
        >
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center justify-between">
              <span>Overdue Action Items</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOverdueOpen ? 'rotate-180' : ''}`} />
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-600">
                {projectMetrics.overdueCount}
              </span>
              <Badge variant="destructive" className="text-[10px]">
                Feed Active
              </Badge>
            </div>
            <div className="text-[10px] text-teal-600 font-medium hover:underline">
              {isOverdueOpen ? 'Hide Tracker Feed' : 'Click to Expand Feed'}
            </div>
          </CardContent>
        </Card>

        {/* License & Statutory Alerts */}
        <Card className="shadow-sm">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Statutory Expiries</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-600">
                {projectMetrics.expiredLicenses}
              </span>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700">
                7 Labour Acts
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground">Renewal Deadlines &lt;30d</div>
          </CardContent>
        </Card>

        {/* Data Completeness */}
        <Card className="shadow-sm">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Data Completeness %</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {projectMetrics.dataCompleteness}%
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600">
                Passed QA
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {allRecords.length - Math.round((projectMetrics.dataCompleteness / 100) * allRecords.length)} Flagged Incomplete
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Collapsible Overdue & Statutory Expiry Tracker Widget */}
      {isOverdueOpen && (
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-md">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Consolidated Overdue & Statutory Expiry Feed (All 7 Forms)
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOverdueOpen(false)}
                className="h-6 px-2 text-xs"
              >
                Close Feed
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {overdueFeed.map((item, idx) => {
                const rec = allRecords.find(r => r.id === item.record_id);
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors flex items-center justify-between text-xs cursor-pointer"
                    onClick={() => rec && handleRecordClick(rec)}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-600">{item.record_id}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {item.category}
                        </Badge>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.details} • Target: <strong>{item.target_date}</strong>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant={item.status === 'Overdue' ? 'destructive' : 'outline'}
                        className={`text-[10px] ${item.status === 'Due Soon' ? 'bg-amber-500/15 text-amber-700' : ''}`}
                      >
                        {item.status} ({Math.abs(item.days_remaining)}d)
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl border">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
          className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeTab === 'overview' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
        >
          <Layers className="w-3.5 h-3.5" /> Executive Overview
        </Button>
        <Button
          variant={activeTab === 'environment' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('environment')}
          className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeTab === 'environment' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
        >
          <TreePine className="w-3.5 h-3.5" /> Environment
        </Button>
        <Button
          variant={activeTab === 'ohs' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('ohs')}
          className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeTab === 'ohs' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
        >
          <HardHat className="w-3.5 h-3.5" /> OHS
        </Button>
        <Button
          variant={activeTab === 'road-safety' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('road-safety')}
          className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeTab === 'road-safety' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
        >
          <Car className="w-3.5 h-3.5" /> Road Safety
        </Button>
        <Button
          variant={activeTab === 'social' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('social')}
          className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeTab === 'social' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
        >
          <Users className="w-3.5 h-3.5" /> Social (4 Sub-Modules)
        </Button>
        <Button
          variant={activeTab === 'cross-cutting' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('cross-cutting')}
          className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeTab === 'cross-cutting' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Cross-Cutting & QA
        </Button>
      </div>

      {/* 5. Render Selected Module View */}
      {activeTab === 'overview' && (
        <OverviewView
          records={filteredRecords}
          onSelectRecord={handleRecordClick}
          onSelectCategoryTab={tabKey => setActiveTab(tabKey)}
        />
      )}

      {activeTab === 'environment' && (
        <EnvironmentView
          records={filteredRecords}
          onSelectRecord={handleRecordClick}
        />
      )}

      {activeTab === 'ohs' && (
        <OHSView
          records={filteredRecords}
          onSelectRecord={handleRecordClick}
        />
      )}

      {activeTab === 'road-safety' && (
        <RoadSafetyView
          records={filteredRecords}
          onSelectRecord={handleRecordClick}
        />
      )}

      {activeTab === 'social' && (
        <SocialView
          records={filteredRecords}
          onSelectRecord={handleRecordClick}
        />
      )}

      {activeTab === 'cross-cutting' && (
        <CrossCuttingView
          records={filteredRecords}
          dataQualityIssues={dataQualityFeed}
          onSelectRecord={handleRecordClick}
        />
      )}

      {/* 6. Drilldown Record Inspector Modal */}
      <RecordDetailModal
        record={selectedRecord}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
