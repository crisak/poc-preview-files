"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            POC Preview App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Demonstration of different proposals for file preview and printing
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Current Implementation (Not Working)
            </h2>
            <p className="text-red-700 mb-3">
              Our current implementation uses{" "}
              <code className="bg-red-100 px-2 py-1 rounded">
                window.open()
              </code>{" "}
              which doesn't work properly in PWAs for direct printing.
            </p>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
              <pre>{`const printLabel = async (pkgId: string) => {
  setLoadLabel(true);
  const PROTOCOL_URI = \`\${process.env.NEXT_PUBLIC_LABEL_REST_URL}/package/\${account}/\${pkgId}\`;
  await getPrintPicking(PROTOCOL_URI, user?.language)
    .then((data) => {
      if (data?.data?.urlFile) {
        window.open(data.data.urlFile, '_blank'); // ❌ Doesn't work in PWAs
      } else {
        toast.error(data?.message);
      }
    })
    .finally(() => setLoadLabel(false));
};`}</pre>
            </div>
            <p className="text-red-700 mt-3 text-sm">
              <strong>Problem:</strong> Users cannot print directly from the
              PWA, requiring additional steps like screenshots.
            </p>
            <div className="mt-4">
              <button
                onClick={() => {
                  // Simular la implementación actual que no funciona
                  const sampleUrl =
                    "https://pickpack-assets.s3.us-east-1.amazonaws.com/serverless/pnp/dev/printed-labels/packages/00bece1b-fa2d-4111-b9f2-e262db7064cd.pdf";
                  window.open(sampleUrl, "_blank");
                  alert(
                    "This is what happens with our current implementation:\n\n1. PDF opens in new tab\n2. User must manually print from browser\n3. In PWA, this often doesn't work properly\n4. User needs to take screenshots instead"
                  );
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium text-sm"
              >
                🚫 Try Current Implementation (Demo)
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          <Link
            href="/iframe-solution"
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
          >
            <div className="text-center">
              <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Proposal 1: iframe
              </h3>
              <p className="text-gray-600 mb-4">
                Native preview using iframe with blob URL and
                contentWindow.print()
              </p>
              <div className="text-sm text-blue-600 font-medium">
                View implementation →
              </div>
            </div>
          </Link>

          <Link
            href="/pdfjs-solution"
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
          >
            <div className="text-center">
              <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Proposal 2: PDF.js
              </h3>
              <p className="text-gray-600 mb-4">
                Rendering with PDF.js for better control and consistency in PWAs
              </p>
              <div className="text-sm text-green-600 font-medium">
                View implementation →
              </div>
            </div>
          </Link>

          <Link
            href="/share-button"
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
          >
            <div className="text-center">
              <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Proposal 3: Web Share API
              </h3>
              <p className="text-gray-600 mb-4">
                Native sharing with Web Share API for mobile devices
              </p>
              <div className="text-sm text-green-600 font-medium">
                View implementation →
              </div>
            </div>
          </Link>

          <Link
            href="/expo-print-solution"
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
          >
            <div className="text-center">
              <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Proposal 4: expo-print
              </h3>
              <p className="text-gray-600 mb-4">
                Native printing using expo-print with uri parameter
              </p>
              <div className="text-sm text-purple-600 font-medium">
                View implementation →
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            POC Features
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Complete PWA application (installable on mobile devices)
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Preview of PDFs, images and text files
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Integrated printing functionality in each proposal
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Solution to the problem reported in ticket PAP_2611
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
