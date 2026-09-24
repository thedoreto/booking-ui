import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/bg';

// initialStartDate/initialEndDate ('YYYY-MM-DD', по избор) – дати, казани в чата
export default function DateSelectorModal({ isOpen, onClose, onSelectDates, initialStartDate, initialEndDate }) {
    const [startDate, setStartDate] = useState(() =>
        initialStartDate ? dayjs(initialStartDate) : dayjs()
    );
    const [endDate, setEndDate] = useState(() =>
        initialEndDate ? dayjs(initialEndDate) : (initialStartDate ? dayjs(initialStartDate) : dayjs()).add(1, 'day')
    );

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (startDate && endDate) {
            onSelectDates(
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD')
            );
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="bg">
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#111827', fontSize: '18px' }}>
                        Изберете период за настаняване
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                        <DatePicker
                            label="Начална дата"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                        <DatePicker
                            label="Крайна дата"
                            value={endDate}
                            minDate={startDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle}>Отказ</button>
                        <button type="button" onClick={handleConfirm} style={primaryBtnStyle}>Провери стаи</button>
                    </div>
                </div>
            </div>
        </LocalizationProvider>
    );
}

const modalOverlayStyle = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000, borderRadius: 'inherit'
};
const modalContentStyle = {
    background: '#fff', padding: '24px', borderRadius: '12px', width: '320px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
};
const cancelBtnStyle = { background: '#f3f4f6', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
const primaryBtnStyle = { background: '#214daf', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };