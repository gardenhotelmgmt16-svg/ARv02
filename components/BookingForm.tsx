
import React, { useState, useEffect } from 'react';
import { 
  Booking, RoomType, PaymentStatus, PaymentMethod, MealPlan, Room 
} from '../types';
import { ROOM_PRICES } from '../constants';

interface BookingFormProps {
  rooms: Room[];
  initialData?: Booking;
  onSave: (booking: Booking) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ rooms, initialData, onSave, onCancel }) => {
  const generateAutoID = () => `BK-${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState<Partial<Booking>>(initialData || {
    noBooking: generateAutoID(),
    bookingDate: new Date().toISOString().split('T')[0],
    checkInDate: '',
    checkOutDate: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    nights: 1,
    qtyPax: 1,
    mealPlan: MealPlan.RO,
    paymentStatus: PaymentStatus.CASH,
    paymentMethod: PaymentMethod.WALK_IN,
    roomType: RoomType.SUPERIOR,
    price: ROOM_PRICES[RoomType.SUPERIOR],
    notes: '',
    reservationBy: ''
  });

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomNum = e.target.value;
    const room = rooms.find(r => r.number === roomNum);
    if (room) {
      setFormData(prev => ({
        ...prev,
        roomNumber: roomNum,
        roomType: room.type,
        price: ROOM_PRICES[room.type]
      }));
    }
  };

  const handleMealPlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlan = e.target.value as MealPlan;
    setFormData(prev => ({
      ...prev,
      mealPlan: selectedPlan,
      // If RO is selected, Qty/Pax becomes 0 automatically
      qtyPax: selectedPlan === MealPlan.RO ? 0 : (prev.qtyPax === 0 ? 1 : prev.qtyPax)
    }));
  };

  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setFormData(prev => ({ ...prev, nights: diffDays > 0 ? diffDays : 0 }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatic ID fallback if left blank manually
    const finalNoBooking = formData.noBooking?.trim() || generateAutoID();

    const newBooking: Booking = {
      ...formData,
      noBooking: finalNoBooking,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
    } as Booking;
    
    onSave(newBooking);
  };

  const totalPrice = (formData.price || 0) * (formData.nights || 0);

  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-teal-100 text-teal-600 rounded-lg">{initialData ? '✏️' : '📝'}</span>
          {initialData ? 'Edit Reservation' : 'New Reservation'}
        </h2>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase">Current ID Preview</span>
          <div className="text-lg font-mono font-bold text-teal-600">
            {formData.noBooking?.trim() ? formData.noBooking : '(Auto Generated)'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div>
          <label className={labelClass}>Booking ID (Optional)</label>
          <input 
            type="text" 
            placeholder="Auto-generated if empty"
            value={formData.noBooking}
            className={`${inputClass} font-mono`} 
            onChange={e => setFormData(p => ({...p, noBooking: e.target.value}))}
          />
        </div>

        <div>
          <label className={labelClass}>Booking Date</label>
          <input 
            required
            type="date" 
            value={formData.bookingDate}
            className={inputClass} 
            onChange={e => setFormData(p => ({...p, bookingDate: e.target.value}))}
          />
        </div>

        <div>
          <label className={labelClass}>Room Number</label>
          <select 
            required 
            value={formData.roomNumber || ''}
            onChange={handleRoomChange} 
            className={inputClass}
          >
            <option value="">Select Room</option>
            {rooms.map(r => (
              <option key={r.number} value={r.number}>
                {r.number} - {r.type}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className={labelClass}>Room Type</label>
          <input readOnly value={formData.roomType || ''} className={`${inputClass} bg-slate-50 text-slate-500`} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Guest Name</label>
          <input 
            required
            type="text" 
            placeholder="Guest Full Name"
            value={formData.guestName || ''}
            className={inputClass} 
            onChange={e => setFormData(p => ({...p, guestName: e.target.value}))}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Phone Number</label>
          <input 
            required
            type="tel" 
            placeholder="08..."
            value={formData.phone || ''}
            className={inputClass} 
            onChange={e => setFormData(p => ({...p, phone: e.target.value}))}
          />
        </div>

        <div>
          <label className={labelClass}>Check In Date</label>
          <input 
            required
            type="date" 
            value={formData.checkInDate || ''}
            className={inputClass} 
            onChange={e => setFormData(p => ({...p, checkInDate: e.target.value}))}
          />
        </div>

        <div>
          <label className={labelClass}>Check In Time</label>
          <input 
            type="time" 
            value={formData.checkInTime || '14:00'}
            className={inputClass} 
            onChange={e => setFormData(p => ({...p, checkInTime: e.target.value}))}
          />
        </div>

        <div>
          <label className={labelClass}>Check Out Date</label>
          <input 
            required
            type="date" 
            value={formData.checkOutDate || ''}
            className={inputClass} 
            onChange={e => setFormData(p => ({...p, checkOutDate: e.target.value}))}
          />
        </div>

        <div>
          <label className={labelClass}>Check Out Time</label>
          <input 
            type="time" 
            value={formData.checkOutTime || '12:00'}
            className={inputClass} 
            onChange={e => setFormData(p => ({...p, checkOutTime: e.target.value}))}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Nights</label>
            <input readOnly value={formData.nights} className={`${inputClass} bg-slate-50 text-slate-500`} />
          </div>
          <div>
            <label className={labelClass}>Qty/Pax</label>
            <input 
              type="number" 
              min="0"
              value={formData.qtyPax}
              className={inputClass} 
              onChange={e => setFormData(p => ({...p, qtyPax: parseInt(e.target.value) || 0}))}
              // Disable if RO since it's forced to 0
              readOnly={formData.mealPlan === MealPlan.RO}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Price (per Night)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 text-sm">Rp</span>
            <input 
              type="number"
              value={formData.price || 0}
              className={`${inputClass} pl-9 font-semibold text-teal-700`}
              onChange={e => setFormData(p => ({...p, price: parseFloat(e.target.value) || 0}))}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Plan (RBF/RO)</label>
          <select 
            className={inputClass}
            value={formData.mealPlan}
            onChange={handleMealPlanChange}
          >
            {Object.values(MealPlan).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Payment Status</label>
          <select 
            className={inputClass}
            value={formData.paymentStatus}
            onChange={e => setFormData(p => ({...p, paymentStatus: e.target.value as PaymentStatus}))}
          >
            {Object.values(PaymentStatus).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Payment Method</label>
          <select 
            className={inputClass}
            value={formData.paymentMethod}
            onChange={e => setFormData(p => ({...p, paymentMethod: e.target.value as PaymentMethod}))}
          >
            {Object.values(PaymentMethod).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className={labelClass}>Reservation By</label>
          <input 
            type="text" 
            placeholder="Agent / Person"
            value={formData.reservationBy || ''}
            className={inputClass} 
            onChange={e => setFormData(p => ({...p, reservationBy: e.target.value}))}
          />
        </div>
      </div>

      <div className="mb-8">
        <label className={labelClass}>Notes</label>
        <textarea 
          rows={3}
          placeholder="Special requests, billing info, etc."
          value={formData.notes || ''}
          className={inputClass} 
          onChange={e => setFormData(p => ({...p, notes: e.target.value}))}
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t pt-8">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-6">
          <div className="text-sm">
            <div className="text-slate-400 font-medium">Daily Rate</div>
            <div className="font-bold text-slate-700">Rp {formData.price?.toLocaleString()}</div>
          </div>
          <div className="text-xl text-slate-300">×</div>
          <div className="text-sm">
            <div className="text-slate-400 font-medium">Duration</div>
            <div className="font-bold text-slate-700">{formData.nights} Nights</div>
          </div>
          <div className="text-xl text-slate-300">=</div>
          <div>
            <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">Total Stay Estimate</div>
            <div className="text-2xl font-black text-slate-900">Rp {totalPrice.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/30 transform active:scale-95"
          >
            {initialData ? 'Update Reservation' : 'Confirm Reservation'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;
