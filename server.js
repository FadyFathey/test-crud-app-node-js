import express from 'express';
import Mongoose from 'mongoose';
import 'dotenv/config'
import cors from 'cors';
import validator from 'validator';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import path from 'path'
const url = process.env.MONGODB_URL
const app = express()
const port = process.env.PORT
Mongoose.connect(url).then(() => {
    console.log(' mongoDb connected successfully')
})
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
// read images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// create schema for products 
const coursesSchema = new Mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    price:
    {
        type: Number,
        required: true
    }
})
const products = Mongoose.model('Product', coursesSchema)
//create schema for users
const userSchema = new Mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String
    },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: './profile/profile.jpg'
    }
})
const users = Mongoose.model('User', userSchema)
// middleware to parse json
app.use(express.json());
app.listen(4000, () => {
    console.log(` app listening on port ${port}`)
})
app.use(cors());
// get all products
app.get('/api/products', async (req, res) => {
    const limit = req.query.limit || 2;
    const page = req.query.page || 1;
    try {
        const allProducts = await products.find().limit(limit).skip((page - 1) * limit).exec();
        res.status(200).json({ status: "success", data: { allProducts } });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// get single product
app.get('/api/products/:id', async (req, res) => {
    const product = await products.findById(req.params.id).exec()
    if (product) {
        res.json({ status: "success", data: { product } });
    } else {
        res.status(404).json({ status: "fail", data: { product: "Product not found" } });
    }
});

// add product
app.post('/api/products', (req, res) => {
    const newProduct = new products(req.body);
    newProduct.save()
    res.status(201).json(newProduct);
    // handel if product not found
    if (!newProduct) {
        res.status(404).json({ status: "fail", data: { product: "Product not found" } });
    }

})
// update product
app.patch('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await products.findOneAndUpdate(
            { _id: productId },
            { $set: { ...req.body } },
            { new: true }
        );

        if (product) {
            return res.status(200).json(product);
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "fail", data: { product: "Internal Server Error" } });
    }
});

// delete product
app.delete('/api/products/:id', async (req, res) => {
    const deleteProduct = await products.deleteOne({ _id: req.params.id });
    res.status(204).json({ status: "success", data: null });

});


// get all users
app.get('/api/users', async (req, res) => {
    const limit = req.query.limit || 2;
    const page = req.query.page || 1;
    try {
        const allUsers = await users.find({}, { password: false }).limit(limit).skip((page - 1) * limit).exec();
        res.status(200).json({ status: "success", data: { allUsers } });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
// register user
app.post('/api/users/register', async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new users({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role
    })
    // generate jwt token
    const token = await jwt.sign({ email: newUser.email, user_Id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    newUser.token = token
    await newUser.save()
    res.status(200).json({ status: "success", data: { newUser } });

})

// login user
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body
    if (!email && !password) {
        return res.status(400).json({ status: "fail", data: { error: "Please provide email and password" } });
    }
    const user = await users.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (user && isMatch) {
        const token = await jwt.sign({ email: user.email, user_Id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
        return res.status(200).json({ status: "success", data: { user: 'logged success' } });
    } else {
        return res.status(400).json({ status: "fail", data: { error: "Invalid email or password" } });
    }
})

// get single user
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await users.findById(req.params.id).exec();
        if (user) {
            res.status(200).json({ status: "success", data: { user } });
        } else {
            res.status(404).json({ status: "fail", data: { user: "User not found" } });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "fail", data: { user: "Internal Server Error" } });
    }
});

// update user
app.patch('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await users.findOneAndUpdate(
            { _id: userId },
            { $set: { ...req.body } },
            { new: true }
        );
        if (user) {
            return res.status(200).json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "fail", data: { user: "Internal Server Error" } });
    }
});

// delete user
app.delete('/api/users/:id', async (req, res) => {
    const deleteUser = await users.deleteOne({ _id: req.params.id });
    res.status(204).json({ status: "success", data: null });
})

