"use client";

import { useTranslations } from "@/lib/i18n/hooks";
import { BadgeCheck, Headset, MessageSquareText, Wallet } from "lucide-react";

export const TrustBar = () => {
    const t = useTranslations();

    const items = [
        {
            icon: <BadgeCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />,
            label: t('trust.bestActivities')
        },
        {
            icon: <Headset className="w-6 h-6 md:w-8 md:h-8 text-white" />,
            label: t('trust.support')
        },
        {
            icon: <MessageSquareText className="w-6 h-6 md:w-8 md:h-8 text-white" />,
            label: t('trust.reviews')
        },
        {
            icon: <Wallet className="w-6 h-6 md:w-8 md:h-8 text-white" />,
            label: t('trust.noFees')
        }
    ];

    return (
        <div className="w-full glass-strong mt-8 py-4 px-6 md:px-12 rounded-[20px] animate-fadeInUp delay-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-white">
                        <div className="flex-shrink-0">
                            {item.icon}
                        </div>
                        <span className="font-medium text-sm md:text-base leading-tight">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
