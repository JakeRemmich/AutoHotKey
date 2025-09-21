import { useState } from "react";

const PromotionBanner = () => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null; // Hide banner when dismissed

    return (
        <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
            {/* Background elements */}
            <div
                aria-hidden="true"
                className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
            >
                <div className="aspect-577/310 w-144.25 bg-linear-to-r from-[#ff80b5] to-[#9089fc] opacity-30"></div>
            </div>
            <div
                aria-hidden="true"
                className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
            >
                <div className="aspect-577/310 w-144.25 bg-linear-to-r from-[#ff80b5] to-[#9089fc] opacity-30"></div>
            </div>

            {/* Content */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-sm/6 text-gray-900">
                    <strong className="font-semibold">Free trial Get started here</strong>
                </p>
            </div>

            {/* Close button */}
            <div className="flex flex-1 justify-end">
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="-m-3 p-3 focus-visible:-outline-offset-4"
                >
                    <span className="sr-only">Dismiss</span>
                    <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        data-slot="icon"
                        aria-hidden="true"
                        className="size-5 text-gray-900"
                    >
                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default PromotionBanner;
