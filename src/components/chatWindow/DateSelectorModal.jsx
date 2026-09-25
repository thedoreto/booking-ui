import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/bg';

// initialStartDate/initialEndDate ('YYYY-MM-DD') и initialRoomType (код на тип), по избор – казани в чата.
// roomTypes ([{ code, name }]) – типовете стаи на хотела от бекенда
export default function DateSelectorModal({ isOpen, onClose, onSelectDates, initialStartDate, initialEndDate, initialRoomType, roomTypes = [] }) {
    const [startDate, setStartDate] = useState(() =>
        initialStartDate ? dayjs(initialStartDate) : dayjs()
    );
    const [endDate, setEndDate] = useState(() =>
        initialEndDate ? dayjs(initialEndDate) : (initialStartDate ? dayjs(initialStartDate) : dayjs()).add(1, 'day')
    );
    const [roomType, setRoomType] = useState(() => initialRoomType || null);
    // Бутоните за тип стая; null = всички типове
    const roomTypeOptions = [{ code: null, name: 'Всички' }, ...roomTypes];

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (startDate && endDate) {
            onSelectDates(
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD'),
                roomType
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
                        {roomTypes.length > 0 && (
                            <div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>Тип стая</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {roomTypeOptions.map(({ code, name }) => (
                                        <button
                                            key={code ?? 'ALL'}
                                            type="button"
                                            onClick={() => setRoomType(code)}
                                            style={roomType === code ? chipSelectedStyle : chipStyle}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
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
const chipStyle = { background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px' };
const chipSelectedStyle = { ...chipStyle, background: '#214daf', color: '#fff', border: '1px solid #214daf' };
