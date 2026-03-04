import { prisma } from "../prismaClient.js";

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

    if(!user) {
        throw new Error ('USER_NOT_FOUND')
    }
    
    return user;

}