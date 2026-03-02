import jwt, { JwtPayload } from "jsonwebtoken";

export function verifyJwt<T extends JwtPayload>(
    token: string,
    secret: string
): T {
    const decoded =jwt.verify(token, secret);

    if(typeof decoded !== "object" || decoded === null) {
        throw new Error("INVALID_TOKEN_PAYLOAD");
    }

    return decoded as T;
}