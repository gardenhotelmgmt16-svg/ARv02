
import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import { generateRooms } from './constants';
import { ViewType, AdminPage, Booking, Room, RoomType, PaymentMethod, PaymentStatus, MealPlan } from './types';
import RoomCard from './components/RoomCard';
import BookingForm from './components/BookingForm';

const OTA_METHODS = [
  PaymentMethod.TRAVELOKA,
  PaymentMethod.AGODA,
  PaymentMethod.TIKET,
  PaymentMethod.MG_HOLIDAY,
  PaymentMethod.KLIKNBOOK,
  PaymentMethod.TIKTOK,
  PaymentMethod.VOUCHER
];

const getLocalDateString = (date: Date) => {
  return date.toLocaleDateString('en-CA');
};

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      if (username === 'Garden Hotel' && password === 'Garden88') onLogin();
      else { setError('Kredensial tidak valid.'); setIsLoading(false); }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-teal-500 rounded-3xl flex items-center justify-center text-white text-4xl font-black mx-auto mb-6">A</div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">ARv01 <span className="text-teal-500">HMS</span></h1>
          <p className="text-slate-400 font-medium">Hotel Management Access</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-teal-500" placeholder="Username" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-teal-500" placeholder="Password" required />
          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95">
            {isLoading ? 'SIGNING IN...' : 'LOGIN TO HMS'}
          </button>
        </form>
      </div>
    </div>
  );
};

