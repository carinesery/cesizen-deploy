import { prisma } from "../prismaClient.js";
import { UserStatusInput } from "../schemas/admin.schema.js";

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

export const getUserService = async (idUser: number) => {

    const user = await prisma.user.findUnique(
        {
            where: { idUser: idUser },
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
    idUser: number,
    data: UserStatusInput,
    idAdmin: number,
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