'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, BarChart, Settings, Info, Layers, Activity, ShieldAlert } from 'lucide-react';

type ChannelType = 'Amazon' | 'Flipkart' | 'JioMart' | 'D2C';
type GlobalChannelType = 'Overall' | ChannelType;

interface SKU {
  sku_id: string;
  product_name: string;
  category: string;
  price: number;
  fulfillment_cost: number;
  ad_spend: number;
  pack_size_g: number;
  rm_cost_per_g: number;
  mtd_units?: number;
  ytd_units?: number;
}

interface UnitEconomicsSheetProps {
  initialSkus: SKU[];
  onSkusChange: (skus: SKU[]) => void;
}

export default function UnitEconomicsSheet({ initialSkus, onSkusChange }: UnitEconomicsSheetProps) {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [viewMode, setViewMode] = useState<'unit' | 'mtd' | 'ytd'>('unit');
  const [selectedChannel, setSelectedChannel] = useState<GlobalChannelType>('Overall');
  
  // Configurable Cost Assumptions (Global parameters)
  const [millingLossPct, setMillingLossPct] = useState<number>(0.03); // Milling Loss: 0.03%
  const [packingCost, setPackingCost] = useState<number>(15); // Packing Cost: Rs. 15
  const [inwardLogisticsPerKg, setInwardLogisticsPerKg] = useState<number>(1); // Inward Logistics: Re 1 per kg
  
  // Advanced e-Commerce Assumptions (India Specific)
  const [salesReturnPct, setSalesReturnPct] = useState<number>(0.08); // Sales Return: 0.08%
  const [gstOnFeesPct, setGstOnFeesPct] = useState<number>(18); // GST on Marketplace Fees: 18%
  const [tdsPct, setTdsPct] = useState<number>(0.05); // TDS: 0.05%
  const [tcsPct, setTcsPct] = useState<number>(0.05); // TCS: 0.05%

  // Marketplace-wise Fee Structure (Configurable)
  const [amazonFee, setAmazonFee] = useState<number>(15); // 15%
  const [flipkartFee, setFlipkartFee] = useState<number>(12); // 12%
  const [jiomartFee, setJiomartFee] = useState<number>(10); // 10%
  const [d2cFee, setD2cFee] = useState<number>(3); // 3% (Payment gateway fees)

  useEffect(() => {
    if (initialSkus && initialSkus.length > 0) {
      const seeded = initialSkus.map((s, index) => ({
        ...s,
        pack_size_g: s.pack_size_g || (250 + (index * 250)),
        rm_cost_per_g: s.rm_cost_per_g || 0.12,
        mtd_units: s.mtd_units || (250 + (index * 75)),
        ytd_units: s.ytd_units || (2000 + (index * 850))
      }));
      setSkus(seeded);
    }
  }, [initialSkus]);

  // Recalculate metrics whenever any configurable parameter changes
  useEffect(() => {
    if (skus.length > 0) {
      onSkusChange(skus);
    }
  }, [millingLossPct, packingCost, inwardLogisticsPerKg, salesReturnPct, gstOnFeesPct, tdsPct, tcsPct, amazonFee, flipkartFee, jiomartFee, d2cFee, selectedChannel]);

  const handleCellChange = (index: number, field: keyof SKU, value: string | number) => {
    const updated = [...skus];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setSkus(updated);
    onSkusChange(updated);
  };

  const handleAddSku = () => {
    const newSku: SKU = {
      sku_id: `SKU-${Date.now().toString().slice(-4)}`,
      product_name: 'New Custom SKU',
      category: 'General',
      price: 299.00,
      fulfillment_cost: 45.00,
      ad_spend: 30.00,
      pack_size_g: 500,
      rm_cost_per_g: 0.10,
      mtd_units: 300,
      ytd_units: 2500,
    };
    const updated = [...skus, newSku];
    setSkus(updated);
    onSkusChange(updated);
  };

  const handleDeleteSku = (index: number) => {
    const updated = skus.filter((_, i) => i !== index);
    setSkus(updated);
    onSkusChange(updated);
  };

  // Get resolved fee % based on channel
  const getChannelFeePct = (channel: ChannelType) => {
    switch (channel) {
      case 'Amazon': return amazonFee / 100;
      case 'Flipkart': return flipkartFee / 100;
      case 'JioMart': return jiomartFee / 100;
      case 'D2C': return d2cFee / 100;
      default: return 0;
    }
  };

  // Row-level calculations matching advanced parameters
  const getRowCalculations = (sku: SKU) => {
    // 1. Computed COGS
    const baseRmCost = sku.pack_size_g * sku.rm_cost_per_g;
    const millingLossCost = baseRmCost * (millingLossPct / 100);
    const totalRmCostWithLoss = baseRmCost + millingLossCost;
    const logisticsCost = (sku.pack_size_g / 1000) * inwardLogisticsPerKg;
    const calculatedCogs = totalRmCostWithLoss + packingCost + logisticsCost;

    // 2. Marketplace Fee Calculations (override or compute blended)
    const feePct = selectedChannel === 'Overall' 
      ? (amazonFee + flipkartFee + jiomartFee + d2cFee) / 400 // Blended average percentage (even 25% split across channels)
      : getChannelFeePct(selectedChannel as ChannelType);
      
    const baseFeeAmount = sku.price * feePct;
    const gstOnFeeAmount = baseFeeAmount * (gstOnFeesPct / 100);
    const totalMarketplaceExpense = baseFeeAmount + gstOnFeeAmount;

    // 3. Indian Tax & Return Deductions
    const salesReturnCost = sku.price * (salesReturnPct / 100);
    const tdsCost = sku.price * (tdsPct / 100);
    const tcsCost = sku.price * (tcsPct / 100);

    // 4. Net Revenue (Net Realized Sales)
    const netRevenue = sku.price - salesReturnCost - totalMarketplaceExpense - tdsCost - tcsCost;
    const grossProfit = netRevenue - calculatedCogs;
    const grossMargin = sku.price > 0 ? (grossProfit / sku.price) * 100 : 0;
    const contributionMargin = grossProfit - sku.fulfillment_cost - sku.ad_spend;
    const contributionMarginPct = sku.price > 0 ? (contributionMargin / sku.price) * 100 : 0;

    const mtdUnits = sku.mtd_units || 0;
    const ytdUnits = sku.ytd_units || 0;

    return {
      cogs: calculatedCogs,
      baseRmCost,
      millingLossCost,
      logisticsCost,
      feePct,
      baseFeeAmount,
      gstOnFeeAmount,
      totalMarketplaceExpense,
      salesReturnCost,
      tdsCost,
      tcsCost,
      netRevenue,
      grossProfit,
      grossMargin,
      contributionMargin,
      contributionMarginPct,
      // MTD totals
      mtdGrossRevenue: sku.price * mtdUnits,
      mtdNetRevenue: netRevenue * mtdUnits,
      mtdCogs: calculatedCogs * mtdUnits,
      mtdFulfillment: sku.fulfillment_cost * mtdUnits,
      mtdAdSpend: sku.ad_spend * mtdUnits,
      mtdGrossProfit: grossProfit * mtdUnits,
      mtdContributionMargin: contributionMargin * mtdUnits,
      // YTD totals
      ytdGrossRevenue: sku.price * ytdUnits,
      ytdNetRevenue: netRevenue * ytdUnits,
      ytdCogs: calculatedCogs * ytdUnits,
      ytdFulfillment: sku.fulfillment_cost * ytdUnits,
      ytdAdSpend: sku.ad_spend * ytdUnits,
      ytdGrossProfit: grossProfit * ytdUnits,
      ytdContributionMargin: contributionMargin * ytdUnits,
    };
  };

  // Base SKU inputs aggregates
  const totalBasePrice = skus.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalBaseCogs = skus.reduce((sum, s) => sum + getRowCalculations(s).cogs, 0);
  const totalBaseFulfill = skus.reduce((sum, s) => sum + (s.fulfillment_cost || 0), 0);
  const totalBaseAd = skus.reduce((sum, s) => sum + (s.ad_spend || 0), 0);

  // Volume Aggregates
  const totalMtdUnits = skus.reduce((sum, s) => sum + (s.mtd_units || 0), 0);
  const totalYtdUnits = skus.reduce((sum, s) => sum + (s.ytd_units || 0), 0);

  // Aggregated totals based on view mode
  const getAggregatedValues = () => {
    let revenue = 0, cogs = 0, gp = 0, cm = 0, netRev = 0, fulfill = 0, marketing = 0;
    skus.forEach(s => {
      const calcs = getRowCalculations(s);
      if (viewMode === 'mtd') {
        revenue += calcs.mtdGrossRevenue;
        cogs += calcs.mtdCogs;
        gp += calcs.mtdGrossProfit;
        cm += calcs.mtdContributionMargin;
        netRev += calcs.mtdNetRevenue;
        fulfill += calcs.mtdFulfillment;
        marketing += calcs.mtdAdSpend;
      } else if (viewMode === 'ytd') {
        revenue += calcs.ytdGrossRevenue;
        cogs += calcs.ytdCogs;
        gp += calcs.ytdGrossProfit;
        cm += calcs.ytdContributionMargin;
        netRev += calcs.ytdNetRevenue;
        fulfill += calcs.ytdFulfillment;
        marketing += calcs.ytdAdSpend;
      } else {
        revenue += s.price;
        cogs += calcs.cogs;
        gp += calcs.grossProfit;
        cm += calcs.contributionMargin;
        netRev += calcs.netRevenue;
        fulfill += s.fulfillment_cost;
        marketing += s.ad_spend;
      }
    });

    const gmPct = revenue > 0 ? (gp / revenue) * 100 : 0;
    const cmPct = revenue > 0 ? (cm / revenue) * 100 : 0;

    return {
      revenue,
      cogs,
      gp,
      cm,
      netRev,
      fulfill,
      marketing,
      gmPct,
      cmPct
    };
  };

  const aggregates = getAggregatedValues();

  // Helper to render a sleek health visual indicator
  const getMarginHealthIndicator = (pct: number) => {
    let barColor = 'bg-rose-500';
    let textColor = 'text-rose-400';
    let label = 'Critical';
    
    if (pct > 35) {
      barColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      textColor = 'text-emerald-400 font-bold';
      label = 'Premium';
    } else if (pct >= 20) {
      barColor = 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]';
      textColor = 'text-cyan-400';
      label = 'Healthy';
    } else if (pct >= 10) {
      barColor = 'bg-amber-500';
      textColor = 'text-amber-400';
      label = 'Fair';
    }

    return (
      <div className="flex flex-col items-end gap-1 select-none w-20">
        <span className={`${textColor} font-mono`}>{pct.toFixed(1)}%</span>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6 transform hover:shadow-[0_20px_50px_rgba(153,102,255,0.15)] transition-all duration-300 w-full max-w-full overflow-hidden">
      
      {/* Cost & Tax Assumptions Configurations */}
      <div className="p-4 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/10 rounded-xl space-y-4 shadow-inner">
        
        {/* Section 1: Logistics and Manufacturing */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-3">
            <Settings className="w-3.5 h-3.5 text-purple-400" /> Manufacturing & Logistics Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-purple-300 transition-colors">Milling Loss (%)</label>
              <input
                type="number"
                step="0.01"
                value={millingLossPct}
                onChange={(e) => setMillingLossPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-purple-300 transition-colors">Packing Cost (₹ / pack)</label>
              <input
                type="number"
                step="1"
                value={packingCost}
                onChange={(e) => setPackingCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-purple-300 transition-colors">Inward Logistics (₹ / kg)</label>
              <input
                type="number"
                step="0.5"
                value={inwardLogisticsPerKg}
                onChange={(e) => setInwardLogisticsPerKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Returns & Indian Taxes */}
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-3">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Return & Taxation Assumptions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-indigo-300 transition-colors">Sales Return (%)</label>
              <input
                type="number"
                step="0.01"
                value={salesReturnPct}
                onChange={(e) => setSalesReturnPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-indigo-300 transition-colors">GST on Fees (%)</label>
              <input
                type="number"
                value={gstOnFeesPct}
                onChange={(e) => setGstOnFeesPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-indigo-300 transition-colors">TDS (%)</label>
              <input
                type="number"
                step="0.01"
                value={tdsPct}
                onChange={(e) => setTdsPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-indigo-300 transition-colors">TCS (%)</label>
              <input
                type="number"
                step="0.01"
                value={tcsPct}
                onChange={(e) => setTcsPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Marketplace commission structures */}
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-3">
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> Channel Referral / Gateway Fee (%)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-emerald-300 transition-colors">Amazon Fee (%)</label>
              <input
                type="number"
                value={amazonFee}
                onChange={(e) => setAmazonFee(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-emerald-300 transition-colors">Flipkart Fee (%)</label>
              <input
                type="number"
                value={flipkartFee}
                onChange={(e) => setFlipkartFee(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-emerald-300 transition-colors">JioMart Fee (%)</label>
              <input
                type="number"
                value={jiomartFee}
                onChange={(e) => setJiomartFee(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
            <div className="group">
              <label className="block text-[9px] uppercase font-semibold text-white/55 mb-1 group-focus-within:text-emerald-300 transition-colors">D2C Website Fee (%)</label>
              <input
                type="number"
                value={d2cFee}
                onChange={(e) => setD2cFee(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono group-hover:border-white/20"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main interactive header */}
      <div className="border-b border-white/5 pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white glow-text flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary animate-pulse" /> Unit Economics Ledger
            </h2>
            <p className="text-xs text-white/50">Edit any SKU value inline. Commission and Indian e-commerce metrics sync globally.</p>
          </div>
          <button 
            onClick={handleAddSku}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold rounded-xl hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transform hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Add SKU Row
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2 border-t border-white/5">
          {/* Global Marketplace / Blended Selector */}
          <div className="flex flex-wrap bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 gap-1 shadow-inner">
            <button
              onClick={() => setSelectedChannel('Overall')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${selectedChannel === 'Overall' ? 'bg-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.5)] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Layers className="w-3.5 h-3.5" /> Blended Overall
            </button>
            <button
              onClick={() => setSelectedChannel('Amazon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${selectedChannel === 'Amazon' ? 'bg-amber-600 shadow-[0_0_12px_rgba(217,119,6,0.5)] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              Amazon
            </button>
            <button
              onClick={() => setSelectedChannel('Flipkart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${selectedChannel === 'Flipkart' ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.5)] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              Flipkart
            </button>
            <button
              onClick={() => setSelectedChannel('JioMart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${selectedChannel === 'JioMart' ? 'bg-emerald-600 shadow-[0_0_12px_rgba(5,150,105,0.5)] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              JioMart
            </button>
            <button
              onClick={() => setSelectedChannel('D2C')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${selectedChannel === 'D2C' ? 'bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.5)] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              D2C Website
            </button>
          </div>

          {/* View Mode Toggles */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 shadow-inner">
            <button
              onClick={() => setViewMode('unit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${viewMode === 'unit' ? 'bg-primary text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <FileText className="w-3.5 h-3.5" /> Unit Economics
            </button>
            <button
              onClick={() => setViewMode('mtd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${viewMode === 'mtd' ? 'bg-primary text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Calendar className="w-3.5 h-3.5" /> Month-to-Date
            </button>
            <button
              onClick={() => setViewMode('ytd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${viewMode === 'ytd' ? 'bg-primary text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <BarChart className="w-3.5 h-3.5" /> Year-to-Date
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl bg-black/20 backdrop-blur-md">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-white/5 text-white/70 border-b border-white/10 uppercase tracking-wider text-[10px]">
              <th className="p-4 font-semibold min-w-[110px]">SKU ID</th>
              <th className="p-4 font-semibold min-w-[150px]">Product Name</th>
              
              {/* Conditional Headers Based on View Mode */}
              {viewMode === 'unit' && (
                <>
                  <th className="p-4 font-semibold min-w-[100px]">Category</th>
                  <th className="p-4 font-semibold text-right text-purple-300">Pack Size</th>
                  <th className="p-4 font-semibold text-right text-purple-300">RM Cost (₹/g)</th>
                  <th className="p-4 font-semibold text-right text-purple-300">Base RM Cost (₹)</th>
                  <th className="p-4 font-semibold text-right text-purple-300">Milling Loss (₹)</th>
                  <th className="p-4 font-semibold text-right text-purple-300">Packing Cost (₹)</th>
                  <th className="p-4 font-semibold text-right text-purple-300">Inward Log. (₹)</th>
                  <th className="p-4 font-semibold text-right text-white">Price (₹)</th>
                  <th className="p-4 font-semibold text-right bg-purple-950/20 text-purple-300 font-bold border-x border-white/5">Total COGS (₹)</th>
                  <th className="p-4 font-semibold text-right text-amber-300">Referral Fee (₹)</th>
                  <th className="p-4 font-semibold text-right text-amber-300">GST on Fee (₹)</th>
                  <th className="p-4 font-semibold text-right text-rose-300">TDS (₹)</th>
                  <th className="p-4 font-semibold text-right text-rose-300">TCS (₹)</th>
                  <th className="p-4 font-semibold text-right text-rose-300">Sales Return (₹)</th>
                  <th className="p-4 font-semibold text-right bg-emerald-950/20 text-emerald-400 font-bold border-x border-white/5">Net Revenue (₹)</th>
                  <th className="p-4 font-semibold text-right">Fulfillment (₹)</th>
                  <th className="p-4 font-semibold text-right">Ad Spend (₹)</th>
                  <th className="p-4 font-semibold text-right bg-indigo-950/20 text-indigo-300 font-semibold">Gross Profit (₹)</th>
                  <th className="p-4 font-semibold text-right bg-indigo-950/20 text-indigo-300">GM %</th>
                  <th className="p-4 font-semibold text-right bg-purple-950/30 text-purple-200 font-bold border-l border-white/10">Contribution (₹)</th>
                  <th className="p-4 font-semibold text-right bg-purple-950/30 text-purple-200">CM %</th>
                </>
              )}

              {viewMode === 'mtd' && (
                <>
                  <th className="p-4 font-semibold text-right text-purple-300">MTD Units</th>
                  <th className="p-4 font-semibold text-right">Unit Price</th>
                  <th className="p-4 font-semibold text-right bg-white/5 text-emerald-400">MTD Revenue</th>
                  <th className="p-4 font-semibold text-right bg-white/5">MTD COGS</th>
                  <th className="p-4 font-semibold text-right bg-white/5">MTD Net Sales</th>
                  <th className="p-4 font-semibold text-right bg-white/5 text-indigo-300">MTD Gross profit</th>
                  <th className="p-4 font-semibold text-right bg-white/5 text-indigo-300">GM %</th>
                  <th className="p-4 font-semibold text-right bg-primary/10 text-primary-foreground font-bold">MTD Contribution</th>
                  <th className="p-4 font-semibold text-right bg-primary/10 text-primary-foreground">CM %</th>
                </>
              )}

              {viewMode === 'ytd' && (
                <>
                  <th className="p-4 font-semibold text-right text-purple-300">YTD Units</th>
                  <th className="p-4 font-semibold text-right">Unit Price</th>
                  <th className="p-4 font-semibold text-right bg-white/5 text-emerald-400">YTD Revenue</th>
                  <th className="p-4 font-semibold text-right bg-white/5">YTD COGS</th>
                  <th className="p-4 font-semibold text-right bg-white/5">YTD Net Sales</th>
                  <th className="p-4 font-semibold text-right bg-white/5 text-indigo-300">YTD Gross profit</th>
                  <th className="p-4 font-semibold text-right bg-white/5 text-indigo-300">GM %</th>
                  <th className="p-4 font-semibold text-right bg-primary/10 text-primary-foreground font-bold">YTD Contribution</th>
                  <th className="p-4 font-semibold text-right bg-primary/10 text-primary-foreground">CM %</th>
                </>
              )}

              <th className="p-4 font-semibold text-center w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/95">
            {skus.map((sku, index) => {
              const calcs = getRowCalculations(sku);
              return (
                <tr key={index} className="hover:bg-white/5 transition-all duration-150">
                  {/* SKU ID */}
                  <td className="p-2 border-r border-white/5">
                    <input
                      type="text"
                      value={sku.sku_id}
                      onChange={(e) => handleCellChange(index, 'sku_id', e.target.value)}
                      className="bg-transparent w-full text-white border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-semibold font-mono"
                    />
                  </td>
                  {/* Product Name */}
                  <td className="p-2 border-r border-white/5">
                    <input
                      type="text"
                      value={sku.product_name}
                      onChange={(e) => handleCellChange(index, 'product_name', e.target.value)}
                      className="bg-transparent w-full text-white/90 border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1"
                    />
                  </td>

                  {/* Render based on view mode */}
                  {viewMode === 'unit' && (
                    <>
                      {/* Category */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={sku.category}
                          onChange={(e) => handleCellChange(index, 'category', e.target.value)}
                          className="bg-transparent w-full text-white/70 border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1"
                        />
                      </td>
                      {/* Pack Size (grams) */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={sku.pack_size_g}
                          onChange={(e) => handleCellChange(index, 'pack_size_g', parseInt(e.target.value) || 0)}
                          className="bg-transparent w-16 text-right text-purple-300 border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-mono font-medium"
                        />
                        <span className="text-[10px] text-purple-300/40 ml-1">g</span>
                      </td>
                      {/* RM Cost (per gram) */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={sku.rm_cost_per_g}
                          step="0.001"
                          onChange={(e) => handleCellChange(index, 'rm_cost_per_g', parseFloat(e.target.value) || 0)}
                          className="bg-transparent w-20 text-right text-purple-300 border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-mono font-medium"
                        />
                      </td>
                      {/* Base RM Cost */}
                      <td className="p-4 text-right text-purple-300 font-mono">
                        ₹{calcs.baseRmCost.toFixed(2)}
                      </td>
                      {/* Milling Loss */}
                      <td className="p-4 text-right text-purple-300 font-mono">
                        ₹{calcs.millingLossCost.toFixed(2)}
                      </td>
                      {/* Packing Cost */}
                      <td className="p-4 text-right text-purple-300 font-mono">
                        ₹{packingCost.toFixed(2)}
                      </td>
                      {/* Inward Logistics */}
                      <td className="p-4 text-right text-purple-300 font-mono">
                        ₹{calcs.logisticsCost.toFixed(2)}
                      </td>
                      {/* Price */}
                      <td className="p-2 text-right font-semibold">
                        <input
                          type="number"
                          value={sku.price}
                          step="1"
                          onChange={(e) => handleCellChange(index, 'price', parseFloat(e.target.value) || 0)}
                          className="bg-transparent w-20 text-right text-white border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-mono text-xs"
                        />
                      </td>
                      {/* Total COGS Column */}
                      <td className="p-4 text-right bg-purple-950/20 font-mono text-purple-300 font-bold border-x border-white/5">
                        ₹{calcs.cogs.toFixed(2)}
                      </td>
                      {/* Referral Fee */}
                      <td className="p-4 text-right text-amber-300 font-mono">
                        ₹{calcs.baseFeeAmount.toFixed(2)}
                      </td>
                      {/* GST on Fee */}
                      <td className="p-4 text-right text-amber-300 font-mono">
                        ₹{calcs.gstOnFeeAmount.toFixed(2)}
                      </td>
                      {/* TDS */}
                      <td className="p-4 text-right text-rose-300/80 font-mono">
                        ₹{calcs.tdsCost.toFixed(2)}
                      </td>
                      {/* TCS */}
                      <td className="p-4 text-right text-rose-300/80 font-mono">
                        ₹{calcs.tcsCost.toFixed(2)}
                      </td>
                      {/* Sales Return */}
                      <td className="p-4 text-right text-rose-300/80 font-mono">
                        ₹{calcs.salesReturnCost.toFixed(2)}
                      </td>
                      {/* Net Revenue */}
                      <td className="p-4 text-right bg-emerald-950/20 font-mono text-emerald-400 font-bold border-x border-white/5">
                        ₹{calcs.netRevenue.toFixed(2)}
                      </td>
                      {/* Fulfillment Cost */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={sku.fulfillment_cost}
                          step="1"
                          onChange={(e) => handleCellChange(index, 'fulfillment_cost', parseFloat(e.target.value) || 0)}
                          className="bg-transparent w-16 text-right text-white/80 border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-mono"
                        />
                      </td>
                      {/* Ad Spend */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={sku.ad_spend}
                          step="1"
                          onChange={(e) => handleCellChange(index, 'ad_spend', parseFloat(e.target.value) || 0)}
                          className="bg-transparent w-16 text-right text-white/80 border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-mono"
                        />
                      </td>
                      {/* Gross Profit */}
                      <td className="p-4 text-right bg-indigo-950/20 font-mono text-indigo-300 font-medium">
                        ₹{calcs.grossProfit.toFixed(2)}
                      </td>
                      <td className="p-4 text-right bg-indigo-950/20 font-mono font-medium">
                        {getMarginHealthIndicator(calcs.grossMargin)}
                      </td>
                      <td className="p-4 text-right bg-purple-950/30 font-mono text-purple-200 font-bold border-l border-white/10">
                        ₹{calcs.contributionMargin.toFixed(2)}
                      </td>
                      <td className="p-4 text-right bg-purple-950/30 font-mono">
                        {getMarginHealthIndicator(calcs.contributionMarginPct)}
                      </td>
                    </>
                  )}

                  {viewMode === 'mtd' && (
                    <>
                      {/* MTD Volume */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={sku.mtd_units || 0}
                          onChange={(e) => handleCellChange(index, 'mtd_units', parseInt(e.target.value) || 0)}
                          className="bg-transparent w-20 text-right text-purple-300 border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-mono font-semibold"
                        />
                      </td>
                      {/* Selling Price */}
                      <td className="p-4 text-right font-mono text-white/60">₹{sku.price.toFixed(2)}</td>
                      {/* Calculated MTD rows */}
                      <td className="p-4 text-right bg-white/5 font-mono text-emerald-400 font-semibold">
                        ₹{calcs.mtdGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-white/5 font-mono">
                        ₹{calcs.mtdCogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-white/5 font-mono">
                        ₹{calcs.mtdNetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-white/5 font-mono text-indigo-300 font-semibold">
                        ₹{calcs.mtdGrossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-white/5 font-mono text-indigo-300">
                        {getMarginHealthIndicator(calcs.grossMargin)}
                      </td>
                      <td className="p-4 text-right bg-primary/10 font-mono text-primary-foreground font-bold">
                        ₹{calcs.mtdContributionMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-primary/10 font-mono text-primary-foreground">
                        {getMarginHealthIndicator(calcs.contributionMarginPct)}
                      </td>
                    </>
                  )}

                  {viewMode === 'ytd' && (
                    <>
                      {/* YTD Volume */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={sku.ytd_units || 0}
                          onChange={(e) => handleCellChange(index, 'ytd_units', parseInt(e.target.value) || 0)}
                          className="bg-transparent w-24 text-right text-purple-300 border border-transparent focus:border-purple-500 focus:bg-black/40 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-mono font-semibold"
                        />
                      </td>
                      {/* Selling Price */}
                      <td className="p-4 text-right font-mono text-white/60">₹{sku.price.toFixed(2)}</td>
                      {/* Calculated YTD rows */}
                      <td className="p-4 text-right bg-white/5 font-mono text-emerald-400 font-semibold">
                        ₹{calcs.ytdGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-white/5 font-mono">
                        ₹{calcs.ytdCogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-white/5 font-mono">
                        ₹{calcs.ytdNetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-white/5 font-mono text-indigo-300 font-semibold">
                        ₹{calcs.ytdGrossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-white/5 font-mono text-indigo-300">
                        {getMarginHealthIndicator(calcs.grossMargin)}
                      </td>
                      <td className="p-4 text-right bg-primary/10 font-mono text-primary-foreground font-bold">
                        ₹{calcs.ytdContributionMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right bg-primary/10 font-mono text-primary-foreground">
                        {getMarginHealthIndicator(calcs.contributionMarginPct)}
                      </td>
                    </>
                  )}

                  {/* Action */}
                  <td className="p-2 text-center border-l border-white/5">
                    <button 
                      onClick={() => handleDeleteSku(index)}
                      className="p-2 hover:bg-rose-500/20 rounded-lg hover:text-rose-400 text-white/30 transition-all active:scale-90"
                      title="Delete SKU"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Totals Row */}
          <tfoot>
            <tr className="bg-white/10 font-bold border-t border-white/20 text-white text-right shadow-md">
              <td className="p-4 text-left" colSpan={3}>Aggregate Totals</td>
              
              {viewMode === 'unit' && (
                <>
                  <td className="p-4 text-white/50 text-xs">-</td>
                  <td className="p-4 text-white/50 text-xs">-</td>
                  <td className="p-4 font-mono text-purple-300">₹{skus.reduce((sum, s) => sum + getRowCalculations(s).baseRmCost, 0).toFixed(2)}</td>
                  <td className="p-4 font-mono text-purple-300">₹{skus.reduce((sum, s) => sum + getRowCalculations(s).millingLossCost, 0).toFixed(2)}</td>
                  <td className="p-4 font-mono text-purple-300">₹{(packingCost * skus.length).toFixed(2)}</td>
                  <td className="p-4 font-mono text-purple-300">₹{skus.reduce((sum, s) => sum + getRowCalculations(s).logisticsCost, 0).toFixed(2)}</td>
                  <td className="p-4 font-mono">₹{totalBasePrice.toFixed(2)}</td>
                  <td className="p-4 font-mono bg-purple-950/20 text-purple-300 font-bold border-x border-white/5">₹{totalBaseCogs.toFixed(2)}</td>
                  <td className="p-4 font-mono text-amber-300">₹{skus.reduce((sum, s) => sum + getRowCalculations(s).baseFeeAmount, 0).toFixed(2)}</td>
                  <td className="p-4 font-mono text-amber-300">₹{skus.reduce((sum, s) => sum + getRowCalculations(s).gstOnFeeAmount, 0).toFixed(2)}</td>
                  <td className="p-4 font-mono text-rose-300">₹{skus.reduce((sum, s) => sum + getRowCalculations(s).tdsCost, 0).toFixed(2)}</td>
                  <td className="p-4 font-mono text-rose-300">₹{skus.reduce((sum, s) => sum + getRowCalculations(s).tcsCost, 0).toFixed(2)}</td>
                  <td className="p-4 font-mono text-rose-300">₹{skus.reduce((sum, s) => sum + getRowCalculations(s).salesReturnCost, 0).toFixed(2)}</td>
                  <td className="p-4 font-mono bg-emerald-950/20 text-emerald-400 border-x border-white/5">₹{aggregates.netRev.toFixed(2)}</td>
                  <td className="p-4 font-mono">₹{totalBaseFulfill.toFixed(2)}</td>
                  <td className="p-4 font-mono">₹{totalBaseAd.toFixed(2)}</td>
                  <td className="p-4 font-mono bg-indigo-950/20 text-indigo-300">₹{aggregates.gp.toFixed(2)}</td>
                  <td className="p-4 font-mono bg-indigo-950/20 text-indigo-300">{aggregates.gmPct.toFixed(1)}%</td>
                  <td className="p-4 font-mono bg-purple-950/30 text-purple-200 font-bold border-l border-white/10">₹{aggregates.cm.toFixed(2)}</td>
                  <td className="p-4 font-mono bg-purple-950/30 text-purple-200">{aggregates.cmPct.toFixed(1)}%</td>
                </>
              )}

              {viewMode === 'mtd' && (
                <>
                  <td className="p-4 font-mono text-purple-300">{totalMtdUnits.toLocaleString()}</td>
                  <td className="p-4 text-white/50 text-xs">-</td>
                  <td className="p-4 font-mono bg-white/5 text-emerald-400">₹{aggregates.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-white/5">₹{aggregates.cogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-white/5">₹{aggregates.netRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-white/5 text-indigo-300">₹{aggregates.gp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-white/5 text-indigo-300">{aggregates.gmPct.toFixed(1)}%</td>
                  <td className="p-4 font-mono bg-primary/10 text-primary-foreground">₹{aggregates.cm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-primary/10 text-primary-foreground">{aggregates.cmPct.toFixed(1)}%</td>
                </>
              )}

              {viewMode === 'ytd' && (
                <>
                  <td className="p-4 font-mono text-purple-300">{totalYtdUnits.toLocaleString()}</td>
                  <td className="p-4 text-white/50 text-xs">-</td>
                  <td className="p-4 font-mono bg-white/5 text-emerald-400">₹{aggregates.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-white/5">₹{aggregates.cogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-white/5">₹{aggregates.netRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-white/5 text-indigo-300">₹{aggregates.gp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-white/5 text-indigo-300">{aggregates.gmPct.toFixed(1)}%</td>
                  <td className="p-4 font-mono bg-primary/10 text-primary-foreground">₹{aggregates.cm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono bg-primary/10 text-primary-foreground">{aggregates.cmPct.toFixed(1)}%</td>
                </>
              )}
              
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
