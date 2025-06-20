import bcrypt from 'bcrypt';
import User from '../models/Usermodel.js';
import token from 'jsonwebtoken';
import {renameSync,unlinkSync} from 'fs';
import path from 'path';
import { rename } from 'fs/promises';

export const createToken = (userId) => {
    return token.sign({ userId }, process.env.JWT_KEY, {expiresIn: 3 * 24 * 60 * 60});
};
export const signup = async (req,res)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: 'Please fill all the fields'});
        }
        const user = await User.create({email,password});
        const token = createToken(user.id)
        console.log(token);
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
        });
        
        return res.status(201).json({user:{
            id: user.id,
            email:user.email,
            profileSetup: user.profileSetup,
        }});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};

export const login = async (req,res)=>{
    try {
        const {email,password} = req.body;
        console.log(req.body);
        
        if(!email || !password){
            return res.status(400).json({message: 'Please fill all the fields'});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({ message: 'User not found.' });
        }

        const auth = await bcrypt.compare(password,user.password);
        if(!auth){
            return res.status(401).json({message: 'Password is incorrect'});
        }
        const token = createToken(user.id)
        console.log(token)
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
        });
        res.status(200).json({user:{
            id: user.id,
            email:user.email,
            profileSetup: user.profileSetup,
            firstname: user.firstname,
            lastname: user.lastname,
            image: user.image,
            color: user.color,
        }});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};

export const getUserInfo = async (req,res)=>{
    try {
        const userData = await User.findById(req.userId);
        if(!userData){
            return res.status(404).send('firstname lastname and color required')
        }
        return res.status(200).json({
            id: userData.id,
            email:userData.email,
            profileSetup: userData.profileSetup,
            firstname: userData.firstname,
            lastname: userData.lastname,
            image: userData.image,
            color: userData.color,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server error');
    }
};

export const addProfileImage = async (req,res)=>{
    try {
        if(!req.file){
            return res.status(400).send('File is required.')
        }
        
        // const ext = path.extname(req.file.originalname);
        // const newFileName = `${Date.now()}${ext}`;
        // const newPath = `uploads/profiles/${newFileName}`;

        // await rename(req.file.path, newPath);
        
        const date = Date.now();
        let fileName = 'uploads/profiles/' + date + req.file.originalname;
        renameSync(req.file.path,fileName);
        
        const updateduser = await User.findByIdAndUpdate(req.userId,
                {image:fileName},
                {new:true,runValidators:true});

        return res.status(200).json({
            image: updateduser.image,
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};

export const updateProfile = async (req,res)=>{
    try {
        const { firstname, lastname, color  } = req.body;
        console.log(req.body);
        
        if (!firstname || !lastname || color === undefined) {
            return res.status(400).json({ message: 'Firstname, lastname, and color are required.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.userId, 
            { firstname, lastname, color , profileSetup: true},
            { new: true, runValidators: true } 
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({
            id: updatedUser.id,
            email: updatedUser.email,
            profileSetup: updatedUser.profileSetup,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            image: updatedUser.image,
            color: updatedUser.color,
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};

export const removeProfileImage = async (req,res)=>{
    try {
        const {userId} = req;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).send('User not found.')
        }
        if(user.image){
            unlinkSync(user.image)
        }
        user.image = null;
        await user.save();
        return res.status(200).send('Profile image remove successfully.');
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};

export const logout = async (req,res)=>{
    try {
        res.cookie('jwt','',{maxAge:1,secure:true,sameSite:"None"})
        return res.status(200).send('Logout successfully.');
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};