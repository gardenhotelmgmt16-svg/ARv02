
import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import { generateRooms } from './constants';
import { ViewType, AdminPage, Booking, Room, RoomType, PaymentMethod } from './types';
import RoomCard from './components/RoomCard';
import BookingForm from './components/BookingForm';

const OTA_METHODS = [
  PaymentMethod.TRAVELOKA,
  PaymentMethod.AGODA,
  PaymentMethod.TIKET,
  PaymentMethod.MG_HOLIDAY,
  PaymentMethod.KLIKNBOOK,
  PaymentMethod.TIKTOK
];

interface BookingListProps {
  filteredBookings: Booking[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  startDate: string;
  endDate: string;
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
  exportToExcel: () => void;
  handleEditClick: (b: Booking) => void;
  handleDeleteClick: (id: string) => void;
  handleViewClick: (b: Booking) => void;
  setAdminPage: (page: AdminPage) => void;
  setEditingBooking: (b: Booking | null) => void;
}

const BookingList: React.FC<BookingListProps> = ({ 
  filteredBookings, 
  searchTerm, 
  setSearchTerm, 
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  exportToExcel, 
  handleEditClick,
  handleDeleteClick,
  handleViewClick,
  setAdminPage, 
  setEditingBooking 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Booking Management</h2>
              <p className="text-xs text-slate-400 mt-1">Found {filteredBookings.length} results</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <span>📊</span> Export Excel
              </button>
              <button 
                onClick={() => {
                  setEditingBooking(null);
                  setAdminPage('NEW_BOOKING');
                }}
                className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all active:scale-95"
              >
                + New Booking
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-5 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500">🔍</span>
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search guest name or booking ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Check In From</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Check Out To</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="lg:col-span-1">
              <button 
                onClick={clearFilters}
                title="Reset Filters"
                className="w-full py-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors text-sm font-bold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Booking Info</th>
              <th className="px-6 py-4">Guest Info</th>
              <th className="px-6 py-4">Room Detail</th>
              <th className="px-6 py-4">Price/Night</th>
              <th className="px-6 py-4">Financial</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Notes</th>
              <th className="px-6 py-4 text-center">Actions</th>
              <th className="px-6 py-4">Reservasi By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-24 text-slate-400">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4">🔍</div>
                    <p className="text-lg font-medium text-slate-600">No matching bookings</p>
                    <p className="text-sm">Try adjusting your filters or search term</p>
                  </div>
                </td>
              </tr>
            ) : filteredBookings.map(b => (
              <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-700">{b.noBooking}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{b.bookingDate}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800">{b.guestName}</div>
                  <div className="text-xs text-slate-500">{b.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-bold text-slate-700">Room {b.roomNumber}</div>
                  <div className="text-xs text-slate-500">{b.roomType} • {b.nights} Nights • {b.mealPlan}</div>
                  <div className="text-[10px] text-teal-600 font-bold mt-1">
                    {b.checkInDate} <span className="text-slate-300 mx-1">→</span> {b.checkOutDate}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  Rp {b.price.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-teal-700">Rp {(b.price * b.nights).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{b.paymentMethod}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase rounded-full border border-teal-100">
                    {b.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 max-w-[150px] truncate" title={b.notes}>
                  {b.notes || <span className="text-slate-300 italic">No notes</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => handleEditClick(b)}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all active:scale-90"
                      title="Edit Booking"
                    >
                      <span className="text-lg">✏️</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(b.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                      title="Delete Booking"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                    <button 
                      onClick={() => handleViewClick(b)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                      title="View Details"
                    >
                      <span className="text-lg">👁️</span>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  {b.reservationBy || <span className="text-slate-300">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OTAReport: React.FC<{ bookings: Booking[], onUpdateBooking: (b: Booking) => void }> = ({ bookings, onUpdateBooking }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedOTA, setSelectedOTA] = useState<string>('ALL');
  const [reportMode, setReportMode] = useState<'SUMMARY' | 'GUESTS'>('SUMMARY');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const otaData = useMemo(() => {
    const report: Record<string, Record<string, number>> = {};

    months.forEach(m => {
      report[m] = {};
      OTA_METHODS.forEach(ota => {
        report[m][ota] = 0;
      });
    });

    bookings.forEach(b => {
      const date = new Date(b.checkInDate);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];

      if (year === selectedYear && OTA_METHODS.includes(b.paymentMethod)) {
        report[monthName][b.paymentMethod] += (b.price * b.nights);
      }
    });

    return report;
  }, [bookings, selectedYear]);

  const otaGuests = useMemo(() => {
    return bookings.filter(b => {
      const date = new Date(b.checkInDate);
      const isYearMatch = date.getFullYear() === selectedYear;
      const isMonthMatch = selectedMonth === -1 || date.getMonth() === selectedMonth;
      const isOTAMatch = selectedOTA === 'ALL' || b.paymentMethod === selectedOTA;
      return isYearMatch && isMonthMatch && isOTAMatch && OTA_METHODS.includes(b.paymentMethod);
    }).sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());
  }, [bookings, selectedYear, selectedMonth, selectedOTA]);

  const totalPerOTA = useMemo(() => {
    const totals: Record<string, number> = {};
    OTA_METHODS.forEach(ota => {
      totals[ota] = 0;
      Object.values(otaData).forEach(monthObj => {
        const mObj = monthObj as Record<string, number>;
        totals[ota] += mObj[ota];
      });
    });
    return totals;
  }, [otaData]);

  const grandTotal = (Object.values(totalPerOTA) as number[]).reduce((a, b) => a + b, 0);

  const exportSummaryToExcel = () => {
    const dataForExcel = months.map(m => {
      const row: any = { "Month": m };
      let monthlySum = 0;
      OTA_METHODS.forEach(ota => {
        const val = otaData[m][ota];
        row[ota] = val;
        monthlySum += val;
      });
      row["Total"] = monthlySum;
      return row;
    });

    const footerRow: any = { "Month": "GRAND TOTAL" };
    OTA_METHODS.forEach(ota => {
      footerRow[ota] = totalPerOTA[ota];
    });
    footerRow["Total"] = grandTotal;
    dataForExcel.push(footerRow);

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OTA Monthly Revenue");
    XLSX.writeFile(workbook, `OTA_Revenue_Summary_${selectedYear}.xlsx`);
  };

  const exportGuestRecapToExcel = () => {
    const dataForExcel = otaGuests.map(b => ({
      "Check In Date": b.checkInDate,
      "Check Out Date": b.checkOutDate,
      "Month": months[new Date(b.checkInDate).getMonth()],
      "OTA Source": b.paymentMethod,
      "Booking ID": b.noBooking,
      "Guest Name": b.guestName,
      "Room": `${b.roomNumber} (${b.roomType})`,
      "Stay (Nights)": b.nights,
      "Rate/Night": b.price,
      "Total Revenue": b.price * b.nights,
      "Payment Status": b.paymentStatus,
      "Notes": b.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OTA Guest Recap");
    const monthSuffix = selectedMonth === -1 ? "FullYear" : months[selectedMonth];
    const otaSuffix = selectedOTA === 'ALL' ? 'AllChannels' : selectedOTA.replace(/\s+/g, '');
    XLSX.writeFile(workbook, `OTA_Guests_${otaSuffix}_${monthSuffix}_${selectedYear}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">OTA Performance Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Analytics and guest recaps for Online Travel Agencies.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex bg-slate-200 p-1 rounded-xl">
            <button 
              onClick={() => setReportMode('SUMMARY')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${reportMode === 'SUMMARY' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
            >
              Revenue Summary
            </button>
            <button 
              onClick={() => setReportMode('GUESTS')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${reportMode === 'GUESTS' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
            >
              Guest Recap
            </button>
          </div>
          
          <div className="flex gap-2 items-center">
             {reportMode === 'GUESTS' && (
               <>
                 <select 
                   value={selectedOTA}
                   onChange={(e) => setSelectedOTA(e.target.value)}
                   className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 text-sm min-w-[140px]"
                 >
                   <option value="ALL">All Channels</option>
                   {OTA_METHODS.map(ota => <option key={ota} value={ota}>{ota}</option>)}
                 </select>

                 <select 
                   value={selectedMonth} 
                   onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                   className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                 >
                   <option value={-1}>All Months</option>
                   {months.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
                 </select>
               </>
             )}
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button 
            onClick={reportMode === 'SUMMARY' ? exportSummaryToExcel : exportGuestRecapToExcel}
            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95"
          >
            <span>📥</span> Export {reportMode === 'SUMMARY' ? 'Summary' : 'Guest List'}
          </button>
        </div>
      </header>

      {reportMode === 'SUMMARY' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {OTA_METHODS.map(ota => (
              <div key={ota} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{ota}</p>
                <p className="text-lg font-black text-slate-900">Rp {totalPerOTA[ota].toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Grand Total OTA Revenue ({selectedYear})</p>
              <h2 className="text-4xl font-black">Rp {grandTotal.toLocaleString()}</h2>
            </div>
            <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center text-3xl">💹</div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800">Monthly Revenue Breakdown</h3>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Values in IDR</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-4">Month</th>
                    {OTA_METHODS.map(ota => <th key={ota} className="px-6 py-4">{ota}</th>)}
                    <th className="px-6 py-4 text-right">Monthly Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {months.map(m => {
                    const monthTotal = OTA_METHODS.reduce((sum, ota) => sum + otaData[m][ota], 0);
                    return (
                      <tr key={m} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{m}</td>
                        {OTA_METHODS.map(ota => (
                          <td key={ota} className="px-6 py-4 font-medium text-slate-500">
                            {otaData[m][ota] > 0 ? `Rp ${otaData[m][ota].toLocaleString()}` : '-'}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right font-black text-teal-700">
                          Rp {monthTotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold">
                  <tr>
                    <td className="px-6 py-5">GRAND TOTAL</td>
                    {OTA_METHODS.map(ota => (
                      <td key={ota} className="px-6 py-5">Rp {totalPerOTA[ota].toLocaleString()}</td>
                    ))}
                    <td className="px-6 py-5 text-right text-teal-400">
                      Rp {grandTotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
               <h3 className="font-black text-slate-800">OTA Monthly Guest Recap</h3>
               <div className="flex gap-2">
                 <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-[10px] font-black">
                   {selectedOTA === 'ALL' ? 'All Channels' : selectedOTA}
                 </span>
                 <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black">
                   {selectedMonth === -1 ? 'Full Year' : months[selectedMonth]} {selectedYear}
                 </span>
               </div>
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Total {otaGuests.length} Bookings Found
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Guest Name</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4 text-center">Nights</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                  <th className="px-6 py-4">Notes (Manual)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {otaGuests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-20 text-slate-400 italic">
                      No OTA reservations found matching these filters.
                    </td>
                  </tr>
                ) : (
                  otaGuests.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {b.checkInDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-tighter">
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                        {b.noBooking}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {b.guestName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-xs">Rm {b.roomNumber}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{b.roomType}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-600">
                        {b.nights}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-teal-700">
                        Rp {(b.price * b.nights).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <input 
                          type="text" 
                          value={b.notes || ''} 
                          onChange={(e) => {
                            onUpdateBooking({ ...b, notes: e.target.value });
                          }}
                          placeholder="Add info..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-600"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}> = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">⚠️</div>
        <h3 className="text-xl font-black text-slate-900 text-center mb-2">Konfirmasi</h3>
        <p className="text-slate-500 text-center font-medium mb-8">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onCancel}
            className="py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors active:scale-95"
          >
            Tidak
          </button>
          <button 
            onClick={onConfirm}
            className="py-3 px-6 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-colors active:scale-95"
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewBookingModal: React.FC<{
  booking: Booking | null;
  onClose: () => void;
}> = ({ booking, onClose }) => {
  if (!booking) return null;

  const total = booking.price * booking.nights;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-slate-100">
        {/* Compact Header - Ticket Style */}
        <div className="bg-slate-900 px-6 py-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-sm"
            title="Close"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-teal-500 text-white rounded text-[9px] font-black uppercase tracking-widest">Reservation</span>
            <span className="font-mono text-[10px] text-slate-400">#{booking.noBooking}</span>
          </div>
          <h2 className="text-xl font-black tracking-tight leading-tight">{booking.guestName}</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{booking.phone}</p>
        </div>

        {/* Card Content */}
        <div className="p-6 bg-white space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room</span>
              <span className="text-2xl font-black text-slate-900">{booking.roomNumber}</span>
              <span className="text-[10px] font-bold text-teal-600 uppercase">{booking.roomType}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</span>
              <span className="text-2xl font-black text-slate-900">{booking.nights}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Night(s)</span>
            </div>
          </div>

          {/* Date Range Block */}
          <div className="flex items-center justify-between px-4 py-3 bg-teal-50 rounded-2xl border border-teal-100">
            <div className="text-center">
              <p className="text-[9px] font-black text-teal-600 uppercase mb-0.5">Check-In</p>
              <p className="text-xs font-black text-teal-900">{booking.checkInDate}</p>
            </div>
            <div className="h-6 w-[1px] bg-teal-200"></div>
            <div className="text-center">
              <p className="text-[9px] font-black text-teal-600 uppercase mb-0.5">Check-Out</p>
              <p className="text-xs font-black text-teal-900">{booking.checkOutDate}</p>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Plan</span>
              <span className="font-black text-slate-700">{booking.mealPlan} • {booking.qtyPax} Pax</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Source</span>
              <span className="font-black text-slate-700">{booking.paymentMethod}</span>
            </div>
            <div className="pt-3 border-t border-slate-50 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Total Payment</p>
                <p className="text-lg font-black text-slate-900">Rp {total.toLocaleString()}</p>
              </div>
              <span className="px-2 py-1 bg-teal-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm">
                {booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Notes Segment */}
          {booking.notes && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
              <p className="text-[9px] font-black text-amber-600 uppercase mb-1">Special Notes</p>
              <p className="text-[11px] font-medium text-amber-900 italic leading-snug">"{booking.notes}"</p>
            </div>
          )}
        </div>

        {/* Footer / Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
           <div className="flex justify-between text-[9px] font-bold text-slate-400 px-1 opacity-60">
             <span>Reserved By: {booking.reservationBy || "Direct"}</span>
             <span>ID: {booking.id.toUpperCase().slice(0, 6)}</span>
           </div>
           <button 
             onClick={onClose}
             className="w-full py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20 text-xs uppercase tracking-widest"
           >
             Close Detail
           </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('ADMIN');
  const [adminPage, setAdminPage] = useState<AdminPage>('DASHBOARD');
  const [rooms] = useState<Room[]>(generateRooms());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  
  // Search Filters for Bookings
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Search Filters for Room Status
  const [roomStatusSearchIn, setRoomStatusSearchIn] = useState('');
  const [roomStatusSearchOut, setRoomStatusSearchOut] = useState('');

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const handleSaveBooking = (booking: Booking) => {
    setBookings(prev => {
      const exists = prev.find(b => b.id === booking.id);
      if (exists) {
        return prev.map(b => b.id === booking.id ? booking : b);
      }
      return [...prev, booking];
    });
    setEditingBooking(null);
  };

  const openDeleteConfirmation = (id: string) => {
    setBookingToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteBooking = () => {
    if (bookingToDelete) {
      setBookings(prev => prev.filter(b => b.id !== bookingToDelete));
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    }
  };

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);
    setAdminPage('NEW_BOOKING');
  };

  const handleViewClick = (booking: Booking) => {
    setViewingBooking(booking);
  };

  const roomStatusMap = useMemo(() => {
    const statuses: Record<string, { occupied: boolean, reserved: boolean }> = {};
    rooms.forEach(r => statuses[r.number] = { occupied: false, reserved: false });
    
    let searchStart = roomStatusSearchIn || todayStr;
    let searchEnd = roomStatusSearchOut || searchStart;

    if (roomStatusSearchIn && roomStatusSearchOut && roomStatusSearchOut < roomStatusSearchIn) {
       searchStart = roomStatusSearchOut;
       searchEnd = roomStatusSearchIn;
    }

    const searchStartObj = new Date(searchStart);
    searchStartObj.setDate(searchStartObj.getDate() + 1);
    const searchNextDayStr = searchStartObj.toISOString().split('T')[0];

    bookings.forEach(b => {
      if (b.checkInDate < searchEnd && b.checkOutDate > searchStart) {
        if (statuses[b.roomNumber]) statuses[b.roomNumber].occupied = true;
      }
      if (b.checkInDate === searchNextDayStr) {
        if (statuses[b.roomNumber]) statuses[b.roomNumber].reserved = true;
      }
    });

    return statuses;
  }, [bookings, rooms, todayStr, roomStatusSearchIn, roomStatusSearchOut]);

  const filteredBookings = useMemo(() => {
    let result = [...bookings];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.guestName.toLowerCase().includes(term) || 
        b.noBooking.toLowerCase().includes(term)
      );
    }
    if (filterStartDate || filterEndDate) {
      result = result.filter(b => {
        const checkIn = b.checkInDate;
        const checkOut = b.checkOutDate;
        const s = filterStartDate || '1900-01-01';
        const e = filterEndDate || '2100-12-31';
        return checkIn < e && checkOut > s;
      });
    }
    return result;
  }, [bookings, searchTerm, filterStartDate, filterEndDate]);

  const floors = [
    { label: 'Floor 1', rooms: rooms.filter(r => r.number.startsWith('1')) },
    { label: 'Floor 2', rooms: rooms.filter(r => r.number.startsWith('2')) },
    { label: 'Floor 3', rooms: rooms.filter(r => r.number.startsWith('3')) },
  ];

  const stats = useMemo(() => {
    const statusValues = Object.values(roomStatusMap) as { occupied: boolean; reserved: boolean }[];
    const occupiedCount = statusValues.filter(s => s.occupied).length;
    const reservedCount = statusValues.filter(s => s.reserved && !s.occupied).length;
    return {
      total: rooms.length,
      occupied: occupiedCount,
      reserved: reservedCount,
      available: rooms.length - occupiedCount,
      revenue: bookings.reduce((sum, b) => sum + (b.price * b.nights), 0)
    };
  }, [rooms, roomStatusMap, bookings]);

  const exportToExcel = () => {
    if (filteredBookings.length === 0) {
      alert("No bookings available to export.");
      return;
    }
    const dataForExcel = filteredBookings.map(b => ({
      "No Booking": b.noBooking,
      "Room No": b.roomNumber,
      "Room Type": b.roomType,
      "Booking Date": b.bookingDate,
      "Guest Name": b.guestName,
      "Check In Date": b.checkInDate,
      "Check Out Date": b.checkOutDate,
      "Night": b.nights,
      "Nomor HP": b.phone,
      "Harga/Night": b.price,
      "Total Harga": b.price * b.nights,
      "Plan (RBF/RO)": b.mealPlan,
      "Qty/Pax": b.qtyPax,
      "Status Payment": b.paymentStatus,
      "Payment Method": b.paymentMethod,
      "Reservasi By": b.reservationBy || '-',
      "Notes": b.notes || '-'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, `ARv01HMS_Bookings_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const Sidebar = () => (
    <div className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col p-4 z-20 shadow-2xl">
      <div className="flex items-center gap-3 px-2 py-6 mb-8 border-b border-slate-800">
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20">A</div>
        <h1 className="text-xl font-black text-white tracking-tighter">ARv01 <span className="text-teal-500">HMS</span></h1>
      </div>
      <nav className="flex-1 space-y-1">
        {[
          { id: 'DASHBOARD', icon: '📊', label: 'Dashboard' },
          { id: 'ROOMS', icon: '🏨', label: 'Room Status' },
          { id: 'BOOKINGS', icon: '📋', label: 'Bookings' },
          { id: 'REPORTS', icon: '📉', label: 'OTA Report' },
          { id: 'NEW_BOOKING', icon: '➕', label: 'New Reservation' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setAdminPage(item.id as AdminPage);
              if (item.id !== 'NEW_BOOKING') setEditingBooking(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
              adminPage === item.id ? 'bg-teal-600 text-white shadow-xl shadow-teal-900/40 translate-x-1' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="pt-8 border-t border-slate-800">
        <button 
          onClick={() => setView('PUBLIC')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-white transition-colors"
        >
          <span>👁️</span> Public View
        </button>
      </div>
    </div>
  );

  const PublicView = () => (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">ARv01 <span className="text-teal-600">Hotel</span></h1>
          <p className="text-slate-500 font-medium">Real-time room availability status</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <div className="w-4 h-4 bg-teal-500 rounded-md shadow-sm"></div> Available
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <div className="w-4 h-4 bg-rose-500 rounded-md shadow-sm"></div> Occupied
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <div className="w-4 h-4 bg-amber-500 rounded-md shadow-sm"></div> Reserved
          </div>
          <button 
            onClick={() => setView('ADMIN')}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Staff Login
          </button>
        </div>
      </header>
      {floors.map(floor => (
        <section key={floor.label} className="mb-12">
          <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center text-sm shadow-lg shadow-teal-600/20">{floor.label.split(' ')[1]}</span>
            {floor.label}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-5">
            {floor.rooms.map(room => (
              <RoomCard 
                key={room.number} 
                room={room} 
                isBooked={roomStatusMap[room.number]?.occupied} 
                isReserved={roomStatusMap[room.number]?.reserved}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  const AdminDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Operational Insights</h1>
        <p className="text-slate-500 font-medium mt-1">Key performance metrics for today.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Rooms', val: stats.total, icon: '🏠', color: 'bg-blue-600' },
          { label: 'Occupied', val: stats.occupied, icon: '🛌', color: 'bg-rose-600' },
          { label: 'Reserved (Upcoming)', val: stats.reserved, icon: '⏳', color: 'bg-amber-600' },
          { label: 'Revenue (MTD)', val: `Rp ${stats.revenue.toLocaleString()}`, icon: '💰', color: 'bg-emerald-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className={`w-12 h-12 flex items-center justify-center ${stat.color} text-white rounded-2xl shadow-lg text-xl`}>{stat.icon}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.val}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <span className="w-2 h-8 bg-teal-500 rounded-full"></span>
            Recent Bookings
          </h3>
          {bookings.length === 0 ? (
            <div className="py-24 text-center text-slate-400">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-bold">Waiting for first reservation</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <tr>
                    <th className="pb-4 font-black">Guest</th>
                    <th className="pb-4 font-black">Room</th>
                    <th className="pb-4 font-black">Period</th>
                    <th className="pb-4 font-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {bookings.slice(-5).reverse().map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-bold text-slate-800">{b.guestName}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">{b.roomNumber}</span>
                      </td>
                      <td className="py-4 text-xs font-medium text-slate-500">
                        {b.checkInDate} <span className="mx-1 opacity-30">→</span> {b.checkOutDate}
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">{b.paymentStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            Inventory
          </h3>
          <div className="space-y-6">
            {Object.values(RoomType).map(type => {
              const count = rooms.filter(r => r.type === type).length;
              const perc = (count / rooms.length) * 100;
              return (
                <div key={type}>
                  <div className="flex justify-between text-[10px] font-black mb-2 text-slate-500 uppercase tracking-widest">
                    <span>{type} Class</span>
                    <span>{count} Units</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all duration-1000" style={{ width: `${perc}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-white">
            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Occupancy Rate</p>
            <p className="text-3xl font-black">{Math.round((stats.occupied / stats.total) * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-['Inter']">
      <ConfirmationModal 
        isOpen={isDeleteModalOpen} 
        message="Anda yakin ingin menghapus data tamu ini?" 
        onConfirm={confirmDeleteBooking} 
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setBookingToDelete(null);
        }} 
      />
      
      <ViewBookingModal 
        booking={viewingBooking}
        onClose={() => setViewingBooking(null)}
      />

      {view === 'PUBLIC' ? (
        <PublicView />
      ) : (
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-10 bg-slate-50/50 min-h-screen">
            {adminPage === 'DASHBOARD' && <AdminDashboard />}
            {adminPage === 'ROOMS' && (
               <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Hotel Status</h1>
                        <p className="text-slate-500 font-medium mt-1">Monitor room availability for any specific date range.</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cek In</label>
                        <input 
                          type="date" 
                          value={roomStatusSearchIn}
                          onChange={(e) => setRoomStatusSearchIn(e.target.value)}
                          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cek Out</label>
                        <input 
                          type="date" 
                          value={roomStatusSearchOut}
                          onChange={(e) => setRoomStatusSearchOut(e.target.value)}
                          className={`px-4 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none transition-all ${roomStatusSearchOut && roomStatusSearchOut < roomStatusSearchIn ? 'border-rose-300 ring-rose-100 ring-4' : 'border-slate-200'}`}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          setRoomStatusSearchIn('');
                          setRoomStatusSearchOut('');
                        }}
                        className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                 </header>

                 <div className="flex gap-6 pb-2 border-b border-slate-100">
                   <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase">
                     <div className="w-3 h-3 bg-teal-500 rounded-sm"></div> Vacant
                   </div>
                   <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase">
                     <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Occupied
                   </div>
                   <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase">
                     <div className="w-3 h-3 bg-amber-500 rounded-sm"></div> Reserved (Upcoming)
                   </div>
                 </div>

                 {floors.map(floor => (
                  <div key={floor.label}>
                    <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg">
                      <span className="w-2 h-6 bg-teal-600 rounded-full"></span>
                      {floor.label}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                      {floor.rooms.map(room => (
                        <RoomCard 
                          key={room.number} 
                          room={room} 
                          isBooked={roomStatusMap[room.number]?.occupied} 
                          isReserved={roomStatusMap[room.number]?.reserved}
                        />
                      ))}
                    </div>
                  </div>
                 ))}
               </div>
            )}
            {adminPage === 'BOOKINGS' && (
              <BookingList 
                filteredBookings={filteredBookings}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                startDate={filterStartDate}
                endDate={filterEndDate}
                setStartDate={setFilterStartDate}
                setEndDate={setFilterEndDate}
                exportToExcel={exportToExcel}
                handleViewClick={handleViewClick}
                handleEditClick={handleEditClick}
                handleDeleteClick={openDeleteConfirmation}
                setAdminPage={setAdminPage}
                setEditingBooking={setEditingBooking}
              />
            )}
            {adminPage === 'REPORTS' && (
              <OTAReport bookings={bookings} onUpdateBooking={handleSaveBooking} />
            )}
            {adminPage === 'NEW_BOOKING' && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <BookingForm 
                  rooms={rooms.filter(r => {
                    if (editingBooking && r.number === editingBooking.roomNumber) return true;
                    return true; 
                  })} 
                  initialData={editingBooking || undefined}
                  onSave={(b) => {
                    handleSaveBooking(b);
                    setAdminPage('BOOKINGS');
                  }} 
                  onCancel={() => {
                    setAdminPage('BOOKINGS');
                    setEditingBooking(null);
                  }}
                />
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
