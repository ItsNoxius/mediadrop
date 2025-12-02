import {
    DeleteObjectCommand,
    ListObjectsV2Command,
    S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { EnvConfig } from "../config";
import type { StorageProvider } from "./index";

export class S3Provider implements StorageProvider {
    private readonly client: S3Client;
    private config: EnvConfig;

    constructor(env: EnvConfig) {
        this.config = env;

        this.client = new S3Client({
            region: env.STORAGE_REGION,
            endpoint: env.STORAGE_ENDPOINT,
            credentials: {
                accessKeyId: env.STORAGE_ACCESS_KEY_ID,
                secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
            },
            // Force path style for local S3-compatible servers
            forcePathStyle: true,
        });
    }

    async upload({
        filename,
        buffer,
        contentType,
    }: {
        filename: string;
        buffer: ArrayBuffer;
        contentType: string;
    }) {
        // Convert ArrayBuffer to Buffer
        const body = Buffer.from(buffer);

        // Create a multipart upload
        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.config.STORAGE_BUCKET,
                Key: filename,
                Body: body,
                ContentType: contentType,
            },
        });

        // Complete the upload - no progress tracking
        await upload.done();

        // Generate the URL
        const url = this.config.STORAGE_PUBLIC_URL
            ? `${this.config.STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${filename}`
            : `https://${this.config.STORAGE_BUCKET}.s3.${this.config.STORAGE_REGION}.amazonaws.com/${filename}`;

        return {
            url,
            key: filename,
            size: body.length,
        };
    }

    async listFiles() {
        const command = new ListObjectsV2Command({
            Bucket: this.config.STORAGE_BUCKET,
        });

        const response = await this.client.send(command);

        return (
            response.Contents?.map((item) => ({
                key: item.Key ?? ("" as string),
                size: item.Size ?? 0,
                lastModified: item.LastModified ?? new Date(),
            })) ?? []
        );
    }

    async deleteFile(key: string) {
        const command = new DeleteObjectCommand({
            Bucket: this.config.STORAGE_BUCKET,
            Key: key,
        });

        await this.client.send(command);
    }
}