const GuestListRecap: React.FC<{ bookings: Booking[], onEdit: (b: Booking) => void, onUpdate: (b: Booking) => void }> = ({ bookings, onEdit, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const todayStr = getLocalDateString(new Date());
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.noBooking.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDate = (!startDate || b.checkOutDate > startDate) && 
                        (!endDate || b.checkInDate < endDate);
      
      return matchSearch && matchDate;
    }).sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  }, [bookings, searchTerm, startDate, endDate]);

  const summaryStats = useMemo(() => {
    const stats = {
      cash: 0, debit: 0, tf: 0, kredit: 0, qris: 0, compliment: 0,
      traveloka: 0, agoda: 0, tiket: 0, mg: 0, kliknbook: 0, tiktok: 0, voucher: 0
    };

    filtered.forEach(b => {
      const amountPerNight = b.price;
      if (b.paymentStatus === PaymentStatus.CASH) stats.cash += amountPerNight;
      else if (b.paymentStatus === PaymentStatus.DEBIT) stats.debit += amountPerNight;
      else if (b.paymentStatus === PaymentStatus.TF) stats.tf += amountPerNight;
      else if (b.paymentStatus === PaymentStatus.KREDIT) stats.kredit += amountPerNight;
      else if (b.paymentStatus === PaymentStatus.QRIS) stats.qris += amountPerNight;
      else if (b.paymentStatus === PaymentStatus.COMPLIMENT) stats.compliment += amountPerNight;

      if (b.paymentMethod === PaymentMethod.TRAVELOKA) stats.traveloka += amountPerNight;
      else if (b.paymentMethod === PaymentMethod.AGODA) stats.agoda += amountPerNight;
      else if (b.paymentMethod === PaymentMethod.TIKET) stats.tiket += amountPerNight;
      else if (b.paymentMethod === PaymentMethod.MG_HOLIDAY) stats.mg += amountPerNight;
      else if (b.paymentMethod === PaymentMethod.KLIKNBOOK) stats.kliknbook += amountPerNight;
      else if (b.paymentMethod === PaymentMethod.TIKTOK) stats.tiktok += amountPerNight;
      else if (b.paymentMethod === PaymentMethod.VOUCHER) stats.voucher += amountPerNight;
    });

    return stats;
  }, [filtered]);

  const exportToExcel = () => {
    const reportRows = [
      ["GUEST LIST RECAP & REVENUE SUMMARY"],
      [`Periode: ${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}`],
      [],
      ["SUMMARY PEMASUKAN PER STATUS PAYMENT (HARGA / NIGHT)"],
      ["Status", "Total Nominal (IDR)"],
      ["Cash", summaryStats.cash],
      ["Debit", summaryStats.debit],
      ["TF", summaryStats.tf],
      ["Kredit", summaryStats.kredit],
      ["Qris", summaryStats.qris],
      ["Compliment", summaryStats.compliment],
      [],
      ["SUMMARY PEMASUKAN PER OTA / VOUCHER (HARGA / NIGHT)"],
      ["Metode", "Total Nominal (IDR)"],
      ["Traveloka", summaryStats.traveloka],
      ["Agoda", summaryStats.agoda],
      ["Tiket", summaryStats.tiket],
      ["MG Holiday", summaryStats.mg],
      ["KliknBook", summaryStats.kliknbook],
      ["Tiktok", summaryStats.tiktok],
      ["Voucher", summaryStats.voucher],
      [],
      ["DETAIL DATA TAMU"],
      [
        "ID Booking", "Guest Name", "Phone", "Room", "Type", 
        "Jam Check In", "Jam Check Out", "Check In Date", "Check Out Date",
        "Harga / Night", "Nights", "Total Stay", "Status Payment", "Payment Method", "Notes"
      ]
    ];

    filtered.forEach(b => {
      reportRows.push([
        b.noBooking,
        b.guestName,
        b.phone,
        b.roomNumber,
        b.roomType,
        b.checkInTime || "14:00",
        b.checkOutTime || "12:00",
        b.checkInDate,
        b.checkOutDate,
        b.price,
        b.nights,
        b.price * b.nights,
        b.paymentStatus,
        b.paymentMethod,
        b.notes || ""
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(reportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Full Report Recap");
    XLSX.writeFile(workbook, `Report_HMS_${getLocalDateString(new Date())}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Guest List Recap</h1>
          <p className="text-slate-500 font-medium mt-1">Laporan lengkap data tamu dan reservasi (Filter berdasarkan masa inap).</p>
        </div>
        <button onClick={exportToExcel} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center gap-2">
          <span>📊</span> Export Full Report
        </button>
      </header>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cari Tamu / ID</label>
            <input 
              type="text" 
              placeholder="Nama tamu atau nomor booking..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dari Tanggal (In-Stay)</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sampai Tanggal (In-Stay)</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Summary Pemasukan per Status Payment (Harga / Night)</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Cash', val: summaryStats.cash, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Debit', val: summaryStats.debit, color: 'bg-blue-50 text-blue-600' },
                { label: 'TF', val: summaryStats.tf, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Kredit', val: summaryStats.kredit, color: 'bg-rose-50 text-rose-600' },
                { label: 'Qris', val: summaryStats.qris, color: 'bg-amber-50 text-amber-600' },
                { label: 'Compliment', val: summaryStats.compliment, color: 'bg-slate-50 text-slate-600' },
              ].map(item => (
                <div key={item.label} className={`px-4 py-3 rounded-2xl flex flex-col gap-1 border border-current/10 ${item.color} min-w-[130px]`}>
                  <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{item.label}</span>
                  <span className="font-black text-sm whitespace-nowrap">Rp {item.val.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Summary Pemasukan per OTA / Voucher (Harga / Night)</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Traveloka', val: summaryStats.traveloka, color: 'bg-slate-50 text-slate-600' },
                { label: 'Agoda', val: summaryStats.agoda, color: 'bg-slate-50 text-slate-600' },
                { label: 'Tiket', val: summaryStats.tiket, color: 'bg-slate-50 text-slate-600' },
                { label: 'MG Holiday', val: summaryStats.mg, color: 'bg-slate-50 text-slate-600' },
                { label: 'KliknBook', val: summaryStats.kliknbook, color: 'bg-slate-50 text-slate-600' },
                { label: 'Tiktok', val: summaryStats.tiktok, color: 'bg-slate-50 text-slate-600' },
                { label: 'Voucher', val: summaryStats.voucher, color: 'bg-teal-50 text-teal-600' },
              ].map(item => (
                <div key={item.label} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-100 ${item.color}`}>
                  <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                  <span className="font-black text-xs">Rp {item.val.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">ID Booking</th>
                <th className="px-6 py-5">Guest Name</th>
                <th className="px-6 py-5">Phone</th>
                <th className="px-6 py-5">Room</th>
                <th className="px-6 py-5">Jam Check In</th>
                <th className="px-6 py-5">Jam Check Out</th>
                <th className="px-6 py-5 text-right">Harga / Night</th>
                <th className="px-6 py-5">Status Payment</th>
                <th className="px-6 py-5">Payment Method</th>
                <th className="px-6 py-5">Notes</th>
                <th className="px-6 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="px-6 py-20 text-center text-slate-400 italic">Data tidak ditemukan dalam rentang ini.</td></tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-mono text-xs font-bold text-teal-600">{b.noBooking}</td>
                    <td className="px-6 py-5 font-bold text-slate-800">{b.guestName}</td>
                    <td className="px-6 py-5 text-slate-500 font-medium">{b.phone}</td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-700">{b.roomNumber}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{b.roomType}</div>
                    </td>
                    <td className="px-6 py-5 text-slate-700 font-bold">{b.checkInTime || '14:00'}</td>
                    <td className="px-6 py-5 text-slate-700 font-bold">
                      <input 
                        type="text" 
                        value={b.checkOutTime || ''} 
                        onChange={e => onUpdate({...b, checkOutTime: e.target.value})}
                        placeholder="12:00 / LATE"
                        className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-700 transition-all hover:bg-white"
                      />
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">Rp {b.price.toLocaleString()}</td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded text-[10px] font-black uppercase tracking-tighter">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-black uppercase tracking-tighter">
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-5 max-w-[200px] truncate text-slate-400 italic" title={b.notes}>
                      {b.notes || "-"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => onEdit(b)} className="p-2 text-slate-400 hover:text-teal-600 transition-all">✏️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BreakfastRecap: React.FC<{ bookings: Booking[], onUpdate: (b: Booking) => void }> = ({ bookings, onUpdate }) => {
  const [targetDate, setTargetDate] = useState(getLocalDateString(new Date()));

  const breakfastList = useMemo(() => {
    return bookings.filter(b => {
      return b.checkInDate <= targetDate && b.checkOutDate > targetDate;
    }).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }, [bookings, targetDate]);

  const summary = useMemo(() => {
    return {
      totalRooms: breakfastList.length,
      totalPax: breakfastList.reduce((acc, b) => acc + b.qtyPax, 0),
      rbfCount: breakfastList.filter(b => b.mealPlan === MealPlan.RBF).length,
      roCount: breakfastList.filter(b => b.mealPlan === MealPlan.RO).length,
    };
  }, [breakfastList]);

  const exportToExcel = () => {
    const data = breakfastList.map(b => ({
      "Nama Tamu": b.guestName,
      "No Kamar": b.roomNumber,
      "Pax": b.qtyPax,
      "Plan": b.mealPlan,
      "Jam In": b.checkInTime || "14:00",
      "Catatan": b.breakfastNotes || ""
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Breakfast Recap");
    XLSX.writeFile(workbook, `Rekap_Breakfast_${targetDate}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Breakfast Manifest</h1>
          <p className="text-slate-500 font-medium mt-1">Daily guest list for F&B department.</p>
        </div>
        <div className="flex gap-4 items-end">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Select Date</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="font-bold text-slate-700 outline-none" />
          </div>
          <button onClick={exportToExcel} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
            📊 Export for Kitchen
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Rooms', val: summary.totalRooms, color: 'bg-blue-500', icon: '🏨' },
          { label: 'Total Pax (Kitchen Qty)', val: summary.totalPax, color: 'bg-teal-500', icon: '🍳' },
          { label: 'Plan RBF', val: summary.rbfCount, color: 'bg-emerald-500', icon: '🍽️' },
          { label: 'Plan RO', val: summary.roCount, color: 'bg-amber-500', icon: '❌' },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 ${s.color} text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-current/20`}>{s.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-xl font-black text-slate-900">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Nama Tamu</th>
                <th className="px-6 py-5">No Kamar</th>
                <th className="px-6 py-5 text-center">Qty/Pax</th>
                <th className="px-6 py-5">Meal Plan</th>
                <th className="px-6 py-5">Notes (Isi Manual)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakfastList.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-slate-800">{b.guestName}</td>
                  <td className="px-6 py-5"><span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-xs">{b.roomNumber}</span></td>
                  <td className="px-6 py-5 text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black mx-auto text-slate-700">{b.qtyPax}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded text-[10px] font-black ${b.mealPlan === MealPlan.RBF ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                      {b.mealPlan}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <input 
                      type="text" 
                      value={b.breakfastNotes || ""} 
                      onChange={e => onUpdate({...b, breakfastNotes: e.target.value})}
                      placeholder="Catatan kitchen..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                    />
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

const OTAReport: React.FC<{ bookings: Booking[], onEdit: (b: Booking) => void }> = ({ bookings, onEdit }) => {
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedOTA, setSelectedOTA] = useState<string>('ALL');

  const reportData = useMemo(() => {
    return bookings.filter(b => {
      const isOTA = OTA_METHODS.includes(b.paymentMethod);
      const isSameMonth = b.checkInDate.startsWith(filterMonth);
      const isSameOTA = selectedOTA === 'ALL' || b.paymentMethod === selectedOTA;
      return isOTA && isSameMonth && isSameOTA;
    }).sort((a, b) => b.checkInDate.localeCompare(a.checkInDate));
  }, [bookings, filterMonth, selectedOTA]);

  const stats = useMemo(() => {
    const totalRevenue = reportData.reduce((sum, b) => sum + (b.price * b.nights), 0);
    return {
      count: reportData.length,
      revenue: totalRevenue
    };
  }, [reportData]);

  const exportToExcel = () => {
    const data = reportData.map(b => ({
      "ID Booking": b.noBooking,
      "OTA Source": b.paymentMethod,
      "Guest Name": b.guestName,
      "Room": b.roomNumber,
      "Phone": b.phone,
      "Check In": b.checkInDate,
      "Check Out": b.checkOutDate,
      "Price / Night": b.price,
      "Status Payment": b.paymentStatus,
      "Total Revenue": b.price * b.nights,
      "Notes": b.notes || ""
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OTA Production");
    XLSX.writeFile(workbook, `OTA_Report_${filterMonth}_${selectedOTA}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">OTA Production Report</h1>
          <p className="text-slate-500 font-medium mt-1">Laporan produksi dan performa Online Travel Agent.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="font-bold text-slate-700 outline-none" />
          </div>
          <button onClick={exportToExcel} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
            📊 Export OTA Data
          </button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Sumber OTA</label>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedOTA('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedOTA === 'ALL' ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            All OTAs
          </button>
          {OTA_METHODS.filter(m => m !== PaymentMethod.VOUCHER).map(ota => (
            <button 
              key={ota}
              onClick={() => setSelectedOTA(ota)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedOTA === ota ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {ota}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-teal-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">📅</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total OTA Bookings</p>
            <p className="text-xl font-black text-slate-900">{stats.count}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">💰</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OTA Revenue (Monthly)</p>
            <p className="text-xl font-black text-slate-900">Rp {stats.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">ID Booking</th>
                <th className="px-6 py-5">Guest Name</th>
                <th className="px-6 py-5">Room</th>
                <th className="px-6 py-5">Phone</th>
                <th className="px-6 py-5">Check In</th>
                <th className="px-6 py-5">Check Out</th>
                <th className="px-6 py-5 text-right">Harga / Night</th>
                <th className="px-6 py-5">Status Payment</th>
                <th className="px-6 py-5">Payment Method</th>
                <th className="px-6 py-5">Notes</th>
                <th className="px-6 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {reportData.length === 0 ? (
                <tr><td colSpan={11} className="px-6 py-20 text-center text-slate-400 italic">Tidak ada data OTA untuk filter ini.</td></tr>
              ) : (
                reportData.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-mono text-xs font-bold text-teal-600">{b.noBooking}</td>
                    <td className="px-6 py-5 font-bold text-slate-800">{b.guestName}</td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-700">{b.roomNumber}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{b.roomType}</div>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-medium">{b.phone}</td>
                    <td className="px-6 py-5 text-slate-700 font-bold">{b.checkInDate}</td>
                    <td className="px-6 py-5 text-slate-700 font-bold">{b.checkOutDate}</td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">Rp {b.price.toLocaleString()}</td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded text-[10px] font-black uppercase tracking-tighter">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-black uppercase tracking-tighter">
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-5 max-w-[150px] truncate text-slate-400 italic" title={b.notes}>
                      {b.notes || "-"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => onEdit(b)} className="p-2 text-slate-400 hover:text-teal-600 transition-all">✏️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPage, setAdminPage] = useState<AdminPage>('DASHBOARD');
  const [rooms] = useState<Room[]>(generateRooms());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [systemTime, setSystemTime] = useState(new Date());
  
  const todayStr = getLocalDateString(new Date());
  const [roomStatusSearchIn, setRoomStatusSearchIn] = useState(todayStr);
  const [roomStatusSearchOut, setRoomStatusSearchOut] = useState(getLocalDateString(new Date(new Date().setDate(new Date().getDate() + 1))));

  useEffect(() => { const timer = setInterval(() => setSystemTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  const handleSaveBooking = (booking: Booking) => {
    setBookings(prev => {
      const exists = prev.find(b => b.id === booking.id);
      if (exists) return prev.map(b => b.id === booking.id ? booking : b);
      return [...prev, booking];
    });
    setEditingBooking(null);
  };

  const roomStatusMap = useMemo(() => {
    const statuses: Record<string, { occupied: boolean, reserved: boolean }> = {};
    rooms.forEach(r => statuses[r.number] = { occupied: false, reserved: false });
    const searchStart = roomStatusSearchIn;
    const searchEnd = roomStatusSearchOut || searchStart;
    
    bookings.forEach(b => {
      if (b.checkInDate < searchEnd && b.checkOutDate > searchStart) {
        if (statuses[b.roomNumber]) statuses[b.roomNumber].occupied = true;
      }
      const [y, m, d] = searchStart.split('-').map(Number);
      const nextDayStr = getLocalDateString(new Date(y, m - 1, d + 1));
      if (b.checkInDate === nextDayStr) {
        if (statuses[b.roomNumber]) statuses[b.roomNumber].reserved = true;
      }
    });
    return statuses;
  }, [bookings, rooms, roomStatusSearchIn, roomStatusSearchOut]);

  const stats = useMemo(() => {
    const statusValues = Object.values(roomStatusMap);
    const occupiedCount = statusValues.filter(s => s.occupied).length;
    return { 
      total: rooms.length, 
      occupied: occupiedCount, 
      revenue: bookings.reduce((sum, b) => sum + (b.price * b.nights), 0) 
    };
  }, [rooms, roomStatusMap, bookings]);

  if (!isAuthenticated) return <LoginPage onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen font-['Inter']">
      <div className="flex">
        <aside className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col p-4 z-20 shadow-2xl">
          <div className="flex items-center gap-3 px-2 py-6 mb-8 border-b border-slate-800">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black text-xl">A</div>
            <h1 className="text-xl font-black text-white tracking-tighter">ARv01 <span className="text-teal-500">HMS</span></h1>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
            {[
              { id: 'DASHBOARD', icon: '📊', label: 'Dashboard' },
              { id: 'ROOMS', icon: '🏨', label: 'Room Status' },
              { id: 'BOOKINGS', icon: '📋', label: 'Bookings' },
              { id: 'GUEST_LIST', icon: '👥', label: 'Guest List' },
              { id: 'BREAKFAST', icon: '🍳', label: 'Breakfast' },
              { id: 'REPORTS', icon: '📉', label: 'OTA Report' },
              { id: 'NEW_BOOKING', icon: '➕', label: 'New Reservation' }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setAdminPage(item.id as AdminPage)} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${adminPage === item.id ? 'bg-teal-600 text-white shadow-xl translate-x-1' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <span className="text-lg">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className="pt-8 border-t border-slate-800">
            <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors"><span>🚪</span> Logout</button>
          </div>
        </aside>

        <main className="flex-1 p-10 bg-slate-50/50 min-h-screen">
          {adminPage === 'DASHBOARD' && (
            <div className="space-y-8">
              <header><h1 className="text-3xl font-black text-slate-900 tracking-tight">Operational Insights</h1></header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Rooms', val: stats.total, color: 'bg-blue-600' },
                  { label: 'Occupied', val: stats.occupied, color: 'bg-rose-600' },
                  { label: 'Revenue', val: `Rp ${stats.revenue.toLocaleString()}`, color: 'bg-emerald-600' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="text-2xl font-black text-slate-900">{stat.val}</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminPage === 'ROOMS' && (
            <div className="space-y-12">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Hotel Status</h1></div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex gap-4">
                  <input type="date" value={roomStatusSearchIn} onChange={e => setRoomStatusSearchIn(e.target.value)} className="px-4 py-2 border rounded-xl text-xs font-bold" />
                  <input type="date" value={roomStatusSearchOut} onChange={e => setRoomStatusSearchOut(e.target.value)} className="px-4 py-2 border rounded-xl text-xs font-bold" />
                </div>
              </header>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {rooms.map(room => (
                  <RoomCard key={room.number} room={room} isBooked={roomStatusMap[room.number]?.occupied} isReserved={roomStatusMap[room.number]?.reserved} />
                ))}
              </div>
            </div>
          )}

          {adminPage === 'BOOKINGS' && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
               <h2 className="text-xl font-bold mb-4">Reservation List</h2>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-400">
                     <tr>
                       <th className="px-4 py-3">Booking ID</th>
                       <th className="px-4 py-3">Guest</th>
                       <th className="px-4 py-3">Phone</th>
                       <th className="px-4 py-3">Room</th>
                       <th className="px-4 py-3">Check In</th>
                       <th className="px-4 py-3">Check Out</th>
                       <th className="px-4 py-3 text-right">Harga / Night</th>
                       <th className="px-4 py-3">Status Payment</th>
                       <th className="px-4 py-3">Payment Method</th>
                       <th className="px-4 py-3">Notes</th>
                       <th className="px-4 py-3">Aksi</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {bookings.map(b => (
                       <tr key={b.id}>
                         <td className="px-4 py-3 font-mono text-xs font-bold text-teal-600">{b.noBooking}</td>
                         <td className="px-4 py-3 font-bold text-slate-800">{b.guestName}</td>
                         <td className="px-4 py-3 text-slate-500">{b.phone}</td>
                         <td className="px-4 py-3">
                           <div className="font-bold">{b.roomNumber}</div>
                           <div className="text-[9px] uppercase text-slate-400 font-bold">{b.roomType}</div>
                         </td>
                         <td className="px-4 py-3 text-slate-700">{b.checkInDate}</td>
                         <td className="px-4 py-3 text-slate-700">{b.checkOutDate}</td>
                         <td className="px-4 py-3 text-right font-black">Rp {b.price.toLocaleString()}</td>
                         <td className="px-4 py-3">
                           <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">
                             {b.paymentStatus}
                           </span>
                         </td>
                         <td className="px-4 py-3">
                           <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-teal-50 border border-teal-100 rounded text-teal-700">
                             {b.paymentMethod}
                           </span>
                         </td>
                         <td className="px-4 py-3 max-w-[150px] truncate text-slate-400 italic" title={b.notes}>{b.notes || "-"}</td>
                         <td className="px-4 py-3">
                           <button onClick={() => {setEditingBooking(b); setAdminPage('NEW_BOOKING');}} className="text-teal-600 hover:bg-teal-50 p-2 rounded-lg transition-colors font-bold text-lg" title="Edit">✏️</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {adminPage === 'GUEST_LIST' && <GuestListRecap bookings={bookings} onEdit={(b) => {setEditingBooking(b); setAdminPage('NEW_BOOKING');}} onUpdate={handleSaveBooking} />}
          {adminPage === 'BREAKFAST' && <BreakfastRecap bookings={bookings} onUpdate={handleSaveBooking} />}
          {adminPage === 'REPORTS' && <OTAReport bookings={bookings} onEdit={(b) => {setEditingBooking(b); setAdminPage('NEW_BOOKING');}} />}
          {adminPage === 'NEW_BOOKING' && <BookingForm rooms={rooms} initialData={editingBooking || undefined} onSave={(b) => { handleSaveBooking(b); setAdminPage('BOOKINGS'); }} onCancel={() => setAdminPage('BOOKINGS')} />}
        </main>
      </div>
    </div>
  );
};

export default App;
