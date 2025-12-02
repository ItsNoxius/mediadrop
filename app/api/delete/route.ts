import { getStorageProvider } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    const { key } = await request.json();
    const storage = getStorageProvider();
    await storage.deleteFile(key);
    return NextResponse.json({ message: "File deleted" });
}
