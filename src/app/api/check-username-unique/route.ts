import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from 'zod'
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()
    try{
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        // checking search name 
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result, 'result')

        if(!result.success){
            // to filter out only username error
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: 400,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query param'
            }, {status: 400})
        }

        const {username} = result.data
        // checking if user exist in DB
        const existingVerifiedUser =  await UserModel.findOne({username,isVerified: true})

        if(existingVerifiedUser){
            return Response.json({
                success: false ,
                message: 'Username is already taken'
            }, {status: 400})
        }

        return Response.json({
            success: true,
            message: 'Username is available'
        }, {status: 200})

    } catch(err){
        console.error("Error checking username", err)
        return Response.json({
            success: false,
            message: "Error checking username"
        }, {status: 500})
    }
}