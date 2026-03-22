import { prisma } from "../prismaClient.js";
import { UpdatedPasswordInput, UpdatedProfileUserInput } from "../schemas/profile.schema.js";
import jwt from "jsonwebtoken";
import { sendConfirmationEmail } from "./mail.service.js";
import bcrypt from "bcrypt";
import { UserRoleEnum } from "../utils/enum.js";

export const getProfileService = async (idUser: string) => {

    const user = await prisma.user.findUnique(
        {
            where: { idUser: idUser },
            select: {
                username: true,
                email: true,
                profilPictureUrl: true,
                isActive: true,
                deletedAt: true,
            }
        }
    )

    if (!user || user.deletedAt) {
        throw new Error('USER_NOT_FOUND')
    }

    if (!user.isActive) {
        throw new Error("ACCOUNT_INACTIVE");
    }

    const userProfile = {
        username: user.username,
        email: user.email,
        profilPictureUrl: user.profilPictureUrl
    }

    return userProfile;

}

export type UpdateUser = {
    username?: string;
    email?: string;
    profilPictureUrl?: string;
    role?: UserRoleEnum,
}


export const updateUserService = async (idUser: string, data: UpdateUser, idAdmin?: string) => {

    const user = await prisma.user.findUnique(
        { where: { idUser: idUser } }
    );

    if (!user || user.deletedAt) {
        throw new Error('USER_NOT_FOUND')
    }

    if (!user.isActive) {
        throw new Error("ACCOUNT_INACTIVE");
    }

    const updatedData: Partial<UpdateUser> & { isActive?: boolean } = {};
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

    // Mise à jour du rôle + empêche un admin de modifier son propre rôle par mégarde
    if (data.role && data.role !== user.role) {
        if (!idAdmin) {
            throw new Error("ADMIN_REQUIRED_TO_CHANGE_ROLE");
        }

        if (user.idUser === idAdmin) {
            throw new Error("CANNOT_CHANGE_SELF_ROLE");
        }

        updatedData.role = data.role;
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
            where: { idUser },
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
            isActive: updatedUser.isActive,
            role: updatedUser.role
        },
        emailChanged
    };
}

export const updatePasswordService = async (idUser: string, data: { currentPassword: string; newPassword: string }) => {

    const user = await prisma.user.findUnique({
        where: { idUser }
    })

    if (!user || user.deletedAt) {
        throw new Error("USER_NOT_FOUND");
    }

    if (!user.isActive) {
        throw new Error("ACCOUNT_INACTIVE");
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

export const deleteAccountService = async (idUser: string) => {

    const user = await prisma.user.findUnique({
        where: { idUser }
    })

    if (!user || user.deletedAt) {
        throw new Error("USER_NOT_FOUND")
    }

    if (!user.isActive) {
        throw new Error("ACCOUNT_INACTIVE")
    }

    await prisma.user.update({
        where: { idUser: idUser },
        data: {
            isActive: false,
            disabledAt: new Date()
        }
    })

    await prisma.refreshToken.updateMany({
        where: {
            userId: idUser,
            revoked: false
        },
        data: {
            revoked: true
        }
    });

}