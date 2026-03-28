import { prisma } from "../prismaClient.js";
import { LoginUserInput } from "../schemas/user.schema.js";
import { sendConfirmationEmail, sendResetPasswordEmail } from "../services/mail.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { UserRoleEnum } from "../utils/enum.js";
import { verifyJwt } from "../utils/jwt.js";

type CreateUser = {
    username: string;
    email: string;
    password: string;
    // profilPictureUrl?: string;
    role: UserRoleEnum,
    termsConsent: boolean | null;
    privacyConsent: boolean | null;
}

export const createUserService = async (data: CreateUser, profilPictureUrl: string | undefined) => {
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
            profilPictureUrl,
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

    let frontPath: string;

    if (role === "ADMIN") {
        frontPath = "/admin/users/confirm-email";
    } else {
        frontPath = "/confirm-email";
    }

    const confirmUrl = `${process.env.FRONT_URL}${frontPath}?token=${emailToken}`;

    await sendConfirmationEmail(user.email, confirmUrl);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
};

export const confirmEmailService = async (token: string) => {
    // 1️⃣ Vérifier et décoder le token + ici un try aurait été bien
    const payload = verifyJwt<{ idUser: string; type: string }>(
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

        console.log("LegalToken envoyé :", legalToken);
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
    const payload = verifyJwt<{ idUser: string; type: string }>(token, secret);

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

    if (!user || !user.isActive || user.deletedAt) {
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

    return { user: {
        id: user.idUser,
        username: user.username,
        email: user.email,
        role: user.role,
    }, accessToken, refreshToken: refreshTokenValue };

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

    if (!storedToken || !storedToken.user) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    if (storedToken.revoked || storedToken.expiresAt < new Date()) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    if (!storedToken.user.isActive || storedToken.user.deletedAt) {
        throw new Error("ACCOUNT_DISABLED");
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

    return {
        accessToken,
        user: { 
            id: storedToken.user.idUser, 
            username: storedToken.user.username, 
            email: storedToken.user.email, 
            role: storedToken.user.role }
    };
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

export const forgotPasswordService = async (email: string) => {

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return; // pas d'information si l'email n'existe pas.

    const token = jwt.sign(
        {
            idUser: user.idUser,
            type: "PASSWORD_RESET"
        },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: "15m" }
    );

    const resetUrl = `${process.env.FRONT_URL}/reset-password?token=${token}`;

    await sendResetPasswordEmail(user.email, resetUrl);
    // Le front fera const token = new URLSearchParams(window.location.search).get("token"); puis 
    /* await fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            token: token, // 💥 injecté manuellement par le front
            password: form.password,
            confirmPassword: form.confirmPassword
  })
}); */
};

export const resetPasswordService = async (token: string, password: string) => {

    let payload: { idUser: string; type: string };

    try {
        payload = verifyJwt<{ idUser: string; type: string }>(
            token,
            process.env.JWT_EMAIL_SECRET!
        );
    } catch {
        throw new Error("INVALID_TOKEN");
    }

    if (payload.type !== "PASSWORD_RESET") {
        throw new Error("INVALID_TOKEN_TYPE");
    }

    const user = await prisma.user.findUnique({
        where: { idUser: payload.idUser }
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { idUser: user.idUser },
        data: {
            passwordHash
        }
    });

    // On révoque tous les tokens de l'utilisateur suite à la maj du mdp
    await prisma.refreshToken.updateMany({
        where: { userId: user.idUser },
        data: { revoked: true }
    });

}