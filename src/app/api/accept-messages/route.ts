import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import {User} from 'next-auth'

export async function POST(request: Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)  // to get session
    const user: User = session?.user as User

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {status: 401})
    }

    const userId = user._id
    const {acceptMessages} = await request.json()

    try{
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessage: acceptMessages},
            {new: true}
        )
        if(!updatedUser){
            return Response.json({
                success: 'false',
                message: 'Failed to update user status to accept Messages'
            }, {status: 401})
        }else {
            return Response.json({
                success: true,
                message: 'Message acceptance status updated successfully',
                updatedUser
            }, {status: 200})
        }
    } catch(err){
        console.log("Failed to update user status to accept Messages")
        return Response.json({
            success: 'false',
            message: 'Failed to update user status to accept Messages'
        }, {status: 500})
    }
}

export async function GET(request: Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "Not Authorized"
        }, {status: 401})
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId)

        if(!foundUser){
            return Response.json({
                success: false,
                message: "User not Found"
            }, {status: 404})
        }
    
        return Response.json({
            success: true,
            isAcceptingMessages : foundUser.isAcceptingMessage
        }, {status: 200})

    } catch(err) {
        console.log(err)
        return Response.json({
            success: false,
            message: 'Error in getting acceptance status'
        }, {status: 500})
    }
}