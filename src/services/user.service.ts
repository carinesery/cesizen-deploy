import { prisma } from "../prismaClient.js";
import { LoginUserInput } from "../schemas/user.schema.js";
import { sendConfirmationEmail } from "../services/mail.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { UserRoleEnum } from "../utils/enum.js";
import { verifyJwt } from "../utils/jwt.js";

type CreateUser = {
    username: string;
    email: string;
    password: string;
    profilPictureUrl?: string;
    role: UserRoleEnum,
    termsConsent: boolean | null;
    privacyConsent: boolean | null;
}

export const createUserService = async (data: CreateUser) => {
    const { username, email, password, role } = data;

    const userExists = await prisma.user.findUnique({
        where: { email: email },
    });
    if (userExists) { throw new Error("USER_ALREADY_EXISTS"); }

    const usernameExists = await prisma.user.findUnique({
        where: { username: username },
    });
    if (usernameExists) { throw new Error("USERNAME_ALREADY_IN_USE") }

    const now = new Date();

    const passwordHash = await bcrypt.hash(password, 10);


    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
            role,
            profilPictureUrl: data.profilPictureUrl,
            termsConsentAt: data.termsConsent === true ? now : null,
            privacyConsentAt: data.privacyConsent === true ? now : null,
            isActive: false,
            createdAt: now,
        }
    })

    const emailToken = jwt.sign(
        {
            idUser: user.idUser,
            type: "EMAIL_CONFIRMATION",
        },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: "1d" }
    );

    const confirmUrl = `${process.env.FRONT_URL}/auth/confirm-email?token=${emailToken}`;

    await sendConfirmationEmail(user.email, confirmUrl);

    return { user };
};

export const confirmEmailService = async (token: string) => {
    // 1️⃣ Vérifier et décoder le token
    const payload = verifyJwt<{idUser: number; type: string}>(
        token,
        process.env.JWT_EMAIL_SECRET!
    );

    // 2️⃣ Vérifier que c’est bien un token de confirmation
    if (payload.type !== "EMAIL_CONFIRMATION") {
        throw new Error("INVALID_TOKEN_TYPE");
    }

    const user = await prisma.user.findUnique({ where: { idUser: payload.idUser } });
    if (!user) throw new Error("USER_NOT_FOUND");

     // 4️⃣ Vérifier si les CGU + privacy ont déjà été acceptées
    const hasAcceptedLegal =
        user.termsConsentAt !== null &&
        user.privacyConsentAt !== null;

    // 5️⃣ Mettre à jour confirmationEmailAt
    const now = new Date();
    await prisma.user.update({
        where: { idUser: user.idUser },
        data: {
            confirmationEmailAt: now,
            isActive: hasAcceptedLegal
        }
    });

    if (!hasAcceptedLegal) {
        const legalToken = jwt.sign(
            { idUser: user.idUser, type: "LEGAL_ACCEPT" },
            process.env.JWT_EMAIL_SECRET!,
            { expiresIn: "15m" }
        );

        return {
            status: "NEEDS_LEGAL",
            legalToken
        };
    }
    
    return {
        status: "ACTIVATED"
    };
};


export const acceptLegalService = async (token: string) => {
    const secret = process.env.JWT_EMAIL_SECRET;
    if (!secret) throw new Error("JWT_EMAIL_SECRET not defined");

    // Vérification du token
    const payload = verifyJwt<{ idUser: number; type: string }>(token, secret);

    if (payload.type !== "LEGAL_ACCEPT") {
        throw new Error("INVALID_TOKEN_TYPE");
    }

    // Mise à jour de l'utilisateur
    const now = new Date();
    await prisma.user.update({
        where: { idUser: payload.idUser },
        data: {
            termsConsentAt: now,
            privacyConsentAt: now,
            isActive: true,
        },
    });
}

export const loginUserService = async (data: LoginUserInput) => {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email: email } });

    if (!user || !user.isActive) {
        throw new Error("INVALID_CREDENTIALS")
    };

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) { throw new Error("INVALID_CREDENTIALS") }


    const accessToken = jwt.sign(
        { idUser: user.idUser, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "5m" }
    );

    const jti = crypto.randomUUID();

    const refreshTokenValue = jwt.sign(
        { jti, type: "REFRESH" },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "60d" }
    );

    const hashedRefreshToken = await argon2.hash(refreshTokenValue);

    await prisma.refreshToken.create({
        data: {
            jti,
            userId: user.idUser,
            refreshToken: hashedRefreshToken,
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
    });

    return { user, accessToken, refreshToken: refreshTokenValue };

    // Faire un refresh token
    // Access token est envoyé à chaque requête et stocké dans LocalStroage ou cookies 5-10 min
    // Refresh dans les cookies 60 jours. Il doit être stocké en base, et il faut le re-hashé (argon 2) --> axios conseillé

}

export const refreshTokenService = async (tokenFromClient: string) => {
    if (!tokenFromClient) throw new Error("NO_REFRESH_TOKEN");

    let payload: { jti: string; type: string };

    try {
        payload = verifyJwt<{ jti: string; type: string }>(
            tokenFromClient, 
            process.env.JWT_REFRESH_SECRET!);
    } catch {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    if (payload.type !== "REFRESH") {
        throw new Error("INVALID_TOKEN_TYPE");
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { jti: payload.jti },
        include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    const isValid = await argon2.verify(storedToken.refreshToken, tokenFromClient);

    if (!isValid) throw new Error("INVALID_REFRESH_TOKEN");

    const accessToken = jwt.sign(
        {
            idUser: storedToken.user.idUser,
            role: storedToken.user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "5m" }
    );

    return { accessToken };
};

export const logoutService = async (refreshTokenFromClient: string) => {

    const secret = process.env.JWT_REFRESH_SECRET;
    const payload = verifyJwt<{ jti: string; type: string }>(refreshTokenFromClient, secret!);

    if (payload.type !== "REFRESH") {
        throw new Error("INVALID_TOKEN_TYPE");
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { jti: payload.jti }
    });

     if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        throw new Error("INVALID_REFRESH_TOKEN");
    };

    // Je révoque le refreshToken
    await prisma.refreshToken.update({
        where: { jti: payload.jti },
        data: { revoked: true }
        }
    );
}