"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/utils/supabase/database.types";
import { useEffect, useState } from "react";

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

interface CouponFormProps {
    coupon: Coupon | null;
    onSubmit: (data: {
        amount: number;
        code: string;
        type: string;
    }) => Promise<void>;
    submitLabel?: string;
}

export function CouponForm({
    coupon,
    onSubmit,
    submitLabel = "Coupon erstellen",
}: CouponFormProps) {
    const [amount, setAmount] = useState(coupon?.amount || 0);
    const [code, setCode] = useState(coupon?.code || "");
    const [type, setType] = useState(coupon?.type || "");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (
            !amount ||
            !code ||
            !type
        ) {
            setError("Bitte fülle alle Felder aus");
            return;
        }

        if (Number.isNaN(amount) || amount <= 0) {
            setError("Anzahl Tickets muss größer als 0 sein");
            return;
        }

        await onSubmit({
            amount,
            code,
            type,
        });
    };

    return (
        <Card className="flex-grow">
            <CardHeader>
                <CardTitle className="text-2xl">
                    {coupon ? "Coupon bearbeiten" : "Neues Coupon"}
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="start-time" className="text-lg">
                            Typ:
                        </Label>
                        <Select
                            value={type}
                            onValueChange={(value) => setType(value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Typ auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Gastmannschaft Kontingent freischalten</SelectItem>
                                <SelectItem value="2">Sponsoren Tickets (100% Rabatt)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="coupon" className="text-lg">
                            Coupon
                        </Label>
                        <Input
                            id="coupon"
                            placeholder="MYCOUPON"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            className="text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-lg">
                            Anzahl Coupons
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            min="1"
                            placeholder="100"
                            value={amount}
                            disabled={type === "1"}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            required
                            className="text-lg"
                        />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg" className="w-full text-lg">
                        {submitLabel}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
