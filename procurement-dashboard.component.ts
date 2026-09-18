import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx-js-style';
import {
  PROCUREMENT_CATEGORIES,
  PROCUREMENT_METHODS,
  PROCUREMENT_RATE_TYPES,
  ProcurementData,
} from '../../../models/procurement.model';
import { AuthService } from '../../../services/auth.service';
import { ProcurementService } from '../../../services/procurement.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { TicketsService } from '../../../services/tickets.service';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

@Component({
  selector: 'app-procurement-dashboard',
  templateUrl: './procurement-dashboard.component.html',
  styleUrls: ['./procurement-dashboard.component.scss'],
})
export class ProcurementDashboardComponent implements OnInit, OnDestroy {
  rows: ProcurementData[] = [];
  totalCount = 0;
  loading = false;
  summaryLoading = false;
  exporting = false;
  saving = false;
  showModal = false;
  editingId: number | null = null;
  showProjectDropdown = false;
  projectOptions: string[] = [];
  filteredProjectOptions: string[] = [];
  private masterProjectNames: string[] = [];
  showContractorDropdown = false;
  contractorOptions: string[] = [];
  filteredContractorOptions: string[] = [];

  searchControl = new FormControl('');
  form: FormGroup;
  readonly categories = PROCUREMENT_CATEGORIES;
  readonly methods = PROCUREMENT_METHODS;
  readonly rateTypes = PROCUREMENT_RATE_TYPES;

  summary = {
    totalCostInrCr: 0,
    totalValueUsdMn: 0,
    agreementsSigned: 0,
    agreementsTotal: 0,
    agreementsPct: 0,
    loaIssued: 0,
    loaPct: 0,
    avgCycleDays: 0,
    avgQuote: 0,
    avgBidders: 0,
    executingCount: 0,
    completedCount: 0,
    timeOverrun: 0,
    costOverrun: 0,
    billsOverrun: 0,
  };

  readonly summaryCards = [
    {
      key: 'totalCost',
      label: 'TOTAL COST IN CR',
      icon: 'bi-currency-rupee',
      tone: 'blue',
    },
    {
      key: 'agreements',
      label: 'AGREEMENTS SIGNED',
      icon: 'bi-check-circle',
      tone: 'green',
    },
    {
      key: 'totalUsd',
      label: 'TOTAL VALUE (USD)',
      icon: 'bi-globe2',
      tone: 'dark-teal',
    },
    {
      key: 'loaIssued',
      label: 'LOA ISSUED',
      icon: 'bi-file-earmark-check',
      tone: 'purple',
    },
  ] as const;

  readonly metricCards = [
    {
      key: 'avgCycle',
      label: 'AVG. CYCLE DAYS',
      icon: 'bi-clock',
      tone: 'teal',
      variant: 'simple',
    },
    {
      key: 'avgQuote',
      label: 'AVG. QUOTE',
      icon: 'bi-percent',
      tone: 'violet',
      variant: 'simple',
    },
    {
      key: 'avgBidders',
      label: 'AVG. BIDDERS',
      icon: 'bi-people',
      tone: 'orange',
      variant: 'simple',
    },
    {
      key: 'timeOverrun',
      label: 'TIME OVERRUN',
      icon: 'bi-hourglass-split',
      tone: 'amber',
      variant: 'overrun',
    },
    {
      key: 'costOverrun',
      label: 'COST OVERRUN',
      icon: 'bi-graph-up',
      tone: 'rose',
      variant: 'overrun',
    },
    {
      key: 'billsOverrun',
      label: 'BILLS OVERRUN',
      icon: 'bi-receipt',
      tone: 'slate',
      variant: 'simple',
    },
  ] as const;

  /** Matches Works dashboard chart palette (dashboard.component.ts). */
  private readonly worksChartColors = [
    '#4E79A7',
    '#F28E2B',
    '#59A14F',
    '#76B7B2',
    '#E15759',
    '#9C755F',
  ];

  readonly skeletonTableRows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  readonly skeletonTableCols = Array.from({ length: 23 }, (_, i) => i);

  agreementChartOption: EChartsOption = {};
  agreementQuarterChartOption: EChartsOption = {};
  contractorPackagesChartOption: EChartsOption = {};
  contractorCostChartOption: EChartsOption = {};
  hasChartData = false;

  private destroy$ = new Subject<void>();

