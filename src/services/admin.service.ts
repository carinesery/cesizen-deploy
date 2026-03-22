import { prisma } from "../prismaClient.js";
import { UserStatusBodyInput } from "../schemas/admin.schema.js";

export const getAllUsersService = async () => {

    const users = await prisma.user.findMany(
        {
            select: {
                idUser: true,
                username: true,
                email: true,
                profilPictureUrl: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true
            }
        }
    )

    return users;
}

export const getUserService = async (idUser: string) => {

    const user = await prisma.user.findUnique(
        {
            where: { idUser },
            select: {
                username: true,
                email: true,
                profilPictureUrl: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            }
        }
    )

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return user;
}

export const setUserActiveStatusService = async (
    idUser: string,
    data: UserStatusBodyInput, // Doute ici
    idAdmin: string,
) => {
    const user = await prisma.user.findUnique({
        where: { idUser }
    });

    if (!user || user.deletedAt) {
        throw new Error("USER_NOT_FOUND");
    }

    if (user.idUser === idAdmin) {
        throw new Error("CANNOT_CHANGE_SELF_STATUS");
    }

    // Désactivation du compte
    if (data.isActive === false) {
        await prisma.$transaction([
            prisma.user.update({
                where: { idUser },
                data: {
                    isActive: false,
                    disabledAt: new Date(),
                }
            }),

            prisma.refreshToken.updateMany({
                where: {
                    userId: idUser,
                    revoked: false
                },
                data: {
                    revoked: true
                }
            })
        ]);
    }

    // Réactivation du compte
    if (data.isActive === true) {
        await prisma.user.update({
            where: { idUser },
            data: {
                isActive: true,
                disabledAt: null,
            }
        })
    }

};

export const deleteUserService = async (idUser: string, idAdmin: string) => {

    const user = await prisma.user.findUnique({
        where: { idUser },
    })

    if (!user) {
        throw new Error("USER_NOT_FOUND")
    }

    if (!idAdmin) {
        throw new Error("ADMIN_REQUIRED_TO_DELETE_ACCOUNT");
    }

    if (idUser === idAdmin) {
        throw new Error("CANNOT_DELETE_SELF_ACCOUNT")
    }

    const anonymizedUsername = `deleted_user_${idUser}`;
    const anonymizedEmail = `deleted_${idUser}@deleted.local`;

    await prisma.$transaction([
        prisma.user.update({
            where: { idUser },
            data: {
                username: anonymizedUsername,
                email: anonymizedEmail,
                profilPictureUrl: null,
                confirmationEmailAt: null,
                passwordHash: "",
                isActive: false,
                deletedAt: new Date(),
                disabledAt: new Date(),
                termsConsentAt: null,
                privacyConsentAt: null
            }
        }),
        prisma.refreshToken.updateMany({
            where: {userId: idUser, revoked: false },
            data: {revoked: true }
        })
    ])
}