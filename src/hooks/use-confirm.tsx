import { useState, useCallback, useRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-model";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export const useConfirm = (
    title: string,
    message: string,
    variant: ButtonProps["variant"] = "primary"
): [() => JSX.Element, () => Promise<boolean>] => {
    const [open, setOpen] = useState(false);
    const resolveRef = useRef<(value: boolean) => void>();

    const confirm = useCallback((): Promise<boolean> => {
        setOpen(true);
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = undefined;
        }
    }, []);

    const handleConfirm = useCallback(() => {
        setOpen(false);
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = undefined;
        }
    }, []);

    const handleCancel = useCallback(() => {
        setOpen(false);
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = undefined;
        }
    }, []);

    const ConfirmationDialog = useCallback(() => (
        <ResponsiveModal 
            open={open} 
            onOpenChange={(isOpen) => {
                if (!isOpen) handleClose();
            }}
        >
            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="pt-8">
                    <CardHeader className="p-0">
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                        <CardDescription className="pt-2">{message}</CardDescription>
                    </CardHeader>
                    <div className="pt-6 w-full flex flex-col sm:flex-row gap-3 items-center justify-end">
                        <Button 
                            onClick={handleCancel} 
                            variant="outline" 
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleConfirm} 
                            variant={variant} 
                            className="w-full sm:w-auto"
                        >
                            Confirm
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ResponsiveModal>
    ), [open, title, message, variant, handleClose, handleConfirm, handleCancel]);

    return [ConfirmationDialog, confirm];
};