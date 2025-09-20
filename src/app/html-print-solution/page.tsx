"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Component for rendering HTML labels optimized for printing
interface LabelData {
  packageId: string;
  recipient: {
    name: string;
    email: string;
    phone: string;
    identification: string;
    address: string;
  };
  sender: {
    name: string;
    warehouse: string;
  };
  items: Array<{
    name: string;
    quantity: string;
    sku: string;
    description: string;
  }>;
  orderDate: string;
  packingDate: string;
  tracking: string;
}

function LabelPreview({ labelData }: { labelData: LabelData }) {
  const handlePrint = () => {
    // Create a print window optimized for labels
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.2;
            }
            .label {
              width: 4in;
              height: 6in;
              padding: 8px;
              box-sizing: border-box;
              border: 1px solid #000;
              display: flex;
              flex-direction: column;
            }
            .header {
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 8px;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
            }
            .section {
              margin-bottom: 6px;
            }
            .section-title {
              font-weight: bold;
              font-size: 10px;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .address {
              font-size: 11px;
              line-height: 1.1;
            }
            .tracking {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              background: #f0f0f0;
              padding: 2px 4px;
              border-radius: 2px;
            }
            .barcode {
              text-align: center;
              font-family: 'Courier New', monospace;
              font-size: 8px;
              margin: 4px 0;
            }
            .footer {
              margin-top: auto;
              text-align: center;
              font-size: 8px;
              color: #666;
            }
            .items {
              font-size: 10px;
            }
            .item {
              margin-bottom: 3px;
              padding: 2px;
              background: #f9f9f9;
            }
            @media print {
              body { margin: 0; }
              .label { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">SHIPPING LABEL</div>
            
            <div class="section">
              <div class="section-title">Package ID:</div>
              <div class="tracking">${labelData.packageId}</div>
            </div>

            <div class="section">
              <div class="section-title">Recipient:</div>
              <div class="address">
                ${labelData.recipient.name}<br>
                ${labelData.recipient.email}<br>
                ${labelData.recipient.phone}<br>
                ID: ${labelData.recipient.identification}<br>
                ${labelData.recipient.address}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Items:</div>
              <div class="items">
                ${labelData.items
                  .map(
                    item => `
                  <div class="item">
                    ${item.name} - Qty: ${item.quantity}<br>
                    SKU: ${item.sku}
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Order Info:</div>
              <div class="address">
                Order Date: ${labelData.orderDate}<br>
                Packing Date: ${labelData.packingDate}<br>
                Warehouse: ${labelData.sender.warehouse}
              </div>
            </div>

            <div class="barcode">||| ${labelData.packageId} |||</div>

            <div class="footer">
              Generated on ${new Date().toLocaleString()}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="h-96 flex flex-col">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Label Preview</h3>
        <button
          onClick={handlePrint}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
        >
          Print Label
        </button>
      </div>

      <div className="flex-1 p-4 bg-gray-100 flex items-center justify-center">
        <div className="bg-white border-2 border-dashed border-gray-300 p-4 text-center max-w-sm">
          <div className="text-sm text-gray-600 mb-2">
            Preview of 4&quot;x6&quot; label
          </div>
          <div className="text-xs text-gray-500">
            <div className="font-bold mb-2">SHIPPING LABEL</div>
            <div className="text-left">
              <div>
                <strong>Package ID:</strong>
              </div>
              <div className="font-mono bg-gray-200 px-2 py-1 rounded text-xs mb-2">
                {labelData.packageId}
              </div>
              <div>
                <strong>Recipient:</strong>
              </div>
              <div>{labelData.recipient.name}</div>
              <div className="text-xs">{labelData.recipient.email}</div>
              <div className="text-xs">{labelData.recipient.address}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HtmlPrintSolutionPage() {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [labelData, setLabelData] = useState<LabelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const defaultUrl =
    "https://pickpack-assets.s3.us-east-1.amazonaws.com/serverless/pnp/dev/printed-labels/packages/00bece1b-fa2d-4111-b9f2-e262db7064cd.pdf";

  // Sample data extracted from the PDF
  const sampleLabelData: LabelData = {
    packageId: "00bece1b-fa2d-4111-b9f2-e262db7064cd",
    recipient: {
      name: "D. test",
      email: "arangomonsalve.daniel@gmail.com",
      phone: "+573204567890",
      identification: "1034567890",
      address: "Bello - Medellin",
    },
    sender: {
      name: "PickPack",
      warehouse: "ColombiaMAIN",
    },
    items: [
      {
        name: "Camisa live shop Talla M",
        quantity: "02 Units",
        sku: "1310",
        description: "Apparel",
      },
    ],
    orderDate: "2/12/2025, 4:36:36 PM",
    packingDate: "4/15/2025, 3:04:19 PM",
    tracking: "1510250516125-01",
  };

  const handlePreview = () => {
    if (fileUrl.trim()) {
      setPreviewUrl(fileUrl.trim());
      // For demo purposes, use sample data
      setLabelData(sampleLabelData);
    }
  };

  const handleUseDefault = () => {
    setFileUrl(defaultUrl);
    setPreviewUrl(defaultUrl);
    setLabelData(sampleLabelData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Proposal 3: HTML-to-Print
              </h1>
              <p className="text-gray-600">
                HTML rendering optimized for thermal printing
              </p>
            </div>
            <Link
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Enter PDF URL
          </h2>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-800">
              <strong>Note:</strong> This solution generates HTML labels without
              fetching external PDFs. Perfect for client-side only applications.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                placeholder="Enter PDF URL here..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handlePreview}
                disabled={!fileUrl.trim()}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
              >
                Preview
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUseDefault}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium text-sm"
              >
                Use Sample PDF
              </button>
              <div className="text-sm text-gray-500 flex items-center">
                Sample: PickPack shipping label
              </div>
            </div>
          </div>
        </div>

        {labelData && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <LabelPreview labelData={labelData} />
          </div>
        )}

        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">
            Advantages of this proposal:
          </h3>
          <ul className="text-purple-800 space-y-1">
            <li>• Optimized for thermal printers (4&quot;x6&quot;)</li>
            <li>• Full control over design and layout</li>
            <li>• No external PDF files required</li>
            <li>• Sharp printing on thermal printers</li>
            <li>• Easy template customization</li>
            <li>• Works perfectly in PWAs</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Considerations:
          </h3>
          <ul className="text-yellow-800 space-y-1">
            <li>• Only for content that can be represented in HTML</li>
            <li>• Requires specific design for each label type</li>
            <li>• Not suitable for complex documents</li>
            <li>• Dependent on browser print CSS</li>
          </ul>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Ideal use cases:</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Shipping and package labels</li>
            <li>• Inventory labels</li>
            <li>• Tickets and receipts</li>
            <li>• Barcodes and QR codes</li>
            <li>• Any content printed in small format</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
