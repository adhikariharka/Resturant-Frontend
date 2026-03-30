"use strict";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface PaymentTimerProps {
    createdAt: string;
    onExpire?: () => void;
}

export function PaymentTimer({ createdAt, onExpire }: PaymentTimerProps) {
    const [timeLeft, setTimeLeft] = useState("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const created = new Date(createdAt).getTime();
            const now = new Date().getTime();
            // 5 minutes expiry time
            const expiryTime = created + 5 * 60 * 1000;
            const difference = expiryTime - now;

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft("Expired");
                if (onExpire) onExpire();
                return;
            }

            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft(`${minutes}:${seconds < 10 ? "0" + seconds : seconds}`);
        };

        // Calculate immediately
        calculateTimeLeft();

        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [createdAt, onExpire]);

    if (isExpired) {
        return <span className="text-red-500 font-medium text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> Expired</span>;
    }

    return (
        <span className="text-orange-600 font-medium text-sm flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pay within {timeLeft}
        </span>
    );
}
