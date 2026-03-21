import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COMPANY_NAME = 'City Smart Library';

const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const monthLabel = (key) => {
    const [year, month] = key.split('-');
    const d = new Date(year, parseInt(month) - 1, 1);
    return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const SectionHeader = ({ emoji, title, count }) => (
    <div className="flex items-center justify-between mt-10 mb-3">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>{emoji}</span> {title}
        </h2>
        {count !== undefined && (
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">
                {count} records
            </span>
        )}
    </div>
);

const Table = ({ headers, rows, emptyMsg = 'No data.' }) => (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                <tr>{headers.map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                    <tr><td colSpan={headers.length} className="text-center py-6 text-gray-400 italic">{emptyMsg}</td></tr>
                ) : rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                        {row.map((cell, j) => <td key={j} className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{cell}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default function ReportPage() {
    const { token } = useAuth();
    const today = new Date().toISOString().split('T')[0];
    const yearStart = `${new Date().getFullYear()}-01-01`;

    const [startDate, setStartDate] = useState(yearStart);
    const [endDate, setEndDate] = useState(today);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    // ---- Fetch report ----
    const handleGenerate = async () => {
        if (!startDate || !endDate) { toast.error('Please select both dates.'); return; }
        if (new Date(startDate) > new Date(endDate)) { toast.error('Start date must be before end date.'); return; }
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/report?startDate=${startDate}&endDate=${endDate}`, {
                headers: { Authorization: token }
            });
            setReport(res.data);
            toast.success('Report generated!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    // ---- Download PDF ----
    const handleDownloadPDF = () => {
        if (!report) { toast.error('Generate the report first.'); return; }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        let y = 0;

        // ── Header Banner ──
        doc.setFillColor(22, 163, 74); // green-600
        doc.rect(0, 0, pageW, 32, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(COMPANY_NAME, pageW / 2, 13, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Library Management Report`, pageW / 2, 21, { align: 'center' });
        doc.text(`Period: ${fmt(startDate)}  –  ${fmt(endDate)}`, pageW / 2, 27, { align: 'center' });

        y = 36;

        // Generation info
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, y);
        y += 8;

        const addSection = (title, head, body, options = {}) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(31, 41, 55);
            doc.text(title, 14, y);
            y += 2;
            autoTable(doc, {
                startY: y,
                head: [head],
                body: body.length > 0 ? body : [Array(head.length).fill('No data')],
                theme: 'grid',
                headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 8 },
                bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { left: 14, right: 14 },
                ...options
            });
            y = doc.lastAutoTable.finalY + 10;
        };

        // 1. User List
        addSection('1. User List', ['#', 'Username', 'Email', 'Coins', 'Status', 'Joined'],
            report.users.map((u, i) => [
                i + 1, u.username, u.email, u.coins,
                u.isBlocked ? 'Blocked' : 'Active',
                fmt(u.createdAt)
            ])
        );

        // 2. Book List
        addSection('2. Book List', ['#', 'ID', 'Title', 'Author', 'Type', 'Pages', 'Language', 'Available'],
            report.books.map((b, i) => [
                i + 1, b.id, b.title, b.author, b.bookType, b.pages, b.language,
                b.available ? 'Yes' : 'No'
            ])
        );

        // 3. User-wise Issue List
        const issueRows = [];
        report.issuesByUser.forEach(u => {
            u.issues.forEach((iss, idx) => {
                issueRows.push([
                    idx === 0 ? u.username : '',
                    iss.bookTitle,
                    fmt(iss.issueDate),
                    fmt(iss.dueDate),
                    iss.returnDate ? fmt(iss.returnDate) : '—',
                    iss.status,
                    iss.fine > 0 ? `₹${iss.fine}` : '—'
                ]);
            });
        });
        addSection('3. User-wise Issue List',
            ['User', 'Book', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine'],
            issueRows
        );

        // 4. User-wise Penalty
        addSection('4. User-wise Penalty List', ['#', 'Username', 'Email', 'Total Fine (₹)', 'Paid (₹)', 'Pending (₹)'],
            report.penaltyByUser.map((p, i) => [
                i + 1, p.username, p.email,
                p.totalFine, p.paidFine, p.totalFine - p.paidFine
            ])
        );

        // 5. Monthly/Yearly Income
        addSection('5. Monthly / Yearly Income', ['Month', 'Transactions', 'Income (₹)'],
            report.monthlyIncome.map(m => [monthLabel(m.month), m.count, m.total.toFixed(2)])
        );

        // Total income footer
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(22, 163, 74);
        doc.text(`Total Income in Period: ₹${report.totalIncome.toFixed(2)}`, 14, y);

        // Footer on last page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(160, 160, 160);
            doc.text(`${COMPANY_NAME} — Confidential Report`, 14, 292);
            doc.text(`Page ${i} of ${pageCount}`, pageW - 14, 292, { align: 'right' });
        }

        doc.save(`Library_Report_${startDate}_to_${endDate}.pdf`);
        toast.success('PDF downloaded!');
    };

    // ── Status badge ──
    const statusBadge = (s) => {
        const map = { issued: 'bg-blue-100 text-blue-700', overdue: 'bg-red-100 text-red-700', returned: 'bg-green-100 text-green-700' };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-lg shadow-md">📊</div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Library Report</h1>
                    <p className="text-xs text-gray-500">{COMPANY_NAME} — Admin View</p>
                </div>
            </div>

            {/* Date Range Picker */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-gray-600 mb-3">Select Report Period</p>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 font-medium">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            max={endDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 font-medium">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            max={today}
                            onChange={e => setEndDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow transition-all disabled:opacity-60 flex items-center gap-2"
                    >
                        {loading ? (
                            <><span className="animate-spin">⏳</span> Generating…</>
                        ) : (
                            <><span>🔍</span> Generate Report</>
                        )}
                    </button>
                    {report && (
                        <button
                            onClick={handleDownloadPDF}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow transition-all flex items-center gap-2"
                        >
                            <span>⬇️</span> Download PDF
                        </button>
                    )}
                </div>
            </div>

            {/* Report Content */}
            {report && (
                <div id="report-content">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                        {[
                            { label: 'Users', value: report.users.length, color: 'from-purple-500 to-purple-600', icon: '👥' },
                            { label: 'Books', value: report.books.length, color: 'from-blue-500 to-blue-600', icon: '📚' },
                            { label: 'Issues', value: report.issuesByUser.reduce((s, u) => s + u.issues.length, 0), color: 'from-amber-500 to-amber-600', icon: '🔖' },
                            { label: 'Penalties', value: report.penaltyByUser.length, color: 'from-red-500 to-red-600', icon: '⚠️' },
                            { label: 'Income', value: `₹${report.totalIncome.toFixed(0)}`, color: 'from-green-500 to-green-600', icon: '💰' },
                        ].map((card, i) => (
                            <div key={i} className={`bg-gradient-to-br ${card.color} text-white rounded-xl p-4 shadow-sm`}>
                                <div className="text-2xl mb-1">{card.icon}</div>
                                <div className="text-xl font-bold">{card.value}</div>
                                <div className="text-xs opacity-80 font-medium">{card.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* 1. User List */}
                    <SectionHeader emoji="👥" title="User List" count={report.users.length} />
                    <Table
                        headers={['#', 'Username', 'Email', 'Coins', 'Status', 'Joined']}
                        rows={report.users.map((u, i) => [
                            i + 1, u.username, u.email, u.coins,
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {u.isBlocked ? 'Blocked' : 'Active'}
                            </span>,
                            fmt(u.createdAt)
                        ])}
                        emptyMsg="No users found."
                    />

                    {/* 2. Book List */}
                    <SectionHeader emoji="📚" title="Book List" count={report.books.length} />
                    <Table
                        headers={['#', 'ID', 'Title', 'Author', 'Type', 'Pages', 'Language', 'Available']}
                        rows={report.books.map((b, i) => [
                            i + 1, b.id, b.title, b.author, b.bookType, b.pages, b.language,
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {b.available ? 'Yes' : 'No'}
                            </span>
                        ])}
                        emptyMsg="No books found."
                    />

                    {/* 3. User-wise Issue List */}
                    <SectionHeader emoji="🔖" title="User-wise Issue List" count={report.issuesByUser.reduce((s, u) => s + u.issues.length, 0)} />
                    {report.issuesByUser.length === 0 ? (
                        <p className="text-sm text-gray-400 italic px-2">No issue records in this period.</p>
                    ) : report.issuesByUser.map((u, ui) => (
                        <div key={ui} className="mb-5">
                            <p className="text-sm font-semibold text-indigo-700 mb-1.5 flex items-center gap-2">
                                <span>👤</span> {u.username}
                                <span className="text-gray-400 font-normal text-xs">({u.email})</span>
                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{u.issues.length} book{u.issues.length > 1 ? 's' : ''}</span>
                            </p>
                            <Table
                                headers={['Book', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine']}
                                rows={u.issues.map(iss => [
                                    iss.bookTitle,
                                    fmt(iss.issueDate),
                                    fmt(iss.dueDate),
                                    iss.returnDate ? fmt(iss.returnDate) : '—',
                                    statusBadge(iss.status),
                                    iss.fine > 0 ? <span className="text-red-600 font-semibold">₹{iss.fine}</span> : '—'
                                ])}
                            />
                        </div>
                    ))}

                    {/* 4. User-wise Penalty List */}
                    <SectionHeader emoji="⚠️" title="User-wise Penalty List" count={report.penaltyByUser.length} />
                    <Table
                        headers={['#', 'Username', 'Email', 'Total Fine (₹)', 'Paid (₹)', 'Pending (₹)']}
                        rows={report.penaltyByUser.map((p, i) => [
                            i + 1, p.username, p.email,
                            <span className="font-semibold text-red-600">₹{p.totalFine}</span>,
                            <span className="text-green-600">₹{p.paidFine}</span>,
                            <span className={`font-semibold ${p.totalFine - p.paidFine > 0 ? 'text-red-500' : 'text-gray-500'}`}>₹{p.totalFine - p.paidFine}</span>
                        ])}
                        emptyMsg="No penalties recorded."
                    />

                    {/* 5. Monthly/Yearly Income */}
                    <SectionHeader emoji="💰" title="Monthly / Yearly Income" />
                    <Table
                        headers={['Month', 'Transactions', 'Income (₹)']}
                        rows={report.monthlyIncome.map(m => [
                            monthLabel(m.month), m.count,
                            <span className="font-semibold text-green-700">₹{m.total.toFixed(2)}</span>
                        ])}
                        emptyMsg="No income records in this period."
                    />
                    <div className="mt-4 flex justify-end">
                        <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3">
                            <span className="text-green-600 text-lg">💰</span>
                            <div>
                                <p className="text-xs text-gray-500">Total Income in Period</p>
                                <p className="text-xl font-bold text-green-700">₹{report.totalIncome.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Download CTA at bottom */}
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleDownloadPDF}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
                        >
                            <span>⬇️</span> Download Full PDF Report
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!report && !loading && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-lg font-medium">Select a date range and click <strong className="text-green-600">Generate Report</strong></p>
                    <p className="text-sm mt-1">The report will include users, books, issues, penalties & income.</p>
                </div>
            )}
        </div>
    );
}
