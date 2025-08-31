"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { createPromotion } from "@/api/subscriptions";

export default function CreatePromotion({
    planId,
    onClose,
    open,
    onOpen,
}: {
    planId: string;
    onClose: () => void;
    open: boolean;
    onOpen: (val: boolean) => void;
}) {
    const [formData, setFormData] = useState({
        salePrice: "",
        saleStartDate: "",
        saleEndDate: "",
    });
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.saleEndDate < formData.saleStartDate) {
            toast({
                title: "Error",
                description: "End date should be greater than start date",
                variant: "destructive",
            });
            return;
        }
        try {
            await createPromotion(planId, formData);
            toast({
                title: "Success",
                description: "Promotion created successfully"
            });
            onClose();

        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : `Failed to update promotion`,
                variant: "destructive"
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Promotion for {planId}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="salePrice">Sale Price</Label>
                        <Input
                            id="salePrice"
                            name="salePrice"
                            type="number"
                            value={formData.salePrice}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="saleStartDate">Start Date</Label>
                        <Input
                            id="saleStartDate"
                            name="saleStartDate"
                            type="date"
                            value={formData.saleStartDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="saleEndDate">End Date</Label>
                        <Input
                            id="saleEndDate"
                            name="saleEndDate"
                            type="date"
                            value={formData.saleEndDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Submit</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
