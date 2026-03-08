import { prisma } from "../prismaClient.js";
import { UpdatedPasswordInput, UpdatedProfileUserInput } from "../schemas/profile.schema.js";
import jwt from "jsonwebtoken";
import { sendConfirmationEmail } from "./mail.service.js";
import bcrypt from "bcrypt";

export const getProfileService = async (idUser: number) => {

    const user = await prisma.user.findUnique(
        {
            where: { idUser: idUser },
            select: {
                username: true,
                email: true,
                profilPictureUrl: true
            }
        }
    )

    if (!user) {
        throw new Error('USER_NOT_FOUND')
    }

    return user;

}

export const updateProfileService = async (idUser: number, data: UpdatedProfileUserInput) => {

    const user = await prisma.user.findUnique(
        { where: { idUser: idUser } }
    );

    if (!user) {
        throw new Error('USER_NOT_FOUND')
    }

    const updatedData: Partial<UpdatedProfileUserInput> & { isActive?: boolean } = {};
    let emailChanged = false;

    // Vérifier la contrainte d'unicité de lu nom d'utilisateur
    if (data.username) {
        if (data.username !== user.username) {
            const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
            if (existingUsername) {
                throw new Error('USERNAME_ALREADY_USED');
            };
            updatedData.username = data.username;
        }
    }

    // Vérifier la contrainte d'unicité de l'email
    if (data.email) {
        if (data.email !== user.email) {
            const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
            if (existingEmail) {
                throw new Error('EMAIL_ALREADY_USED');
            }
            updatedData.email = data.email;
            emailChanged = true;
            updatedData.isActive = false;
        }
    }

    // Mise à jour de l'image de profil : 
    if (data.profilPictureUrl) {
        updatedData.profilPictureUrl = data.profilPictureUrl;
    }

    if (Object.keys(updatedData).length === 0) {
        throw new Error("NO_DATA_TO_UPDATE");
    }

    const updatedUser = await prisma.user.update(
        {
            where: { idUser: idUser },
            data: {
                ...updatedData,
                updatedAt: new Date()
            }
        }
    );

    // Envoyer la notification mail pour confirmation
    if (emailChanged) {
        const emailToken = jwt.sign(
            {
                idUser: user.idUser,
                type: "EMAIL_CONFIRMATION",
            },
            process.env.JWT_EMAIL_SECRET!,
            { expiresIn: "1d" }
        );

        const confirmUrl = `${process.env.FRONT_URL}/auth/confirm-email?token=${emailToken}`;

        await sendConfirmationEmail(updatedUser.email, confirmUrl);
    }

    return {
        user: {
            username: updatedUser.username,
            email: updatedUser.email,
            profilPictureUrl: updatedUser.profilPictureUrl,
            isActive: updatedUser.isActive
        },
        emailChanged
    };
}

export const updatePasswordService = async (idUser: number, data: UpdatedPasswordInput) => {

    //vérif user et trouver le user ?
    const user = await prisma.user.findUnique({
        where: { idUser }
    })

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    const passwordMatch = await bcrypt.compare(
        data.currentPassword,
        user.passwordHash
    );

    if (!passwordMatch) {
        throw new Error("INVALID_PASSWORD");
    }

    const isSamePassword = await bcrypt.compare(
        data.newPassword,
        user.passwordHash
    );

    if (isSamePassword) {
        throw new Error("PASSWORD_IDENTICAL");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
        where: { idUser },
        data: {
            passwordHash: hashedPassword,
            updatedAt: new Date()
        }
    });

    await prisma.refreshToken.updateMany({
        where: {
            userId: idUser,
            revoked: false
        },
        data: {
            revoked: true
        }
    });

    return true;
}