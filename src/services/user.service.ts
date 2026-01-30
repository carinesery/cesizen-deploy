import { prisma } from "../prismaClient.js";
import { RegisterUserInput, LoginUserInput } from "../schemas/user.schema.js";
import { sendConfirmationEmail } from "../services/mail.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createUser = async (data: RegisterUserInput) => {
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

export const confirmEmail = async (token: string) => {
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

export const loginUser = async (data: LoginUserInput) => {


}