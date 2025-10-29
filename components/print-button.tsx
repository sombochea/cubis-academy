'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium print:hidden"
    >
      🖨️ Print Receipt
    </button>
  );
}
