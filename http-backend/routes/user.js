const express = require("express");
const { UserModel} = require("../models/userschema");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userRouter = express.Router()
const bcrypt = require("bcryptjs");
userRouter.post("/signup", async function (req, res) {
    const requirebody = z.object({
        email: z.string().min(3).max(50).email(),
        firstName: z.string().min(3).max(100),
        lastName: z.string().min(2).max(20),
        password: z.string().min(8).max(20).refine((password) => {
            const uppercase = /[A-Z]/.test(password);
            const lowercase = /[a-z]/.test(password);
            const specialchar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            return uppercase && lowercase && specialchar;
        }, {
            message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one special character."
        })
    });

    const parsedata = requirebody.safeParse(req.body);

    if (!parsedata.success) {
        return res.status(400).json({
            message: "Invalid input data",
            error: parsedata.error.errors
        });
    }

    const { email, password, firstName, lastName } = req.body;
    let errorthrown = false;

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists with this email"
            });
        }
        const hashpassword = await bcrypt.hash(password, 5);
        // const profileImage = req.file ? `/uploads/${ req.file.filename }` : null;

        await UserModel.create({
            email: email,
            password: hashpassword,
            firstName: firstName,
            lastName: lastName,
            // profileImage: profileImage, // If you add this in the future
        });

    } catch (e) {
        return res.status(500).json({
            error: "Server error: " + e.message
        });
    }
    return res.status(201).json({
        message: "You have successfully signed up!"
    });
});
userRouter.post("/signin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const response = await UserModel.findOne({
        email: email
    })
    if (!response) {
        res.status(403).json({
            message: "User does not exist"
        })
        return
    }
    try {
        const comparepassword = await bcrypt.compare(password, response.password);
        if (comparepassword) {
            const token = jwt.sign({
                id: response._id.toString()
            }, process.env.JWT_SECRET);
            res.json({
                message: "You successfully logged in",
                token: token
            });
        }
    } catch (error) {
        res.status(403).json({
            message: "Wrong username or password:",
            error: error.message
        })
    }
})




module.exports = userRouter;