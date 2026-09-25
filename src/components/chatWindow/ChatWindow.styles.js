export const styles = {
    wrapper: {
        width: "100%",
        maxWidth: "420px",
        position: "fixed",
        bottom: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "22px",
        overflow: "hidden",
        backgroundColor: "white",
        boxShadow: "0 10px 40px rgba(0,0,0,0.18)",
        border: "1px solid #e5e7eb",
        transition: "all 0.25s ease"
    },
    // Максимизиран: целият екран с малък отстъп
    wrapperMaximized: {
        top: "20px",
        left: "20px",
        maxWidth: "none",
        width: "auto",
        zIndex: 1000
    },
    header: {
        height: "70px",
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1c4498",
        color: "white"
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    onlineDot: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: "#00ff66",
        boxShadow: "0 0 12px #00ff66"
    },
    title: { fontSize: "16px", fontWeight: "600" },
    onlineText: { fontSize: "12px", color: "#10e681", marginTop: "2px" },
    headerButtons: { display: "flex", alignItems: "center", gap: "4px" },
    minimizeButton: { border: "none", background: "transparent", color: "white", fontSize: "22px", cursor: "pointer" },
    maximizeButton: {
        border: "none",
        background: "transparent",
        color: "white",
        cursor: "pointer",
        padding: "6px",
        display: "flex",
        alignItems: "center"
    },
    messages: {
        flex: 1,
        overflowY: "auto",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "#f3f4f6"
    },
    messageRow: { display: "flex" },
    messageBubble: {
        padding: "12px 15px",
        borderRadius: "16px",
        maxWidth: "78%",
        lineHeight: "1.45",
        fontSize: "14px",
        wordBreak: "break-word",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        whiteSpace: "pre-line"
    },
    shortcutsContainer: {
        display: "flex",
        gap: "8px",
        padding: "8px 14px",
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        flexWrap: "wrap",
        flexShrink: 0,
        // До 3 реда бутони (30px всеки + 8px между тях + 16px padding); ако са повече – скрол надолу
        maxHeight: "122px",
        overflowY: "auto",
        boxSizing: "border-box"
    },
    // В максимизиран прозорец – толкова реда, колкото е нужно
    shortcutsContainerExpanded: {
        maxHeight: "none",
        overflowY: "visible"
    },
    shortcutChip: {
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        borderRadius: "12px",
        padding: "6px 12px",
        fontSize: "13px",
        lineHeight: "16px",
        fontWeight: "500",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background-color 0.2s"
    },
    shortcutChipActive: {
        backgroundColor: "#1d4ed8",
        color: "#fff",
        border: "1px solid #1d4ed8",
        borderRadius: "12px",
        padding: "6px 12px",
        fontSize: "13px",
        lineHeight: "16px",
        fontWeight: "500",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background-color 0.2s"
    },
    inputContainer: {
        display: "flex",
        padding: "14px",
        gap: "10px",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "white"
    },
    input: {
        flex: 1,
        border: "1px solid #d1d5db",
        borderRadius: "14px",
        padding: "12px 14px",
        fontSize: "14px",
        outline: "none"
    },
    button: {
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        padding: "0 18px",
        borderRadius: "14px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600"
    },
    roomList: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginTop: "10px"
    },
    roomCard: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "12px",
        border: "1px solid #d1d5db",
        backgroundColor: "white"
    },
    roomTitle: { fontSize: "14px", fontWeight: "600" },
    roomPrice: { fontSize: "13px", color: "#4b5563", marginTop: "2px" },
    bookingActions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "8px" },
    bookingNote: { fontSize: "13px", color: "#6b7280", marginTop: "6px", textAlign: "right" },
    bookingCanceled: { fontSize: "13px", color: "#b91c1c", fontWeight: "600", marginTop: "6px", textAlign: "right" },
    cancelBookingButton: {
        border: "none",
        backgroundColor: "#dc2626",
        color: "white",
        padding: "6px 12px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
    },
    secondaryButton: {
        border: "none",
        backgroundColor: "#f3f4f6",
        color: "#111827",
        padding: "6px 12px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer"
    },
    bookButton: {
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        padding: "10px 14px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "600"
    }
};