  constructor(
    private procurementService: ProcurementService,
    private snackbar: SnackbarService,
    private fb: FormBuilder,
    private authService: AuthService,
    private ticketsService: TicketsService,
  ) {
    this.form = this.fb.group({
      workNumber: [''],
      projectName: [''],
      projectDescription: [''],
      adminSanctionDate: [''],
      technicalSanctionDate: [''],
      estimatedCostInrCr: [null],
      estimatedCostUsdMn: [null],
      procurementCategory: [''],
      procurementMethod: [''],
      rateType: [''],
      nitPlannedMonth: [''],
      techEnvelopeOpeningMonth: [''],
      expectedAwardMonth: [''],
      tenderPublishDate: [''],
      loaIssueDate: [''],
      agreementDate: [''],
      contractorName: [''],
      procurementCycleDays: [null],
      financialQuoteVariancePct: [null],
      avgBidderCount: [null],
    });
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadRows();
        this.loadSummary();
      });
    this.loadRows();
    this.loadSummary();
    this.loadProjectOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get projectNameQuery(): string {
    return (this.form?.get('projectName')?.value || '').toString().trim();
  }

  get maxDate(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  get canUseNewProject(): boolean {
    const query = this.projectNameQuery;
    if (!query) {
      return false;
    }
    return !this.projectOptions.some(
      (name) => name.toLowerCase() === query.toLowerCase(),
    );
  }

  get contractorNameQuery(): string {
    return (this.form?.get('contractorName')?.value || '').toString().trim();
  }

  get canUseNewContractor(): boolean {
    const query = this.contractorNameQuery;
    if (!query) {
      return false;
    }
    return !this.contractorOptions.some(
      (name) => name.toLowerCase() === query.toLowerCase(),
    );
  }

  loadRows(): void {
    this.loading = true;
    this.procurementService
      .getProcurementData({
        search: this.searchControl.value || '',
        page: 1,
        pageSize: 5000,
      })
      .subscribe({
        next: (result) => {
          this.rows = result.data || [];
          this.totalCount = result.total || 0;
          this.loading = false;
          this.refreshProjectOptions();
          this.refreshContractorOptions();
        },
        error: () => {
          this.loading = false;
          this.snackbar.show('Failed to load procurement data', 'error');
        },
      });
  }

  private loadProjectOptions(): void {
    this.ticketsService.getProjectsOptions().subscribe({
      next: (options) => {
        this.masterProjectNames = (options || [])
          .map((item) => (item.label || '').trim())
          .filter(Boolean);
        this.refreshProjectOptions();
      },
      error: () => {
        this.masterProjectNames = [];
        this.refreshProjectOptions();
      },
    });
  }

  private refreshProjectOptions(): void {
    const fromRows = (this.rows || [])
      .map((row) => (row.projectName || '').trim())
      .filter(Boolean);
    const merged = new Map<string, string>();
    [...this.masterProjectNames, ...fromRows].forEach((name) => {
      const key = name.toLowerCase();
      if (!merged.has(key)) {
        merged.set(key, name);
      }
    });
    this.projectOptions = [...merged.values()].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
    this.filterProjectOptions();
  }

  onProjectFocus(): void {
    this.filterProjectOptions();
    this.showProjectDropdown = true;
  }

  onProjectInput(): void {
    this.filterProjectOptions();
    this.showProjectDropdown = true;
  }

  onProjectBlur(): void {
    setTimeout(() => {
      this.showProjectDropdown = false;
    }, 150);
  }

  selectProject(event: Event, name: string): void {
    event.preventDefault();
    this.form.patchValue({ projectName: name });
    this.showProjectDropdown = false;
    this.filterProjectOptions();
  }

  private filterProjectOptions(): void {
    const query = this.projectNameQuery.toLowerCase();
    if (!query) {
      this.filteredProjectOptions = this.projectOptions.slice(0, 80);
      return;
    }
    this.filteredProjectOptions = this.projectOptions
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 80);
  }

  private refreshContractorOptions(): void {
    const merged = new Map<string, string>();
    (this.rows || []).forEach((row) => {
      const name = (row.contractorName || '').trim();
      if (!name) {
        return;
      }
      const key = name.toLowerCase();
      if (!merged.has(key)) {
        merged.set(key, name);
      }
    });
    this.contractorOptions = [...merged.values()].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
    this.filterContractorOptions();
  }

  onContractorFocus(): void {
    this.filterContractorOptions();
    this.showContractorDropdown = true;
  }

  onContractorInput(): void {
    this.filterContractorOptions();
    this.showContractorDropdown = true;
  }

  onContractorBlur(): void {
    setTimeout(() => {
      this.showContractorDropdown = false;
    }, 150);
  }

  selectContractor(event: Event, name: string): void {
    event.preventDefault();
    this.form.patchValue({ contractorName: name });
    this.showContractorDropdown = false;
    this.filterContractorOptions();
  }

  private filterContractorOptions(): void {
    const query = this.contractorNameQuery.toLowerCase();
    if (!query) {
      this.filteredContractorOptions = this.contractorOptions.slice(0, 80);
      return;
    }
    this.filteredContractorOptions = this.contractorOptions
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 80);
  }

  loadSummary(): void {
    this.summaryLoading = true;
    this.procurementService
      .getProcurementData({
        search: this.searchControl.value || '',
        page: 1,
        pageSize: 5000,
      })
      .subscribe({
        next: (result) => {
          this.computeSummary(result.data || []);
          this.summaryLoading = false;
        },
        error: () => {
          this.summaryLoading = false;
        },
      });
  }

  summaryValue(key: string): string {
    const s = this.summary;
    switch (key) {
      case 'totalCost':
        return `₹ ${this.formatNumber(s.totalCostInrCr, 2)}`;
      case 'agreements':
        return `${s.agreementsSigned} / ${s.agreementsTotal} (${s.agreementsPct}%)`;
      case 'totalUsd':
        return `$ ${this.formatNumber(s.totalValueUsdMn, 1)} M`;
      case 'loaIssued':
        return `${s.loaIssued} / ${s.agreementsTotal} (${s.loaPct}%)`;
      case 'avgCycle':
        return `${Math.round(s.avgCycleDays)} days`;
      case 'avgQuote':
        return this.formatNumber(s.avgQuote, 2);
      case 'avgBidders':
        return this.formatNumber(s.avgBidders, 1);
      case 'timeOverrun':
        return `${s.timeOverrun}`;
      case 'costOverrun':
        return `${s.costOverrun}`;
      case 'billsOverrun':
        return `${s.billsOverrun}`;
      default:
        return '-';
    }
  }

  private computeSummary(rows: ProcurementData[]): void {
    const total = rows.length;
    let costInr = 0;
    let costUsd = 0;
    let signed = 0;
    let loaIssued = 0;
    let cycleSum = 0;
    let cycleCount = 0;
    let quoteSum = 0;
    let quoteCount = 0;
    let bidderSum = 0;
    let bidderCount = 0;

    for (const row of rows) {
      if (row.estimatedCostInrCr != null) {
        costInr += Number(row.estimatedCostInrCr) || 0;
      }
      if (row.estimatedCostUsdMn != null) {
        costUsd += Number(row.estimatedCostUsdMn) || 0;
      }
      if (row.agreementDate) {
        signed += 1;
      }
      if (row.loaIssueDate) {
        loaIssued += 1;
      }
      if (row.procurementCycleDays != null) {
        cycleSum += Number(row.procurementCycleDays) || 0;
        cycleCount += 1;
      }
      if (row.financialQuoteVariancePct != null) {
        quoteSum += Number(row.financialQuoteVariancePct) || 0;
        quoteCount += 1;
      }
      if (row.avgBidderCount != null) {
        bidderSum += Number(row.avgBidderCount) || 0;
        bidderCount += 1;
      }
    }

    const pct = (count: number) =>
      total > 0 ? Math.round((count / total) * 100) : 0;

    this.summary = {
      totalCostInrCr: costInr,
      totalValueUsdMn: costUsd,
      agreementsSigned: signed,
      agreementsTotal: total,
      agreementsPct: pct(signed),
      loaIssued,
      loaPct: pct(loaIssued),
      avgCycleDays: cycleCount > 0 ? cycleSum / cycleCount : 0,
      avgQuote: quoteCount > 0 ? quoteSum / quoteCount : 0,
      avgBidders: bidderCount > 0 ? bidderSum / bidderCount : 0,
      executingCount: total,
      completedCount: 0,
      timeOverrun: 0,
      costOverrun: 0,
      billsOverrun: 0,
    };

    this.buildCharts(rows);
  }

  private buildCharts(rows: ProcurementData[]): void {
    this.hasChartData = rows.length > 0;
    if (!this.hasChartData) {
      this.agreementChartOption = {};
      this.agreementQuarterChartOption = {};
      this.contractorPackagesChartOption = {};
      this.contractorCostChartOption = {};
      return;
    }

    let agreement = 0;
    const packageMap = new Map<string, number>();
    const costMap = new Map<string, number>();
    const quarterMap = new Map<string, number>();

    for (const row of rows) {
      if (row.agreementDate) {
        agreement += 1;
        const quarterKey = this.toQuarterLabel(row.agreementDate);
        if (quarterKey) {
          quarterMap.set(quarterKey, (quarterMap.get(quarterKey) || 0) + 1);
        }
      }

      const contractor = (row.contractorName || '').trim() || 'Unassigned';
      packageMap.set(contractor, (packageMap.get(contractor) || 0) + 1);
      costMap.set(
        contractor,
        (costMap.get(contractor) || 0) + (Number(row.estimatedCostInrCr) || 0),
      );
    }

    const pending = Math.max(0, rows.length - agreement);
    const quarterEntries = [...quarterMap.entries()].sort((a, b) => {
      const [aq, ay] = a[0].replace('Q', '').split('-').map(Number);
      const [bq, by] = b[0].replace('Q', '').split('-').map(Number);
      return ay !== by ? ay - by : aq - bq;
    });
    const topPackages = [...packageMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .reverse();
    const topCosts = [...costMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .reverse();

    this.agreementChartOption = {
      color: [this.worksChartColors[2], this.worksChartColors[1]],
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { fontSize: 10, color: '#64748b' },
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '44%'],
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          data: [
            { name: 'Signed', value: agreement },
            { name: 'To be signed', value: pending },
          ],
        },
      ],
    };

    this.agreementQuarterChartOption = {
      color: this.worksChartColors,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: { left: 8, right: 12, top: 24, bottom: 2, containLabel: true },
      xAxis: {
        type: 'category',
        data: quarterEntries.map(([label]) => label),
        axisLabel: { fontSize: 10, color: '#64748b', margin: 6 },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series: [
        {
          name: 'Agreements Signed',
          type: 'bar',
          data: quarterEntries.map(([, value], index) => ({
            value,
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color:
                this.worksChartColors[index % this.worksChartColors.length],
            },
          })),
          barWidth: 26,
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            color: '#334155',
            fontWeight: 600,
          },
        },
      ],
    };

    this.contractorPackagesChartOption = {
      color: this.worksChartColors,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: { left: 8, right: 36, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      yAxis: {
        type: 'category',
        data: topPackages.map(([name]) => this.shortContractorName(name)),
        axisLabel: { fontSize: 10, color: '#64748b' },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          name: 'Packages',
          type: 'bar',
          data: topPackages.map(([name, value], index) => ({
            value,
            name: this.shortContractorName(name),
            itemStyle: {
              borderRadius: [0, 6, 6, 0],
              color:
                this.worksChartColors[index % this.worksChartColors.length],
            },
          })),
          barWidth: 12,
          label: {
            show: true,
            position: 'right',
            fontSize: 10,
            color: '#334155',
            fontWeight: 600,
          },
        },
      ],
    };

    this.contractorCostChartOption = {
      color: this.worksChartColors,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value) => `₹ ${Number(value).toFixed(2)} Cr`,
      },
      grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      yAxis: {
        type: 'category',
        data: topCosts.map(([name]) => this.shortContractorName(name)),
        axisLabel: { fontSize: 10, color: '#64748b' },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          name: 'Cost (₹ Cr)',
          type: 'bar',
          data: topCosts.map(([name, value], index) => ({
            value: Number((Number(value) || 0).toFixed(2)),
            name: this.shortContractorName(name),
            itemStyle: {
              borderRadius: [0, 6, 6, 0],
              color:
                this.worksChartColors[
                  (index + 2) % this.worksChartColors.length
                ],
            },
          })),
          barWidth: 12,
          label: {
            show: true,
            position: 'right',
            fontSize: 10,
            color: '#334155',
            fontWeight: 600,
          },
        },
      ],
    };
  }

  private shortContractorName(value: string): string {
    const raw = (value || '').trim();
    if (!raw || raw.toLowerCase() === 'unassigned') {
      return 'Unassigned';
    }

    const known: Array<[RegExp, string]> = [
      [/larsen|l\s*&\s*t|l&t/i, 'L&T'],
      [/shapoorji|pallonji|spcl/i, 'SPCL'],
      [/megha|meil/i, 'MEIL'],
      [/\bncc\b/i, 'NCC'],
      [/\bbsr\b/i, 'BSR'],
      [/\bkmv\b/i, 'KMV'],
      [/\bkpc\b/i, 'KPC'],
      [/r\s*v\s*r|\brvr\b/i, 'RVR'],
      [/afcons/i, 'Afcons'],
      [/hindustan\s*construction|\bhcc\b/i, 'HCC'],
      [/simplex/i, 'Simplex'],
      [/dilip\s*buildcon|\bdbl\b/i, 'DBL'],
      [/ircon/i, 'IRCON'],
      [/nbcc/i, 'NBCC'],
    ];

    for (const [pattern, short] of known) {
      if (pattern.test(raw)) {
        return short;
      }
    }

    let text = raw
      .replace(/^(m\/s\.?|messrs\.?|ms\.?)\s*/i, '')
      .replace(/[()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const stop = new Set([
      'limited',
      'ltd',
      'private',
      'pvt',
      'india',
      'co',
      'company',
      'and',
      'the',
      'of',
      'engineering',
      'engineers',
      'infrastructures',
      'infrastructure',
      'infratech',
      'projects',
      'project',
      'construction',
      'constructions',
      'builders',
      'buildcon',
      'tech',
      'llp',
      'inc',
    ]);

    const words = text
      .split(/[\s./,&-]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0 && !stop.has(w.toLowerCase()));

    if (words.length === 0) {
      return raw.slice(0, 10);
    }

    if (words.length === 1) {
      return words[0].length <= 10
        ? words[0]
        : words[0].slice(0, 9).toUpperCase();
    }

    if (words.length >= 3 || words.every((w) => w.length <= 4)) {
      return words
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 6);
    }

    return words.slice(0, 2).join(' ').slice(0, 12);
  }

  private toQuarterLabel(value?: string | null): string | null {
    if (!value) {
      return null;
    }
    const date = this.parseToDate(value);
    if (!date) {
      return null;
    }
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const year = String(date.getFullYear()).slice(-2);
    return `Q${quarter}-${year}`;
  }

  private formatNumber(value: number, digits: number): string {
    return (Number(value) || 0).toLocaleString('en-IN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  openAddModal(): void {
    this.editingId = null;
    this.form.reset({
      workNumber: '',
      projectName: '',
      projectDescription: '',
      adminSanctionDate: '',
      technicalSanctionDate: '',
      estimatedCostInrCr: null,
      estimatedCostUsdMn: null,
      procurementCategory: '',
      procurementMethod: '',
      rateType: '',
      nitPlannedMonth: '',
      techEnvelopeOpeningMonth: '',
      expectedAwardMonth: '',
      tenderPublishDate: '',
      loaIssueDate: '',
      agreementDate: '',
      contractorName: '',
      procurementCycleDays: null,
      financialQuoteVariancePct: null,
      avgBidderCount: null,
    });
    this.showProjectDropdown = false;
    this.showContractorDropdown = false;
    this.filterProjectOptions();
    this.filterContractorOptions();
    this.showModal = true;
  }

  openEditModal(row: ProcurementData): void {
    this.editingId = row.id;
    this.form.patchValue({
      workNumber: row.workNumber || '',
      projectName: row.projectName || '',
      projectDescription: row.projectDescription || '',
      adminSanctionDate: this.toInputDate(row.adminSanctionDate),
      technicalSanctionDate: this.toInputDate(row.technicalSanctionDate),
      estimatedCostInrCr: row.estimatedCostInrCr ?? null,
      estimatedCostUsdMn: row.estimatedCostUsdMn ?? null,
      procurementCategory: row.procurementCategory || '',
      procurementMethod: row.procurementMethod || '',
      rateType: row.rateType || '',
      nitPlannedMonth: this.toMonthInput(row.nitPlannedMonth),
      techEnvelopeOpeningMonth: this.toMonthInput(row.techEnvelopeOpeningMonth),
      expectedAwardMonth: this.toMonthInput(row.expectedAwardMonth),
      tenderPublishDate: this.toInputDate(row.tenderPublishDate),
      loaIssueDate: this.toInputDate(row.loaIssueDate),
      agreementDate: this.toInputDate(row.agreementDate),
      contractorName: row.contractorName || '',
      procurementCycleDays: row.procurementCycleDays ?? null,
      financialQuoteVariancePct: row.financialQuoteVariancePct ?? null,
      avgBidderCount: row.avgBidderCount ?? null,
    });
    this.showProjectDropdown = false;
    this.showContractorDropdown = false;
    this.filterProjectOptions();
    this.filterContractorOptions();
    this.showModal = true;
  }

  closeModal(): void {
    if (this.saving) {
      return;
    }
    this.showModal = false;
    this.showProjectDropdown = false;
    this.showContractorDropdown = false;
    this.editingId = null;
  }

  saveRecord(): void {
    if (this.saving) {
      return;
    }
    const value = this.form.getRawValue();
    if (this.hasFutureDate(value)) {
      this.snackbar.show('Future dates are not allowed', 'error');
      return;
    }
    const userId = this.currentUserId();
    const payload: ProcurementData = {
      id: this.editingId || 0,
      workNumber: value.workNumber?.trim() || null,
      projectName: value.projectName?.trim() || null,
      projectDescription: value.projectDescription?.trim() || null,
      adminSanctionDate: value.adminSanctionDate || null,
      technicalSanctionDate: value.technicalSanctionDate || null,
      estimatedCostInrCr: this.toNumberOrNull(value.estimatedCostInrCr),
      estimatedCostUsdMn: this.toNumberOrNull(value.estimatedCostUsdMn),
      procurementCategory: value.procurementCategory || null,
      procurementMethod: value.procurementMethod || null,
      rateType: value.rateType || null,
      nitPlannedMonth: this.fromMonthInput(value.nitPlannedMonth),
      techEnvelopeOpeningMonth: this.fromMonthInput(
        value.techEnvelopeOpeningMonth,
      ),
      expectedAwardMonth: this.fromMonthInput(value.expectedAwardMonth),
      tenderPublishDate: value.tenderPublishDate || null,
      loaIssueDate: value.loaIssueDate || null,
      agreementDate: value.agreementDate || null,
      contractorName: value.contractorName?.trim() || null,
      procurementCycleDays: this.toNumberOrNull(value.procurementCycleDays),
      financialQuoteVariancePct: this.toNumberOrNull(
        value.financialQuoteVariancePct,
      ),
      avgBidderCount: this.toNumberOrNull(value.avgBidderCount),
      status: 1,
      createdBy: this.editingId ? undefined : userId,
      updatedBy: userId,
    };

    this.saving = true;
    this.procurementService.saveProcurementData(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.showModal = false;
        this.editingId = null;
        this.snackbar.show(res.message || 'Saved successfully', 'success');
        this.loadRows();
        this.loadSummary();
      },
      error: (err) => {
        this.saving = false;
        this.snackbar.show(
          err?.error?.message || 'Failed to save record',
          'error',
        );
      },
    });
  }

  deleteRecord(row: ProcurementData): void {
    if (!row?.id) {
      return;
    }
    const label = row.workNumber || row.projectName || `#${row.id}`;
    if (!confirm(`Soft delete this record?\n${label}`)) {
      return;
    }
    this.procurementService
      .deleteProcurementData(row.id, this.currentUserId())
      .subscribe({
        next: (res) => {
          this.snackbar.show(res.message || 'Deleted successfully', 'success');
          this.loadRows();
          this.loadSummary();
        },
        error: (err) => {
          this.snackbar.show(
            err?.error?.message || 'Failed to delete record',
            'error',
          );
        },
      });
  }

  private hasFutureDate(value: {
    adminSanctionDate?: string | null;
    technicalSanctionDate?: string | null;
    tenderPublishDate?: string | null;
    loaIssueDate?: string | null;
    agreementDate?: string | null;
  }): boolean {
    const today = this.maxDate;
    const fields = [
      value.adminSanctionDate,
      value.technicalSanctionDate,
      value.tenderPublishDate,
      value.loaIssueDate,
      value.agreementDate,
    ];
    return fields.some((date) => !!date && date > today);
  }

  private toMonthInput(value?: string | null): string {
    if (!value) {
      return '';
    }
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const date = this.parseToDate(trimmed);
    if (!date) {
      return '';
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  }

  private fromMonthInput(value?: string | null): string | null {
    if (!value?.trim()) {
      return null;
    }
    return this.formatMonthYear(value.trim()) || value.trim();
  }

  private currentUserId(): number | null {
    const user = this.authService.getUserData();
    const id = user?.id ?? user?.userId ?? user?.UserId;
    return id != null && id !== '' ? Number(id) : null;
  }

  private toInputDate(value?: string | null): string {
    if (!value) {
      return '';
    }
    const date = this.parseToDate(value);
    if (!date) {
      return '';
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  exportToExcel(): void {
    this.exporting = true;
    this.procurementService
      .getProcurementData({
        search: this.searchControl.value || '',
        page: 1,
        pageSize: 500,
      })
      .subscribe({
        next: (result) => {
          const rows = (result.data || []).map((row, index) => ({
            'S.No': index + 1,
            'Work Number': row.workNumber || '',
            'Project Name': row.projectName || '',
            'Project Description': row.projectDescription || '',
            'Administrative Sanction Date': this.formatDate(
              row.adminSanctionDate,
            ),
            'Technical Year Sanction Date': this.formatDate(
              row.technicalSanctionDate,
            ),
            'Estimated Cost INR (Crores)': row.estimatedCostInrCr ?? '',
            'Estimated Cost USD (Millions)': row.estimatedCostUsdMn ?? '',
            'Estimated Cost ₹ (Crores)': row.estimatedCostInrCr ?? '',
            'Procurement Category (Goods/Works/NCS/CS)':
              row.procurementCategory || '',
            'Procurement Method (Open/Limited/Direct)':
              row.procurementMethod || '',
            'Item Rate/Lumpsum (EPC/DBO)': row.rateType || '',
            'Planned Issuance of NIT (month/year)': this.formatMonthYear(
              row.nitPlannedMonth,
            ),
            'Technical Envelope Opening (Tender/RFP)': this.formatMonthYear(
              row.techEnvelopeOpeningMonth,
            ),
            'Expected Date of Contract Award [APP]': this.formatMonthYear(
              row.expectedAwardMonth,
            ),
            'Tender Publish Date': this.formatDate(row.tenderPublishDate),
            'LOA Issue': this.formatDate(row.loaIssueDate),
            'Agreement Date': this.formatDate(row.agreementDate),
            Contractor: row.contractorName || '',
            'Procurement Cycle Time (NIT to Agreement) (Days)':
              row.procurementCycleDays ?? '',
            'Financial Quote (+/-)': row.financialQuoteVariancePct ?? '',
            'Avg. No. of Bidders': row.avgBidderCount ?? '',
          }));
          const worksheet = XLSX.utils.json_to_sheet(rows);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Procurement Data');
          XLSX.writeFile(
            workbook,
            `Procurement_Dashboard_${this.todayStamp()}.xlsx`,
          );
          this.exporting = false;
        },
        error: () => {
          this.exporting = false;
          this.snackbar.show('Failed to export procurement data', 'error');
        },
      });
  }

  formatDate(value?: string | null): string {
    if (!value) {
      return '';
    }
    const date = this.parseToDate(value);
    if (!date) {
      return value;
    }
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }

  formatMonthYear(value?: string | null): string {
    if (!value) {
      return '';
    }
    const date = this.parseToDate(value);
    if (!date) {
      return value;
    }
    return `${MONTH_LABELS[date.getMonth()]}-${String(date.getFullYear()).slice(-2)}`;
  }

  private parseToDate(value: string): Date | null {
    const trimmed = value.trim();
    const yyyyMmMatch = /^(\d{4})-(\d{2})$/.exec(trimmed);
    if (yyyyMmMatch) {
      const year = Number(yyyyMmMatch[1]);
      const month = Number(yyyyMmMatch[2]);
      if (month < 1 || month > 12) {
        return null;
      }
      return new Date(year, month - 1, 1);
    }
    const mmmYyMatch = /^([A-Za-z]{3})-(\d{2})$/.exec(trimmed);
    if (mmmYyMatch) {
      const monthIndex = MONTH_LABELS.findIndex(
        (label) => label.toLowerCase() === mmmYyMatch[1].toLowerCase(),
      );
      if (monthIndex < 0) {
        return null;
      }
      return new Date(2000 + Number(mmmYyMatch[2]), monthIndex, 1);
    }
    const iso = Date.parse(trimmed);
    if (!Number.isNaN(iso)) {
      return new Date(iso);
    }
    return null;
  }

  private todayStamp(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${yyyy}${mm}${dd}`;
  }
}
