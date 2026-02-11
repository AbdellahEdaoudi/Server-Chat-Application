const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Messages = require('../models/Messages');
const fs = require('fs');
const { uploadImage, cloudinary } = require('../utils/cloudinary');

const isPasswordStrong = (password) => {
    // Requirements: 8+ characters, at least one digit, at least one special character
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return regex.test(password);
};

exports.register = async (req, res) => {
    try {
        const { fullname, email, password, publicKey, protectedPrivateKey } = req.body;

        if (!isPasswordStrong(password)) {
            return res.status(400).json({
                message: 'Password is too weak. It must be at least 8 characters long and include uppercase, lowercase, and a special character.'
            });
        }

        if (fullname.length > 30) return res.status(400).json({ message: 'Full name exceeds 30 characters' });

        const emailRegex = /^[a-zA-Z0-9._-]+@edchatflow\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email. Only letters, numbers, ., -, _ are allowed before @edchatflow.com' });
        }

        if (email.length > 50) return res.status(400).json({ message: 'Email exceeds 50 characters' });
        if (password.length > 50) return res.status(400).json({ message: 'Password exceeds 50 characters' });

        let profileImage = `https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png`;

        if (req.file) {
            try {
                const result = await uploadImage(req.file.path);
                profileImage = result.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(500).json({ message: 'Error uploading image' });
            }
        }


        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            fullname,
            email,
            username: email.split('@')[0],
            password: hashedPassword,
            profileImage,
            publicKey,
            protectedPrivateKey
        });
        await Messages.create({
            from: newUser._id,
            to: newUser._id,
            message: `Hi 👋 I'm ${newUser.fullname}, and this is my EdChatFlow account. This is my first message here. Ready to start chatting! 🚀`,
            readorno: false,
            updated: false
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        // Generate Token
        const accessToken = jwt.sign(
            { UserInfo: { id: user._id, email: user.email } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "60m" }
        );
        const refreshToken = jwt.sign(
            { UserInfo: { id: user._id, email: user.email } },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // Create secure cookie with refresh token 
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('jwt', refreshToken, {
            httpOnly: true, // accessible only by web server 
            secure: isProduction, // https
            sameSite: isProduction ? 'None' : 'Lax', // cross-site cookie 
            maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: set to match rT
        });

        // Create secure cookie with access token
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.status(200).json({
            message: 'Login successful',
            user,
            accessToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

exports.logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        path: '/'
    };

    res.clearCookie('jwt', cookieOptions);
    res.clearCookie('accessToken', cookieOptions);
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullname, newPassword, publicKey, protectedPrivateKey } = req.body;
        if (fullname && fullname.length > 30) return res.status(400).json({ message: 'Full name exceeds 30 characters' });
        if (newPassword && newPassword.length > 50) return res.status(400).json({ message: 'Password exceeds 50 characters' });
        const currentUser = await User.findById(userId);
        if (!currentUser) return res.status(404).json({ message: "User not found" });

        let updateData = { fullname };

        // Only allow setting publicKey if it's not already set in the database
        if (publicKey && (!currentUser.publicKey || currentUser.publicKey === "")) {
            updateData.publicKey = publicKey;
        }

        if (protectedPrivateKey) {
            updateData.protectedPrivateKey = protectedPrivateKey;
        }

        const defaultImage = "https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png";

        if (req.body.removeProfileImage === 'true') {
            if (currentUser.profileImage && currentUser.profileImage !== defaultImage) {
                try {
                    const parts = currentUser.profileImage.split('/');
                    const filename = parts.pop().split('.')[0];
                    const folder = parts.pop();
                    const publicId = `${folder}/${filename}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error("Error deleting old image:", err);
                }
            }
            updateData.profileImage = defaultImage;
        } else if (req.file) {

            // Delete old image if it exists and is not default
            if (currentUser.profileImage && currentUser.profileImage !== defaultImage) {
                try {
                    const parts = currentUser.profileImage.split('/');
                    const filename = parts.pop().split('.')[0];
                    const folder = parts.pop();
                    const publicId = `${folder}/${filename}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error("Error deleting old image:", err);
                }
            }

            try {
                const result = await uploadImage(req.file.path);
                updateData.profileImage = result.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(500).json({ message: 'Error uploading image' });
            }

        }

        if (newPassword && newPassword.trim() !== "") {
            const { password } = req.body; // Current password
            if (!password) {
                return res.status(400).json({ message: "Current password is required to set a new password" });
            }
            const isMatch = await bcrypt.compare(password, currentUser.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect current password" });
            }

            if (!isPasswordStrong(newPassword)) {
                return res.status(400).json({
                    message: 'New password is too weak. It must be at least 8 characters long and include a number and a special character.'
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        // Allow updating protectedPrivateKey (usually sent when password changes)
        if (protectedPrivateKey) {
            updateData.protectedPrivateKey = protectedPrivateKey;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};
