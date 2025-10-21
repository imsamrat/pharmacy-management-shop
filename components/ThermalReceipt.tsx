"use client";

import { useRef } from "react";

interface ReceiptData {
  customer?: {
    name?: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal?: number;
  discount?: number;
  total: number;
  saleId?: string;
  date?: string;
  cashier?: string;
}

interface ThermalReceiptProps {
  data: ReceiptData;
  onClose?: () => void;
}

export function ThermalReceipt({ data, onClose }: ThermalReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              @page {
                size: 57mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 2mm;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                line-height: 1.2;
                color: black;
                background: white;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              line-height: 1.2;
              color: black;
              background: white;
              margin: 0;
              padding: 2mm;
              max-width: 48mm;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed black; margin: 2px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
            .item-name { flex: 1; margin-right: 4px; }
            .item-qty { margin-right: 4px; }
            .item-price { text-align: right; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="center bold">
            POINT OF SALE SYSTEM
          </div>
          <div class="center">
            Receipt
          </div>
          <div class="line"></div>

          ${data.saleId ? `<div>Sale ID: ${data.saleId.slice(-8)}</div>` : ""}
          <div>Date: ${data.date || new Date().toLocaleString()}</div>
          ${data.cashier ? `<div>Cashier: ${data.cashier}</div>` : ""}
          <div class="line"></div>

          ${
            data.customer
              ? `
            <div>Customer: ${data.customer.name || "Walk-in"}</div>
            <div>Phone: ${data.customer.phone}</div>
            <div class="line"></div>
          `
              : ""
          }

          <div class="bold">Items:</div>
          ${data.items
            .map(
              (item) => `
            <div class="item-row">
              <span class="item-name">${
                item.name.length > 15
                  ? item.name.substring(0, 15) + "..."
                  : item.name
              }</span>
              <span class="item-qty">${item.quantity}x</span>
              <span class="item-price">৳${item.total.toFixed(2)}</span>
            </div>
          `
            )
            .join("")}

          <div class="line"></div>
          ${
            data.subtotal
              ? `<div class="total-row">
            <span>SUBTOTAL:</span>
            <span>৳${data.subtotal.toFixed(2)}</span>
          </div>`
              : ""
          }
          ${
            data.discount && data.discount > 0
              ? `<div class="total-row">
            <span>DISCOUNT:</span>
            <span>-৳${data.discount.toFixed(2)}</span>
          </div>`
              : ""
          }
          <div class="total-row">
            <span>TOTAL:</span>
            <span>৳${data.total.toFixed(2)}</span>
          </div>

          <div class="center" style="margin-top: 8px; font-size: 8px;">
            Thank you for your business!
          </div>
          <div class="center" style="font-size: 8px;">
            Visit us again
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      onClose?.();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Print Receipt</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          {/* Receipt Preview */}
          <div
            ref={receiptRef}
            className="bg-white border border-gray-300 p-3 text-xs font-mono max-w-xs mx-auto"
            style={{
              fontFamily: "Courier New, monospace",
              lineHeight: "1.2",
              maxWidth: "48mm",
            }}
          >
            <div className="text-center font-bold mb-1">
              POINT OF SALE SYSTEM
            </div>
            <div className="text-center mb-2">Receipt</div>
            <div className="border-t border-dashed border-gray-400 mb-2"></div>

            {data.saleId && (
              <div className="mb-1">Sale ID: {data.saleId.slice(-8)}</div>
            )}
            <div className="mb-1">
              Date: {data.date || new Date().toLocaleString()}
            </div>
            {data.cashier && (
              <div className="mb-2">Cashier: {data.cashier}</div>
            )}
            <div className="border-t border-dashed border-gray-400 mb-2"></div>

            {data.customer && (
              <>
                <div className="mb-1">
                  Customer: {data.customer.name || "Walk-in"}
                </div>
                <div className="mb-2">Phone: {data.customer.phone}</div>
                <div className="border-t border-dashed border-gray-400 mb-2"></div>
              </>
            )}

            <div className="font-bold mb-1">Items:</div>
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between mb-1">
                <span className="flex-1 mr-2 truncate">
                  {item.name.length > 15
                    ? item.name.substring(0, 15) + "..."
                    : item.name}
                </span>
                <span className="mr-2">{item.quantity}x</span>
                <span>৳{item.total.toFixed(2)}</span>
              </div>
            ))}

            <div className="border-t border-dashed border-gray-400 mt-2 mb-2"></div>
            {data.subtotal && (
              <div className="flex justify-between mb-1">
                <span>SUBTOTAL:</span>
                <span>৳{data.subtotal.toFixed(2)}</span>
              </div>
            )}
            {data.discount && data.discount > 0 && (
              <div className="flex justify-between mb-1">
                <span>DISCOUNT:</span>
                <span>-৳{data.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>TOTAL:</span>
              <span>৳{data.total.toFixed(2)}</span>
            </div>

            <div className="text-center mt-3 text-xs">
              Thank you for your business!
            </div>
            <div className="text-center text-xs">Visit us again</div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Skip
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
