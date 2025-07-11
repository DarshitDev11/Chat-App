import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/AuthRoutes.js';
import path from 'path';
import contactsRoutes from './routes/ContactRoutes.js';
import setupSocket from './socket.js';
import messagesRoutes from './routes/MessagesRoutes.js';
import channelRoutes from './routes/ChannelRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.DB_URI;
mongoose.connect(MONGO_URI).then(()=>{console.log('MongoDB connected')}).catch((err)=>{console.log(err)});

const allowedOrigins = (process.env.ORIGIN || '').split(',').filter(Boolean);
console.log('Allowed origins:', allowedOrigins);
app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

app.use('/uploads/profiles', express.static(path.join(process.cwd(), 'uploads/profiles')));
app.use('/uploads/files',express.static(path.join(process.cwd(), 'uploads/files')));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',authRoutes);
app.use('/api/contacts',contactsRoutes);
app.use('/api/messages',messagesRoutes);
app.use('/api/channel',channelRoutes);

const server = app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

setupSocket(server);