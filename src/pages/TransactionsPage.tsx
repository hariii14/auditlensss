import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  Calendar,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const TransactionsPage: React.FC = () => {
  const { transactions, company } = useData();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const accounts = Array.from(new Set(transactions.map((t) => t.accountName)));

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedAccount !== 'all' && tx.accountName !== selectedAccount) return false;
    if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.description.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q) ||
        (tx.reconciledInvoiceId && tx.reconciledInvoiceId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-paper-300 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-charcoal-900 tracking-tight">
            Unified Multi-Account Ledger
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Cross-account bank and corporate credit card debits reconciled against digital invoices and receipts.
          </p>
        </div>

        {/* Account balance preview chips */}
        <div className="flex flex-wrap items-center gap-2">
          {company.connectedAccounts.map((acc, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-white border border-paper-300 shadow-subtle text-xs">
              <span className="text-[10px] text-charcoal-400 block truncate">{acc.name}</span>
              <strong className="text-charcoal-900">{acc.balance}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-paper-300 text-xs bg-white text-charcoal-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest-600"
          >
            <option value="all">All Accounts ({accounts.length})</option>
            {accounts.map((acc) => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-paper-300 text-xs bg-white text-charcoal-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest-600"
          >
            <option value="all">All Reconciliation Statuses</option>
            <option value="reconciled">Reconciled</option>
            <option value="flagged">Discrepancy Flagged</option>
            <option value="unmatched">Unmatched</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-paper-300 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-forest-600 bg-white"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-paper-300 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-paper-200 text-charcoal-500 font-semibold uppercase text-[10px] tracking-wider bg-paper-50/50">
                <th className="py-3 px-4">Date & Ref</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Account / Card</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Matched Invoice</th>
                <th className="py-3 px-4 text-right">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-paper-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-charcoal-500">
                    <div>{tx.date}</div>
                    <div className="text-[10px] text-charcoal-400">{tx.reference}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-charcoal-900">{tx.description}</p>
                  </td>

                  <td className="py-3.5 px-4 text-charcoal-600 font-medium">
                    {tx.accountName}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-charcoal-900">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>{tx.currency} {tx.amount.toFixed(2)}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-charcoal-600">
                    {tx.reconciledInvoiceId ? (
                      <span className="font-mono bg-paper-100 text-charcoal-800 px-2 py-0.5 rounded border border-paper-200 font-semibold">
                        {tx.reconciledInvoiceId}
                      </span>
                    ) : (
                      <span className="text-charcoal-400 italic">No invoice linked</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {tx.status === 'reconciled' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-forest-50 border border-forest-600/20 text-forest-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-forest-700" />
                        Reconciled
                      </span>
                    ) : tx.status === 'flagged' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-alert-redBg border border-alert-redBorder text-alert-red text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        Discrepancy Flagged
                      </span>
                    ) : (
                      <span className="text-[10px] text-charcoal-500">Unmatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
