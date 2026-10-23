import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  CreditCard,
  GitFork,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { VendorRecord } from '../types';

export const VendorsPage: React.FC = () => {
  const { vendors, anomalies } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredVendors = vendors.filter((v) => {
    if (riskFilter !== 'all' && v.riskRating !== riskFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.availableIdentifiers.verifiedEmailDomains.some(d => d.toLowerCase().includes(q))
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
            Vendor Master Vault & Remittance Registry
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Verified corporate bank accounts, authorized contact phone numbers, and domain impersonation watchlists.
          </p>
        </div>

          <div className="flex items-center gap-2">
          <NavLink
            to="/vendors"
            className="px-3 py-1.5 rounded-lg border border-paper-300 bg-white hover:bg-paper-50 text-charcoal-800 text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
          >
            <GitFork className="w-3.5 h-3.5 text-forest-700" />
            <span>Vendor Details</span>
          </NavLink>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-paper-200/70 rounded-lg border border-paper-300 text-xs font-medium self-start">
          <button
            onClick={() => setRiskFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              riskFilter === 'all' ? 'bg-white text-charcoal-900 font-semibold shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            All Vendors ({vendors.length})
          </button>
          <button
            onClick={() => setRiskFilter('high')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              riskFilter === 'high' ? 'bg-white text-alert-red font-semibold shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            High Risk ({vendors.filter(v => v.riskRating === 'high').length})
          </button>
          <button
            onClick={() => setRiskFilter('medium')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              riskFilter === 'medium' ? 'bg-white text-alert-amber font-semibold shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Medium Risk
          </button>
          <button
            onClick={() => setRiskFilter('low')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              riskFilter === 'low' ? 'bg-white text-forest-800 font-semibold shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Low Risk
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-paper-300 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-forest-600 bg-white"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => {
          const vendorAnomalies = anomalies.filter(a => vendor.associatedRecordIds.includes(a.id));

          return (
            <div
              key={vendor.id}
              className={`p-5 rounded-xl bg-white border transition-all shadow-subtle flex flex-col justify-between space-y-4 ${
                vendor.riskRating === 'high'
                  ? 'border-alert-redBorder hover:border-alert-red hover:shadow-card'
                  : 'border-paper-300 hover:border-forest-600/50 hover:shadow-card'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-paper-100 text-forest-800 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5 text-forest-700" />
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                    vendor.riskRating === 'high'
                      ? 'bg-alert-redBg text-alert-red border border-alert-redBorder'
                      : vendor.riskRating === 'medium'
                      ? 'bg-alert-amberBg text-alert-amber border border-alert-amberBorder'
                      : 'bg-forest-50 text-forest-800 border border-forest-600/20'
                  }`}>
                    {vendor.riskRating} Risk
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-charcoal-900">{vendor.name}</h3>
                  <p className="text-[11px] text-charcoal-500">{vendor.category}</p>
                </div>

                {/* Verified Remittance Info */}
                <div className="bg-paper-50 rounded-lg p-3 border border-paper-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-charcoal-500">Monthly Run Rate:</span>
                    <strong className="text-charcoal-900">{vendor.currency} {vendor.monthlySpend.toLocaleString()}/mo</strong>
                  </div>

                  <div className="pt-1 border-t border-paper-200">
                    <span className="text-charcoal-500 block text-[10px] uppercase font-semibold">Verified Bank Account:</span>
                    {vendor.availableIdentifiers.verifiedBankAccounts.length > 0 ? (
                      <p className="font-mono text-[11px] text-charcoal-800 mt-0.5">
                        {vendor.availableIdentifiers.verifiedBankAccounts[0].bankName} (*{vendor.availableIdentifiers.verifiedBankAccounts[0].last4})
                      </p>
                    ) : (
                      <p className="text-[11px] text-charcoal-400 italic">No bank wire on file (Card-only)</p>
                    )}
                  </div>

                  <div className="pt-1 border-t border-paper-200">
                    <span className="text-charcoal-500 block text-[10px] uppercase font-semibold">Verified Domains:</span>
                    <p className="font-mono text-[11px] text-forest-800 mt-0.5">
                      {vendor.availableIdentifiers.verifiedEmailDomains.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Warning if vendor has high risk anomalies */}
                {vendorAnomalies.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-alert-redBg border border-alert-redBorder text-[11px] text-alert-red font-semibold flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{vendorAnomalies[0].title}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-paper-200 flex items-center justify-between text-xs">
                {vendor.availableIdentifiers.phone ? (
                  <a
                    href={`tel:${vendor.availableIdentifiers.phone}`}
                    className="text-forest-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{vendor.availableIdentifiers.phone}</span>
                  </a>
                ) : (
                  <span className="text-charcoal-400 text-[11px]">No phone on file</span>
                )}

                <NavLink
                  to="/vendors"
                  className="px-2.5 py-1 rounded bg-paper-100 hover:bg-paper-200 text-charcoal-800 font-semibold text-[11px] flex items-center gap-1"
                >
                  <GitFork className="w-3 h-3 text-forest-700" />
                  <span>Details</span>
                </NavLink>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
