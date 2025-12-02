"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function DeleteFileButton({ fileKey }: { fileKey: string }) {
    const router = useRouter();
    const handleDelete = async () => {
        await fetch(`/api/delete`, {
            method: "DELETE",
            body: JSON.stringify({ key: fileKey }),
        });
        router.refresh();
    };
    return (
        <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete - {fileKey}
        </Button>
    );
}
