import { prisma } from "../prismaClient.js";

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