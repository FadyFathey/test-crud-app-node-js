import { products } from './data/products.js';

export const getAllProducts = (req, res) => {
    res.status(201).json(products);
};

export const getSingleProduct = (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Product not found');
    }
};

export const addProduct = (req, res) => {
    products.push({ id: products.length + 1, name: req.body.name, price: req.body.price });
    res.status(201).json(products);
};

export const updateProduct = (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === productId);
    if (product) {
        product.name = req.body.name;
        product.price = req.body.price;
    }
    res.status(200).json(product);
};

export const deleteProduct = (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products.splice(productIndex, 1);
    }
    res.status(204).json(products);
};