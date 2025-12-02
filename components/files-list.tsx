import { getStorageProvider } from "@/lib/storage";
import { DeleteFileButton } from "./delete-file-button";

export async function FilesList() {
    const storage = getStorageProvider();
    const files = await storage.listFiles();

    return (
        <div>
            <h2>Files</h2>
            <ul>
                {files.map((file) => (
                    <li key={file.key}>
                        <a
                            href={`${process.env.STORAGE_PUBLIC_URL}/${file.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {file.key} - {file.size} -{" "}
                            {file.lastModified.toISOString()}
                        </a>
                        <DeleteFileButton fileKey={file.key} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
