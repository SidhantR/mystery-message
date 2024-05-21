import {NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'

export const authOptions: NextAuthOptions ={
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: {label: 'Email', type: 'text'},
                password: {label: 'Password', type: 'password'} 
            },
            async authorize(credentials: any): Promise<any>{
                await dbConnect()
                try{
                    const user = await UserModel.findOne({
                        $or: [
                            {email: credentials.identifier},
                            {username: credentials.username}
                        ]
                    })
                    if(!user){
                        throw new Error('No user found with this email')
                    }
                    if(!user.isVerified){
                        throw new Error('Please verify your acount before login')
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if(isPasswordCorrect){
                        return user
                    }else {
                        throw new Error('Incorrect Password')
                    }
                } catch(err: any){
                    throw new Error(err)
                }
            }
        })
        // if want to add github or facebook provider - add here 
    ],
    callbacks: {
        async jwt({token, user}){
            if(user){
                //modifying token from user that we get in jwt so we dont have to call again and again
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessaages= user.isAcceptingMessages;
                token.username = user.userName
            }
            return token
        },
        async session({session, token}){
            if(token){
                // adding details in session
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.userName = token.username
            }
            return session
        }
    },
    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
}