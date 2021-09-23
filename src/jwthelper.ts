import * as jsonwebtoken from "jsonwebtoken";

export function Decode<T extends object>(iJWT: string): T | undefined {

    try {
        return jsonwebtoken.verify(iJWT, process.env.JWTENCRYPTIONKEY) as T;
    } catch (e) {
        // Failed to decode
        return undefined;
    }

}

export function Encode<T extends object>(iPayLoad: T, iTimeoutSeconds = 3600 * 10): string {
    return jsonwebtoken.sign(iPayLoad, process.env.JWTENCRYPTIONKEY, { expiresIn: iTimeoutSeconds });
}
