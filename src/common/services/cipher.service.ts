import {Injectable} from "@nestjs/common";
import * as argon2 from "argon2";
import * as crypto from "crypto";
import * as uuid from "uuid";

@Injectable()
export class CipherService{
    // Hash functions
    getSum(content: string | Buffer): string{
        if(!content) content = "";
        return crypto.createHash("sha256").update(content).digest("hex");
    }

    async hashPassword(content: string | Buffer, cost = 10): Promise<string>{
        if(!content) content = "";
        return await argon2.hash(content, {
            type: argon2.argon2id,
            timeCost: cost,
        });
    }

    async comparePassword(hash: string, content: string | Buffer): Promise<boolean>{
        if(!hash) return false;
        if(!content) content = "";
        return await argon2.verify(hash, content);
    }

    // Symmetric functions
    private prepareEncryptionKey(encryptionKey: string | Buffer): Buffer{
        let keyBuffer: Buffer;
        if(typeof encryptionKey === "string")
            keyBuffer = Buffer.from(encryptionKey);
        else
            keyBuffer = encryptionKey;
        const key = Buffer.alloc(64);
        keyBuffer.copy(key);
        return key;
    }

    cipherSymmetric(content: string, encryptionKey: string | Buffer): string{
        if(!content) content = "";
        return this.cipherBufferSymmetric(Buffer.from(content, "utf-8"), encryptionKey).toString("hex");
    }

    cipherBufferSymmetric(content: Buffer, encryptionKey: string | Buffer): Buffer{
        if(!content) content = Buffer.alloc(0);
        const iv = crypto.randomBytes(12);
        const key = this.prepareEncryptionKey(encryptionKey);
        const cipher = crypto.createCipheriv("aes-256-gcm", key.subarray(0, 32), iv);
        const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
        const tag = cipher.getAuthTag();
        return Buffer.concat([iv, encrypted, tag]);
    }

    decipherSymmetric(encryptedContent: string, encryptionKey: string | Buffer): string{
        return this.decipherBufferSymmetric(Buffer.from(encryptedContent, "hex"), encryptionKey).toString("utf-8");
    }

    decipherBufferSymmetric(encryptedContent: Buffer, encryptionKey: string | Buffer): Buffer{
        const iv = encryptedContent.subarray(0, 12);
        const encrypted = encryptedContent.subarray(12, encryptedContent.length - 16);
        const tag = encryptedContent.subarray(encryptedContent.length - 16);
        const key = this.prepareEncryptionKey(encryptionKey);
        const decipher = crypto.createDecipheriv("aes-256-gcm", key.subarray(0, 32), iv);
        decipher.setAuthTag(tag);
        try{
            return Buffer.concat([decipher.update(encrypted), decipher.final()]);
        }catch(_){
            throw new Error("Decryption failed");
        }
    }

    cipherHardSymmetric(content: string, encryptionKey: string | Buffer, timeCost = 200000){
        if(!content) content = "";
        const salt = crypto.randomBytes(32);
        const key = crypto.pbkdf2Sync(encryptionKey, salt, timeCost, 64, "sha512");
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", key.subarray(0, 32), iv);
        let encrypted = cipher.update(content, "utf-8", "hex");
        encrypted += cipher.final("hex");
        const hmac = crypto.createHmac("sha256", key.subarray(32));
        hmac.update(`${salt.toString("hex")}:${iv.toString("hex")}:${encrypted}`);
        const digest = hmac.digest("hex");
        return `${salt.toString("hex")}:${iv.toString("hex")}:${encrypted}:${digest}`;
    }

    decipherHardSymmetric(encryptedContent: string, encryptionKey: string | Buffer, timeCost = 200000){
        const [saltString, ivString, encryptedString, digest] = encryptedContent.split(":");
        const salt = Buffer.from(saltString, "hex");
        const key = crypto.pbkdf2Sync(encryptionKey, salt, timeCost, 64, "sha512");
        const iv = Buffer.from(ivString, "hex");
        const hmac = crypto.createHmac("sha256", key.subarray(32));
        hmac.update(`${saltString}:${ivString}:${encryptedString}`);
        const calculatedDigest = hmac.digest("hex");
        if(calculatedDigest !== digest)
            throw new Error("Integrity check failed");
        const decipher = crypto.createDecipheriv("aes-256-cbc", key.subarray(0, 32), iv);
        let decrypted = decipher.update(encryptedString, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return decrypted;
    }

    // Asymmetric functions
    generateKeyPair(modulusLength = 4096, privateEncryptionKey = null): crypto.KeyPairSyncResult<string, string>{
        if(!privateEncryptionKey)
            console.warn("No private encryption key provided, the private key will not be encrypted");
        let options = undefined;
        if(privateEncryptionKey){
            options = {
                cipher: "aes-256-cbc",
                passphrase: privateEncryptionKey,
            };
        }
        return crypto.generateKeyPairSync("rsa", {
            modulusLength: modulusLength,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
                ...options,
            },
        });
    }

    encryptAsymmetric(content: string, publicKey: string | Buffer): string{
        if(!content) content = "";
        const buffer = Buffer.from(content, "utf-8");
        const encrypted = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        }, buffer);
        return encrypted.toString("base64");
    }

    decryptAsymmetric(encryptedContent: string, privateKey: string | Buffer, privateEncryptionKey = undefined): string{
        const buffer = Buffer.from(encryptedContent, "base64");
        if(!privateEncryptionKey)
            return crypto.privateDecrypt({
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            }, buffer).toString("utf-8");
        else
            return crypto.privateDecrypt({
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                passphrase: privateEncryptionKey,
            }, buffer).toString("utf-8");
    }

    // Secret functions
    /**
     * Generate a random string
     * @param bytes Number of bytes to generate
     */
    generateRandomBytes(bytes = 32): string{
        return crypto.randomBytes(bytes).toString("hex");
    }

    /**
     * Generate a random number
     * @param numbersNumber Number of numbers to generate
     */
    generateRandomNumbers(numbersNumber = 6): string{
        return Array.from({length: numbersNumber}, () => Math.floor(Math.random() * 10)).join("");
    }

    /**
     * Generate a UUID
     * @param version UUID version
     */
    generateUuid(version: number = 4): string{
        switch (version){
            case 1:
                return uuid.v1();
            case 4:
                return uuid.v4();
            case 6:
                return uuid.v6();
            case 7:
                return uuid.v7();
            default:
                throw new Error("Unsupported UUID version");
        }
    }
}
