'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './page.module.scss';
import {
  ProcurementData,
  PROCUREMENT_CATEGORIES,
  PROCUREMENT_METHODS,
  PROCUREMENT_RATE_TYPES,
} from './types';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const worksChartColors = [
  '#4E79A7', '#F28E2B', '#59A14F', '#76B7B2', '#E15759', '#9C755F',
];

export default function ProcurementDashboard() {
  const [rows, setRows] = useState<ProcurementData[]>([]);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<ProcurementData>>({});
  
  // Mock data loading
  useEffect(() => {
    setLoading(true);
    setSummaryLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRows([]); // Mock empty rows
      setLoading(false);
      setSummaryLoading(false);
    }, 1000);
  }, []);

  const summary = useMemo(() => {
    return {
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
  }, [rows]);

  const summaryCards = [
    { key: 'totalCost', label: 'TOTAL COST IN CR', icon: 'bi-currency-rupee', tone: 'blue' },
    { key: 'agreements', label: 'AGREEMENTS SIGNED', icon: 'bi-check-circle', tone: 'green' },
    { key: 'totalUsd', label: 'TOTAL VALUE (USD)', icon: 'bi-globe2', tone: 'dark-teal' },
    { key: 'loaIssued', label: 'LOA ISSUED', icon: 'bi-file-earmark-check', tone: 'purple' },
  ];

  const metricCards = [
    { key: 'avgCycle', label: 'AVG. CYCLE DAYS', icon: 'bi-clock', tone: 'teal', variant: 'simple' },
    { key: 'avgQuote', label: 'AVG. QUOTE', icon: 'bi-percent', tone: 'violet', variant: 'simple' },
    { key: 'avgBidders', label: 'AVG. BIDDERS', icon: 'bi-people', tone: 'orange', variant: 'simple' },
    { key: 'timeOverrun', label: 'TIME OVERRUN', icon: 'bi-hourglass-split', tone: 'amber', variant: 'overrun' },
    { key: 'costOverrun', label: 'COST OVERRUN', icon: 'bi-graph-up', tone: 'rose', variant: 'overrun' },
    { key: 'billsOverrun', label: 'BILLS OVERRUN', icon: 'bi-receipt', tone: 'slate', variant: 'simple' },
  ];

  const summaryValue = (key: string) => {
    switch (key) {
      case 'totalCost': return `₹ 0.00`;
      case 'agreements': return `0 / 0 (0%)`;
      case 'totalUsd': return `$ 0.0 M`;
      case 'loaIssued': return `0 / 0 (0%)`;
      case 'avgCycle': return `0 days`;
      case 'avgQuote': return `0.00`;
      case 'avgBidders': return `0.0`;
      case 'timeOverrun': return `0`;
      case 'costOverrun': return `0`;
      case 'billsOverrun': return `0`;
      default: return '-';
    }
  };

  const hasChartData = rows.length > 0;
  const agreementChartOption = {};
  const agreementQuarterChartOption = {};
  const contractorPackagesChartOption = {};
  const contractorCostChartOption = {};

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = () => {
    setShowModal(false);
    // TODO: implement save logic
  };

  return (
    <div className={styles['container']}>
      <div className={styles['proc-page']}>
        
        {/* Summary Grid */}
        {!summaryLoading ? (
          <div className={styles['proc-summary-grid']}>
            {summaryCards.map((card) => (
              <div key={card.key} className={styles['proc-summary-card']}>
                <div className={`${styles['proc-summary-icon']} ${styles[`tone-${card.tone}`]}`}>
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <div className={styles['proc-summary-text']}>
                  <span className={styles['proc-summary-label']}>{card.label} :</span>
                  <span className={styles['proc-summary-value']}>{summaryValue(card.key)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles['proc-summary-grid']}>
            {summaryCards.map((card, i) => (
              <div key={i} className={`${styles['proc-summary-card']} ${styles['is-skeleton']}`}>
                <div className={`${styles['proc-summary-icon']} ${styles['tone-blue']}`}></div>
                <div className={styles['proc-summary-text']}>
                  <span className={styles['proc-summary-label']}>&nbsp;</span>
                  <span className={styles['proc-summary-value']}>&nbsp;</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metric Row */}
        <div className={styles['proc-metric-row']}>
          {!summaryLoading ? (
            <div className={styles['proc-metric-grid']}>
              {metricCards.map((card) => (
                <div 
                  key={card.key} 
                  className={`${styles['proc-summary-card']} ${card.variant === 'overrun' ? styles['is-overrun'] : ''}`}
                >
                  <div className={`${styles['proc-summary-icon']} ${styles[`tone-${card.tone}`]}`}>
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                  {card.variant === 'simple' && (
                    <div className={styles['proc-summary-text']}>
                      <span className={styles['proc-summary-label']}>{card.label} :</span>
                      <span className={styles['proc-summary-value']}>{summaryValue(card.key)}</span>
                    </div>
                  )}
                  {card.variant === 'overrun' && (
                    <div className={styles['proc-overrun-body']}>
                      <div className={styles['proc-summary-text']}>
                        <span className={styles['proc-summary-label']}>{card.label} :</span>
                        <span className={styles['proc-summary-value']}>{summaryValue(card.key)}</span>
                      </div>
                      <div className={styles['proc-overrun-meta']}>
                        <span>Executing {summary.executingCount}</span>
                        <span className={styles['proc-overrun-dot']}>·</span>
                        <span>Completed {summary.completedCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles['proc-metric-grid']}>
              {metricCards.map((_, i) => (
                <div key={i} className={`${styles['proc-summary-card']} ${styles['is-skeleton']}`}>
                  <div className={`${styles['proc-summary-icon']} ${styles['tone-blue']}`}></div>
                  <div className={styles['proc-summary-text']}>
                    <span className={styles['proc-summary-label']}>&nbsp;</span>
                    <span className={styles['proc-summary-value']}>&nbsp;</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <a
            className={styles['proc-tenders-link']}
            href="https://crda.ap.gov.in/APCRDAV2/Views/NotificationsView.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-box-arrow-up-right"></i>
            Tenders
          </a>
        </div>

        {/* Charts */}
        {!summaryLoading && hasChartData && (
          <div className={styles['proc-charts']}>
            <div className={styles['proc-chart-card']}>
              <div className={styles['proc-chart-header']}>Agreement Status</div>
              <ReactECharts option={agreementChartOption} style={{ height: '200px', width: '100%' }} />
            </div>
            <div className={styles['proc-chart-card']}>
              <div className={styles['proc-chart-header']}>Agreement Timeline</div>
              <ReactECharts option={agreementQuarterChartOption} style={{ height: '200px', width: '100%' }} />
            </div>
            <div className={`${styles['proc-chart-card']} ${styles['proc-chart-card-wide']}`}>
              <div className={styles['proc-chart-header']}>Contractor Distribution</div>
              <ReactECharts option={contractorPackagesChartOption} style={{ height: '200px', width: '100%' }} />
            </div>
            <div className={`${styles['proc-chart-card']} ${styles['proc-chart-card-wide']}`}>
              <div className={styles['proc-chart-header']}>Cost Distribution (₹ Cr)</div>
              <ReactECharts option={contractorCostChartOption} style={{ height: '200px', width: '100%' }} />
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className={styles['proc-filter-bar']}>
          <div className={styles['proc-search']}>
            <i className="bi bi-search"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search work number, project, contractor..."
            />
          </div>
          <div className={styles['proc-header-actions']}>
            <button
              type="button"
              className={`${styles['proc-btn']} ${styles['proc-btn-primary']}`}
              onClick={handleOpenAddModal}
            >
              <i className="bi bi-plus-lg"></i>
              Add Record
            </button>
            <button
              type="button"
              className={`${styles['proc-btn']} ${styles['proc-btn-export']}`}
              disabled={rows.length === 0}
            >
              <i className="bi bi-file-earmark-excel"></i>
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={styles['proc-table-card']}>
          <div className={styles['proc-table-scroll']}>
            <table className={styles['proc-table']}>
              <thead>
                <tr>
                  <th className={styles['col-sno']}><span className={styles['th-label']}>S.No</span></th>
                  <th className={styles['col-work']}><span className={styles['th-label']}>Work Number</span></th>
                  <th className={styles['col-name']}><span className={styles['th-label']}>Project Name</span></th>
                  <th className={styles['col-date']}><span className={styles['th-label']}>Admin Sanction</span></th>
                  <th className={styles['col-date']}><span className={styles['th-label']}>Tech Sanction</span></th>
                  <th className={styles['col-num']}><span className={styles['th-label']}>Cost INR</span></th>
                  <th className={styles['col-cat']}><span className={styles['th-label']}>Category</span></th>
                  <th className={styles['col-cat']}><span className={styles['th-label']}>Method</span></th>
                  <th className={styles['col-actions']}><span className={styles['th-label']}>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows.map((row, i) => (
                  <tr key={row.id}>
                    <td className={styles['col-sno']}>{i + 1}</td>
                    <td className={styles['col-work']}>{row.workNumber || '-'}</td>
                    <td className={styles['col-name']}>{row.projectName || '-'}</td>
                    <td className={styles['col-date']}>{row.adminSanctionDate || '-'}</td>
                    <td className={styles['col-date']}>{row.technicalSanctionDate || '-'}</td>
                    <td className={styles['col-num']}>{row.estimatedCostInrCr || '-'}</td>
                    <td className={styles['col-cat']}>{row.procurementCategory || '-'}</td>
                    <td className={styles['col-cat']}>{row.procurementMethod || '-'}</td>
                    <td className={styles['col-actions']}>
                      <div className={styles['proc-actions-cell']}>
                        <button className={styles['proc-icon-btn']} title="Edit"><i className="bi bi-pencil"></i></button>
                        <button className={`${styles['proc-icon-btn']} ${styles['danger']}`} title="Delete"><i className="bi bi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      {loading ? 'Loading procurement data...' : 'No procurement data found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className={styles['proc-overlay']} onClick={handleCloseModal}>
            <div className={styles['proc-modal']} onClick={(e) => e.stopPropagation()}>
              <div className={styles['proc-modal-header']}>
                <div className={styles['proc-modal-header-text']}>
                  <div className={styles['proc-modal-badge']}>
                    <i className={`bi ${editingId ? 'bi-pencil-square' : 'bi-plus-lg'}`}></i>
                  </div>
                  <div>
                    <h2>{editingId ? "Edit Record" : "Add Record"}</h2>
                    <p>{editingId ? "Update procurement package details" : "Create a new procurement package entry"}</p>
                  </div>
                </div>
                <button type="button" className={styles['proc-modal-close']} onClick={handleCloseModal}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className={styles['proc-modal-body']}>
                <div className={styles['proc-form-grid']}>
                  <div className={styles['proc-field']}>
                    <label>Work Number</label>
                    <input type="text" placeholder="e.g. WIN/0081/25-26" />
                  </div>
                  <div className={styles['proc-field']}>
                    <label>Project Name</label>
                    <input type="text" placeholder="Project name" />
                  </div>
                </div>
              </div>
              <div className={styles['proc-modal-actions']}>
                <button type="button" className={`${styles['proc-btn']} ${styles['proc-btn-ghost']}`} onClick={handleCloseModal}>Cancel</button>
                <button type="button" className={`${styles['proc-btn']} ${styles['proc-btn-primary']}`} onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
