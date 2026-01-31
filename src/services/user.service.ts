import { prisma } from "../prismaClient.js";
import { RegisterUserInput, LoginUserInput } from "../schemas/user.schema.js";
import { sendConfirmationEmail } from "../services/mail.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import argon2 from "argon2";

export const createUserService = async (data: RegisterUserInput) => {
    const { username, email, password, termsConsent, privacyConsent } = data;

    const userExists = await prisma.user.findUnique({
        where: { email: email },
    });
    if (userExists) { throw new Error("USER_ALREADY_EXISTS"); }

    const usernameExists = await prisma.user.findUnique({
        where: { username: username },
    });
    if (usernameExists) { throw new Error("USERNAME_ALREADY_IN_USE") }

    if (!termsConsent) {
        throw new Error("TERMS_NOT_ACCEPTED");
    }

    if (!privacyConsent) {
        throw new Error("PRIVACY_NOT_ACCEPTED");
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const now = new Date();

    const user = await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            passwordHash: passwordHash,
            role: data.role ?? "USER",
            profilPictureUrl: data.profilPictureUrl,
            termsConsentAt: now,
            privacyConsentAt: now,
            isActive: false,
            createdAt: now,
            updatedAt: null,
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

    return {
        user,
        confirmUrl,
    };
};

export const confirmEmailService = async (token: string) => {
    // 1️⃣ Vérifier et décoder le token
    const payload = jwt.verify(
        token,
        process.env.JWT_EMAIL_SECRET!
    ) as {
        idUser: number;
        type: string;
    };

    // 2️⃣ Vérifier que c’est bien un token de confirmation
    if (payload.type !== "EMAIL_CONFIRMATION") {
        throw new Error("INVALID_TOKEN_TYPE");
    }

    // 3️⃣ Activer le compte
    await prisma.user.update({
        where: { idUser: payload.idUser },
        data: {
            isActive: true,
            confirmationEmailAt: new Date(),
        },
    });
};

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
        { expiresIn:"5m"}
    );

    const jti = crypto.randomUUID();

    const refreshTokenValue = jwt.sign(
        { jti, type: "refresh" },
        process.env.JWT_REFRESH_SECRET!,
        {expiresIn: "60d"}
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

  let payload: { jti: string };

  try {
    payload = jwt.verify(tokenFromClient, process.env.JWT_REFRESH_SECRET!) as { jti: string };
  } catch {
    throw new Error("INVALID_REFRESH_TOKEN");
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
    { expiresIn: "5m"}
  );

  return { accessToken };
};