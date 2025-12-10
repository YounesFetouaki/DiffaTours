"use client";

import { useTranslations } from "@/lib/i18n/hooks";
import { ShieldCheck, MessageCircle, CreditCard, Award } from "lucide-react";

const WhyUs = () => {
    // We can use useTranslations later, for now hardcoded or generic keys
    const features = [
        {
            icon: <Award className="w-10 h-10 text-primary" />,
            title: "Expert Local Guides",
            description: "Experience Morocco with passionate locals who know every hidden gem."
        },
        {
            icon: <ShieldCheck className="w-10 h-10 text-primary" />,
            title: "Secure Payments",
            description: "Book with confidence using our secure CMI payment gateway or pay on arrival."
        },
        {
            icon: <MessageCircle className="w-10 h-10 text-primary" />,
            title: "24/7 Support",
            description: "Our dedicated team is available around the clock to assist you."
        },
        {
            icon: <CreditCard className="w-10 h-10 text-primary" />,
            title: "Best Price Guarantee",
            description: "We offer the best experiences at the most competitive prices."
        }
    ];

    return (
        <section className="py-16 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 bg-background rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-4 p-3 bg-primary/10 rounded-full">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyUs;
